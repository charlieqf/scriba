# Deployment Guide: Vercel + Railway

This guide outlines the deployment strategy using **Vercel** for the Vue frontend and **Railway** for the Flask backend. This "DX-First" stack provides automatic CI/CD and easy scaling.

## 1. Architecture Overview

-   **Frontend**: Vue 3 (Vite) -> Deployed on **Vercel**.
-   **Backend**: Flask (Python) -> Deployed on **Railway**.
-   **Database**: TiDB Cloud (MySQL Compatible) -> **Managed Service**.

---

## 2. Backend Deployment (Railway)

We deploy the backend first to get the API URL.

### Prerequisites
-   A [Railway](https://railway.app/) account.
-   [Railway CLI](https://docs.railway.app/guides/cli) (Optional, but recommended for debugging).

### Steps
1.  **Create a Project**:
    -   Go to Dashboard -> "New Project" -> "Deploy from GitHub repo".
    -   Select this repository.

2.  **Configure Service**:
    -   Railway will automatically detect `backend/requirements.txt` and `backend/app.py` if configured correctly.
    -   **Root Directory**: Set this to `/backend` in the service settings -> "Root Directory". This is critical because our flask app is in a subdirectory.
    -   **Start Command**: `gunicorn app:app` (You may need to add `gunicorn` to `requirements.txt`).
    -   **Networking**: Click "Generate Domain" to get a public URL (e.g., `https://web-production-1234.up.railway.app`).

3.  **Environment Variables**:
    -   Add any secrets (API keys, etc.) in the "Variables" tab.

---

## 3. Frontend Deployment (Vercel)

### Prerequisites
-   A [Vercel](https://vercel.com/) account.

### Steps
1.  **Import Project**:
    -   Dashboard -> "Add New..." -> "Project".
    -   Import from GitHub.

2.  **Build Settings**:
    -   **Framework Preset**: Select **Vite**.
    -   **Root Directory**: `/` (Default).
    -   **Build Command**: `npm run build` (Default).
    -   **Output Directory**: `dist` (Default).

3.  **Environment Variables**:
    -   Go to "Environment Variables".
    -   Add `VITE_API_URL`: Set this to your Railway Backend URL (e.g., `https://web-production-1234.up.railway.app`).
    -   *Note*: In your code, ensure you use `import.meta.env.VITE_API_URL` to make API calls.

4.  **Deploy**:
    -   Click "Deploy". Vercel will build and assign a domain (e.g., `scriba-app.vercel.app`).

---

## 4. Post-Deployment Configuration

### CORS
Update your Flask backend (`backend/app.py`) to allow requests from your Vercel domain.

```python
# backend/app.py
from flask_cors import CORS

# Allow local dev and production vercel domain
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://scriba-app.vercel.app"]}})
```

### Social Auth Redirects
If using Google/Apple/Facebook login:
1.  Go to the developer console for each provider.
2.  Add your Vercel domain to the "Authorized Redirect URIs".

---

## 5. Future Migration: Moving to Azure

Because we adhered to standard architecture (Docker-ready Flask + Standard Vue Build), migrating to Azure later is straightforward. You are **not locked in**.

### Migration Path

1.  **Frontend (Vercel -> Azure Static Web Apps)**:
    -   Create an Azure Static Web App.
    -   Connect GitHub.
    -   Use the same build preset: `Vue` / `npm run build` / `dist`.
    -   Azure will auto-detect the configuration just like Vercel did.

2.  **Backend (Railway -> Azure App Service)**:
    -   Create an Azure App Service (Python).
    -   Deploy code via GitHub Actions or VS Code.
    -   The `requirements.txt` and `app.py` we created work natively on Azure's Python runtime.

3.  **Database (TiDB Cloud -> Azure Database for MySQL)**:
    -   Since TiDB is MySQL compatible, you can use `mysqldump` to export data.
    -   Import into Azure Database for MySQL.
    -   Update the `DATABASE_URL` / connection string in App Service.

**Summary**: Your code requires **zero changes** to migrate. Only the hosting configuration changes.
