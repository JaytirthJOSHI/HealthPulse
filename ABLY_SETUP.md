# Ably Chat Setup Guide

## Quick Setup for Real-time Chat

### 1. Get Ably API Key (Free)
1. Go to [Ably.com](https://ably.com)
2. Sign up for a free account
3. Create a new app
4. Copy your API key (starts with `YOUR_APP_KEY`)

### 2. Update the Code
Replace `YOUR_ABLY_API_KEY` in `frontend/src/components/PrivateChatRoom.tsx` with your actual API key:

```typescript
const ABLY_API_KEY = 'YOUR_ACTUAL_ABLY_API_KEY_HERE';
```

### 3. Features
- ✅ Real-time messaging
- ✅ Works with Cloudflare Workers
- ✅ Your existing UI
- ✅ Invite codes
- ✅ No server changes needed

### 4. Alternative Options
If Ably doesn't work, try these alternatives:

#### PubNub
```typescript
// Replace Ably with PubNub
const PUBLISH_KEY = 'your_publish_key';
const SUBSCRIBE_KEY = 'your_subscribe_key';
```

#### Stream Chat
```typescript
// Replace Ably with Stream Chat
const STREAM_API_KEY = 'your_stream_api_key';
```

### 5. Test
1. Build and deploy
2. Create a chat room
3. Share invite code
4. Test real-time messaging

The chat will now work with real-time messaging using Ably's service! 