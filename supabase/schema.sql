-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create regions table for disease mapping
CREATE TABLE IF NOT EXISTS regions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    country TEXT NOT NULL,
    state_province TEXT,
    city TEXT,
    pin_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    climate_zone TEXT,
    population_density TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diseases table
CREATE TABLE IF NOT EXISTS diseases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    category TEXT NOT NULL,
    severity_level TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    transmission_method TEXT[],
    common_symptoms TEXT[],
    incubation_period TEXT,
    treatment_options TEXT[],
    prevention_methods TEXT[],
    seasonal_pattern TEXT,
    endemic_regions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disease_regions mapping table
CREATE TABLE IF NOT EXISTS disease_regions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    disease_id UUID REFERENCES diseases(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    prevalence_level TEXT CHECK (prevalence_level IN ('low', 'medium', 'high', 'endemic')),
    seasonal_peak TEXT[],
    risk_factors TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(disease_id, region_id)
);

-- Create symptom_reports table
CREATE TABLE IF NOT EXISTS symptom_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nickname TEXT,
    country TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    symptoms TEXT[] NOT NULL,
    illness_type TEXT NOT NULL CHECK (illness_type IN ('flu', 'dengue', 'covid', 'malaria', 'typhoid', 'chikungunya', 'unknown', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI consultations table for phone AI integration
CREATE TABLE IF NOT EXISTS ai_consultations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    symptoms TEXT[] NOT NULL,
    medical_history JSONB,
    urgency_level TEXT CHECK (urgency_level IN ('normal', 'urgent', 'critical')) DEFAULT 'normal',
    consultation_type TEXT NOT NULL CHECK (consultation_type IN ('voice_report', 'ai_diagnosis', 'emergency_diagnosis')),
    status TEXT NOT NULL CHECK (status IN ('pending_diagnosis', 'in_progress', 'completed', 'urgent')) DEFAULT 'pending_diagnosis',
    diagnosis TEXT,
    confidence_score DECIMAL(3, 2),
    recommendations TEXT[],
    severity_assessment TEXT CHECK (severity_assessment IN ('low', 'moderate', 'high', 'critical')),
    audio_url TEXT,
    location JSONB,
    emergency_alert_id UUID,
    ai_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create phone notifications table
CREATE TABLE IF NOT EXISTS phone_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('health_tip', 'outbreak_alert', 'weather_alert', 'personalized', 'urgent', 'emergency')),
    consultation_id UUID REFERENCES ai_consultations(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    symptoms TEXT[] NOT NULL,
    location JSONB,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'escalated')) DEFAULT 'active',
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification subscriptions table
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT,
    country TEXT,
    pin_code TEXT,
    email TEXT,
    push_enabled BOOLEAN DEFAULT false,
    outbreak_alerts BOOLEAN DEFAULT true,
    health_tips BOOLEAN DEFAULT true,
    weather_alerts BOOLEAN DEFAULT true,
    personalized_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_tips table
CREATE TABLE IF NOT EXISTS health_tips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    symptoms TEXT[],
    target_diseases TEXT[],
    seasonal_relevance TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_symptom_reports_country ON symptom_reports(country);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_pin_code ON symptom_reports(pin_code);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_created_at ON symptom_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_location ON symptom_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_phone ON symptom_reports(phone_number);
