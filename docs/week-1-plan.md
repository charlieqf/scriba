# Week 1 Development Plan: Bluetooth & Hardware Integration

**Goal**: Implement robust Bluetooth Low Energy (BLE) connectivity with the Scriba Badge hardware.

## Key Objectives
- [ ] Initialize BLE environment on mobile (iOS/Android via Capacitor/Cordova or Web Bluetooth if applicable, assumig Hybrid/Native wrapper).
- [ ] Implement Device Scanning & RSSI Display.
- [ ] Implement Connection/Disconnection logic.
- [ ] Implement "Main Badge" priority logic.
- [ ] Read Badge Status (Battery, Firmware, Button States).

## Detailed Tasks

### 1. Project Setup & BLE Library Integration
- **Objective**: Ensure the app can access device Bluetooth hardware.
- **Tasks**:
    - Install necessary BLE plugins (e.g., `capacitor-community/bluetooth-le` or similar).
    - Configure platform permissions (iOS `Info.plist`: `NSBluetoothAlwaysUsageDescription`; Android `AndroidManifest.xml`).
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

## Definition of Done (DoD)
- App can scan and identify Scriba Badges.
- App can connect to a Badge and stay connected.
- App displays real-time Battery level.
- Tapping "Record" on Badge triggers a log event in the App console (Preparation for Week 2).
