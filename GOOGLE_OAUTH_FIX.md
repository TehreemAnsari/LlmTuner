# Google OAuth Redirect URI Fix

## Problem
The deployment is showing:
```
Error 400: redirect_uri_mismatch
```

This happens because the Google Cloud Console OAuth settings have a different redirect URI than what your deployed app is using.

## Current Deployed Domain
Your app is deployed at: `https://8da26382-5b3d-4491-877b-59592029075a-00-2tkhecdvkimib.riker.replit.dev`

## Required Redirect URI
The Google OAuth settings need to include:
```
https://8da26382-5b3d-4491-877b-59592029075a-00-2tkhecdvkimib.riker.replit.dev/api/auth/google/callback
```

## Steps to Fix

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Navigate to "APIs & Services" → "Credentials"

### 2. Find Your OAuth 2.0 Client ID
- Look for the OAuth 2.0 Client ID that starts with: `61164045088-f76afr25fiv32uhm6ks0l54ikcnirg2m.apps.googleusercontent.com`
- Click on the pencil icon to edit it

### 3. Update Authorized Redirect URIs
- In the "Authorized redirect URIs" section, add:
  ```
  https://8da26382-5b3d-4491-877b-59592029075a-00-2tkhecdvkimib.riker.replit.dev/api/auth/google/callback
  ```
- Keep any existing URIs (like localhost ones for development)
- Click "Save"

### 4. Wait for Changes to Propagate
- Google OAuth changes can take a few minutes to propagate
- Try the login again after 2-3 minutes

## Alternative: Use Environment Variable Override
If you want to use a specific redirect URI, you can set the `GOOGLE_REDIRECT_URI` environment variable in your Replit secrets to override the automatic detection.

## Current OAuth Configuration
The app currently detects the domain automatically using:
- `REPLIT_DOMAINS` environment variable
- Falls back to `localhost:5000` for development

Your current detected domain: `8da26382-5b3d-4491-877b-59592029075a-00-2tkhecdvkimib.riker.replit.dev`