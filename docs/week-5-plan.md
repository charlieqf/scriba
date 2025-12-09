# Week 5 Development Plan: Report Management & Export

**Goal**: Polish the report viewing experience and enable data export (PDF).

## Key Objectives
- [ ] Implement Report Editor.
- [ ] Implement PDF Generation.
- [ ] Report History / Dashboard.

## Detailed Tasks

### 1. Report Editor
- **Objective**: Allow professionals to correct AI errors.
- **Tasks**:
    - Rich Text Editor or Field-based Form (Subjective, Objective, Assessment, Plan).
    - "Revert to Original" feature (optional but good for MVP v1.1).
    - Save changes to Backend.

### 2. PDF Export
- **Objective**: Shareable format.
- **Tasks**:
    - Generate PDF on Backend (e.g., using `ReportLab` or `WeasyPrint` in Python) OR Frontend (e.g., `jspdf`). *Recommendation: Backend generation ensures consistent medical formatting.*
    - Include Hospital/Clinic Header (if configured) and User Signature line.
    - Download/Share intent on Mobile.

### 3. Dashboard / List View
- **Objective**: Manage past work.
- **Tasks**:
    - Filter by Date, Patient Name (extracted by AI), or Status.
    - Search functionality (Local or Remote).

### 4. Security & Compliance Check
- **Objective**: Privacy Act readiness.
- **Tasks**:
    - Ensure Temporary URLs for audio expire.
    - Ensure PDF does not cache permanently in public folders.
    - Verify encryption in transit (HTTPS) for all Export calls.

## Definition of Done (DoD)
- User can edit the AI-generated report sections.
- User can download a professionally formatted PDF of the report.
- Dashboard accurately shows all past history.
