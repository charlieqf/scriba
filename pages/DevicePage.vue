<template>
  <div class="device-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <div class="logo-icon-img">
          <img :src="deviceIconImg" alt="Device Icon" />
        </div>
        <h1>Device</h1>
      </div>
      <div class="header-right">
        <span :class="['status-badge', activeConnectionStatus.toLowerCase().replace(' ', '-')]">
          {{ activeConnectionStatus }}
        </span>
        <button class="settings-btn" @click="showSettingsModal = true">
          <Settings :size="22" />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="page-content">
      <!-- Greeting -->
      <div class="greeting">
        <h2>Hello, {{ userName }}</h2>
        <p>{{ greetingMessage }}</p>
      </div>

      <!-- Action Button -->
      <div class="action-area">
        <!-- Disconnected State -->
        <button 
          v-if="!isConnected && !isMobileMode" 
          class="connect-button"
          @click="handleConnectClick"
        >
          <div class="button-inner">
            <Bluetooth :size="40" />
          </div>
          <span class="button-title">Connect Badge</span>
          <span class="button-subtitle">TAP TO PAIR</span>
        </button>

        <!-- Connected State -->
        <button 
          v-else 
          class="session-button"
          @click="handleStartSession"
        >
          <div class="button-inner">
            <Mic :size="36" />
          </div>
          <span class="button-title">Start Session</span>
          <span class="button-subtitle">TAP TO RECORD</span>
        </button>
      </div>

      <!-- Connected Device Info -->
      <div v-if="isConnected && connectedDevice" class="connected-device-bar">
        <Bluetooth :size="16" class="bt-icon" />
        <span class="device-name">{{ connectedDevice.name.toUpperCase() }}</span>
        <div class="battery-info">
          <Signal :size="16" />
          <span>{{ connectedDevice.batteryLevel }}%</span>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <AddDeviceModal
      :visible="showAddDeviceModal"
      :devices="availableDevices"
      :is-scanning="isScanning"
      :connecting="isConnecting"
      @close="showAddDeviceModal = false"
      @pair="handlePairDevice"
      @scan="handleScan"
    />

    <DeviceSettingsModal
      :visible="showSettingsModal"
      :settings="deviceSettings"
      :upload-queue="uploadQueue"
      @close="showSettingsModal = false"
      @update="handleSettingsUpdate"
    />

    <MobileRecordingModal
      :visible="showMobileRecordingModal"
      @close="handleCloseMobileModal"
      @switch="handleSwitchToMobile"
      @retry="handleRetryConnection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Mic, Settings, Bluetooth, Signal } from 'lucide-vue-next';
import deviceIconImg from '../assets/device_icon.png';
import { useBluetoothService, type DeviceSettings } from '../services/bluetoothService';
import AddDeviceModal from '../components/AddDeviceModal.vue';
import DeviceSettingsModal from '../components/DeviceSettingsModal.vue';
import MobileRecordingModal from '../components/MobileRecordingModal.vue';
import { useRecordingService } from '../services/recordingService';

// Bluetooth service
const {
  isScanning,
  isConnected,
  connectedDevice,
  availableDevices,
  connectionStatus,
  deviceSettings,
  uploadQueue,
  startScan,
  connectToDevice,
  updateSettings,
} = useBluetoothService();

const { startRecording } = useRecordingService();

// Local state
const props = defineProps<{ user?: any }>();

// Computed
const userName = computed(() => {
  if (props.user?.name) {
    return props.user.name.split(' ')[0]; // First name
  }
  return 'User';
});
const showAddDeviceModal = ref(false);
const showSettingsModal = ref(false);
const showMobileRecordingModal = ref(false);
const isConnecting = ref(false);
const failedAttempts = ref(0);

// Computed
const greetingMessage = computed(() => {
  if (isConnected.value || isMobileMode.value) {
    return 'Tap below to start a new session recording.';
  }
  return 'Please connect your Scriba badge to begin.';
});

const isMobileMode = ref(false);
const activeConnectionStatus = computed(() => {
    if (isMobileMode.value) return 'MOBILE MIC';
    return connectionStatus.value;
});

// Handlers
async function handleConnectClick() {
  showAddDeviceModal.value = true;
  await handleScan();
}

async function handleScan() {
  await startScan();
}

