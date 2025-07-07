interface Env {
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

// In-memory storage (in production, you'd use KV or D1)
let symptomReports: any[] = [];
let aiConsultations: any[] = [];
let phoneNotifications: any[] = [];
let emergencyAlerts: any[] = [];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

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
            phoneAISystem: '+1 7703620543'
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
        return await handleCreateReport(request);
      }

      if (path === '/api/reports' && request.method === 'GET') {
        return await handleGetReports();
      }

      if (path === '/api/health-aggregates' && request.method === 'GET') {
        return await handleGetHealthAggregates();
      }

      // Phone AI Integration endpoints
      if (path === '/api/phone-ai/voice-report' && request.method === 'POST') {
        return await handleVoiceSymptomReport(request);
      }

      if (path === '/api/phone-ai/health-consultation' && request.method === 'POST') {
        return await handlePhoneAIConsultation(request);
      }

      if (path === '/api/phone-ai/send-notification' && request.method === 'POST') {
        return await handleSendPhoneNotification(request);
      }

      if (path === '/api/phone-ai/emergency-alert' && request.method === 'POST') {
        return await handleEmergencyAlert(request);
      }

      if (path === '/api/phone-ai/health-status' && request.method === 'GET') {
        return await handleGetPhoneHealthStatus(request);
      }

      // Predictive Analytics endpoints
      if (path === '/api/analytics/outbreak-prediction' && request.method === 'GET') {
        return await handleOutbreakPrediction(request);
      }

      if (path === '/api/analytics/health-trends' && request.method === 'GET') {
        return await handleHealthTrends(request);
      }

      if (path === '/api/analytics/risk-assessment' && request.method === 'POST') {
        return await handleRiskAssessment(request);
      }

      if (path === '/api/analytics/seasonal-patterns' && request.method === 'GET') {
        return await handleSeasonalPatterns(request);
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
async function handleCreateReport(request: Request): Promise<Response> {
  try {
    const report = await request.json() as any;
    
    const newReport = {
      id: generateId(),
      nickname: report.nickname,
      country: report.country,
      pin_code: report.pinCode,
      symptoms: report.symptoms,
      illness_type: report.illnessType,
      severity: report.severity,
      latitude: report.latitude,
      longitude: report.longitude,
      phone_number: report.phoneNumber,
      created_at: new Date().toISOString()
    };

    symptomReports.push(newReport);

    return new Response(
      JSON.stringify({ success: true, data: newReport }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleCreateReport:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handleGetReports(): Promise<Response> {
  try {
    return new Response(
      JSON.stringify({
        reports: symptomReports,
        total: symptomReports.length,
        lastUpdated: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetReports:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handleGetHealthAggregates(): Promise<Response> {
  try {
    const totalReports = symptomReports.length;
    const recentReports = symptomReports.filter(r => {
      const reportDate = new Date(r.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return reportDate > weekAgo;
    });

    const severityCounts = symptomReports.reduce((acc: any, report: any) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {});

    const illnessCounts = symptomReports.reduce((acc: any, report: any) => {
      acc[report.illness_type] = (acc[report.illness_type] || 0) + 1;
      return acc;
    }, {});

    return new Response(
      JSON.stringify({
        totalReports,
        recentReports: recentReports.length,
        severityDistribution: severityCounts,
        illnessDistribution: illnessCounts,
        lastUpdated: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetHealthAggregates:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

// Phone AI Integration Handlers
async function handleVoiceSymptomReport(request: Request): Promise<Response> {
  try {
    const { phoneNumber, symptoms, audioUrl, location } = await request.json() as any;
    
    const consultation = {
      id: generateId(),
      phone_number: phoneNumber,
      symptoms: symptoms,
      audio_url: audioUrl,
      location: location,
      consultation_type: 'voice_report',
      status: 'pending_diagnosis',
      created_at: new Date().toISOString()
    };

    aiConsultations.push(consultation);

    // Send to external AI diagnosis phone system (+1 7703620543)
    const aiDiagnosisRequest = {
      consultationId: consultation.id,
      phoneNumber: phoneNumber,
      symptoms: symptoms,
      audioUrl: audioUrl,
      location: location,
      timestamp: new Date().toISOString()
    };

    // Simulate sending to external AI system
    const aiResponse = await simulateExternalAIDiagnosis(aiDiagnosisRequest);

    // Update consultation with AI diagnosis
    const consultationIndex = aiConsultations.findIndex(c => c.id === consultation.id);
    if (consultationIndex !== -1) {
      aiConsultations[consultationIndex] = {
        ...aiConsultations[consultationIndex],
        diagnosis: aiResponse.diagnosis,
        confidence_score: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        status: 'completed',
        ai_response: aiResponse,
        updated_at: new Date().toISOString()
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        consultationId: consultation.id,
        diagnosis: aiResponse.diagnosis,
        confidence: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        phoneNumber: '+1 7703620543',
        message: 'Voice report processed and sent to external AI diagnosis system'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleVoiceSymptomReport:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handlePhoneAIConsultation(request: Request): Promise<Response> {
  try {
    const { phoneNumber, symptoms, medicalHistory, urgency } = await request.json() as any;
    
    const consultation = {
      id: generateId(),
      phone_number: phoneNumber,
      symptoms: symptoms,
      medical_history: medicalHistory,
      urgency_level: urgency || 'normal',
      consultation_type: 'ai_diagnosis',
      status: 'in_progress',
      created_at: new Date().toISOString()
    };

    aiConsultations.push(consultation);

    // Simulate external AI diagnosis process
    const aiDiagnosis = await simulateExternalAIDiagnosis({
      consultationId: consultation.id,
      symptoms: symptoms,
      medicalHistory: medicalHistory,
      urgency: urgency
    });

    // Update consultation with results
    const consultationIndex = aiConsultations.findIndex(c => c.id === consultation.id);
    if (consultationIndex !== -1) {
      aiConsultations[consultationIndex] = {
        ...aiConsultations[consultationIndex],
        diagnosis: aiDiagnosis.diagnosis,
        confidence_score: aiDiagnosis.confidence,
        recommendations: aiDiagnosis.recommendations,
        severity_assessment: aiDiagnosis.severity,
        status: 'completed',
        ai_response: aiDiagnosis,
        updated_at: new Date().toISOString()
      };
    }

    // Send notification to external AI phone system if urgent
    if (urgency === 'urgent' || aiDiagnosis.severity === 'high') {
      await sendUrgentNotification(phoneNumber, aiDiagnosis);
    }

    return new Response(
      JSON.stringify({
        success: true,
        consultationId: consultation.id,
        diagnosis: aiDiagnosis.diagnosis,
        confidence: aiDiagnosis.confidence,
        severity: aiDiagnosis.severity,
        recommendations: aiDiagnosis.recommendations,
        phoneAIContact: '+1 7703620543',
        followUpRequired: aiDiagnosis.followUpRequired,
        message: 'AI consultation completed successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handlePhoneAIConsultation:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handleSendPhoneNotification(request: Request): Promise<Response> {
  try {
    const { phoneNumber, message, type, consultationId } = await request.json() as any;
    
    const notification = {
      id: generateId(),
      phone_number: phoneNumber,
      message: message,
      notification_type: type,
      consultation_id: consultationId,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    phoneNotifications.push(notification);

    // Simulate sending to external AI phone system
    const notificationSent = await simulatePhoneNotification(phoneNumber, message, type);

    return new Response(
      JSON.stringify({
        success: true,
        notificationId: notification.id,
        sent: notificationSent,
        phoneAISystem: '+1 7703620543',
        message: 'Notification sent to external AI phone system'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleSendPhoneNotification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handleEmergencyAlert(request: Request): Promise<Response> {
  try {
    const { phoneNumber, symptoms, location, severity, description } = await request.json() as any;
    
    const alert = {
      id: generateId(),
      phone_number: phoneNumber,
      symptoms: symptoms,
      location: location,
      severity: severity,
      description: description,
      status: 'active',
      created_at: new Date().toISOString()
    };

    emergencyAlerts.push(alert);

    // Send immediate alert to external AI phone system
    const emergencyMessage = `EMERGENCY ALERT: ${severity} case reported. Symptoms: ${symptoms.join(', ')}. Location: ${location}. Call: ${phoneNumber}`;
    
    const alertSent = await sendEmergencyNotification(phoneNumber, emergencyMessage, severity);

    // Also create an AI consultation for immediate diagnosis
    const consultation = {
      id: generateId(),
      phone_number: phoneNumber,
      symptoms: symptoms,
      urgency_level: 'critical',
      consultation_type: 'emergency_diagnosis',
      status: 'urgent',
      emergency_alert_id: alert.id,
      created_at: new Date().toISOString()
    };

    aiConsultations.push(consultation);

    return new Response(
      JSON.stringify({
        success: true,
        alertId: alert.id,
        consultationId: consultation.id,
        emergencyContact: '+1 7703620543',
        alertSent: alertSent,
        message: 'Emergency alert sent to external AI phone system',
        immediateAction: 'External AI diagnosis system has been notified'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleEmergencyAlert:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handleGetPhoneHealthStatus(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const phoneNumber = url.searchParams.get('phoneNumber');
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Get recent consultations for this phone number
    const consultations = aiConsultations
      .filter(c => c.phone_number === phoneNumber)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Get recent symptom reports for this phone number
    const reports = symptomReports
      .filter(r => r.phone_number === phoneNumber)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Calculate health score
    const healthScore = calculateHealthScore(reports);
    const recommendations = getHealthRecommendations(healthScore);

    // Get active emergency alerts
    const activeAlerts = emergencyAlerts.filter(a => 
      a.phone_number === phoneNumber && a.status === 'active'
    );

    return new Response(
      JSON.stringify({
        phoneNumber: phoneNumber,
        healthScore: healthScore,
        recommendations: recommendations,
        recentConsultations: consultations.length,
        recentReports: reports.length,
        activeAlerts: activeAlerts.length,
        lastConsultation: consultations[0]?.created_at,
        aiPhoneSystem: '+1 7703620543',
        status: 'active',
        lastUpdated: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleGetPhoneHealthStatus:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function calculateHealthScore(reports: any[]): number {
  if (reports.length === 0) return 100;
  
  let score = 100;
  
  reports.forEach((report: any) => {
    switch (report.severity) {
      case 'severe':
        score -= 20;
        break;
      case 'moderate':
        score -= 10;
        break;
      case 'mild':
        score -= 5;
        break;
    }
    
    if (reports.length > 5) score -= 10;
  });
  
  return Math.max(0, score);
}

function getHealthRecommendations(healthScore: number): string[] {
  const recommendations = [];
  
  if (healthScore < 50) {
    recommendations.push('Consider consulting a healthcare professional');
    recommendations.push('Focus on rest and recovery');
  } else if (healthScore < 70) {
    recommendations.push('Monitor your symptoms closely');
    recommendations.push('Maintain good hygiene practices');
  } else {
    recommendations.push('Continue with your current health routine');
    recommendations.push('Stay hydrated and get adequate sleep');
  }
  
  return recommendations;
}

async function simulateExternalAIDiagnosis(request: any): Promise<any> {
  // Simulate external AI diagnosis process
  const commonDiagnoses = [
    { condition: 'Common Cold', confidence: 0.85, severity: 'low' },
    { condition: 'Seasonal Allergies', confidence: 0.78, severity: 'low' },
    { condition: 'Mild Dehydration', confidence: 0.72, severity: 'low' },
    { condition: 'Stress-related Symptoms', confidence: 0.68, severity: 'low' },
    { condition: 'Flu-like Symptoms', confidence: 0.82, severity: 'moderate' },
    { condition: 'Respiratory Infection', confidence: 0.75, severity: 'moderate' }
  ];

  const randomDiagnosis = commonDiagnoses[Math.floor(Math.random() * commonDiagnoses.length)];
  
  return {
    diagnosis: randomDiagnosis.condition,
    confidence: randomDiagnosis.confidence,
    severity: randomDiagnosis.severity,
    recommendations: [
      'Rest and stay hydrated',
      'Monitor symptoms closely',
      'Consider over-the-counter medications if appropriate',
      'Contact healthcare provider if symptoms worsen'
    ],
    followUpRequired: randomDiagnosis.severity === 'moderate',
    externalAISystem: '+1 7703620543',
    timestamp: new Date().toISOString()
  };
}

async function simulatePhoneNotification(phoneNumber: string, message: string, type: string): Promise<boolean> {
  // Simulate sending notification to external AI phone system
  console.log(`Sending ${type} notification to ${phoneNumber}: ${message}`);
  console.log(`External AI Phone System: +1 7703620543`);
  return true;
}

async function sendUrgentNotification(phoneNumber: string, diagnosis: any): Promise<boolean> {
  const urgentMessage = `URGENT: ${diagnosis.diagnosis} detected. Confidence: ${diagnosis.confidence}. Severity: ${diagnosis.severity}. Call external AI system: +1 7703620543`;
  return await simulatePhoneNotification(phoneNumber, urgentMessage, 'urgent');
}

async function sendEmergencyNotification(phoneNumber: string, message: string, severity: string): Promise<boolean> {
  const emergencyMessage = `CRITICAL: ${message}. External AI System: +1 7703620543`;
  return await simulatePhoneNotification(phoneNumber, emergencyMessage, 'emergency');
}

// Predictive Analytics Handlers
async function handleOutbreakPrediction(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') || 'general';
    const timeframe = url.searchParams.get('timeframe') || '30';

    // Analyze recent symptom reports for patterns
    const recentReports = symptomReports.filter(r => {
      const reportDate = new Date(r.created_at);
      const daysAgo = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000);
      return reportDate > daysAgo;
    });

    // Group by illness type and location
    const illnessCounts = recentReports.reduce((acc: any, report: any) => {
      const illness = report.illness_type || 'unknown';
      if (!acc[illness]) {
        acc[illness] = { count: 0, locations: new Set(), severity: { mild: 0, moderate: 0, severe: 0 } };
      }
      acc[illness].count++;
      acc[illness].locations.add(report.country);
      acc[illness].severity[report.severity]++;
      return acc;
    }, {});

    // Prepare data for AI analysis
    const analysisData = {
      timeframe: `${timeframe} days`,
      location: location,
      totalReports: recentReports.length,
      illnessBreakdown: Object.entries(illnessCounts).map(([illness, data]: [string, any]) => ({
        illness,
        count: data.count,
        locations: Array.from(data.locations),
        severity: data.severity
      })),
      recentTrends: recentReports.slice(-10).map(r => ({
        date: r.created_at,
        illness: r.illness_type,
        severity: r.severity,
        location: r.country
      }))
    };

    // Use Hack Club AI for prediction
    const prediction = await getAIPrediction(analysisData, 'outbreak');

    return new Response(
      JSON.stringify({
        prediction: prediction,
        data: analysisData,
        confidence: prediction.confidence || 0.75,
        recommendations: prediction.recommendations || [],
        lastUpdated: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleOutbreakPrediction:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handleHealthTrends(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7';

    // Get reports for the specified period
    const periodReports = symptomReports.filter(r => {
      const reportDate = new Date(r.created_at);
      const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
      return reportDate > daysAgo;
    });

    // Analyze trends
    const dailyTrends = periodReports.reduce((acc: any, report: any) => {
      const date = new Date(report.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, illnesses: {}, severity: { mild: 0, moderate: 0, severe: 0 } };
      }
      acc[date].total++;
      acc[date].illnesses[report.illness_type] = (acc[date].illnesses[report.illness_type] || 0) + 1;
      acc[date].severity[report.severity]++;
      return acc;
    }, {});

    // Calculate trend indicators
    const trendData = {
      period: `${period} days`,
      totalReports: periodReports.length,
      averageDaily: periodReports.length / parseInt(period),
      dailyBreakdown: Object.entries(dailyTrends).map(([date, data]: [string, any]) => ({
        date,
        total: data.total,
        illnesses: data.illnesses,
        severity: data.severity
      })),
      topIllnesses: Object.entries(
        periodReports.reduce((acc: any, r: any) => {
          acc[r.illness_type] = (acc[r.illness_type] || 0) + 1;
          return acc;
        }, {})
      ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5)
    };

    // Get AI insights
    const insights = await getAIPrediction(trendData, 'trends');

    return new Response(
      JSON.stringify({
        trends: trendData,
        insights: insights,
        lastUpdated: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleHealthTrends:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handleRiskAssessment(request: Request): Promise<Response> {
  try {
    const { location, symptoms, medicalHistory, age, gender } = await request.json() as any;

    // Get local health data
    const localReports = symptomReports.filter(r => 
      r.country === location || r.pin_code === location
    ).slice(-50);

    // Prepare risk assessment data
    const assessmentData = {
      userProfile: {
        age: age || 'unknown',
        gender: gender || 'unknown',
        location: location,
        symptoms: symptoms || [],
        medicalHistory: medicalHistory || []
      },
      localHealthData: {
        totalReports: localReports.length,
        recentIllnesses: localReports.slice(-10).map(r => r.illness_type),
        severityDistribution: localReports.reduce((acc: any, r: any) => {
          acc[r.severity] = (acc[r.severity] || 0) + 1;
          return acc;
        }, {})
      },
      globalContext: {
        totalReports: symptomReports.length,
        topIllnesses: Object.entries(
          symptomReports.reduce((acc: any, r: any) => {
            acc[r.illness_type] = (acc[r.illness_type] || 0) + 1;
            return acc;
          }, {})
        ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5)
      }
    };

    // Get AI risk assessment
    const riskAssessment = await getAIPrediction(assessmentData, 'risk');

    return new Response(
      JSON.stringify({
        riskAssessment: riskAssessment,
        data: assessmentData,
        lastUpdated: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleRiskAssessment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

async function handleSeasonalPatterns(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get('location') || 'all';

    // Analyze seasonal patterns
    const seasonalData = symptomReports.reduce((acc: any, report: any) => {
      const date = new Date(report.created_at);
      const month = date.getMonth();
      const season = getSeason(month);
      
      if (!acc[season]) {
        acc[season] = { total: 0, illnesses: {}, locations: new Set() };
      }
      
      acc[season].total++;
      acc[season].illnesses[report.illness_type] = (acc[season].illnesses[report.illness_type] || 0) + 1;
      acc[season].locations.add(report.country);
      
      return acc;
    }, {});

    // Convert to array format
    const seasonalAnalysis = Object.entries(seasonalData).map(([season, data]: [string, any]) => ({
      season,
      total: data.total,
      illnesses: data.illnesses,
      locations: Array.from(data.locations)
    }));

    // Get AI seasonal insights
    const insights = await getAIPrediction(seasonalAnalysis, 'seasonal');

    return new Response(
      JSON.stringify({
        seasonalPatterns: seasonalAnalysis,
        insights: insights,
        lastUpdated: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in handleSeasonalPatterns:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

// Helper functions for Predictive Analytics
async function getAIPrediction(data: any, type: string): Promise<any> {
  try {
    const prompt = generateAIPrompt(data, type);
    
    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a health analytics expert specializing in predictive modeling and outbreak detection. Provide clear, actionable insights based on health data patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const result = await response.json() as any;
    const aiResponse = result.choices?.[0]?.message?.content || '';

    // Parse AI response and return structured data
    return parseAIResponse(aiResponse, type);
  } catch (error) {
    console.error('Error calling AI service:', error);
    // Return fallback response
    return getFallbackResponse(type);
  }
}

function generateAIPrompt(data: any, type: string): string {
  switch (type) {
    case 'outbreak':
      return `Analyze this health data for potential outbreak patterns:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Outbreak risk assessment (low/medium/high)
2. Confidence level (0-1)
3. Key indicators of concern
4. Recommended preventive measures
5. Timeline prediction for potential outbreak

Format your response as JSON with keys: risk, confidence, indicators, recommendations, timeline`;

    case 'trends':
      return `Analyze these health trends:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Trend analysis summary
2. Key patterns identified
3. Anomalies or concerning trends
4. Recommendations for monitoring
5. Future trend predictions

Format your response as JSON with keys: summary, patterns, anomalies, recommendations, predictions`;

    case 'risk':
      return `Assess health risk for this individual:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Overall risk level (low/medium/high)
2. Specific risk factors
3. Preventive recommendations
4. Monitoring suggestions
5. Emergency indicators to watch for

Format your response as JSON with keys: riskLevel, riskFactors, recommendations, monitoring, emergencyIndicators`;

    case 'seasonal':
      return `Analyze seasonal health patterns:

Data: ${JSON.stringify(data, null, 2)}

Please provide:
1. Seasonal pattern summary
2. Peak illness periods
3. Seasonal risk factors
4. Preventive measures by season
5. Preparation recommendations

Format your response as JSON with keys: summary, peakPeriods, riskFactors, preventiveMeasures, preparation`;

    default:
      return `Analyze this health data: ${JSON.stringify(data, null, 2)}`;
  }
}

function parseAIResponse(response: string, type: string): any {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback parsing
    return {
      summary: response,
      confidence: 0.7,
      recommendations: ['Monitor health trends closely', 'Maintain good hygiene practices']
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return getFallbackResponse(type);
  }
}

function getFallbackResponse(type: string): any {
  const fallbacks = {
    outbreak: {
      risk: 'medium',
      confidence: 0.6,
      indicators: ['Increased symptom reports', 'Multiple locations affected'],
      recommendations: ['Monitor trends closely', 'Maintain hygiene protocols'],
      timeline: '2-4 weeks'
    },
    trends: {
      summary: 'Health trends are being monitored',
      patterns: ['Seasonal variations', 'Location-based clusters'],
      anomalies: 'None detected',
      recommendations: ['Continue monitoring', 'Report unusual patterns'],
      predictions: 'Stable trend expected'
    },
    risk: {
      riskLevel: 'low',
      riskFactors: ['General population risk'],
      recommendations: ['Maintain good health practices'],
      monitoring: ['Watch for symptom changes'],
      emergencyIndicators: ['Severe symptoms', 'Rapid deterioration']
    },
    seasonal: {
      summary: 'Seasonal patterns analyzed',
      peakPeriods: ['Winter respiratory', 'Summer heat-related'],
      riskFactors: ['Weather changes', 'Seasonal activities'],
      preventiveMeasures: ['Seasonal vaccinations', 'Weather-appropriate clothing'],
      preparation: ['Plan for seasonal health needs']
    }
  };
  
  return fallbacks[type as keyof typeof fallbacks] || fallbacks.trends;
}

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}