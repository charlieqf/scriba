# Week 1 Development Plan: Native Platform Setup & Bluetooth Integration

**Goal**: Initialize the native mobile project structure (iOS/Android) and implement robust Bluetooth Low Energy (BLE) connectivity with the Scriba Badge hardware.

## Key Objectives
- [ ] **Set up Native Mobile Project** (Capacitor/React Native/Flutter - TBD based on team stack).
- [ ] Initialize BLE environment on mobile (iOS/Android).
- [ ] Implement Device Scanning & RSSI Display.
- [ ] Implement Connection/Disconnection logic.
- [ ] Implement "Main Badge" priority logic.
- [ ] Read Badge Status (Battery, Firmware, Button States).

---

## Detailed Tasks

### 0. Native Project Initialization (Critical for App Store)

> [!IMPORTANT]
> This step is essential. Without proper native project setup, you cannot build for TestFlight or Google Play.

#### iOS Setup
- [ ] Install **Xcode** (latest stable, currently 15.x).
- [ ] If using **Capacitor**: Run `npx cap add ios` to generate Xcode project.
- [ ] Open `ios/App/App.xcworkspace` in Xcode.
- [ ] Configure **Team & Bundle Identifier** (`com.scriba.app`) in Signing & Capabilities.
- [ ] Add **required capabilities**: Bluetooth (Background Modes > Uses Bluetooth LE accessories).
- [ ] Configure `Info.plist` usage descriptions:
    - `NSBluetoothAlwaysUsageDescription`: "Scriba needs Bluetooth to connect to your Badge for audio recording."
    - `NSBluetoothPeripheralUsageDescription`: (if needed for older iOS)
    - `NSMicrophoneUsageDescription`: "Scriba needs microphone access to record clinical notes."

#### Android Setup
- [ ] Install **Android Studio** (latest stable).
- [ ] If using **Capacitor**: Run `npx cap add android` to generate Android project.
- [ ] Open `android/` folder in Android Studio.
- [ ] Configure `applicationId` in `app/build.gradle` (`com.scriba.app`).
- [ ] Set **minSdkVersion** (21+) and **targetSdkVersion** (34+).
- [ ] Add permissions to `AndroidManifest.xml`:
    - `<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />`
    - `<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />`
    - `<uses-permission android:name="android.permission.RECORD_AUDIO" />`
    - `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />` (required for BLE scan on Android 11 and below)
- [ ] Create a **signing keystore** for release builds:
    ```bash
    keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
    ```
    - Store securely! This is needed for Google Play upload.

---

### 1. BLE Library Integration
- **Objective**: Ensure the app can access device Bluetooth hardware.
- **Tasks**:
    - Install necessary BLE plugins (e.g., `@capacitor-community/bluetooth-le` or `react-native-ble-plx`).
    - Verify BLE initialization works on both iOS Simulator/Device and Android Emulator/Device.
    - Create a `BluetoothService` singleton to manage state.

### 2. Scanning & Discovery
- **Objective**: Find the Scriba Badge among nearby devices.
- **Tasks**:
    - Implement `startScan()` filtering for Scriba's Service UUID (if known) or name prefix.
    - Display list of found devices with RSSI (Signal Strength).
    - Implement list sorting by RSSI (Strongest signal first).

### 3. Connection Management
- **Objective**: Establish and maintain a stable link.
- **Tasks**:
    - Implement `connect(deviceId)` and `disconnect(deviceId)`.
    - Handle unexpected disconnections (Auto-reconnect logic implementation).
    - **Logic**: If multiple known devices exist, prioritize the "Last Connected" (Main Badge).

### 4. Hardware Interaction (Data IO)
- **Objective**: Read device attributes and listen for events.
- **Tasks**:
    - Read **Battery Level** characteristic.
    - Subscribe to **Button Press** notifications (Record/Power buttons).
    - Read **Firmware Version**.

### 5. UI Integration (Connectivity Page)
- **Objective**: User interface for managing devices.
- **Tasks**:
    - Build "Hardware Connection" view (Section 2.2 in PRD).
    - Status indicators: Connecting, Connected, Disconnected.
    - Low Battery Alert (<10%) logic hook.

---

## Definition of Done (DoD)
- **iOS project builds and runs on a real iPhone.**
- **Android project builds and runs on a real Android device.**
- App can scan and identify Scriba Badges.
- App can connect to a Badge and stay connected.
- App displays real-time Battery level.
- Tapping "Record" on Badge triggers a log event in the App console (Preparation for Week 2).
