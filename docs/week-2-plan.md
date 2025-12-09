# Week 2 Development Plan: Audio Recording & Management

**Goal**: Implement reliable audio capture, storage, and local management, including the fallback logic.

## Key Objectives
- [ ] Implement Audio Recording (Start/Stop/Pause).
- [ ] Implement Audio Routing (Badge Mic vs Phone Mic).
- [ ] Implement Local File Management.
- [ ] Implement Playback with Speed Control.

## Detailed Tasks

### 1. Recording Engine
- **Objective**: Capture high-quality audio.
- **Tasks**:
    - Initialize Audio Session.
    - Implement `AudioService`.
    - Configure Audio Format: **OPUS** (preferred) or AAC for compatibility.
    - Handling Interruption (Phone call, backgrounding).

### 2. Source Switching & Fallback
- **Objective**: Seamlessly switch between Hardware and Software mics.
- **Tasks**:
    - **Primary**: Receive audio stream from Bluetooth Badge (if supported by protocol) OR trigger local recording based on Badge events. *Note: If Badge sends raw audio data via BLE/SPP, implement data assembly. If Badge acts as a broadcase mic, configure AudioSession to use Bluetooth A2DP/HFP.*
    - **Fallback**: If Badge disconnects, auto-switch to Phone Internal Mic.
    - **UI**: Show "Using Phone Mic" toast when fallback occurs.

### 3. Storage & Persistence
- **Objective**: Save recordings safely.
- **Tasks**:
    - Write audio data to local filesystem (Sandboxed).
    - Implement "Auto-save Draft" every 60 seconds (Timer loop).
    - Create metadata database (Room/SQLite) to track: Filename, Duration, Timestamp, Status (Synced/Unsynced).

### 4. Playback Features
- **Objective**: Review recordings.
- **Tasks**:
    - Implement Audio Player with Scrub bar.
    - Add **Speed Control** (0.5x, 1.0x, 1.5x, 2.0x).
    - Verify Playback matches recorded duration.

### 5. UI Implementation (Record & Review Pages)
- **Objective**: PRD Sections 2.3 & 2.4.
- **Tasks**:
    - "Quick Record" button on Homepage.
    - Recording State UI (Waveform visualization, Timer).
    - Review Page: Save, Delete, Rename (Auto-name system).

## Definition of Done (DoD)
- User can record audio using Badge or Phone.
- Audio is saved locally and survives App restart.
- User can play back audio at different speeds.
- Disconnecting Badge during recording automatically switches to Phone mic without data loss.
