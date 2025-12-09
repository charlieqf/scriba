# Google Cloud Platform (GCP) Deployment Guide

This guide outlines how to migrate the Scriba application (Vue frontend + Flask backend) to Google Cloud Platform.

## Architecture on GCP

*   **Frontend**: Google Cloud Run (Hosting containerized Nginx+Vue) OR Firebase Hosting (Static).
    *   *Recommendation*: **Firebase Hosting** is easier for static Vue apps.
*   **Backend**: **Google Cloud Run** (Serverless container for Flask).
*   **Database**: **TiDB Cloud** (Keep as is, reachable from GCP).
*   **Storage**: **Cloudinary** (Keep as is).

## key Benefits
- **Serverless**: Pay only for what you use (Cloud Run scale-to-zero).
- **Integration**: Strong integration with other Google AI services (Gemini Vertex AI) if needed later.

## Migration Steps

### 1. Backend (Cloud Run)

A `Dockerfile` has been created in `backend/` to support container deployment.

**Prerequisites**:
- Install `gcloud` CLI.
- Enable APIs: `gcloud services enable run.googleapis.com cloudbuild.googleapis.com`

**Deploy Command**:
```bash
cd backend
gcloud run deploy scriba-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="CLOUDINARY_URL=...,DATABASE_URL=..."
```
*Note: Replace `...` with your actual `.env` values.*

### 2. Frontend (Firebase Hosting)

**Setup**:
1.  Install tools: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize: `firebase init hosting`
    -   Select "Use an existing project" (or create new).
    -   Public directory: `dist`
    -   Configure as SPA: **Yes**
    -   Automatic builds with GitHub: (Optional)

**Deploy**:
1.  Build: `npm run build`
2.  Deploy: `firebase deploy`

### 3. Connection

Once Backend is deployed to Cloud Run, it will give you a URL (e.g., `https://scriba-backend-xyz.a.run.app`).
Update your Frontend environment:
- If using Vercel/Firebase: Set `VITE_API_URL` to this Cloud Run URL.

## Summary
The migration is **highly feasible** and requires minimal code changes (just adding a Dockerfile).
