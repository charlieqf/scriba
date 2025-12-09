# Google Cloud Platform (GCP) Deployment Guide

This guide outlines how to deploy the Scriba application (Vue frontend + Flask backend) to Google Cloud Platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Google Cloud Platform                      │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │  Firebase        │  HTTPS  │   Cloud Run      │              │
│  │  Hosting         ├────────►│   (Backend)      │              │
│  │  (Vue SPA)       │         │   Flask + Gunicorn│             │
│  └──────────────────┘         └─────────┬────────┘              │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────┐
              │                           ▼                       │
              │  ┌──────────────┐   ┌──────────────┐             │
              │  │  Cloudinary  │   │  TiDB Cloud  │             │
              │  │  (Media)     │   │  (Database)  │             │
              │  └──────────────┘   └──────────────┘             │
              │              External Services                    │
              └───────────────────────────────────────────────────┘
```

| Component | Service | Notes |
|-----------|---------|-------|
| Frontend | **Firebase Hosting** | Static Vue SPA, free tier available |
| Backend | **Cloud Run** | Serverless container, scale-to-zero |
| Database | **TiDB Cloud** | Keep existing, MySQL-compatible |
| Media | **Cloudinary** | Keep existing |

## Key Benefits

- **Serverless**: Pay only for what you use (Cloud Run scale-to-zero)
- **Integration**: Strong integration with Google AI services (Gemini, Vertex AI)
- **Global CDN**: Firebase Hosting includes global CDN for frontend

---

## Prerequisites

1. **Install Google Cloud CLI**
   ```bash
   # Windows (run as Administrator)
   (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
   & $env:Temp\GoogleCloudSDKInstaller.exe
   ```

2. **Login and Set Project**
   ```bash
   gcloud auth login
   gcloud projects create scriba-app --name="Scriba App"  # or use existing
   gcloud config set project scriba-app
   ```

3. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com
   ```

4. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

---

## Step 1: Deploy Backend to Cloud Run

### 1.1 Environment Variables

Create or verify `backend/.env` with all required variables:

```bash
# Database (TiDB Cloud)
DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:4000/<database>?ssl_mode=VERIFY_IDENTITY

# Cloudinary
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# Authentication
JWT_SECRET_KEY=<your-jwt-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
FACEBOOK_APP_ID=<your-facebook-app-id>
FACEBOOK_APP_SECRET=<your-facebook-app-secret>
APPLE_CLIENT_ID=<your-apple-service-id>
```

### 1.2 Deploy Command

```bash
cd backend

# Deploy with environment variables
gcloud run deploy scriba-backend \
  --source . \
  --region australia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=$(grep DATABASE_URL .env | cut -d'=' -f2-)" \
  --set-env-vars="CLOUDINARY_URL=$(grep CLOUDINARY_URL .env | cut -d'=' -f2-)" \
  --set-env-vars="JWT_SECRET_KEY=$(grep JWT_SECRET_KEY .env | cut -d'=' -f2-)" \
  --set-env-vars="GOOGLE_CLIENT_ID=$(grep GOOGLE_CLIENT_ID .env | cut -d'=' -f2-)" \
  --set-env-vars="GOOGLE_CLIENT_SECRET=$(grep GOOGLE_CLIENT_SECRET .env | cut -d'=' -f2-)" \
  --set-env-vars="FACEBOOK_APP_ID=$(grep FACEBOOK_APP_ID .env | cut -d'=' -f2-)" \
  --set-env-vars="FACEBOOK_APP_SECRET=$(grep FACEBOOK_APP_SECRET .env | cut -d'=' -f2-)" \
  --set-env-vars="APPLE_CLIENT_ID=$(grep APPLE_CLIENT_ID .env | cut -d'=' -f2-)"
```

> [!TIP]
> Use `australia-southeast1` (Sydney) for lowest latency to Australian users.

### 1.3 Note the Backend URL

After deployment, Cloud Run will output a URL like:
```
Service URL: https://scriba-backend-xxxxxxxxxx-ts.a.run.app
```

**Save this URL** - you'll need it for the frontend configuration.

---

## Step 2: Update Backend CORS

After deploying, update `backend/app.py` to allow your Firebase Hosting domain:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://scriba-app.web.app",           # Firebase default domain
            "https://scriba-app.firebaseapp.com",   # Firebase alternate domain
            "https://your-custom-domain.com"        # If using custom domain
        ],
        "supports_credentials": True
    }
})
```

Then redeploy the backend.

---

## Step 3: Deploy Frontend to Firebase Hosting

### 3.1 Initialize Firebase

```bash
# In project root
firebase init hosting
```

When prompted:
- **Project**: Select your GCP project or create new
- **Public directory**: `dist`
- **Single-page app**: **Yes**
- **GitHub auto-deploys**: Optional (can set up later)

### 3.2 Create firebase.json

Ensure your `firebase.json` looks like this:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 3.3 Configure Frontend Environment

Create `.env.production`:

```bash
VITE_API_URL=https://scriba-backend-xxxxxxxxxx-ts.a.run.app
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=<your-facebook-app-id>
VITE_APPLE_CLIENT_ID=<your-apple-service-id>
```

### 3.4 Build and Deploy

```bash
npm run build
firebase deploy
```

Your app will be live at:
- `https://scriba-app.web.app`
- `https://scriba-app.firebaseapp.com`

---

## Step 4: Update OAuth Redirect URIs

Update your OAuth provider settings with the new production URLs:

### Google Cloud Console
- Add `https://scriba-app.web.app` to Authorized JavaScript origins
- Add `https://scriba-backend-xxx.a.run.app/api/auth/google/callback` to Authorized redirect URIs

### Facebook Developers
- Add `https://scriba-app.web.app` to Valid OAuth Redirect URIs
- Add the Firebase domain to App Domains

### Apple Developer
- Update Service ID with Firebase domain

---

## Optional: CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: |
          cd backend
          gcloud run deploy scriba-backend \
            --source . \
            --region australia-southeast1 \
            --allow-unauthenticated

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Verify backend CORS includes Firebase domain |
| Cloud Run cold starts | Set `--min-instances=1` (costs more) |
| TiDB connection timeout | Ensure Cloud Run region is close to TiDB region |
| Firebase 404 on refresh | Verify `rewrites` in `firebase.json` |

---

## Cost Estimate (Monthly)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Firebase Hosting | 10GB storage, 360MB/day transfer | **Free** |
| Cloud Run | 2M requests, 360K GB-seconds | **Free** for low traffic |
| TiDB Cloud | Serverless tier | ~$0 - $5 |
| Cloudinary | 25GB storage, 25GB bandwidth | **Free** |

> [!NOTE]
> For MVP/low traffic, total cost can be **$0 - $5/month**.

---

## Migration Checklist

- [ ] GCP project created
- [ ] Required APIs enabled
- [ ] Backend deployed to Cloud Run
- [ ] Backend URL noted
- [ ] CORS updated with Firebase domain
- [ ] Firebase Hosting initialized
- [ ] Frontend `.env.production` configured
- [ ] Frontend built and deployed
- [ ] OAuth redirect URIs updated (Google, Facebook, Apple)
- [ ] End-to-end testing completed
