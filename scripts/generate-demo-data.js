const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Global locations with coordinates for comprehensive demo
const globalLocations = [
  // North America
  { country: 'US', pinCode: '10001', city: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { country: 'US', pinCode: '90001', city: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
  { country: 'US', pinCode: '60601', city: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
  { country: 'US', pinCode: '77001', city: 'Houston', latitude: 29.7604, longitude: -95.3698 },
  { country: 'US', pinCode: '33101', city: 'Miami', latitude: 25.7617, longitude: -80.1918 },
  { country: 'US', pinCode: '98101', city: 'Seattle', latitude: 47.6062, longitude: -122.3321 },
  { country: 'US', pinCode: '80201', city: 'Denver', latitude: 39.7392, longitude: -104.9903 },
  { country: 'US', pinCode: '75201', city: 'Dallas', latitude: 32.7767, longitude: -96.7970 },
  { country: 'US', pinCode: '19101', city: 'Philadelphia', latitude: 39.9526, longitude: -75.1652 },
  { country: 'US', pinCode: '02101', city: 'Boston', latitude: 42.3601, longitude: -71.0589 },
  { country: 'US', pinCode: '30301', city: 'Atlanta', latitude: 33.7490, longitude: -84.3880 },
  { country: 'US', pinCode: '94101', city: 'San Francisco', latitude: 37.7749, longitude: -122.4194 },
  { country: 'US', pinCode: '20001', city: 'Washington DC', latitude: 38.9072, longitude: -77.0369 },
  { country: 'US', pinCode: '89101', city: 'Las Vegas', latitude: 36.1699, longitude: -115.1398 },
  { country: 'US', pinCode: '85001', city: 'Phoenix', latitude: 33.4484, longitude: -112.0740 },
  
  // Canada
  { country: 'Canada', pinCode: 'M5V', city: 'Toronto', latitude: 43.6532, longitude: -79.3832 },
  { country: 'Canada', pinCode: 'V6C', city: 'Vancouver', latitude: 49.2827, longitude: -123.1207 },
  { country: 'Canada', pinCode: 'H2Y', city: 'Montreal', latitude: 45.5017, longitude: -73.5673 },
  { country: 'Canada', pinCode: 'T2P', city: 'Calgary', latitude: 51.0447, longitude: -114.0719 },
  { country: 'Canada', pinCode: 'K1P', city: 'Ottawa', latitude: 45.4215, longitude: -75.6972 },
  
  // Europe
  { country: 'UK', pinCode: 'SW1A', city: 'London', latitude: 51.5074, longitude: -0.1278 },
  { country: 'UK', pinCode: 'M1', city: 'Manchester', latitude: 53.4808, longitude: -2.2426 },
  { country: 'UK', pinCode: 'B1', city: 'Birmingham', latitude: 52.4862, longitude: -1.8904 },
  { country: 'UK', pinCode: 'EH1', city: 'Edinburgh', latitude: 55.9533, longitude: -3.1883 },
  { country: 'UK', pinCode: 'L1', city: 'Liverpool', latitude: 53.4084, longitude: -2.9916 },
  
  { country: 'Germany', pinCode: '10115', city: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
  { country: 'Germany', pinCode: '80331', city: 'Munich', latitude: 48.1351, longitude: 11.5820 },
  { country: 'Germany', pinCode: '50667', city: 'Cologne', latitude: 50.9375, longitude: 6.9603 },
  { country: 'Germany', pinCode: '60311', city: 'Frankfurt', latitude: 50.1109, longitude: 8.6821 },
  { country: 'Germany', pinCode: '20095', city: 'Hamburg', latitude: 53.5511, longitude: 9.9937 },
  
  { country: 'France', pinCode: '75001', city: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { country: 'France', pinCode: '13001', city: 'Marseille', latitude: 43.2965, longitude: 5.3698 },
  { country: 'France', pinCode: '69001', city: 'Lyon', latitude: 45.7640, longitude: 4.8357 },
  { country: 'France', pinCode: '31000', city: 'Toulouse', latitude: 43.6047, longitude: 1.4442 },
  { country: 'France', pinCode: '06000', city: 'Nice', latitude: 43.7102, longitude: 7.2620 },
  
  { country: 'Spain', pinCode: '28001', city: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { country: 'Spain', pinCode: '08001', city: 'Barcelona', latitude: 41.3851, longitude: 2.1734 },
  { country: 'Spain', pinCode: '41001', city: 'Seville', latitude: 37.3891, longitude: -5.9845 },
  { country: 'Spain', pinCode: '46001', city: 'Valencia', latitude: 39.4699, longitude: -0.3763 },
  { country: 'Spain', pinCode: '29001', city: 'Malaga', latitude: 36.7213, longitude: -4.4217 },
  
  { country: 'Italy', pinCode: '00100', city: 'Rome', latitude: 41.9028, longitude: 12.4964 },
  { country: 'Italy', pinCode: '20100', city: 'Milan', latitude: 45.4642, longitude: 9.1900 },
  { country: 'Italy', pinCode: '50100', city: 'Florence', latitude: 43.7696, longitude: 11.2558 },
  { country: 'Italy', pinCode: '80100', city: 'Naples', latitude: 40.8518, longitude: 14.2681 },
  { country: 'Italy', pinCode: '30100', city: 'Venice', latitude: 45.4371, longitude: 12.3326 },
  
  { country: 'Netherlands', pinCode: '1000', city: 'Amsterdam', latitude: 52.3676, longitude: 4.9041 },
  { country: 'Netherlands', pinCode: '3000', city: 'Rotterdam', latitude: 51.9225, longitude: 4.4792 },
  { country: 'Netherlands', pinCode: '2500', city: 'The Hague', latitude: 52.0705, longitude: 4.3007 },
  { country: 'Netherlands', pinCode: '5600', city: 'Eindhoven', latitude: 51.4416, longitude: 5.4697 },
  
  { country: 'Sweden', pinCode: '11120', city: 'Stockholm', latitude: 59.3293, longitude: 18.0686 },
  { country: 'Sweden', pinCode: '21100', city: 'Malmo', latitude: 55.6050, longitude: 13.0038 },
  { country: 'Sweden', pinCode: '41300', city: 'Gothenburg', latitude: 57.7089, longitude: 11.9746 },
  
  { country: 'Norway', pinCode: '0001', city: 'Oslo', latitude: 59.9139, longitude: 10.7522 },
  { country: 'Norway', pinCode: '5000', city: 'Bergen', latitude: 60.3913, longitude: 5.3221 },
  { country: 'Norway', pinCode: '7000', city: 'Trondheim', latitude: 63.4305, longitude: 10.3951 },
  
  { country: 'Denmark', pinCode: '1000', city: 'Copenhagen', latitude: 55.6761, longitude: 12.5683 },
  { country: 'Denmark', pinCode: '8000', city: 'Aarhus', latitude: 56.1629, longitude: 10.2039 },
  { country: 'Denmark', pinCode: '5000', city: 'Odense', latitude: 55.4038, longitude: 10.4024 },
  
  // Asia
  { country: 'Japan', pinCode: '100-0001', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { country: 'Japan', pinCode: '530-0001', city: 'Osaka', latitude: 34.6937, longitude: 135.5023 },
  { country: 'Japan', pinCode: '460-0001', city: 'Nagoya', latitude: 35.1815, longitude: 136.9066 },
  { country: 'Japan', pinCode: '650-0001', city: 'Kobe', latitude: 34.6901, longitude: 135.1955 },
  { country: 'Japan', pinCode: '060-0001', city: 'Sapporo', latitude: 43.0618, longitude: 141.3545 },
  
  { country: 'South Korea', pinCode: '100-011', city: 'Seoul', latitude: 37.5665, longitude: 126.9780 },
  { country: 'South Korea', pinCode: '600-011', city: 'Busan', latitude: 35.1796, longitude: 129.0756 },
  { country: 'South Korea', pinCode: '300-011', city: 'Daejeon', latitude: 36.3504, longitude: 127.3845 },
  { country: 'South Korea', pinCode: '500-011', city: 'Gwangju', latitude: 35.1595, longitude: 126.8526 },
  { country: 'South Korea', pinCode: '400-011', city: 'Incheon', latitude: 37.4563, longitude: 126.7052 },
  
  { country: 'China', pinCode: '100000', city: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
  { country: 'China', pinCode: '200000', city: 'Shanghai', latitude: 31.2304, longitude: 121.4737 },
  { country: 'China', pinCode: '510000', city: 'Guangzhou', latitude: 23.1291, longitude: 113.2644 },
  { country: 'China', pinCode: '610000', city: 'Xi\'an', latitude: 34.3416, longitude: 108.9398 },
  { country: 'China', pinCode: '310000', city: 'Hangzhou', latitude: 30.2741, longitude: 120.1551 },
  
  { country: 'Singapore', pinCode: '018956', city: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  
  { country: 'Thailand', pinCode: '10100', city: 'Bangkok', latitude: 13.7563, longitude: 100.5018 },
  { country: 'Thailand', pinCode: '50200', city: 'Chiang Mai', latitude: 18.7883, longitude: 98.9853 },
  { country: 'Thailand', pinCode: '83100', city: 'Phuket', latitude: 7.8804, longitude: 98.3923 },
  
  { country: 'Vietnam', pinCode: '100000', city: 'Hanoi', latitude: 21.0285, longitude: 105.8542 },
  { country: 'Vietnam', pinCode: '700000', city: 'Ho Chi Minh City', latitude: 10.8231, longitude: 106.6297 },
  { country: 'Vietnam', pinCode: '500000', city: 'Da Nang', latitude: 16.0544, longitude: 108.2022 },
  
  { country: 'Malaysia', pinCode: '50000', city: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869 },
  { country: 'Malaysia', pinCode: '80000', city: 'Johor Bahru', latitude: 1.4927, longitude: 103.7414 },
  { country: 'Malaysia', pinCode: '10000', city: 'George Town', latitude: 5.4164, longitude: 100.3327 },
  
  { country: 'Indonesia', pinCode: '10110', city: 'Jakarta', latitude: -6.2088, longitude: 106.8456 },
  { country: 'Indonesia', pinCode: '40111', city: 'Surabaya', latitude: -7.2575, longitude: 112.7521 },
  { country: 'Indonesia', pinCode: '50111', city: 'Bandung', latitude: -6.9175, longitude: 107.6191 },
  
  { country: 'Philippines', pinCode: '1000', city: 'Manila', latitude: 14.5995, longitude: 120.9842 },
  { country: 'Philippines', pinCode: '6000', city: 'Cebu City', latitude: 10.3157, longitude: 123.8854 },
  { country: 'Philippines', pinCode: '8000', city: 'Davao City', latitude: 7.1907, longitude: 125.4553 },
  
  // Australia & Oceania
  { country: 'Australia', pinCode: '2000', city: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { country: 'Australia', pinCode: '3000', city: 'Melbourne', latitude: -37.8136, longitude: 144.9631 },
  { country: 'Australia', pinCode: '4000', city: 'Brisbane', latitude: -27.4698, longitude: 153.0251 },
  { country: 'Australia', pinCode: '6000', city: 'Perth', latitude: -31.9505, longitude: 115.8605 },
  { country: 'Australia', pinCode: '5000', city: 'Adelaide', latitude: -34.9285, longitude: 138.6007 },
  
  { country: 'New Zealand', pinCode: '1010', city: 'Auckland', latitude: -36.8485, longitude: 174.7633 },
  { country: 'New Zealand', pinCode: '6011', city: 'Wellington', latitude: -41.2866, longitude: 174.7756 },
  { country: 'New Zealand', pinCode: '8011', city: 'Christchurch', latitude: -43.5320, longitude: 172.6306 },
  
  // South America
  { country: 'Brazil', pinCode: '20000-000', city: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
  { country: 'Brazil', pinCode: '01310-100', city: 'Sao Paulo', latitude: -23.5505, longitude: -46.6333 },
  { country: 'Brazil', pinCode: '40000-000', city: 'Salvador', latitude: -12.9714, longitude: -38.5011 },
  { country: 'Brazil', pinCode: '50000-000', city: 'Recife', latitude: -8.0476, longitude: -34.8770 },
  { country: 'Brazil', pinCode: '80000-000', city: 'Curitiba', latitude: -25.4289, longitude: -49.2671 },
  
  { country: 'Argentina', pinCode: '1000', city: 'Buenos Aires', latitude: -34.6118, longitude: -58.3960 },
  { country: 'Argentina', pinCode: '5000', city: 'Cordoba', latitude: -31.4201, longitude: -64.1888 },
  { country: 'Argentina', pinCode: '4000', city: 'Rosario', latitude: -32.9468, longitude: -60.6393 },
  
  { country: 'Chile', pinCode: '8320000', city: 'Santiago', latitude: -33.4489, longitude: -70.6693 },
  { country: 'Chile', pinCode: '2340000', city: 'Valparaiso', latitude: -33.0472, longitude: -71.6127 },
  { country: 'Chile', pinCode: '4100000', city: 'Concepcion', latitude: -36.8201, longitude: -73.0444 },
  
  { country: 'Colombia', pinCode: '110010', city: 'Bogota', latitude: 4.7110, longitude: -74.0721 },
  { country: 'Colombia', pinCode: '050010', city: 'Medellin', latitude: 6.2442, longitude: -75.5812 },
  { country: 'Colombia', pinCode: '760010', city: 'Cali', latitude: 3.4516, longitude: -76.5320 },
  
  { country: 'Peru', pinCode: '15001', city: 'Lima', latitude: -12.0464, longitude: -77.0428 },
  { country: 'Peru', pinCode: '08001', city: 'Cusco', latitude: -13.5167, longitude: -71.9789 },
  { country: 'Peru', pinCode: '04001', city: 'Arequipa', latitude: -16.4090, longitude: -71.5375 },
  
  // Africa
  { country: 'South Africa', pinCode: '2000', city: 'Johannesburg', latitude: -26.2041, longitude: 28.0473 },
  { country: 'South Africa', pinCode: '8001', city: 'Cape Town', latitude: -33.9249, longitude: 18.4241 },
  { country: 'South Africa', pinCode: '4001', city: 'Durban', latitude: -29.8587, longitude: 31.0218 },
  { country: 'South Africa', pinCode: '0001', city: 'Pretoria', latitude: -25.7479, longitude: 28.2293 },
  
  { country: 'Nigeria', pinCode: '100001', city: 'Lagos', latitude: 6.5244, longitude: 3.3792 },
  { country: 'Nigeria', pinCode: '900001', city: 'Kano', latitude: 11.9914, longitude: 8.5317 },
  { country: 'Nigeria', pinCode: '500001', city: 'Ibadan', latitude: 7.3964, longitude: 3.8867 },
  
  { country: 'Kenya', pinCode: '00100', city: 'Nairobi', latitude: -1.2921, longitude: 36.8219 },
  { country: 'Kenya', pinCode: '80100', city: 'Mombasa', latitude: -4.0435, longitude: 39.6682 },
  { country: 'Kenya', pinCode: '30100', city: 'Kisumu', latitude: -0.1022, longitude: 34.7617 },
  
  { country: 'Egypt', pinCode: '11511', city: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
  { country: 'Egypt', pinCode: '21511', city: 'Alexandria', latitude: 31.2001, longitude: 29.9187 },
  { country: 'Egypt', pinCode: '82511', city: 'Luxor', latitude: 25.6872, longitude: 32.6396 },
  
  { country: 'Morocco', pinCode: '20000', city: 'Casablanca', latitude: 33.5731, longitude: -7.5898 },
  { country: 'Morocco', pinCode: '10000', city: 'Rabat', latitude: 34.0209, longitude: -6.8416 },
  { country: 'Morocco', pinCode: '40000', city: 'Marrakech', latitude: 31.6295, longitude: -7.9811 },
  
  { country: 'Ghana', pinCode: '00233', city: 'Accra', latitude: 5.5600, longitude: -0.2057 },
  { country: 'Ghana', pinCode: '00233', city: 'Kumasi', latitude: 6.6885, longitude: -1.6244 },
  { country: 'Ghana', pinCode: '00233', city: 'Tamale', latitude: 9.4035, longitude: -0.8423 },
  
  { country: 'Ethiopia', pinCode: '1000', city: 'Addis Ababa', latitude: 9.0320, longitude: 38.7486 },
  { country: 'Ethiopia', pinCode: '1000', city: 'Dire Dawa', latitude: 9.6000, longitude: 41.8500 },
  { country: 'Ethiopia', pinCode: '1000', city: 'Mekelle', latitude: 13.4969, longitude: 39.4769 },
  
  { country: 'Tanzania', pinCode: '1000', city: 'Dar es Salaam', latitude: -6.8230, longitude: 39.2695 },
  { country: 'Tanzania', pinCode: '1000', city: 'Dodoma', latitude: -6.1730, longitude: 35.7469 },
  { country: 'Tanzania', pinCode: '1000', city: 'Mwanza', latitude: -2.5167, longitude: 32.9000 },
  
  { country: 'Uganda', pinCode: '1000', city: 'Kampala', latitude: 0.3476, longitude: 32.5825 },
  { country: 'Uganda', pinCode: '1000', city: 'Entebbe', latitude: 0.0500, longitude: 32.4600 },
  { country: 'Uganda', pinCode: '1000', city: 'Jinja', latitude: 0.4244, longitude: 33.2041 },
  
  { country: 'Rwanda', pinCode: '1000', city: 'Kigali', latitude: -1.9441, longitude: 30.0619 },
  { country: 'Rwanda', pinCode: '1000', city: 'Butare', latitude: -2.5967, longitude: 29.7394 },
  { country: 'Rwanda', pinCode: '1000', city: 'Gitarama', latitude: -2.0744, longitude: 29.7569 },
  
  { country: 'Burundi', pinCode: '1000', city: 'Bujumbura', latitude: -3.3731, longitude: 29.9189 },
  { country: 'Burundi', pinCode: '1000', city: 'Gitega', latitude: -3.4271, longitude: 29.9246 },
  { country: 'Burundi', pinCode: '1000', city: 'Ngozi', latitude: -2.9075, longitude: 29.8306 },
  
  { country: 'Democratic Republic of Congo', pinCode: '1000', city: 'Kinshasa', latitude: -4.4419, longitude: 15.2663 },
  { country: 'Democratic Republic of Congo', pinCode: '1000', city: 'Lubumbashi', latitude: -11.6647, longitude: 27.4793 },
  { country: 'Democratic Republic of Congo', pinCode: '1000', city: 'Mbuji-Mayi', latitude: -6.1360, longitude: 23.5898 },
  
  { country: 'Congo', pinCode: '1000', city: 'Brazzaville', latitude: -4.2634, longitude: 15.2429 },
  { country: 'Congo', pinCode: '1000', city: 'Pointe-Noire', latitude: -4.7989, longitude: 11.8363 },
  { country: 'Congo', pinCode: '1000', city: 'Dolisie', latitude: -4.1983, longitude: 12.6667 },
  
  { country: 'Central African Republic', pinCode: '1000', city: 'Bangui', latitude: 4.3947, longitude: 18.5582 },
  { country: 'Central African Republic', pinCode: '1000', city: 'Bimbo', latitude: 4.2569, longitude: 18.4158 },
  { country: 'Central African Republic', pinCode: '1000', city: 'Berberati', latitude: 4.2667, longitude: 15.7833 },
  
  { country: 'Cameroon', pinCode: '1000', city: 'Yaounde', latitude: 3.8480, longitude: 11.5021 },
  { country: 'Cameroon', pinCode: '1000', city: 'Douala', latitude: 4.0511, longitude: 9.7679 },
  { country: 'Cameroon', pinCode: '1000', city: 'Bamenda', latitude: 5.9333, longitude: 10.1667 },
  
  { country: 'Chad', pinCode: '1000', city: 'N\'Djamena', latitude: 12.1348, longitude: 15.0557 },
  { country: 'Chad', pinCode: '1000', city: 'Moundou', latitude: 8.5667, longitude: 16.0833 },
  { country: 'Chad', pinCode: '1000', city: 'Sarh', latitude: 9.1500, longitude: 18.3833 },
  
  { country: 'Niger', pinCode: '1000', city: 'Niamey', latitude: 13.5136, longitude: 2.1103 },
  { country: 'Niger', pinCode: '1000', city: 'Zinder', latitude: 13.8000, longitude: 8.9833 },
  { country: 'Niger', pinCode: '1000', city: 'Maradi', latitude: 13.4833, longitude: 7.1000 },
  
  { country: 'Mali', pinCode: '1000', city: 'Bamako', latitude: 12.6392, longitude: -8.0029 },
  { country: 'Mali', pinCode: '1000', city: 'Sikasso', latitude: 11.3167, longitude: -5.6667 },
  { country: 'Mali', pinCode: '1000', city: 'Mopti', latitude: 14.4833, longitude: -4.1833 },
  
  { country: 'Burkina Faso', pinCode: '1000', city: 'Ouagadougou', latitude: 12.3714, longitude: -1.5197 },
  { country: 'Burkina Faso', pinCode: '1000', city: 'Bobo-Dioulasso', latitude: 11.1833, longitude: -4.2833 },
  { country: 'Burkina Faso', pinCode: '1000', city: 'Koudougou', latitude: 12.2500, longitude: -2.3667 },
  
  { country: 'Senegal', pinCode: '1000', city: 'Dakar', latitude: 14.7167, longitude: -17.4677 },
  { country: 'Senegal', pinCode: '1000', city: 'Thies', latitude: 14.7833, longitude: -16.9333 },
  { country: 'Senegal', pinCode: '1000', city: 'Kaolack', latitude: 14.1500, longitude: -16.0833 },
  
  { country: 'Guinea', pinCode: '1000', city: 'Conakry', latitude: 9.5370, longitude: -13.6785 },
  { country: 'Guinea', pinCode: '1000', city: 'Kankan', latitude: 10.3833, longitude: -9.3000 },
  { country: 'Guinea', pinCode: '1000', city: 'Kindia', latitude: 10.0500, longitude: -12.8667 },
  
  { country: 'Sierra Leone', pinCode: '1000', city: 'Freetown', latitude: 8.4840, longitude: -13.2299 },
  { country: 'Sierra Leone', pinCode: '1000', city: 'Bo', latitude: 7.9500, longitude: -11.7333 },
  { country: 'Sierra Leone', pinCode: '1000', city: 'Kenema', latitude: 7.8833, longitude: -11.1833 },
  
  { country: 'Liberia', pinCode: '1000', city: 'Monrovia', latitude: 6.3004, longitude: -10.7969 },
  { country: 'Liberia', pinCode: '1000', city: 'Gbarnga', latitude: 6.9956, longitude: -9.4722 },
  { country: 'Liberia', pinCode: '1000', city: 'Buchanan', latitude: 5.8808, longitude: -10.0447 },
  
  { country: 'Ivory Coast', pinCode: '1000', city: 'Abidjan', latitude: 5.3600, longitude: -4.0083 },
  { country: 'Ivory Coast', pinCode: '1000', city: 'Bouake', latitude: 7.6833, longitude: -5.0333 },
  { country: 'Ivory Coast', pinCode: '1000', city: 'San-Pedro', latitude: 4.7500, longitude: -6.6333 },
  
  { country: 'Togo', pinCode: '1000', city: 'Lome', latitude: 6.1375, longitude: 1.2123 },
  { country: 'Togo', pinCode: '1000', city: 'Sokode', latitude: 8.9833, longitude: 1.1333 },
  { country: 'Togo', pinCode: '1000', city: 'Kara', latitude: 9.5500, longitude: 1.1833 },
  
  { country: 'Benin', pinCode: '1000', city: 'Cotonou', latitude: 6.3667, longitude: 2.4333 },
  { country: 'Benin', pinCode: '1000', city: 'Porto-Novo', latitude: 6.4833, longitude: 2.6167 },
  { country: 'Benin', pinCode: '1000', city: 'Parakou', latitude: 9.3500, longitude: 2.6167 },
  
  { country: 'Gabon', pinCode: '1000', city: 'Libreville', latitude: 0.4162, longitude: 9.4673 },
  { country: 'Gabon', pinCode: '1000', city: 'Port-Gentil', latitude: -0.7167, longitude: 8.7833 },
  { country: 'Gabon', pinCode: '1000', city: 'Franceville', latitude: -1.6333, longitude: 13.5833 },
  
  { country: 'Equatorial Guinea', pinCode: '1000', city: 'Malabo', latitude: 3.7500, longitude: 8.7833 },
  { country: 'Equatorial Guinea', pinCode: '1000', city: 'Bata', latitude: 1.8500, longitude: 9.7500 },
  { country: 'Equatorial Guinea', pinCode: '1000', city: 'Ebebiyin', latitude: 2.1500, longitude: 11.3167 },
  
  { country: 'Sao Tome and Principe', pinCode: '1000', city: 'Sao Tome', latitude: 0.3333, longitude: 6.7333 },
  { country: 'Sao Tome and Principe', pinCode: '1000', city: 'Santo Antonio', latitude: 1.6333, longitude: 7.4167 },
  
  { country: 'Angola', pinCode: '1000', city: 'Luanda', latitude: -8.8383, longitude: 13.2344 },
  { country: 'Angola', pinCode: '1000', city: 'Huambo', latitude: -12.7667, longitude: 15.7333 },
  { country: 'Angola', pinCode: '1000', city: 'Lobito', latitude: -12.3500, longitude: 13.5333 },
  
  { country: 'Zambia', pinCode: '1000', city: 'Lusaka', latitude: -15.4167, longitude: 28.2833 },
  { country: 'Zambia', pinCode: '1000', city: 'Kitwe', latitude: -12.8167, longitude: 28.2000 },
  { country: 'Zambia', pinCode: '1000', city: 'Ndola', latitude: -12.9667, longitude: 28.6333 },
  
  { country: 'Zimbabwe', pinCode: '1000', city: 'Harare', latitude: -17.8292, longitude: 31.0522 },
  { country: 'Zimbabwe', pinCode: '1000', city: 'Bulawayo', latitude: -20.1500, longitude: 28.5833 },
  { country: 'Zimbabwe', pinCode: '1000', city: 'Chitungwiza', latitude: -18.0000, longitude: 31.1000 },
  
  { country: 'Botswana', pinCode: '1000', city: 'Gaborone', latitude: -24.6583, longitude: 25.9089 },
  { country: 'Botswana', pinCode: '1000', city: 'Francistown', latitude: -21.1667, longitude: 27.5000 },
  { country: 'Botswana', pinCode: '1000', city: 'Molepolole', latitude: -24.4167, longitude: 25.5000 },
  
  { country: 'Namibia', pinCode: '1000', city: 'Windhoek', latitude: -22.5609, longitude: 17.0658 },
  { country: 'Namibia', pinCode: '1000', city: 'Walvis Bay', latitude: -22.9575, longitude: 14.5053 },
  { country: 'Namibia', pinCode: '1000', city: 'Oshakati', latitude: -17.7833, longitude: 15.6833 },
  
  { country: 'Eswatini', pinCode: '1000', city: 'Mbabane', latitude: -26.3167, longitude: 31.1333 },
  { country: 'Eswatini', pinCode: '1000', city: 'Manzini', latitude: -26.5000, longitude: 31.3667 },
  { country: 'Eswatini', pinCode: '1000', city: 'Big Bend', latitude: -26.8167, longitude: 31.9333 },
  
  { country: 'Lesotho', pinCode: '100', city: 'Maseru', latitude: -29.3167, longitude: 27.4833 },
  { country: 'Lesotho', pinCode: '100', city: 'Teyateyaneng', latitude: -29.1500, longitude: 27.7333 },
  { country: 'Lesotho', pinCode: '100', city: 'Mafeteng', latitude: -29.8167, longitude: 27.2500 },
  
  { country: 'Madagascar', pinCode: '1000', city: 'Antananarivo', latitude: -18.9333, longitude: 47.5167 },
  { country: 'Madagascar', pinCode: '1000', city: 'Toamasina', latitude: -18.1500, longitude: 49.4000 },
  { country: 'Madagascar', pinCode: '1000', city: 'Antsirabe', latitude: -19.8667, longitude: 47.0333 },
  
  { country: 'Mauritius', pinCode: '1000', city: 'Port Louis', latitude: -20.1667, longitude: 57.5000 },
  { country: 'Mauritius', pinCode: '1000', city: 'Beau Bassin-Rose Hill', latitude: -20.2333, longitude: 57.4667 },
  { country: 'Mauritius', pinCode: '1000', city: 'Vacoas-Phoenix', latitude: -20.3000, longitude: 57.4833 },
  
  { country: 'Seychelles', pinCode: '1000', city: 'Victoria', latitude: -4.6167, longitude: 55.4500 },
  
  { country: 'Comoros', pinCode: '1000', city: 'Moroni', latitude: -11.7000, longitude: 43.2333 },
  
  { country: 'Djibouti', pinCode: '1000', city: 'Djibouti', latitude: 11.5886, longitude: 43.1450 },
  
  { country: 'Somalia', pinCode: '1000', city: 'Mogadishu', latitude: 2.0333, longitude: 45.3500 },
  { country: 'Somalia', pinCode: '1000', city: 'Hargeisa', latitude: 9.5500, longitude: 44.0500 },
  { country: 'Somalia', pinCode: '1000', city: 'Kismayo', latitude: -0.3583, longitude: 42.5453 },
  
  { country: 'Eritrea', pinCode: '1000', city: 'Asmara', latitude: 15.3333, longitude: 38.9333 },
  { country: 'Eritrea', pinCode: '1000', city: 'Keren', latitude: 15.7833, longitude: 38.4500 },
  { country: 'Eritrea', pinCode: '1000', city: 'Massawa', latitude: 15.6167, longitude: 39.4500 },
  
  { country: 'Sudan', pinCode: '1000', city: 'Khartoum', latitude: 15.5000, longitude: 32.5600 },
  { country: 'Sudan', pinCode: '1000', city: 'Omdurman', latitude: 15.6500, longitude: 32.4833 },
  { country: 'Sudan', pinCode: '1000', city: 'Port Sudan', latitude: 19.6167, longitude: 37.2167 },
  
  { country: 'South Sudan', pinCode: '1000', city: 'Juba', latitude: 4.8500, longitude: 31.6000 },
  { country: 'South Sudan', pinCode: '1000', city: 'Malakal', latitude: 9.5333, longitude: 31.6500 },
  { country: 'South Sudan', pinCode: '1000', city: 'Wau', latitude: 7.7000, longitude: 27.9833 },
  
  // Russia & Eastern Europe
  { country: 'Russia', pinCode: '101000', city: 'Moscow', latitude: 55.7558, longitude: 37.6176 },
  { country: 'Russia', pinCode: '190000', city: 'Saint Petersburg', latitude: 59.9311, longitude: 30.3609 },
  { country: 'Russia', pinCode: '620000', city: 'Yekaterinburg', latitude: 56.8431, longitude: 60.6454 },
  { country: 'Russia', pinCode: '630000', city: 'Novosibirsk', latitude: 55.0084, longitude: 82.9357 },
  { country: 'Russia', pinCode: '450000', city: 'Ufa', latitude: 54.7388, longitude: 55.9721 },
  { country: 'Russia', pinCode: '400000', city: 'Volgograd', latitude: 48.7080, longitude: 44.5133 },
  { country: 'Russia', pinCode: '350000', city: 'Krasnodar', latitude: 45.0355, longitude: 38.9753 },
  { country: 'Russia', pinCode: '660000', city: 'Omsk', latitude: 54.9924, longitude: 73.3686 },
  { country: 'Russia', pinCode: '650000', city: 'Kemerovo', latitude: 55.3904, longitude: 86.0468 },
  { country: 'Russia', pinCode: '680000', city: 'Khabarovsk', latitude: 48.4827, longitude: 135.0838 },
  
  { country: 'Ukraine', pinCode: '01001', city: 'Kyiv', latitude: 50.4501, longitude: 30.5234 },
  { country: 'Ukraine', pinCode: '49000', city: 'Dnipro', latitude: 48.4647, longitude: 35.0462 },
  { country: 'Ukraine', pinCode: '61001', city: 'Kharkiv', latitude: 49.9935, longitude: 36.2304 },
  { country: 'Ukraine', pinCode: '65000', city: 'Odessa', latitude: 46.4825, longitude: 30.7233 },
  { country: 'Ukraine', pinCode: '79000', city: 'Lviv', latitude: 49.8397, longitude: 24.0297 },
  
  { country: 'Poland', pinCode: '00-001', city: 'Warsaw', latitude: 52.2297, longitude: 21.0122 },
  { country: 'Poland', pinCode: '30-001', city: 'Krakow', latitude: 50.0647, longitude: 19.9450 },
  { country: 'Poland', pinCode: '50-001', city: 'Wroclaw', latitude: 51.1079, longitude: 17.0385 },
  { country: 'Poland', pinCode: '80-001', city: 'Gdansk', latitude: 54.3520, longitude: 18.6466 },
  { country: 'Poland', pinCode: '90-001', city: 'Lodz', latitude: 51.7592, longitude: 19.4559 },
  
  { country: 'Czech Republic', pinCode: '11000', city: 'Prague', latitude: 50.0755, longitude: 14.4378 },
  { country: 'Czech Republic', pinCode: '60200', city: 'Brno', latitude: 49.1951, longitude: 16.6068 },
  { country: 'Czech Republic', pinCode: '40001', city: 'Usti nad Labem', latitude: 50.6611, longitude: 14.0531 },
  
  { country: 'Hungary', pinCode: '1051', city: 'Budapest', latitude: 47.4979, longitude: 19.0402 },
  { country: 'Hungary', pinCode: '6720', city: 'Szeged', latitude: 46.2530, longitude: 20.1414 },
  { country: 'Hungary', pinCode: '4032', city: 'Debrecen', latitude: 47.5316, longitude: 21.6273 },
  
  { country: 'Romania', pinCode: '010001', city: 'Bucharest', latitude: 44.4268, longitude: 26.1025 },
  { country: 'Romania', pinCode: '400001', city: 'Cluj-Napoca', latitude: 46.7712, longitude: 23.6236 },
  { country: 'Romania', pinCode: '300001', city: 'Timisoara', latitude: 45.7475, longitude: 21.2257 },
  
  { country: 'Bulgaria', pinCode: '1000', city: 'Sofia', latitude: 42.6977, longitude: 23.3219 },
  { country: 'Bulgaria', pinCode: '4000', city: 'Plovdiv', latitude: 42.1354, longitude: 24.7453 },
  { country: 'Bulgaria', pinCode: '9000', city: 'Varna', latitude: 43.2141, longitude: 27.9147 },
  
  { country: 'Serbia', pinCode: '11000', city: 'Belgrade', latitude: 44.7866, longitude: 20.4489 },
  { country: 'Serbia', pinCode: '21000', city: 'Novi Sad', latitude: 45.2551, longitude: 19.8452 },
  { country: 'Serbia', pinCode: '18000', city: 'Nis', latitude: 43.3247, longitude: 21.9033 },
  
  { country: 'Croatia', pinCode: '10000', city: 'Zagreb', latitude: 45.8150, longitude: 15.9819 },
  { country: 'Croatia', pinCode: '21000', city: 'Split', latitude: 43.5081, longitude: 16.4402 },
  { country: 'Croatia', pinCode: '51000', city: 'Rijeka', latitude: 45.3271, longitude: 14.4422 },
  
  { country: 'Slovenia', pinCode: '1000', city: 'Ljubljana', latitude: 46.0569, longitude: 14.5058 },
  { country: 'Slovenia', pinCode: '2000', city: 'Maribor', latitude: 46.5547, longitude: 15.6467 },
  { country: 'Slovenia', pinCode: '6000', city: 'Koper', latitude: 45.5481, longitude: 13.7302 },
  
  { country: 'Slovakia', pinCode: '81101', city: 'Bratislava', latitude: 48.1486, longitude: 17.1077 },
  { country: 'Slovakia', pinCode: '04001', city: 'Kosice', latitude: 48.7164, longitude: 21.2611 },
  { country: 'Slovakia', pinCode: '01001', city: 'Zilina', latitude: 49.2229, longitude: 18.7394 },
  
  { country: 'Lithuania', pinCode: '01108', city: 'Vilnius', latitude: 54.6872, longitude: 25.2797 },
  { country: 'Lithuania', pinCode: '44280', city: 'Kaunas', latitude: 54.8985, longitude: 23.9036 },
  { country: 'Lithuania', pinCode: '92101', city: 'Klaipeda', latitude: 55.7033, longitude: 21.1443 },
  
  { country: 'Latvia', pinCode: '1050', city: 'Riga', latitude: 56.9496, longitude: 24.1052 },
  { country: 'Latvia', pinCode: '3001', city: 'Daugavpils', latitude: 55.8754, longitude: 26.5362 },
  { country: 'Latvia', pinCode: '3401', city: 'Liepaja', latitude: 56.5047, longitude: 21.0108 },
  
  { country: 'Estonia', pinCode: '10115', city: 'Tallinn', latitude: 59.4370, longitude: 24.7536 },
  { country: 'Estonia', pinCode: '50090', city: 'Tartu', latitude: 58.3776, longitude: 26.7290 },
  { country: 'Estonia', pinCode: '80010', city: 'Parnu', latitude: 58.3858, longitude: 24.4966 },
  
  { country: 'Belarus', pinCode: '220000', city: 'Minsk', latitude: 53.9045, longitude: 27.5615 },
  { country: 'Belarus', pinCode: '210000', city: 'Gomel', latitude: 52.4345, longitude: 30.9754 },
  { country: 'Belarus', pinCode: '230000', city: 'Mogilev', latitude: 53.9006, longitude: 30.3319 },
  
  { country: 'Moldova', pinCode: '2001', city: 'Chisinau', latitude: 47.0105, longitude: 28.8638 },
  { country: 'Moldova', pinCode: '3100', city: 'Balti', latitude: 47.7539, longitude: 27.9184 },
  { country: 'Moldova', pinCode: '3300', city: 'Tiraspol', latitude: 46.8482, longitude: 29.5968 },
  
  { country: 'Georgia', pinCode: '0101', city: 'Tbilisi', latitude: 41.7151, longitude: 44.8271 },
  { country: 'Georgia', pinCode: '4600', city: 'Kutaisi', latitude: 42.2679, longitude: 42.6946 },
  { country: 'Georgia', pinCode: '6000', city: 'Batumi', latitude: 41.6168, longitude: 41.6367 },
  
  { country: 'Armenia', pinCode: '0001', city: 'Yerevan', latitude: 40.1872, longitude: 44.5152 },
  { country: 'Armenia', pinCode: '3101', city: 'Gyumri', latitude: 40.7895, longitude: 43.8477 },
  { country: 'Armenia', pinCode: '3301', city: 'Vanadzor', latitude: 40.8128, longitude: 44.4883 },
  
  { country: 'Azerbaijan', pinCode: '1000', city: 'Baku', latitude: 40.4093, longitude: 49.8671 },
  { country: 'Azerbaijan', pinCode: '5000', city: 'Ganja', latitude: 40.6828, longitude: 46.3606 },
  { country: 'Azerbaijan', pinCode: '6000', city: 'Sumgayit', latitude: 40.5897, longitude: 49.6686 },
  
  { country: 'Kazakhstan', pinCode: '050000', city: 'Almaty', latitude: 43.2220, longitude: 76.8512 },
  { country: 'Kazakhstan', pinCode: '010000', city: 'Astana', latitude: 51.1694, longitude: 71.4491 },
  { country: 'Kazakhstan', pinCode: '100000', city: 'Shymkent', latitude: 42.3000, longitude: 69.6000 },
  
  { country: 'Uzbekistan', pinCode: '100000', city: 'Tashkent', latitude: 41.2995, longitude: 69.2401 },
  { country: 'Uzbekistan', pinCode: '700000', city: 'Samarkand', latitude: 39.6270, longitude: 66.9750 },
  { country: 'Uzbekistan', pinCode: '200000', city: 'Bukhara', latitude: 39.7684, longitude: 64.4556 },
  
  { country: 'Kyrgyzstan', pinCode: '720000', city: 'Bishkek', latitude: 42.8746, longitude: 74.5698 },
  { country: 'Kyrgyzstan', pinCode: '720000', city: 'Osh', latitude: 40.5142, longitude: 72.8168 },
  { country: 'Kyrgyzstan', pinCode: '720000', city: 'Jalal-Abad', latitude: 40.9333, longitude: 73.0000 },
  
  { country: 'Tajikistan', pinCode: '734000', city: 'Dushanbe', latitude: 38.5358, longitude: 68.7791 },
  { country: 'Tajikistan', pinCode: '735700', city: 'Khujand', latitude: 40.2833, longitude: 69.6333 },
  { country: 'Tajikistan', pinCode: '735800', city: 'Kulob', latitude: 37.9167, longitude: 69.7833 },
  
  { country: 'Turkmenistan', pinCode: '744000', city: 'Ashgabat', latitude: 37.9601, longitude: 58.3261 },
  { country: 'Turkmenistan', pinCode: '744000', city: 'Turkmenabat', latitude: 39.0833, longitude: 63.5667 },
  { country: 'Turkmenistan', pinCode: '744000', city: 'Dashoguz', latitude: 41.8333, longitude: 59.9667 },
  
  // Middle East
  { country: 'UAE', pinCode: '00000', city: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
  { country: 'UAE', pinCode: '00000', city: 'Abu Dhabi', latitude: 24.4539, longitude: 54.3773 },
  { country: 'UAE', pinCode: '00000', city: 'Sharjah', latitude: 25.3463, longitude: 55.4209 },
  
  { country: 'Saudi Arabia', pinCode: '11421', city: 'Riyadh', latitude: 24.7136, longitude: 46.6753 },
  { country: 'Saudi Arabia', pinCode: '21411', city: 'Jeddah', latitude: 21.4858, longitude: 39.1925 },
  { country: 'Saudi Arabia', pinCode: '41411', city: 'Mecca', latitude: 21.4225, longitude: 39.8262 },
  
  { country: 'Israel', pinCode: '91000', city: 'Tel Aviv', latitude: 32.0853, longitude: 34.7818 },
  { country: 'Israel', pinCode: '91000', city: 'Jerusalem', latitude: 31.7683, longitude: 35.2137 },
  { country: 'Israel', pinCode: '91000', city: 'Haifa', latitude: 32.7940, longitude: 34.9896 },
  
  { country: 'Lebanon', pinCode: '1100', city: 'Beirut', latitude: 33.8935, longitude: 35.5016 },
  { country: 'Lebanon', pinCode: '1600', city: 'Tripoli', latitude: 34.4369, longitude: 35.8344 },
  { country: 'Lebanon', pinCode: '2800', city: 'Sidon', latitude: 33.5631, longitude: 35.3688 },
  
  { country: 'Jordan', pinCode: '11181', city: 'Amman', latitude: 31.9454, longitude: 35.9284 },
  { country: 'Jordan', pinCode: '21110', city: 'Zarqa', latitude: 32.0728, longitude: 36.0895 },
  { country: 'Jordan', pinCode: '22110', city: 'Irbid', latitude: 32.5556, longitude: 35.8500 },
  
  { country: 'Iraq', pinCode: '10001', city: 'Baghdad', latitude: 33.3152, longitude: 44.3661 },
  { country: 'Iraq', pinCode: '31001', city: 'Basra', latitude: 30.5000, longitude: 47.8167 },
  { country: 'Iraq', pinCode: '36001', city: 'Mosul', latitude: 36.3450, longitude: 43.1450 },
  
  { country: 'Iran', pinCode: '11369', city: 'Tehran', latitude: 35.6892, longitude: 51.3890 },
  { country: 'Iran', pinCode: '51367', city: 'Mashhad', latitude: 36.2970, longitude: 59.6062 },
  { country: 'Iran', pinCode: '71367', city: 'Isfahan', latitude: 32.6546, longitude: 51.6680 },
  
  { country: 'Pakistan', pinCode: '44000', city: 'Karachi', latitude: 24.8607, longitude: 67.0011 },
  { country: 'Pakistan', pinCode: '54000', city: 'Lahore', latitude: 31.5204, longitude: 74.3587 },
  { country: 'Pakistan', pinCode: '44000', city: 'Islamabad', latitude: 33.6844, longitude: 73.0479 },
  
  { country: 'Bangladesh', pinCode: '1000', city: 'Dhaka', latitude: 23.8103, longitude: 90.4125 },
  { country: 'Bangladesh', pinCode: '4000', city: 'Chittagong', latitude: 22.3419, longitude: 91.8132 },
  { country: 'Bangladesh', pinCode: '2200', city: 'Rajshahi', latitude: 24.3745, longitude: 88.6042 },
  
  { country: 'Sri Lanka', pinCode: '10000', city: 'Colombo', latitude: 6.9271, longitude: 79.8612 },
  { country: 'Sri Lanka', pinCode: '20000', city: 'Kandy', latitude: 7.2906, longitude: 80.6337 },
  { country: 'Sri Lanka', pinCode: '80000', city: 'Galle', latitude: 6.0535, longitude: 80.2210 },
  
  { country: 'Nepal', pinCode: '44600', city: 'Kathmandu', latitude: 27.7172, longitude: 85.3240 },
  { country: 'Nepal', pinCode: '33700', city: 'Pokhara', latitude: 28.2096, longitude: 83.9856 },
  { country: 'Nepal', pinCode: '32900', city: 'Lalitpur', latitude: 27.6667, longitude: 85.3167 },
  
  { country: 'Bhutan', pinCode: '11001', city: 'Thimphu', latitude: 27.4716, longitude: 89.6386 },
  { country: 'Bhutan', pinCode: '31001', city: 'Paro', latitude: 27.4333, longitude: 89.4167 },
  { country: 'Bhutan', pinCode: '41001', city: 'Punakha', latitude: 27.6167, longitude: 89.8667 },
  
  { country: 'Myanmar', pinCode: '11181', city: 'Yangon', latitude: 16.8661, longitude: 96.1951 },
  { country: 'Myanmar', pinCode: '11181', city: 'Mandalay', latitude: 21.9588, longitude: 96.0891 },
  { country: 'Myanmar', pinCode: '11181', city: 'Naypyidaw', latitude: 19.7633, longitude: 96.0785 },
  
  { country: 'Cambodia', pinCode: '12000', city: 'Phnom Penh', latitude: 11.5564, longitude: 104.9282 },
  { country: 'Cambodia', pinCode: '17252', city: 'Siem Reap', latitude: 13.3671, longitude: 103.8448 },
  { country: 'Cambodia', pinCode: '18000', city: 'Battambang', latitude: 13.0957, longitude: 103.2022 },
  
  { country: 'Laos', pinCode: '01000', city: 'Vientiane', latitude: 17.9757, longitude: 102.6331 },
  { country: 'Laos', pinCode: '06000', city: 'Luang Prabang', latitude: 19.8834, longitude: 102.1347 },
  { country: 'Laos', pinCode: '16000', city: 'Savannakhet', latitude: 16.5560, longitude: 104.7500 },
  
  { country: 'Mongolia', pinCode: '14200', city: 'Ulaanbaatar', latitude: 47.8864, longitude: 106.9057 },
  { country: 'Mongolia', pinCode: '14200', city: 'Erdenet', latitude: 49.0333, longitude: 104.0833 },
  { country: 'Mongolia', pinCode: '14200', city: 'Darkhan', latitude: 49.4667, longitude: 105.9667 },
  
  { country: 'Turkey', pinCode: '34000', city: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
  { country: 'Turkey', pinCode: '06000', city: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { country: 'Turkey', pinCode: '35000', city: 'Izmir', latitude: 38.4192, longitude: 27.1287 },
  
  // India (keeping some key cities)
  { country: 'India', pinCode: '400001', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { country: 'India', pinCode: '110001', city: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
  { country: 'India', pinCode: '700001', city: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { country: 'India', pinCode: '600001', city: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { country: 'India', pinCode: '560001', city: 'Bangalore', latitude: 12.9716, longitude: 77.5946 },
];

// Comprehensive disease patterns for global demo (using only allowed illness types)
const globalDiseasePatterns = {
  flu: {
    baseRate: 0.4,
    seasonalMultiplier: 1.8,
    symptoms: ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue', 'Headache'],
    severity: ['mild', 'moderate', 'severe'],
    global: true
  },
  covid: {
    baseRate: 0.25,
    seasonalMultiplier: 1.2,
    symptoms: ['Fever', 'Cough', 'Fatigue', 'Loss of taste/smell', 'Shortness of breath', 'Body aches'],
    severity: ['mild', 'moderate', 'severe'],
    global: true
  },
  dengue: {
    baseRate: 0.3,
    seasonalMultiplier: 2.5,
    symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Muscle pain', 'Rash', 'Nausea'],
    severity: ['mild', 'moderate', 'severe'],
    tropical: true
  },
  malaria: {
    baseRate: 0.2,
    seasonalMultiplier: 3.0,
    symptoms: ['Cyclic fever', 'Chills', 'Sweating', 'Headache', 'Nausea', 'Fatigue'],
    severity: ['mild', 'moderate', 'severe'],
    tropical: true
  },
  typhoid: {
    baseRate: 0.15,
    seasonalMultiplier: 2.0,
    symptoms: ['High fever', 'Headache', 'Abdominal pain', 'Diarrhea', 'Loss of appetite'],
    severity: ['mild', 'moderate', 'severe'],
    developing: true
  },
  chikungunya: {
    baseRate: 0.1,
    seasonalMultiplier: 2.8,
    symptoms: ['High fever', 'Joint pain', 'Muscle pain', 'Headache', 'Rash', 'Fatigue'],
    severity: ['mild', 'moderate'],
    tropical: true
  },
  unknown: {
    baseRate: 0.08,
    seasonalMultiplier: 1.0,
    symptoms: ['Fever', 'Fatigue', 'Headache', 'Body aches', 'Nausea'],
    severity: ['mild', 'moderate'],
    global: true
  },
  other: {
    baseRate: 0.06,
    seasonalMultiplier: 1.3,
    symptoms: ['Fever', 'Cough', 'Fatigue', 'Headache', 'Body aches'],
    severity: ['mild', 'moderate', 'severe'],
    global: true
  }
};

// Global nicknames for anonymous reporting
const globalNicknames = [
  'HealthWatcher', 'WellnessSeeker', 'CommunityCare', 'HealthGuard', 'WellnessBuddy',
  'HealthTracker', 'CommunityHealth', 'WellnessGuide', 'HealthMonitor', 'WellnessPartner',
  'HealthHelper', 'CommunityWell', 'WellnessFriend', 'HealthSupporter', 'WellnessAdvocate',
  'GlobalHealth', 'WorldWellness', 'HealthObserver', 'WellnessTracker', 'CommunityMonitor',
  'HealthReporter', 'WellnessWatcher', 'HealthSpotter', 'WellnessObserver', 'HealthMonitor',
  'GlobalCare', 'WorldHealth', 'CommunityGuard', 'HealthSpotter', 'WellnessReporter'
];

// Generate random date within the last 30 days
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  
  return date.toISOString();
}

// Determine if a disease should occur in a location
function shouldDiseaseOccur(diseaseType, location) {
  const pattern = globalDiseasePatterns[diseaseType];
  
  if (pattern.global) return true;
  
  if (pattern.tropical) {
    const absLat = Math.abs(location.latitude);
    return absLat < 30; // Tropical regions
  }
  
  if (pattern.developing) {
    // Simplified logic - certain countries are considered developing
    const developingCountries = ['India', 'Brazil', 'China', 'Indonesia', 'Philippines', 'Thailand', 'Vietnam', 'Malaysia', 'Nigeria', 'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Peru', 'Colombia'];
    return developingCountries.includes(location.country);
  }
  
  return false;
}

// Generate comprehensive demo data
async function generateDemoData() {
  console.log('🚀 Generating comprehensive global demo health data for funding presentation...');
  
  const reports = [];
  const now = new Date();
  
  // Generate data for each location and disease pattern
  for (const location of globalLocations) {
    for (const [diseaseType, pattern] of Object.entries(globalDiseasePatterns)) {
      // Check if this disease should occur in this location
      if (!shouldDiseaseOccur(diseaseType, location)) continue;
      
      // Calculate base number of reports for this location-disease combination
      const baseReports = Math.floor(pattern.baseRate * 80); // Increased for demo
      
      // Generate reports for the last 30 days
      for (let day = 0; day < 30; day++) {
        // Add some randomness and seasonal variation
        const seasonalFactor = 1 + (pattern.seasonalMultiplier - 1) * Math.sin((day / 30) * Math.PI);
        const decayedReports = Math.floor(baseReports * seasonalFactor * (0.3 + Math.random() * 0.7));
        
        for (let i = 0; i < decayedReports; i++) {
          const report = {
            nickname: globalNicknames[Math.floor(Math.random() * globalNicknames.length)],
            country: location.country,
            pin_code: location.pinCode,
            symptoms: pattern.symptoms.slice(0, 2 + Math.floor(Math.random() * 4)), // 2-5 symptoms
            illness_type: diseaseType,
            severity: pattern.severity[Math.floor(Math.random() * pattern.severity.length)],
            latitude: location.latitude + (Math.random() - 0.5) * 0.02, // Add some variation
            longitude: location.longitude + (Math.random() - 0.5) * 0.02,
            created_at: getRandomDate()
          };
          
          reports.push(report);
        }
      }
    }
  }
  
  console.log(`📊 Generated ${reports.length} global demo reports`);
  
  // Clear existing data first
  console.log('🗑️ Clearing existing data...');
  const { error: deleteError } = await supabase
    .from('symptom_reports')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
  
  if (deleteError) {
    console.error('Error clearing data:', deleteError);
  } else {
    console.log('✅ Existing data cleared');
  }
  
  // Insert reports in batches
  const batchSize = 100;
  for (let i = 0; i < reports.length; i += batchSize) {
    const batch = reports.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('symptom_reports')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(reports.length / batchSize)}`);
      }
    } catch (err) {
      console.error('Error inserting batch:', err);
    }
  }
  
  console.log('🎉 Global demo data generation complete!');
  
  // Show comprehensive summary statistics
  const { data: summary } = await supabase
    .from('symptom_reports')
    .select('illness_type, country, created_at')
    .gte('created_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());
  
  if (summary) {
    const diseaseCounts = summary.reduce((acc, report) => {
      acc[report.illness_type] = (acc[report.illness_type] || 0) + 1;
      return acc;
    }, {});
    
    const countryCounts = summary.reduce((acc, report) => {
      acc[report.country] = (acc[report.country] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 Global Demo Data Summary (Last 30 days):');
    console.log(`Total Reports: ${summary.length}`);
    console.log(`Countries Covered: ${Object.keys(countryCounts).length}`);
    console.log(`Diseases Tracked: ${Object.keys(diseaseCounts).length}`);
    
    console.log('\n🌍 Reports by Disease:');
    Object.entries(diseaseCounts).forEach(([disease, count]) => {
      console.log(`  ${disease}: ${count} reports`);
    });
    
    console.log('\n🌍 Top Countries by Reports:');
    Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([country, count]) => {
        console.log(`  ${country}: ${count} reports`);
      });
  }
}

// Run the script
generateDemoData().catch(console.error);