# Plan for Integrating CDC PLACES Data

This document outlines the plan to integrate public health data from the CDC's PLACES API into the HealthPulse application.

## 1. Backend Development

### 1.1. Database Schema
- [ ] Create a new table named `cdc_places_data` in the Supabase database.
- [ ] Define columns for the new table:
    - `id` (Primary Key)
    - `state_abbr` (State Abbreviation)
    - `county_name` (County Name)
    - `county_fips` (County FIPS code)
    - `latitude`
    - `longitude`
    - `measure` (e.g., "Chronic obstructive pulmonary disease among adults aged >=18 years")
    - `data_value_type` (e.g., "Crude prevalence")
    - `data_value` (The actual numeric value)
    - `low_confidence_limit`
    - `high_confidence_limit`
    - `year`
    - `data_source` (e.g., "PLACES")
    - `created_at`

### 1.2. Data Fetching Worker
- [ ] Create a new route in `backend/src/worker.ts` (e.g., `/api/fetch-cdc-places`).
- [ ] Implement logic to fetch data from the CDC PLACES API endpoint.
- [ ] Use a scheduler (Cloudflare Cron Trigger) to periodically call this endpoint.
- [ ] The worker should handle:
    - Making HTTP requests to the Socrata API.
    - Parsing the JSON response.
    - Transforming the data to match the `cdc_places_data` table schema.
    - Inserting or updating the records in the Supabase table.

## 2. Frontend Development

### 2.1. Map Component
- [ ] Update the `HealthMap` component in the frontend.
- [ ] Create a new API call in the frontend to fetch the `cdc_places_data` from our backend.
- [ ] Add a new layer to the map to visualize the CDC data.
- [ ] Implement UI elements (e.g., toggles, filters) to allow users to switch between different data views (symptom reports vs. CDC data).
- [ ] Add popups or tooltips on the map to display details of the CDC data for a selected location.

## 3. Deployment & Testing
- [ ] Deploy the updated backend worker to Cloudflare.
- [ ] Configure the cron trigger for the new data fetching route.
- [ ] Test the entire flow from data fetching to frontend display.
- [ ] Monitor for any API rate limiting or data usage issues. 