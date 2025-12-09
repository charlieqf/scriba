# Migration to Google Cloud Platform (GCP)

## Goal
Migrate the application hosting from Vercel/Railway to **Google Cloud Platform** to leverage Google's serverless infrastructure, while retaining **TiDB Cloud** and **Cloudinary** for data and media storage.

## Architecture Change

| Component | Current (Vercel/Railway) | Target (GCP) | Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel (Static + SPA) | **Firebase Hosting** (Global CDN) | Needs Config |
| **Backend** | Railway (Buildpacks) | **Google Cloud Run** (Docker Container) | Dockerfile Ready |
| **Database** | TiDB Cloud | TiDB Cloud | **No Change** |
| **Media** | Cloudinary | Cloudinary | **No Change** |

## Implementation Steps

### Phase 1: Preparation
- [x] **Backend**: Verify `backend/Dockerfile` exists. (Done)
- [x] **Docs**: Review `docs/04_DEPLOYMENT_GCP.md`. (Done)
- [ ] **GCP Project**: User needs to create a project in Google Cloud Console.
- [ ] **CLI Tools**: Ensure `gcloud` and `firebase-tools` are installed.

### Phase 2: Backend Migration (Cloud Run)
1.  **Build & Submit**: Submit the Docker image to Google Artifact Registry.
2.  **Deploy**: Deploy the container to Cloud Run.
3.  **Configuration**:
    *   Set `DATABASE_URL` (Copy from `.env`).
    *   Set `CLOUDINARY_URL` (Copy from `.env`).
    *   Set `FLASK_APP=app.py`.
4.  **Verification**: Test the `/health` endpoint of the new Cloud Run URL.

### Phase 3: Frontend Migration (Firebase)
1.  **Initialize**: Run `firebase init hosting` in the project root.
    *   Set public directory to `dist`.
    *   Configure as Single Page App (Yes).
2.  **Environment**: Update `.env.production` or Vercel env vars equivalent?
    *   *Note*: Firebase Hosting doesn't inject env vars at runtime like Vercel. We must build them in.
    *   Action: Create `.env.production` locally with `VITE_API_URL=<New_Cloud_Run_URL>`.
3.  **Build**: Run `npm run build`.
4.  **Deploy**: Run `firebase deploy`.

### Phase 4: DNS & Verification (Optional)
-   Map custom domains in Cloud Run / Firebase Console if desired.
-   Full E2E test on new URLs.

## User Action Required
To proceed, you will need:
1.  A **Google Cloud Account**.
2.  To install **Google Cloud SDK** (`gcloud`) and **Firebase CLI** (`npm install -g firebase-tools`).
