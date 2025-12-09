<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add New Device</h2>
          <button class="close-btn" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <p class="section-label">AVAILABLE DEVICES</p>
          
          <div v-if="isScanning" class="scanning-state">
            <div class="spinner"></div>
            <span>Scanning for devices...</span>
          </div>

          <div v-else-if="devices.length === 0" class="empty-state">
            <p>No devices found</p>
          </div>

          <div v-else class="device-list">
            <div 
              v-for="device in devices" 
              :key="device.id"
              :class="['device-item', { 'is-scriba': device.name.includes('Scriba') }]"
            >
              <div class="device-info">
                <Bluetooth :size="20" class="bt-icon" />
                <div class="device-text">
                  <span class="device-name">{{ device.name }}</span>
                  <span class="device-signal">Signal: {{ device.rssi }} dBm</span>
                </div>
              </div>
              <button 
                class="pair-btn"
                @click="$emit('pair', device.id)"
                :disabled="connecting"
              >
                {{ connecting ? '...' : 'Pair' }}
              </button>
            </div>
          </div>

          <button class="scan-again-btn" @click="$emit('scan')" :disabled="isScanning">
            Scan Again
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Bluetooth } from 'lucide-vue-next';
import type { BluetoothDevice } from '../services/bluetoothService';

defineProps<{
  visible: boolean;
  devices: BluetoothDevice[];
  isScanning: boolean;
  connecting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'pair', deviceId: string): void;
  (e: 'scan'): void;
}>();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #64748B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #F1F5F9;
}

.modal-body {
  padding: 0 20px 20px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

.scanning-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: #64748B;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #E2E8F0;
  border-top-color: #14B8A6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.device-item.is-scriba {
  border-color: #14B8A6;
  background: rgba(20, 184, 166, 0.05);
}

.device-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bt-icon {
  color: #14B8A6;
}

.device-text {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.device-signal {
  font-size: 12px;
  color: #94A3B8;
}

.pair-btn {
  padding: 8px 16px;
  border: 1px solid #14B8A6;
  background: transparent;
  color: #14B8A6;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pair-btn:hover:not(:disabled) {
  background: #14B8A6;
  color: #ffffff;
}

.pair-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.scan-again-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: none;
  border: none;
  color: #64748B;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.scan-again-btn:hover:not(:disabled) {
  color: #1E293B;
}

.scan-again-btn:disabled {
  opacity: 0.5;
}
</style>
