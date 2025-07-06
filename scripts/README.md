# HealthPulse Data Scripts

This directory contains scripts for managing sample data in the HealthPulse application.

## 📊 Sample Data Generation

The `generate-sample-data.js` script creates realistic health data with exponential decay patterns over 14 days.

### Features

- **Exponential Decay**: Reports follow a realistic decay curve with a 3-day half-life
- **Geographic Distribution**: Data spread across 10 major Indian cities
- **Disease Patterns**: Different diseases have varying prevalence by location
- **Time-based Weighting**: Recent reports have higher impact on heatmap intensity
- **Anonymous Reporting**: Uses realistic nicknames for privacy

### Disease Patterns

| Disease | Base Rate | Seasonal Multiplier | Common Locations |
|---------|-----------|-------------------|------------------|
| Dengue | 0.3 | 2.5x | Mumbai, Delhi, Kolkata, Chennai, Kerala, Ahmedabad |
| Flu | 0.4 | 1.8x | All major cities |
| COVID-19 | 0.2 | 1.2x | Mumbai, Delhi, Kolkata, Chennai, Bangalore |
| Malaria | 0.15 | 3.0x | Mumbai, Kolkata, Kerala |
| Typhoid | 0.1 | 2.0x | Mumbai, Chennai, Lucknow, Patna |

### Usage

1. **Install dependencies**:
   ```bash
   cd scripts
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Generate sample data**:
   ```bash
   npm run generate-data
   ```

4. **Clear sample data** (if needed):
   ```bash
   npm run clear-data
   ```

### Exponential Decay Formula

The script uses the following formula for time-based weighting:

```
timeWeight = Math.exp(-daysAgo / 3)
```

Where:
- `daysAgo` = number of days since the report was created
- `3` = half-life in days (reports lose half their weight every 3 days)

### Data Structure

Each generated report includes:
- **Location**: Country, PIN code, latitude/longitude
- **Symptoms**: 2-4 symptoms based on disease type
- **Severity**: mild, moderate, or severe
- **Timestamp**: Random time within the last 14 days
- **Nickname**: Anonymous identifier

### Visualization

The frontend automatically applies this decay pattern to:
- **Heatmap intensity**: Recent reports appear brighter
- **Time filtering**: Users can view different time ranges
- **Trend analysis**: Shows activity patterns over time

## 🔧 Customization

You can modify the script to:
- Add more locations
- Change disease patterns
- Adjust decay rates
- Add seasonal variations
- Include more symptom combinations

## 📈 Expected Results

After running the script, you should see:
- ~500-1000 sample reports
- Exponential decay pattern in the heatmap
- Geographic clustering by disease type
- Realistic time-based intensity variations 