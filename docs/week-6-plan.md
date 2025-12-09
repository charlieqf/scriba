# Week 6 Development Plan: Polish, Testing & App Store Submission

**Goal**: Final Quality Assurance, NFR verification, and **successful submission to Apple App Store (TestFlight) and Google Play Store**.

## Key Objectives
- [ ] Verify Non-Functional Requirements (NFRs).
- [ ] UI/UX Polish (Visual Guidelines).
- [ ] Bug Fixes.
- [ ] **Complete Apple App Store / TestFlight Submission.**
- [ ] **Complete Google Play Store Submission.**

---

## Detailed Tasks

### 1. NFR Verification
- **Performance**: Test App Launch time (< 1.5s). Optimize bundle size if needed.
- **Latency**: Stress test AI processing with 1-hour audio files.
- **Reliability**: Test "Airplane Mode" interruption during upload.

### 2. UI/UX Refinement
- **Visuals**: Align complete App with "Teal/Indigo" color palette.
- **Feedback**: Ensure every button has a loading state. Add Toast messages for success/error.
- **Onboarding**: Polish the "Connect Badge" walkthrough for new users.

### 3. Edge Case Handling
- **Low Battery**: Trigger low battery alerts on actual hardware.
- **Kill App**: Kill App during recording -> Restart -> Verify state recovery.

---

## 4. Apple App Store / TestFlight Submission

### 4.1 Prerequisites (Before Week 6)
- [ ] **Apple Developer Account** ($99/year): Ensure membership is active.
- [ ] **App ID**: Register Bundle ID in Apple Developer Portal (e.g., `com.scriba.app`).
- [ ] **Signing Certificates**: Create Distribution Certificate + Provisioning Profile.
- [ ] **Xcode Configuration**: Ensure `Signing & Capabilities` is correctly configured (Team, Bundle ID).

### 4.2 App Store Connect Setup
- [ ] Create App Record in App Store Connect.
- [ ] Fill in:
    - **App Name**: Scriba (or localized name)
    - **Subtitle**: AI Clinical Notes
    - **Category**: Medical / Productivity
    - **Privacy Policy URL** (Required): Host at `https://scriba.io/privacy`
    - **Support URL**: `https://scriba.io/support`
    - **Age Rating**: Complete questionnaire (likely 4+ or 12+)
    - **App Review Information**: Contact details for Apple Review team.

### 4.3 App Store Assets
- [ ] **App Icon**: 1024x1024 PNG (no alpha).
- [ ] **Screenshots** (Required):
    - iPhone 6.7" (1290x2796) - e.g., iPhone 15 Pro Max
    - iPhone 6.5" (1284x2778) - e.g., iPhone 14 Plus
    - iPad Pro 12.9" (2048x2732) - if supporting iPad
- [ ] **App Preview Video** (Optional but recommended): 15-30 seconds.

### 4.4 Build & Upload
- [ ] Archive build in Xcode (`Product > Archive`).
- [ ] Upload to App Store Connect via Xcode or Transporter.
- [ ] Select build in TestFlight section.

### 4.5 TestFlight Distribution
- [ ] Add **Internal Testers** (up to 100, instant access).
- [ ] Add **External Testers** (requires Beta App Review, 1-2 days).
- [ ] Provide **Test Notes** explaining what to test.

### 4.6 App Store Review Compliance Checklist
> [!WARNING]
> Apple rejects apps for these common reasons. Verify before submitting!

- [ ] **4.2 Minimum Functionality**: App must have real utility, not be a "thin client".
- [ ] **5.1.1 Data Collection**: Declare data usage in App Privacy section (Audio, Health if applicable).
- [ ] **5.1.2 Data Use and Sharing**: Privacy Policy must match App Store declaration.
- [ ] **2.1 App Completeness**: No placeholder content, all links work, no debug UIs.
- [ ] **Bluetooth Usage**: `NSBluetoothAlwaysUsageDescription` must include clear user-facing string.
- [ ] **Microphone Usage**: `NSMicrophoneUsageDescription` must include clear user-facing string.
- [ ] **Background Modes**: If using `audio` or `bluetooth-central`, justify in review notes.

---

## 5. Google Play Store Submission

### 5.1 Prerequisites
- [ ] **Google Play Developer Account** ($25 one-time): Ensure account is active.
- [ ] **Package Name**: `com.scriba.app` (must match `applicationId` in `build.gradle`).
- [ ] **Signing Key**: Create and secure `upload-keystore.jks`. Store password safely.

### 5.2 Google Play Console Setup
- [ ] Create App in Google Play Console.
- [ ] Fill in:
    - **App Name**
    - **Short Description** (80 chars)
    - **Full Description** (4000 chars)
    - **Category**: Medical / Productivity
    - **Privacy Policy URL** (Required)
    - **Contact Email**

### 5.3 Google Play Assets
- [ ] **App Icon**: 512x512 PNG.
- [ ] **Feature Graphic**: 1024x500 PNG (displayed on Store listing).
- [ ] **Screenshots** (Required):
    - Phone: Min 2, max 8.
    - Tablet: Optional but recommended.

### 5.4 Build & Upload
- [ ] Generate signed AAB (`./gradlew bundleRelease`).
- [ ] Upload AAB to Google Play Console (Release > Production or Internal Testing).

### 5.5 Testing Tracks
- [ ] **Internal Testing**: Up to 100 testers, instant access (recommended first).
- [ ] **Closed Testing**: Invite via email or Google Groups.
- [ ] **Open Testing**: Public opt-in link.
- [ ] **Production**: Full public release (requires review, 1-3 days).

### 5.6 Google Play Review Compliance Checklist
> [!WARNING]
> Google rejects apps for these. Verify before submitting!

- [ ] **Permissions**: Sensitive permissions (Microphone, Bluetooth, Location) must be justified.
- [ ] **Data Safety Form**: Complete in Play Console (What data is collected, how it's used).
- [ ] **Target API Level**: Must target recent Android API (currently API 34 for new apps).
- [ ] **64-bit Requirement**: Ensure native libraries (if any) are 64-bit.
- [ ] **No Debug Builds**: Ensure `android:debuggable="false"`.

---

## 6. Final Release Engineering

- [ ] **Versioning**: Bump to `1.0.0` (iOS: CFBundleShortVersionString; Android: versionName).
- [ ] **Build Numbers**: Increment build number for each upload.
- [ ] **Remove Dev Artifacts**: No console.log, no debug toasts, no test accounts.
- [ ] **Docs**: Finalize "Help / FAQ" screen in App.

---

## Definition of Done (DoD)
- Zero Critical/Major bugs from QA testing.
- App looks professional and matches Visual Guidelines.
- All MVP User Flows work smoothly on real devices.
- **iOS Build uploaded to TestFlight and available to testers.**
- **Android Build uploaded to Google Play Internal Testing track.**
- Ready for Production release (pending final stakeholder approval).
