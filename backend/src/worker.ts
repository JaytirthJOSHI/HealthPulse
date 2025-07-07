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