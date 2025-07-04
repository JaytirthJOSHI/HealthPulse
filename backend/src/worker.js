import { createClient } from '@supabase/supabase-js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize Supabase client
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Health check endpoint
    if (path === '/health' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          service: 'HealthPulse Backend API',
          domain: 'api.pulse.health-sathi.org',
          environment: 'production',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // REST API endpoints
    if (path === '/api/reports' && request.method === 'POST') {
      return await handleCreateReport(request, supabase);
    }

    if (path === '/api/reports' && request.method === 'GET') {
      return await handleGetReports(supabase);
    }

    if (path === '/api/health-tips' && request.method === 'GET') {
      return await handleGetHealthTips(supabase);
    }

    if (path === '/api/disease-risk' && request.method === 'GET') {
      return await handleGetDiseaseRisk(request, supabase);
    }

    if (path === '/api/diseases' && request.method === 'GET') {
      return await handleGetDiseases(supabase);
    }

    if (path === '/api/regions' && request.method === 'GET') {
      return await handleGetRegions(supabase);
    }

    if (path === '/api/aggregates' && request.method === 'GET') {
      return await handleGetAggregates(supabase);
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ 
        error: 'Not found',
        available_endpoints: [
          'GET /health',
          'POST /api/reports',
          'GET /api/reports',
          'GET /api/health-tips',
          'GET /api/disease-risk?pinCode=400001',
          'GET /api/diseases',
          'GET /api/regions',
          'GET /api/aggregates'
        ]
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};

// Handler functions
async function handleCreateReport(request, supabase) {
  try {
    const report = await request.json();
    
    const { data, error } = await supabase
      .from('symptom_reports')
      .insert([{
        nickname: report.nickname,
        country: report.country,
        pin_code: report.pinCode,
        symptoms: report.symptoms,
        illness_type: report.illnessType,
        severity: report.severity,
        latitude: report.latitude,
        longitude: report.longitude,
      }])
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create report', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetReports(supabase) {
  try {
    const { data, error } = await supabase
      .from('symptom_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get reports', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetHealthTips(supabase) {
  try {
    const { data, error } = await supabase
      .from('health_tips')
      .select('*');

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get health tips', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetDiseaseRisk(request, supabase) {
  try {
    const url = new URL(request.url);
    const pinCode = url.searchParams.get('pinCode');

    if (!pinCode) {
      return new Response(
        JSON.stringify({ error: 'Pin code is required. Use ?pinCode=400001' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const { data, error } = await supabase
      .rpc('get_disease_risk_for_location', {
        location_pin_code: pinCode
      });

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get disease risk', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetDiseases(supabase) {
  try {
    const { data, error } = await supabase
      .from('diseases')
      .select('*');

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get diseases', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetRegions(supabase) {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*');

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get regions', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

async function handleGetAggregates(supabase) {
  try {
    const { data, error } = await supabase
      .from('health_aggregates')
      .select('*');

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get aggregates', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}