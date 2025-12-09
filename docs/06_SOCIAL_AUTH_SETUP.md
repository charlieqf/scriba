# Social Authentication Setup Guide

This guide explains how to obtain the necessary credentials for Google, Facebook, and Apple login integrations.

## 1. Google Login (Done)
*   **Console**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
*   **Credentials Needed**: `VITE_GOOGLE_CLIENT_ID`
*   **Setup**:
    1.  Create Credentials -> OAuth Client ID -> Web Application.
    2.  Add Authorized Origins: `http://localhost:3000`, `https://your-vercel-app.vercel.app`.

## 2. Facebook Login
*   **Portal**: [Meta for Developers](https://developers.facebook.com/)
*   **Credentials Needed**: `VITE_FACEBOOK_APP_ID`
*   **Setup Steps**:
    1.  **Register App**: Go to "My Apps" -> "Create App".
    2.  **Use Case**: Select "Authenticate and request data from users with Facebook Login" (or "Consumer").
    3.  **App Type**: Select "Web".
    4.  **Settings**:
        *   In the sidebar, find **Facebook Login** -> **Settings**.
        *   **Valid OAuth Redirect URIs**: not strictly needed for the JS SDK Popup mode, but good to add your domains.
        *   **App Domain**: Add your Vercel domain.
    5.  **Get ID**: Go to **Settings** -> **Basic**. Copy the **App ID**.
    6.  **Environment**:
        *   Vercel: Add `VITE_FACEBOOK_APP_ID` = `123456...`

## 3. Apple Login (Sign in with Apple)
*   **Portal**: [Apple Developer Account](https://developer.apple.com/account/) (Requires $99/year membership).
*   **Credentials Needed**: `VITE_APPLE_SERVICE_ID`, `VITE_APPLE_REDIRECT_URI`.
*   **Setup Steps**:
    1.  **Identifier (App ID)**:
        *   Certificates, Identifiers & Profiles -> Identifiers.
        *   Create new **App ID** (e.g., `com.scriba.app`). Enable "Sign in with Apple".
    2.  **Identifier (Service ID)**:
        *   Create new **Service ID** (e.g., `com.scriba.app.service`).
        *   **Important**: This is what goes into `VITE_APPLE_SERVICE_ID`.
        *   Configure: Link it to your primary App ID.
        *   **Domains and Subdomains**: Add your Vercel domain (e.g., `scriba.vercel.app`) without `https://`.
        *   **Return URLs**: Add `https://scriba.vercel.app`.
    3.  **Key (Private Key)**:
        *   Keys -> Create New Key. Enable "Sign in with Apple".
        *   Download the `.p8` file. **Keep this safe**. You (or the backend) need this to verify tokens strictly (though for the current frontend-only flow, we are decoding tokens without signature verification, a Private Key is needed for strict backend validation).
    4.  **Environment**:
        *   Vercel: `VITE_APPLE_SERVICE_ID` = `com.scriba.app.service`
        *   Vercel: `VITE_APPLE_REDIRECT_URI` = `https://scriba.vercel.app` (Must match Return URLs exactly).

## Summary of Environment Variables

| Variable | Where to set | Value Source |
| :--- | :--- | :--- |
| `VITE_GOOGLE_CLIENT_ID` | Vercel (Public) | Google Cloud Console |
| `VITE_FACEBOOK_APP_ID` | Vercel (Public) | Meta Developers |
| `VITE_APPLE_SERVICE_ID` | Vercel (Public) | Apple Developer (Service ID) |
| `VITE_APPLE_REDIRECT_URI`| Vercel (Public) | Your Vercel URL |
