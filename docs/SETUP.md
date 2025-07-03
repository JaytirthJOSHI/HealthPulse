# HealthPulse Lite Setup Guide

This guide will help you set up HealthPulse Lite on your local machine.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Git

## 1. Clone and Setup

```bash
git clone <your-repo-url>
cd HealthPulse
```

## 2. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Note down your project URL and anon key

### Setup Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script

### Get Your Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy the Project URL and anon public key

## 3. Frontend Setup

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp env.example .env
```

Edit `.env` with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_SOCKET_URL=http://localhost:3001
```

## 4. Backend Setup

```bash
cd ../backend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 5. Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### Start Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## 6. Testing the Application

1. Open `http://localhost:3000` in your browser
2. Navigate to "Report Symptoms" to submit a test report
3. Check the "Health Map" to see the visualization
4. Verify real-time updates work by opening multiple browser tabs

## 7. Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set environment variables
5. Deploy

## 8. Environment Variables Reference

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | Yes |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `REACT_APP_SOCKET_URL` | Backend Socket.io URL | Yes |

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |

## 9. Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `FRONTEND_URL` is set correctly in backend `.env`
2. **Socket Connection Failed**: Ensure backend is running on port 3001
3. **Database Connection Failed**: Verify Supabase credentials are correct
4. **Map Not Loading**: Check if Leaflet CSS is loading properly

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your backend `.env` file.

## 10. Features to Test

- [ ] Anonymous symptom reporting
- [ ] Real-time map updates
- [ ] Health tips generation
- [ ] Location-based data aggregation
- [ ] Mobile responsiveness
- [ ] Privacy features

## 11. Next Steps

- Add authentication (optional)
- Implement geocoding service
- Add more health tips
- Create admin dashboard
- Add data export features
- Implement notifications

## Support

If you encounter any issues, please check:
1. All environment variables are set correctly
2. Supabase database schema is properly set up
3. Both frontend and backend are running
4. Network connectivity and firewall settings 