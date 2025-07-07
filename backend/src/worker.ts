import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  FRONTEND_URL: string;
}

// Cloudflare Workers types
declare global {
  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
  }
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
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
          service: 'HealthPulse Backend (Cloudflare Workers)',
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

    if (path === '/api/who-data' && request.method === 'GET') {
      return await handleGetWHOData();
    }

    if (path === '/api/health-aggregates' && request.method === 'GET') {
      return await handleGetHealthAggregates(supabase);
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};

// Handler functions
async function handleCreateReport(request: Request, supabase: any): Promise<Response> {
  try {
    const report = await request.json() as any;
    // Only keep minimal fields
    const minimalReport = {
      illness_type: report.illnessType,
      latitude: report.latitude,
      longitude: report.longitude,
      country: report.country,
      created_at: new Date().toISOString(),
    };
    // File-per-day logic
    const today = new Date().toISOString().slice(0, 10);
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    const filePath = path.join(dataDir, `reports-${today}.json`);
    let reports: any[] = [];
    if (fs.existsSync(filePath)) {
      reports = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    reports.push(minimalReport);
    fs.writeFileSync(filePath, JSON.stringify(reports, null, 2));
    return new Response(
      JSON.stringify({ success: true, data: minimalReport }),
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
      JSON.stringify({ error: 'Failed to create report' }),
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

async function handleGetReports(supabase: any): Promise<Response> {
  try {
    // Aggregate all daily files
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const files = fs.readdirSync(dataDir).filter(f => f.startsWith('reports-') && f.endsWith('.json'));
    let allReports: any[] = [];
    for (const file of files) {
      const fileReports = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
      allReports = allReports.concat(fileReports);
    }
    // Sort by created_at descending
    allReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // Limit to 100
    const limited = allReports.slice(0, 100);
    return new Response(
      JSON.stringify(limited),
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
      JSON.stringify({ error: 'Failed to get reports' }),
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

async function handleGetHealthTips(supabase: any): Promise<Response> {
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
      JSON.stringify({ error: 'Failed to get health tips' }),
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

async function handleGetDiseaseRisk(request: Request, supabase: any): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pinCode = url.searchParams.get('pinCode');

    if (!pinCode) {
      return new Response(
        JSON.stringify({ error: 'Pin code is required' }),
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
      JSON.stringify({ error: 'Failed to get disease risk' }),
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

async function handleGetDiseases(supabase: any): Promise<Response> {
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
      JSON.stringify({ error: 'Failed to get diseases' }),
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

async function handleGetRegions(supabase: any): Promise<Response> {
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
      JSON.stringify({ error: 'Failed to get regions' }),
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

async function handleGetWHOData(): Promise<Response> {
  try {
    const whoApiUrl = 'https://ghoapi.azureedge.net/api/WHS3_62'; // Reported number of measles cases
    const response = await fetch(whoApiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WHO API request failed with status ${response.status}`);
    }

    const data = await response.json() as { value: any[] };

    return new Response(
      JSON.stringify(data.value),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching WHO data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Failed to get WHO data', details: errorMessage }),
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

async function handleGetHealthAggregates(supabase: any): Promise<Response> {
  try {
    // Aggregate all daily files
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const files = fs.readdirSync(dataDir).filter(f => f.startsWith('reports-') && f.endsWith('.json'));
    let reportsData: any[] = [];
    for (const file of files) {
      const fileReports = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
      reportsData = reportsData.concat(fileReports);
    }
    // Calculate aggregates
    const totalReports = reportsData.length;
    // Count unique countries
    const uniqueCountries = new Set(reportsData.map((r: any) => r.country)).size;
    // Count reports in last 24 hours
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const reportsLast24h = reportsData.filter((r: any) => 
      new Date(r.created_at) > oneDayAgo
    ).length;
    // Find most reported illness_type
    const illnessCounts: { [key: string]: number } = {};
    reportsData.forEach((r: any) => {
      if (!r.illness_type) return;
      illnessCounts[r.illness_type] = (illnessCounts[r.illness_type] || 0) + 1;
    });
    const mostReportedIllness = Object.keys(illnessCounts).length > 0 
      ? Object.entries(illnessCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'N/A';

    const aggregates = [
      { metric: 'total_reports', value: totalReports },
      { metric: 'active_countries', value: uniqueCountries },
      { metric: 'reports_in_last_24h', value: reportsLast24h },
      { metric: 'most_reported_illness', value: mostReportedIllness }
    ];

    return new Response(
      JSON.stringify(aggregates),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error calculating health aggregates:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get health aggregates' }),
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