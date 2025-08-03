// Netlify function for secure Google OAuth
// This handles the OAuth flow server-side to keep client secrets secure

import { google } from "googleapis";
import { Client } from "pg";

// Use environment variables for production, fallback to hardcoded for development
const CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "843268184647-p89poev104e7n2jdf5ks6e9ufflmnl4r.apps.googleusercontent.com";
const CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "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";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_w0RoQNxMjpX3@ep-silent-shadow-aex6400q-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Create database connection
const createClient = () => {
  return new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const handler = async (event, context) => {
  // Add debug logging
  console.log("Auth function called:", {
    method: event.httpMethod,
    path: event.path,
    headers: Object.keys(event.headers),
    origin: event.headers.origin || event.headers.referer,
    host: event.headers.host,
  });

  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    const { httpMethod, path, body } = event;

    // Determine the origin/redirect URI
    const origin =
      event.headers.origin ||
      event.headers.referer?.split("/").slice(0, 3).join("/") ||
      "http://localhost:8888";
    const isLocal = origin.includes("localhost");
    const redirectUri = isLocal
      ? origin + "/"
      : `https://${event.headers.host}/`;

    console.log("Redirect URI:", redirectUri);

    // Parse the path to get the endpoint
    const pathParts = event.path.split("/").filter(Boolean);
    const endpoint = pathParts[pathParts.length - 1];

    console.log("Auth function called:", {
      method: httpMethod,
      path: event.path,
      endpoint,
    });

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      redirectUri
    );

    if (httpMethod === "POST" && endpoint === "token") {
      console.log("Handling token exchange");
      // Exchange authorization code for tokens
      const { code } = JSON.parse(body);

      if (!code) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Authorization code is required" }),
        };
      }

      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user profile
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data: profile } = await oauth2.userinfo.get();

      console.log("Token exchange successful for user:", profile.email);

      // Save user to database
      const client = createClient();
      try {
        await client.connect();
        console.log("Connected to database successfully");

        const userId = "google_" + profile.id;
        console.log("Attempting to save user:", {
          userId,
          email: profile.email,
          name: profile.name,
        });

        const result = await client.query(
          `INSERT INTO users (id, email, name, picture, provider)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO UPDATE SET
             name = EXCLUDED.name,
             picture = EXCLUDED.picture,
             updated_at = CURRENT_TIMESTAMP
           RETURNING id, email, name`,
          [userId, profile.email, profile.name, profile.picture, "google"]
        );

        console.log("User saved to database successfully:", result.rows[0]);
      } catch (dbError) {
        console.error("Database error during user save:", dbError);
        // Don't fail the auth process if database save fails
      } finally {
        await client.end();
        console.log("Database connection closed");
      }

      // Return sanitized user data and access token
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            verified_email: profile.verified_email,
          },
          tokens: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date,
          },
        }),
      };
    }

    if (httpMethod === "GET" && endpoint === "url") {
      console.log("Generating auth URL for redirect URI:", redirectUri);
      // Generate OAuth URL
      const scopes = ["openid", "profile", "email"];

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
      });

      console.log("Auth URL generated successfully");

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ authUrl }),
      };
    }

    if (httpMethod === "POST" && endpoint === "refresh") {
      console.log("Handling token refresh");
      // Refresh access token
      const { refresh_token } = JSON.parse(body);

      if (!refresh_token) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Refresh token is required" }),
        };
      }

      oauth2Client.setCredentials({ refresh_token });
      const { credentials } = await oauth2Client.refreshAccessToken();

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          access_token: credentials.access_token,
          expiry_date: credentials.expiry_date,
        }),
      };
    }

    // Default response for unknown endpoints
    console.log("Unknown endpoint requested:", endpoint);
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: `Endpoint '${endpoint}' not found` }),
    };
  } catch (error) {
    console.error("OAuth Error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Authentication failed",
        details: error.message,
      }),
    };
  }
};
