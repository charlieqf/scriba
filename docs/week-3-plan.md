# Week 3 Development Plan: User System & Cloud Sync

**Goal**: Finalize user authentication and implement the data synchronization layer.

## Key Objectives
- [ ] Refine Authentication Flow (Role Selection, Permissions).
- [ ] Implement Cloud Storage for Audio.
- [ ] Implement Sync Queue/Manager.

## Detailed Tasks

### 1. Authentication Polish
- **Objective**: Match PRD v1.1 Requirements.
- **Tasks**:
    - Ensure Social Login (Google/Apple/FB) is robust (using backend verification).
    - Implement "Contact Admin" modal/link for Role Change requests.
    - Enforce permissions: Hide "Admin" features from App UI (if any exist).
    - User Profile Page: Show current Role and Organization (if applicable).

### 2. Backend Storage Setup
- **Objective**: Secure upload endpoint.
- **Tasks**:
    - Backend: Create `POST /api/upload` endpoint (Multipart/form-data).
    - Backend: Integrate AWS S3 / Google Cloud Storage for blob storage.
    - Backend: Security check (Bearer Token validation).

### 3. Sync Logic (The "Sync Manager")
- **Objective**: Robust file upload.
- **Tasks**:
    - Detect Network Status (WiFi vs Cellular vs Offline).
    - **Queue System**: Add local recordings to a "To Upload" queue.
    - **Retry Logic**: If upload fails, retry 3 times with exponential backoff.
    - **Background Upload**: Attempt to use Background Fetch APIs if possible (limitations apply on iOS).

### 4. Data Lifecycle
- **Objective**: Manage local storage space.
- **Tasks**:
    - Mark local files as "Synced" after successful upload.
    - Implement logic to "Clean up local files older than 30 days" (on App launch).

## Definition of Done (DoD)
- User can log in and see their profile.
- Recorded audio files are automatically uploaded to the cloud when online.
- Offline recordings sit in a queue and sync when network returns.
- Backend stores audio securely associated with the User ID.
