# Netlify Production Setup Guide

## 🚀 Fix Google OAuth for Netlify Production

### Step 1: Set Environment Variables in Netlify

1. Go to your **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**

2. Add these environment variables (replace with your actual values):
   ```
   VITE_GOOGLE_CLIENT_ID = your_google_client_id_here
   VITE_DATABASE_URL = your_neon_database_connection_string
   GOOGLE_CLIENT_SECRET = your_google_client_secret_here
   ```
   
   **⚠️ SECURITY NOTE:** Never commit actual credentials to version control!

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Add your Netlify domain to **Authorized redirect URIs**:
   ```
   https://your-app-name.netlify.app/
   https://your-netlify-domain.com/
   ```
   (Replace with your actual Netlify URL)

### Step 3: Deploy to Netlify

```bash
npm run deploy
```

### Step 4: Test Production

1. Visit your deployed Netlify site
2. Try Google Sign-In
3. Check browser console for any errors

## 🔧 Troubleshooting

### If you get "redirect_uri_mismatch" error:
- Double-check that your Netlify URL is added to Google OAuth redirect URIs
- Make sure the URL includes the trailing slash

### If functions aren't working:
- Check Netlify Functions logs in your Netlify dashboard
- Ensure environment variables are set correctly

### If you get CORS errors:
- The functions already include CORS headers
- Make sure your site is properly deployed

## 📝 Common Issues

1. **Environment Variables Not Set**: Google OAuth will fail silently
2. **Wrong Redirect URI**: Google will show "redirect_uri_mismatch" error
3. **Function Dependencies**: The `googleapis` package should be in dependencies (✅ already added)

## ✅ Verification Checklist

- [ ] Environment variables added to Netlify
- [ ] Google OAuth redirect URIs updated
- [ ] Site deployed successfully
- [ ] Google Sign-In works on production 