CREATE INDEX IF NOT EXISTS idx_health_tips_category ON health_tips(category);
CREATE INDEX IF NOT EXISTS idx_health_tips_severity ON health_tips(severity);
CREATE INDEX IF NOT EXISTS idx_diseases_category ON diseases(category);
CREATE INDEX IF NOT EXISTS idx_diseases_severity ON diseases(severity_level);
CREATE INDEX IF NOT EXISTS idx_regions_location ON regions(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_disease_regions_prevalence ON disease_regions(prevalence_level);

-- Phone AI integration indexes
CREATE INDEX IF NOT EXISTS idx_ai_consultations_phone ON ai_consultations(phone_number);
CREATE INDEX IF NOT EXISTS idx_ai_consultations_status ON ai_consultations(status);
CREATE INDEX IF NOT EXISTS idx_ai_consultations_type ON ai_consultations(consultation_type);
CREATE INDEX IF NOT EXISTS idx_ai_consultations_created_at ON ai_consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phone_notifications_phone ON phone_notifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_notifications_status ON phone_notifications(status);
CREATE INDEX IF NOT EXISTS idx_phone_notifications_type ON phone_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_phone ON emergency_alerts(phone_number);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_severity ON emergency_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user ON notification_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_location ON notification_subscriptions(country, pin_code);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_symptom_reports_updated_at 
    BEFORE UPDATE ON symptom_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_tips_updated_at 
    BEFORE UPDATE ON health_tips 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_consultations_updated_at 
    BEFORE UPDATE ON ai_consultations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_alerts_updated_at 
    BEFORE UPDATE ON emergency_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_subscriptions_updated_at 
    BEFORE UPDATE ON notification_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample regions with disease data
INSERT INTO regions (country, state_province, city, pin_code, latitude, longitude, climate_zone, population_density) VALUES
('India', 'Maharashtra', 'Mumbai', '400001', 19.0760, 72.8777, 'tropical', 'high'),
('India', 'Delhi', 'New Delhi', '110001', 28.6139, 77.2090, 'subtropical', 'very_high'),
('India', 'West Bengal', 'Kolkata', '700001', 22.5726, 88.3639, 'tropical', 'high'),
('India', 'Tamil Nadu', 'Chennai', '600001', 13.0827, 80.2707, 'tropical', 'high'),
('India', 'Karnataka', 'Bangalore', '560001', 12.9716, 77.5946, 'tropical', 'high'),
('India', 'Kerala', 'Thiruvananthapuram', '695001', 8.5241, 76.9366, 'tropical', 'medium'),
('India', 'Gujarat', 'Ahmedabad', '380001', 23.0225, 72.5714, 'arid', 'high'),
('India', 'Rajasthan', 'Jaipur', '302001', 26.9124, 75.7873, 'arid', 'medium'),
('India', 'Uttar Pradesh', 'Lucknow', '226001', 26.8467, 80.9462, 'subtropical', 'high'),
('India', 'Bihar', 'Patna', '800001', 25.5941, 85.1376, 'subtropical', 'high');

-- Insert comprehensive diseases database
INSERT INTO diseases (name, scientific_name, category, severity_level, transmission_method, common_symptoms, incubation_period, treatment_options, prevention_methods, seasonal_pattern, endemic_regions) VALUES
-- Vector-borne diseases
('Dengue Fever', 'Dengue virus', 'vector_borne', 'high', ARRAY['mosquito_bite'], ARRAY['High fever', 'Severe headache', 'Joint pain', 'Muscle pain', 'Rash', 'Bleeding gums'], '4-10 days', ARRAY['Rest', 'Hydration', 'Pain relievers', 'Hospital care for severe cases'], ARRAY['Mosquito control', 'Use repellents', 'Wear protective clothing', 'Eliminate standing water'], 'monsoon', ARRAY['tropical', 'subtropical']),

('Malaria', 'Plasmodium spp.', 'vector_borne', 'high', ARRAY['mosquito_bite'], ARRAY['Cyclic fever', 'Chills', 'Sweating', 'Headache', 'Nausea', 'Fatigue'], '7-30 days', ARRAY['Antimalarial drugs', 'Hospital care', 'Blood transfusion if needed'], ARRAY['Mosquito nets', 'Repellents', 'Prophylactic medication'], 'monsoon', ARRAY['tropical', 'subtropical']),

('Chikungunya', 'Chikungunya virus', 'vector_borne', 'medium', ARRAY['mosquito_bite'], ARRAY['High fever', 'Severe joint pain', 'Rash', 'Headache', 'Muscle pain'], '3-7 days', ARRAY['Rest', 'Pain relievers', 'Anti-inflammatory drugs'], ARRAY['Mosquito control', 'Repellents', 'Protective clothing'], 'monsoon', ARRAY['tropical']),

-- Respiratory diseases
('COVID-19', 'SARS-CoV-2', 'respiratory', 'high', ARRAY['airborne', 'close_contact'], ARRAY['Fever', 'Cough', 'Fatigue', 'Loss of taste/smell', 'Shortness of breath'], '2-14 days', ARRAY['Rest', 'Hydration', 'Oxygen therapy', 'Antiviral medications'], ARRAY['Vaccination', 'Mask wearing', 'Social distancing', 'Hand hygiene'], 'year_round', ARRAY['global']),

('Influenza', 'Influenza virus', 'respiratory', 'medium', ARRAY['airborne', 'close_contact'], ARRAY['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue'], '1-4 days', ARRAY['Rest', 'Hydration', 'Antiviral medications', 'Pain relievers'], ARRAY['Annual vaccination', 'Hand hygiene', 'Avoiding sick people'], 'winter', ARRAY['global']),

('Tuberculosis', 'Mycobacterium tuberculosis', 'respiratory', 'high', ARRAY['airborne'], ARRAY['Persistent cough', 'Chest pain', 'Weight loss', 'Night sweats', 'Fatigue'], '2-12 weeks', ARRAY['Antibiotic therapy', 'Directly observed treatment'], ARRAY['BCG vaccination', 'Early detection', 'Proper ventilation'], 'year_round', ARRAY['global']),

-- Water-borne diseases
('Typhoid Fever', 'Salmonella typhi', 'water_borne', 'high', ARRAY['contaminated_food', 'contaminated_water'], ARRAY['High fever', 'Headache', 'Abdominal pain', 'Diarrhea', 'Constipation'], '6-30 days', ARRAY['Antibiotics', 'Hospital care', 'Hydration'], ARRAY['Safe drinking water', 'Food hygiene', 'Vaccination'], 'monsoon', ARRAY['tropical', 'subtropical']),

('Cholera', 'Vibrio cholerae', 'water_borne', 'high', ARRAY['contaminated_water', 'contaminated_food'], ARRAY['Severe diarrhea', 'Vomiting', 'Dehydration', 'Muscle cramps'], '2-5 days', ARRAY['Oral rehydration', 'IV fluids', 'Antibiotics'], ARRAY['Safe drinking water', 'Sanitation', 'Food hygiene'], 'monsoon', ARRAY['tropical']),

('Hepatitis A', 'Hepatitis A virus', 'water_borne', 'medium', ARRAY['contaminated_food', 'contaminated_water'], ARRAY['Jaundice', 'Fatigue', 'Nausea', 'Abdominal pain', 'Dark urine'], '15-50 days', ARRAY['Rest', 'Hydration', 'Supportive care'], ARRAY['Vaccination', 'Safe drinking water', 'Food hygiene'], 'monsoon', ARRAY['tropical', 'subtropical']),

-- Heat-related conditions
('Heat Stroke', 'Hyperthermia', 'environmental', 'critical', ARRAY['heat_exposure'], ARRAY['High body temperature', 'Confusion', 'Seizures', 'Loss of consciousness'], 'immediate', ARRAY['Cooling measures', 'IV fluids', 'Hospital care'], ARRAY['Stay hydrated', 'Avoid peak sun hours', 'Light clothing'], 'summer', ARRAY['tropical', 'arid']),

('Heat Exhaustion', 'Heat stress', 'environmental', 'medium', ARRAY['heat_exposure'], ARRAY['Heavy sweating', 'Weakness', 'Dizziness', 'Nausea', 'Headache'], 'immediate', ARRAY['Cooling measures', 'Hydration', 'Rest'], ARRAY['Stay hydrated', 'Avoid peak sun hours', 'Light clothing'], 'summer', ARRAY['tropical', 'arid']),

-- Air pollution related
('Bronchitis', 'Acute bronchitis', 'respiratory', 'medium', ARRAY['air_pollution', 'viral_infection'], ARRAY['Persistent cough', 'Chest discomfort', 'Fatigue', 'Mild fever'], '3-10 days', ARRAY['Rest', 'Hydration', 'Cough suppressants'], ARRAY['Air purifiers', 'Avoid pollution', 'Masks'], 'winter', ARRAY['urban']),

('Asthma', 'Bronchial asthma', 'respiratory', 'medium', ARRAY['allergens', 'air_pollution'], ARRAY['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing'], 'variable', ARRAY['Inhalers', 'Avoiding triggers', 'Medication'], ARRAY['Avoid triggers', 'Air purifiers', 'Regular medication'], 'year_round', ARRAY['urban']);

-- Insert disease-region mappings
INSERT INTO disease_regions (disease_id, region_id, prevalence_level, seasonal_peak, risk_factors) VALUES
-- Mumbai (tropical, high density)
((SELECT id FROM diseases WHERE name = 'Dengue Fever'), (SELECT id FROM regions WHERE city = 'Mumbai'), 'high', ARRAY['monsoon', 'post_monsoon'], ARRAY['High population density', 'Standing water', 'Poor drainage']),
((SELECT id FROM diseases WHERE name = 'Malaria'), (SELECT id FROM regions WHERE city = 'Mumbai'), 'medium', ARRAY['monsoon'], ARRAY['Coastal area', 'Standing water']),
((SELECT id FROM diseases WHERE name = 'Typhoid Fever'), (SELECT id FROM regions WHERE city = 'Mumbai'), 'medium', ARRAY['monsoon'], ARRAY['High population density', 'Water contamination']),

-- Delhi (subtropical, very high density)
((SELECT id FROM diseases WHERE name = 'Dengue Fever'), (SELECT id FROM regions WHERE city = 'New Delhi'), 'high', ARRAY['monsoon', 'post_monsoon'], ARRAY['Very high population density', 'Standing water', 'Construction sites']),
((SELECT id FROM diseases WHERE name = 'Air pollution related'), (SELECT id FROM regions WHERE city = 'New Delhi'), 'high', ARRAY['winter'], ARRAY['High pollution levels', 'Traffic congestion']),
((SELECT id FROM diseases WHERE name = 'Bronchitis'), (SELECT id FROM regions WHERE city = 'New Delhi'), 'high', ARRAY['winter'], ARRAY['Air pollution', 'Cold weather']),

-- Kolkata (tropical, high density)
((SELECT id FROM diseases WHERE name = 'Dengue Fever'), (SELECT id FROM regions WHERE city = 'Kolkata'), 'high', ARRAY['monsoon'], ARRAY['High humidity', 'Standing water']),
((SELECT id FROM diseases WHERE name = 'Cholera'), (SELECT id FROM regions WHERE city = 'Kolkata'), 'medium', ARRAY['monsoon'], ARRAY['Water contamination', 'Poor sanitation']),
((SELECT id FROM diseases WHERE name = 'Malaria'), (SELECT id FROM regions WHERE city = 'Kolkata'), 'medium', ARRAY['monsoon'], ARRAY['High humidity', 'Standing water']),

-- Chennai (tropical, high density)
((SELECT id FROM diseases WHERE name = 'Dengue Fever'), (SELECT id FROM regions WHERE city = 'Chennai'), 'high', ARRAY['monsoon'], ARRAY['Coastal area', 'Standing water']),
((SELECT id FROM diseases WHERE name = 'Typhoid Fever'), (SELECT id FROM regions WHERE city = 'Chennai'), 'medium', ARRAY['monsoon'], ARRAY['Water contamination']),
((SELECT id FROM diseases WHERE name = 'Heat Stroke'), (SELECT id FROM regions WHERE city = 'Chennai'), 'high', ARRAY['summer'], ARRAY['High temperature', 'Humidity']),

-- Bangalore (tropical, high density)
((SELECT id FROM diseases WHERE name = 'Dengue Fever'), (SELECT id FROM regions WHERE city = 'Bangalore'), 'medium', ARRAY['monsoon'], ARRAY['Standing water', 'Garden city']),
((SELECT id FROM diseases WHERE name = 'Respiratory infections'), (SELECT id FROM regions WHERE city = 'Bangalore'), 'medium', ARRAY['winter'], ARRAY['Altitude', 'Temperature variation']),

-- Kerala (tropical, medium density)
((SELECT id FROM diseases WHERE name = 'Dengue Fever'), (SELECT id FROM regions WHERE city = 'Thiruvananthapuram'), 'high', ARRAY['monsoon'], ARRAY['High rainfall', 'Standing water']),
((SELECT id FROM diseases WHERE name = 'Malaria'), (SELECT id FROM regions WHERE city = 'Thiruvananthapuram'), 'medium', ARRAY['monsoon'], ARRAY['High rainfall', 'Forest areas']),

-- Gujarat (arid, high density)
((SELECT id FROM diseases WHERE name = 'Heat Stroke'), (SELECT id FROM regions WHERE city = 'Ahmedabad'), 'high', ARRAY['summer'], ARRAY['High temperature', 'Arid climate']),
((SELECT id FROM diseases WHERE name = 'Dengue Fever'), (SELECT id FROM regions WHERE city = 'Ahmedabad'), 'medium', ARRAY['monsoon'], ARRAY['Standing water']),

-- Rajasthan (arid, medium density)
((SELECT id FROM diseases WHERE name = 'Heat Stroke'), (SELECT id FROM regions WHERE city = 'Jaipur'), 'high', ARRAY['summer'], ARRAY['High temperature', 'Arid climate']),
((SELECT id FROM diseases WHERE name = 'Heat Exhaustion'), (SELECT id FROM regions WHERE city = 'Jaipur'), 'high', ARRAY['summer'], ARRAY['High temperature', 'Tourism']);

-- Insert enhanced health tips
INSERT INTO health_tips (title, content, category, severity, symptoms, target_diseases, seasonal_relevance) VALUES
-- Dengue specific tips
('Dengue Prevention - Mumbai', 'High dengue risk in Mumbai during monsoon. Use mosquito repellents, eliminate standing water, and wear protective clothing. Seek immediate medical care if you develop high fever with severe headache.', 'prevention', 'high', ARRAY['High fever', 'Severe headache', 'Joint pain'], ARRAY['Dengue Fever'], ARRAY['monsoon', 'post_monsoon']),

('Dengue Prevention - Delhi', 'Delhi has high dengue cases. Use mosquito nets, repellents, and avoid outdoor activities during peak mosquito hours (dawn and dusk).', 'prevention', 'high', ARRAY['High fever', 'Severe headache', 'Joint pain'], ARRAY['Dengue Fever'], ARRAY['monsoon', 'post_monsoon']),

-- Air pollution tips
('Delhi Air Quality Alert', 'Delhi has severe air pollution in winter. Use air purifiers, wear N95 masks outdoors, and avoid outdoor exercise. Monitor AQI levels.', 'prevention', 'high', ARRAY['Cough', 'Shortness of breath', 'Chest tightness'], ARRAY['Bronchitis', 'Asthma'], ARRAY['winter']),

-- Heat-related tips
('Chennai Heat Safety', 'Chennai experiences extreme heat. Stay hydrated, avoid outdoor activities during peak hours (10 AM - 4 PM), and wear light clothing.', 'prevention', 'high', ARRAY['High body temperature', 'Confusion', 'Dizziness'], ARRAY['Heat Stroke', 'Heat Exhaustion'], ARRAY['summer']),

('Jaipur Heat Management', 'Jaipur has very high temperatures. Drink plenty of water, use cooling measures, and avoid direct sun exposure during peak hours.', 'prevention', 'high', ARRAY['Heavy sweating', 'Weakness', 'Dizziness'], ARRAY['Heat Stroke', 'Heat Exhaustion'], ARRAY['summer']),

-- Water-borne disease tips
('Kolkata Water Safety', 'High risk of water-borne diseases in Kolkata during monsoon. Drink only boiled or filtered water, avoid street food, and maintain good hygiene.', 'prevention', 'high', ARRAY['Diarrhea', 'Vomiting', 'Abdominal pain'], ARRAY['Cholera', 'Typhoid Fever'], ARRAY['monsoon']),

-- General health tips
('Monsoon Health Guide', 'During monsoon, maintain good hygiene, avoid street food, use mosquito protection, and stay updated on local health alerts.', 'prevention', 'medium', ARRAY['Fever', 'Cough', 'Diarrhea'], ARRAY['Dengue Fever', 'Malaria', 'Typhoid Fever'], ARRAY['monsoon']),

('Summer Health Tips', 'Stay hydrated, avoid peak sun hours, wear light clothing, and use cooling measures to prevent heat-related illnesses.', 'prevention', 'medium', ARRAY['High body temperature', 'Weakness', 'Dizziness'], ARRAY['Heat Stroke', 'Heat Exhaustion'], ARRAY['summer']),

('Winter Health Care', 'Protect against respiratory infections by wearing warm clothing, using air purifiers, and avoiding crowded places during flu season.', 'prevention', 'medium', ARRAY['Cough', 'Sore throat', 'Fever'], ARRAY['Influenza', 'Bronchitis'], ARRAY['winter']);

-- Create a view for aggregated health data
CREATE OR REPLACE VIEW health_aggregates AS
SELECT 
    country,
    pin_code,
    COUNT(*) as total_reports,
    COUNT(CASE WHEN severity = 'severe' THEN 1 END) as severe_cases,
    COUNT(CASE WHEN severity = 'moderate' THEN 1 END) as moderate_cases,
    COUNT(CASE WHEN severity = 'mild' THEN 1 END) as mild_cases,
    COUNT(CASE WHEN illness_type = 'covid' THEN 1 END) as covid_cases,
    COUNT(CASE WHEN illness_type = 'flu' THEN 1 END) as flu_cases,
    COUNT(CASE WHEN illness_type = 'dengue' THEN 1 END) as dengue_cases,
    COUNT(CASE WHEN illness_type = 'malaria' THEN 1 END) as malaria_cases,
    COUNT(CASE WHEN illness_type = 'typhoid' THEN 1 END) as typhoid_cases,
    AVG(latitude) as avg_latitude,
    AVG(longitude) as avg_longitude,
    MAX(created_at) as last_report
FROM symptom_reports
GROUP BY country, pin_code;

-- Create view for disease risk assessment
CREATE OR REPLACE VIEW disease_risk_assessment AS
SELECT 
    r.country,
    r.state_province,
    r.city,
    r.pin_code,
    d.name as disease_name,
    d.severity_level,
    dr.prevalence_level,
    dr.seasonal_peak,
    dr.risk_factors,
    r.climate_zone,
    r.population_density
FROM regions r
JOIN disease_regions dr ON r.id = dr.region_id
JOIN diseases d ON dr.disease_id = d.id
ORDER BY r.country, r.city, d.severity_level DESC;

-- Enable Row Level Security (RLS)
ALTER TABLE symptom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_regions ENABLE ROW LEVEL SECURITY;

-- Create policies for symptom_reports
CREATE POLICY "Allow anonymous read access to symptom_reports" ON symptom_reports
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert to symptom_reports" ON symptom_reports
    FOR INSERT WITH CHECK (true);

-- Create policies for health_tips
CREATE POLICY "Allow anonymous read access to health_tips" ON health_tips
    FOR SELECT USING (true);

-- Create policies for diseases
CREATE POLICY "Allow anonymous read access to diseases" ON diseases
    FOR SELECT USING (true);

-- Create policies for regions
CREATE POLICY "Allow anonymous read access to regions" ON regions
    FOR SELECT USING (true);

-- Create policies for disease_regions
CREATE POLICY "Allow anonymous read access to disease_regions" ON disease_regions
    FOR SELECT USING (true);

-- Create function to get health tips based on symptoms and location
CREATE OR REPLACE FUNCTION get_health_tip_by_symptoms_and_location(symptom_list TEXT[], location_pin_code TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    severity TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ht.id,
        ht.title,
        ht.content,
        ht.category,
        ht.severity
    FROM health_tips ht
    WHERE ht.symptoms && symptom_list
    AND (ht.seasonal_relevance @> ARRAY[CASE 
        WHEN EXTRACT(MONTH FROM NOW()) IN (6,7,8,9) THEN 'monsoon'
        WHEN EXTRACT(MONTH FROM NOW()) IN (12,1,2) THEN 'winter'
        WHEN EXTRACT(MONTH FROM NOW()) IN (3,4,5) THEN 'summer'
        ELSE 'year_round'
    END] OR ht.seasonal_relevance @> ARRAY['year_round'])
    ORDER BY 
        CASE ht.severity 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
        END,
        ht.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to get disease risk for a location
CREATE OR REPLACE FUNCTION get_disease_risk_for_location(location_pin_code TEXT)
RETURNS TABLE (
    disease_name TEXT,
    severity_level TEXT,
    prevalence_level TEXT,
    seasonal_peak TEXT[],
    risk_factors TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.name,
        d.severity_level,
        dr.prevalence_level,
        dr.seasonal_peak,
        dr.risk_factors
    FROM regions r
    JOIN disease_regions dr ON r.id = dr.region_id
    JOIN diseases d ON dr.disease_id = d.id
    WHERE r.pin_code = location_pin_code
    ORDER BY d.severity_level DESC, dr.prevalence_level DESC;
END;
$$ LANGUAGE plpgsql;