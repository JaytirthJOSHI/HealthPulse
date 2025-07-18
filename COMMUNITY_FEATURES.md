# HealthPulse Community Features

## Overview
The HealthPulse Community features provide real-time health support through:
- **Support Groups**: Disease-specific and wellness communities
- **Health Challenges**: Fitness, nutrition, and mental health challenges
- **Emergency Support**: Real-time emergency coordination

## How to Remove Community Features

### Option 1: Quick Disable (Recommended)
Edit `frontend/src/config/features.ts` and set:
```typescript
COMMUNITY_ENABLED: false,
SUPPORT_GROUPS: false,
HEALTH_CHALLENGES: false,
EMERGENCY_SUPPORT: false,
```

### Option 2: Complete Removal
1. Delete the community component files:
   - `frontend/src/components/HealthCommunity.tsx`
   - `frontend/src/components/CollaborativeFeatures.tsx` (if exists)

2. Remove imports and references from:
   - `frontend/src/App.tsx`
   - `frontend/src/components/Header.tsx`

3. Remove community-related backend endpoints from `backend/src/worker.ts`:
   - `/api/collaborative/groups`
   - `/api/collaborative/challenges`
   - `/api/collaborative/emergency`

## Features Included

### Support Groups
- Flu Recovery Support
- COVID-19 Support Network
- Mental Wellness Circle
- Emergency Response Network

### Health Challenges
- 30-Day Hydration Challenge
- 10K Steps Daily Challenge
- Stress Reduction Challenge

### Emergency Support
- Emergency alert system
- Direct contact with health professionals
- Real-time coordination

## Configuration
All community features can be toggled individually in `frontend/src/config/features.ts`:

```typescript
export const FEATURES = {
  COMMUNITY_ENABLED: true,      // Main community toggle
  SUPPORT_GROUPS: true,         // Support groups feature
  HEALTH_CHALLENGES: true,      // Health challenges feature
  EMERGENCY_SUPPORT: true,      // Emergency support feature
  // ... other features
};
```

## Backend Integration
The community features use WebSocket connections for real-time communication and REST APIs for data management. The backend includes:
- In-memory storage for groups, challenges, and messages
- WebSocket handlers for real-time chat
- REST endpoints for group and challenge management

## Dependencies
- React hooks for state management
- Lucide React for icons
- Tailwind CSS for styling
- WebSocket API for real-time communication 