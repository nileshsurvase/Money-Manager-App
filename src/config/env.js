// Environment configuration and validation
const requiredEnvVars = [
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_DATABASE_URL'
];

const optionalEnvVars = [
  'VITE_API_ENDPOINT',
  'VITE_SENTRY_DSN',
  'VITE_ANALYTICS_ID'
];

// Validate required environment variables
const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMessage);
    
    // In development, show helpful error
    if (import.meta.env.DEV) {
      console.error(`
🚨 Environment Configuration Error

Missing environment variables:
${missing.map(v => `  - ${v}`).join('\n')}

Please create a .env file in the project root with these variables.
See .env.example for reference.
      `);
    }
    
    throw new Error(errorMessage);
  }
};

// Get environment configuration
export const getEnvConfig = () => {
  validateEnv();
  
  return {
    // Required variables
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    databaseUrl: import.meta.env.VITE_DATABASE_URL,
    
    // Optional variables with defaults
    apiEndpoint: import.meta.env.VITE_API_ENDPOINT || '/.netlify/functions/api',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || null,
    analyticsId: import.meta.env.VITE_ANALYTICS_ID || null,
    
    // Environment flags
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  };
};

// Export individual config values for convenience
export const ENV = getEnvConfig();

export default ENV; 