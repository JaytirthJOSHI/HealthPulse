# HealthSathi's Pulse App

A real-time collaborative health heatmap platform where users can anonymously report symptoms and see live health trends in their local area.

## 🚀 Features

- **Anonymous Symptom Reporting**: Report symptoms with optional nickname
- **Location-Based Heatmap**: View health trends by country and PIN code
- **Real-Time Updates**: Live updates using Supabase real-time subscriptions
- **Interactive Map**: Powered by Leaflet.js with heatmap visualization
- **Health Tips**: Instant advice based on symptoms and location
- **Mobile-Friendly**: Responsive design for all devices
- **Privacy-First**: No exact location tracking, only area-based data
- **Exponential Decay Analysis**: Time-based health trend visualization

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS
- **Map Visualization**: Leaflet.js
- **Real-time Communication**: Socket.io
- **Backend & Storage**: Supabase
- **Deployment**: Vercel (frontend) + Render (backend)

## 📁 Project Structure

```
HealthPulse/
├── frontend/          # React application
├── backend/           # Node.js + Socket.io server
├── supabase/          # Database schema and functions
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Environment Variables
Create `.env` files in both frontend and backend directories with your Supabase credentials.

## 📱 Usage

1. Open the application in your browser
2. Enter your country and PIN code
3. Report symptoms anonymously
4. View the live heatmap of health trends
5. Get instant health tips based on your symptoms
6. Explore time-based trend analysis

## 🔒 Privacy

- No exact GPS coordinates are stored
- Only country and PIN code area data
- Anonymous reporting with optional nicknames
- Data is aggregated for privacy protection

## 🤝 Contributing

This is a public health tool designed to help communities monitor health trends. Contributions are welcome!

## 📄 License

Jaytirth Joshi License - see LICENSE file for details