async function handlePairDevice(deviceId: string) {
  isConnecting.value = true;
  const success = await connectToDevice(deviceId);
  isConnecting.value = false;
  
  if (success) {
    showAddDeviceModal.value = false;
    failedAttempts.value = 0;
    isMobileMode.value = false;
  } else {
    failedAttempts.value++;
    console.log(`Connection failed. Attempt ${failedAttempts.value}/3`);
    
    if (failedAttempts.value >= 3) {
      showAddDeviceModal.value = false; // Close scanning modal
      showMobileRecordingModal.value = true;
    }
  }
}

function handleCloseMobileModal() {
    showMobileRecordingModal.value = false;
    failedAttempts.value = 0; 
}

function handleSwitchToMobile() {
    showMobileRecordingModal.value = false;
    isMobileMode.value = true;
    failedAttempts.value = 0;
}

function handleRetryConnection() {
    showMobileRecordingModal.value = false;
    showAddDeviceModal.value = true;
    failedAttempts.value = 0;
    handleScan();
}

function handleStartSession() {
  console.log('Starting session...');
  startRecording(isMobileMode.value ? 'mobile' : 'badge');
}

function handleSettingsUpdate(key: keyof DeviceSettings, value: boolean) {
  updateSettings(key, value);
}
</script>

<style scoped>
.device-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 100px; /* Space for bottom nav */
  display: flex;
  flex-direction: column;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon-img {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
}

.logo-icon-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  letter-spacing: 0.5px;
}

.status-badge.offline {
  background: #F1F5F9;
  color: #64748B;
}

.status-badge.ready,
.status-badge.mobile-mic {
  background: #D1FAE5;
  color: #059669;
}

.settings-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #64748B;
  display: flex;
}

.settings-btn:hover {
  color: #1E293B;
}

/* Main Content */
.page-content {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.greeting {
  text-align: center;
  margin-bottom: 60px;
}

.greeting h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 8px 0;
}

.greeting p {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

/* Action Buttons */
.action-area {
  display: flex;
  justify-content: center;
}

.connect-button,
.session-button {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.connect-button {
  background: #ffffff;
  /* Larger, more visible halo, moved further down */
  box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.1), 0 0 80px 30px rgba(20, 184, 166, 0.15);
  margin-top: 80px; /* Push down further */
}

.connect-button .button-inner {
  width: 80px;
  height: 80px;
  background: rgba(20, 184, 166, 0.05); /* Softer background */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14B8A6;
  margin-bottom: 8px;
}

.connect-button .button-title {
  font-size: 18px;
  font-weight: 600;
  color: #14B8A6;
}

.connect-button .button-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: #14B8A6;
  letter-spacing: 1px;
}

/* Animation Keyframes */
@keyframes breathe-glow {
  0% {
    box-shadow: 0 0 40px 10px rgba(20, 184, 166, 0.4);
  }
  50% {
    box-shadow: 0 0 60px 20px rgba(20, 184, 166, 0.6);
  }
  100% {
    box-shadow: 0 0 40px 10px rgba(20, 184, 166, 0.4);
  }
}

@keyframes breathe-glow-deep {
  0% {
    box-shadow: 0 0 40px 10px rgba(20, 184, 166, 0.7);
  }
  50% {
    box-shadow: 0 0 70px 25px rgba(20, 184, 166, 0.9);
  }
  100% {
    box-shadow: 0 0 40px 10px rgba(20, 184, 166, 0.7);
  }
}

.session-button {
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  margin-top: 80px; /* Push down to match connect button */
  animation: breathe-glow 3s infinite ease-in-out; /* Breathing effect */
}

.session-button:hover {
  animation: breathe-glow-deep 3s infinite ease-in-out;
}

.session-button .button-inner {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-bottom: 8px;
}

.session-button .button-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.session-button .button-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1px;
}

.connect-button:hover {
  transform: scale(1.02);
  box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.3), 0 0 80px 30px rgba(20, 184, 166, 0.4);
}

.session-button:active,
.connect-button:active {
  transform: scale(0.98);
}

/* Connected Device Bar */
.connected-device-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  padding: 12px 20px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.connected-device-bar .bt-icon {
  color: #14B8A6;
}

.device-name {
  font-size: 12px;
  font-weight: 600;
  color: #1E293B;
  letter-spacing: 0.5px;
}

.battery-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #14B8A6;
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid #E2E8F0;
}
</style>
