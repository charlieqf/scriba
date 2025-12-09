# Week 4 Development Plan: AI Processing Pipeline

**Goal**: Integrate the core AI features: Speech-to-Text (STT) and structured report generation.

## Key Objectives
- [ ] Integrate OpenAI Whisper (Cloud).
- [ ] Implement Report Generation Logic (LLM).
- [ ] Build Backend Processing Queue.
- [ ] Handle AI Failures/Fallbacks.

## Detailed Tasks

### 1. Backend AI Services
- **Objective**: Process Audio -> Text -> Report.
- **Tasks**:
    - **STT**: Call OpenAI Whisper API with the uploaded audio file.
    - **Summary/Extraction**: Call LLM (GPT-4o or Clause 3.5 Sonnet) with the transcript.
    - **Prompt Engineering**: Design the "SOAP" template prompt for medical context.
    - **Latency Optimization**: Ensure processing starts immediately after upload.

### 2. Asynchronous Processing
- **Objective**: Don't block the User.
- **Tasks**:
    - App polls for status: `Pending` -> `Processing` -> `Completed`.
    - (Optionally) Implement WebSocket or Push Notification for "Report Ready".

### 3. Frontend Integration
- **Objective**: Trigger and View.
- **Tasks**:
    - "Generate Report" button on Recording Detail page.
    - "Processing..." animation/state.
    - Display raw Transcript and generated Report.

### 4. Error Handling (AI)
- **Objective**: Fallback to Manual.
- **Tasks**:
    - If STT fails or Quality is too low: Return "Transcription Failed" state.
    - Allow User to manually input/edit text if AI fails.
    - **NFR Check**: Measure processing time (Target: < 20% of audio length).

## Definition of Done (DoD)
- User can click "Generate" on a recording.
- Backend processes audio and creates a text report.
- App displays a structured SOAP report derived from the audio.
- Processing latency meets acceptable criteria (basic verification).
