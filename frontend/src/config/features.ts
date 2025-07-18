// Feature flags for HealthPulse
export const FEATURES = {
  // Main community features - easily removable
  COMMUNITY_ENABLED: true,
  
  // Individual community components
  SUPPORT_GROUPS: true,
  HEALTH_CHALLENGES: true,
  EMERGENCY_SUPPORT: true,
  
  // Other features
  PREDICTIVE_ANALYTICS: true,
  PHONE_AI: true,
  CONNECT_FEATURE: true,
  
  // Development features
  DEMO_MODE: true,
  DEBUG_MODE: false
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature] || false;
};

// Helper function to disable community features
export const disableCommunityFeatures = () => {
  FEATURES.COMMUNITY_ENABLED = false;
  FEATURES.SUPPORT_GROUPS = false;
  FEATURES.HEALTH_CHALLENGES = false;
  FEATURES.EMERGENCY_SUPPORT = false;
};

// Helper function to enable community features
export const enableCommunityFeatures = () => {
  FEATURES.COMMUNITY_ENABLED = true;
  FEATURES.SUPPORT_GROUPS = true;
  FEATURES.HEALTH_CHALLENGES = true;
  FEATURES.EMERGENCY_SUPPORT = true;
}; 