-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create symptom_reports table
CREATE TABLE IF NOT EXISTS symptom_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nickname TEXT,
    country TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    symptoms TEXT[] NOT NULL,
    illness_type TEXT NOT NULL CHECK (illness_type IN ('flu', 'dengue', 'covid', 'unknown', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_symptom_reports_country ON symptom_reports(country);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_pin_code ON symptom_reports(pin_code);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_created_at ON symptom_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_location ON symptom_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_health_tips_category ON health_tips(category);
CREATE INDEX IF NOT EXISTS idx_health_tips_severity ON health_tips(severity);

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

-- Insert sample health tips
INSERT INTO health_tips (title, content, category, severity, symptoms) VALUES
(
    'General Health Advice',
    'Stay hydrated, get plenty of rest, and monitor your symptoms. If they worsen, consult a healthcare professional.',
    'general',
    'low',
    ARRAY['general']
),
(
    'Respiratory Symptoms Detected',
    'You may have a respiratory infection. Rest, stay hydrated, and consider consulting a doctor if symptoms persist for more than 3 days.',
    'respiratory',
    'medium',
    ARRAY['Fever', 'Cough', 'Sore throat', 'Runny nose']
),
(
    'Serious Symptoms Alert',
    'These symptoms require immediate medical attention. Please contact a healthcare provider or visit an emergency room.',
    'emergency',
    'high',
    ARRAY['Shortness of breath', 'Chest pain', 'Severe headache']
),
(
    'Flu-like Symptoms',
    'Rest, stay hydrated, and take over-the-counter medications for fever and pain. Monitor your symptoms and seek medical care if they worsen.',
    'flu',
    'medium',
    ARRAY['Fever', 'Body aches', 'Fatigue', 'Chills']
),
(
    'Dengue Prevention',
    'If you suspect dengue, rest, stay hydrated, and avoid aspirin. Seek immediate medical attention if you develop severe symptoms.',
    'dengue',
    'high',
    ARRAY['High fever', 'Severe headache', 'Joint pain', 'Rash']
);

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
    AVG(latitude) as avg_latitude,
    AVG(longitude) as avg_longitude,
    MAX(created_at) as last_report
FROM symptom_reports
GROUP BY country, pin_code;

-- Enable Row Level Security (RLS)
ALTER TABLE symptom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_tips ENABLE ROW LEVEL SECURITY;

-- Create policies for symptom_reports
CREATE POLICY "Allow anonymous read access to symptom_reports" ON symptom_reports
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert to symptom_reports" ON symptom_reports
    FOR INSERT WITH CHECK (true);

-- Create policies for health_tips
CREATE POLICY "Allow anonymous read access to health_tips" ON health_tips
    FOR SELECT USING (true);

-- Create function to get health tips based on symptoms
CREATE OR REPLACE FUNCTION get_health_tip_by_symptoms(symptom_list TEXT[])
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