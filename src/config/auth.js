// Authentication configuration
// ⚠️ SECURITY: All sensitive credentials are now loaded from environment variables
// Never hardcode API keys, secrets, or database credentials in source code
import { getEnvConfig } from './env.js';

const env = getEnvConfig();

export const AUTH_CONFIG = {
  google: {
    clientId: env.googleClientId,
    // Client secret removed for security - handled server-side only
    redirectUri: window.location.origin,
    scopes: ['openid', 'profile', 'email'],
  },
  
  // Neon Database Configuration - Using environment variables
  database: {
    connectionString: env.databaseUrl,
    // Individual connection details removed for security
    // These should be parsed from the connection string server-side
    ssl: true,
  },
  
  // App Configuration
  app: {
    name: "MoneyManager Premium",
    currency: "INR",
    locale: "en-IN",
    theme: "premium-orange-green",
  }
};

// Note: OAuth flow is now handled entirely server-side via Netlify functions
// Frontend only initiates the process by calling /.netlify/functions/auth/url 