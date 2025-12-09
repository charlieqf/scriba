<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Device Settings</h2>
          <button class="close-btn" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <!-- Storage Section -->
          <div class="storage-section">
            <div class="storage-header">
              <HardDrive :size="18" />
              <span>Storage</span>
              <span class="storage-value">{{ settings.storageUsed }}GB / {{ settings.storageTotal }}GB</span>
            </div>
            <div class="storage-bar">
              <div 
                class="storage-system" 
                :style="{ width: `${(settings.systemStorage / settings.storageTotal) * 100}%` }"
              ></div>
              <div 
                class="storage-recordings" 
                :style="{ width: `${(settings.recordingsStorage / settings.storageTotal) * 100}%` }"
              ></div>
            </div>
            <div class="storage-labels">
              <span>System: {{ settings.systemStorage }}GB</span>
              <span>Recordings: {{ settings.recordingsStorage }}GB</span>
            </div>
          </div>

          <!-- Auto-stop Settings -->
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-icon driving">
                  <Car :size="18" />
                </div>
                <div class="setting-text">
                  <span class="setting-name">Auto-stop (Driving)</span>
                  <span class="setting-desc">Stop recording when moving fast</span>
                </div>
              </div>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  :checked="settings.autoStopDriving"
                  @change="$emit('update', 'autoStopDriving', ($event.target as HTMLInputElement).checked)"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-icon geofence">
                  <MapPin :size="18" />
                </div>
                <div class="setting-text">
                  <span class="setting-name">Auto-stop (Geofence)</span>
                  <span class="setting-desc">Stop if >500m from patient</span>
                </div>
              </div>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  :checked="settings.autoStopGeofence"
                  @change="$emit('update', 'autoStopGeofence', ($event.target as HTMLInputElement).checked)"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Upload Queue -->
          <div class="upload-section">
            <div class="upload-header">
              <span class="section-label">UPLOAD QUEUE</span>
              <span v-if="hasSyncing" class="syncing-badge">Syncing...</span>
            </div>
            
            <div class="upload-list">
              <div 
                v-for="item in uploadQueue" 
                :key="item.id"
                class="upload-item"
              >
                <div class="upload-icon" :class="item.status">
                  <Upload v-if="item.status === 'uploading'" :size="16" />
                  <CheckCircle v-else :size="16" />
                </div>
                <div class="upload-info">
                  <span class="upload-name">{{ item.filename }}</span>
                  <span class="upload-status" :class="item.status">
                    {{ getStatusText(item) }}
                  </span>
                </div>
                <span v-if="item.status === 'uploading'" class="upload-progress">
                  {{ item.progress }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { X, HardDrive, Car, MapPin, Upload, CheckCircle } from 'lucide-vue-next';
import type { DeviceSettings, UploadQueueItem } from '../services/bluetoothService';

const props = defineProps<{
  visible: boolean;
  settings: DeviceSettings;
  uploadQueue: UploadQueueItem[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'update', key: keyof DeviceSettings, value: boolean): void;
}>();

const hasSyncing = computed(() => 
  props.uploadQueue.some(item => item.status === 'uploading')
);

function getStatusText(item: UploadQueueItem): string {
  if (item.status === 'uploading') {
    return `Uploading ${item.progress}% • ${item.size}`;
  }
  return `Synced • ${item.size}`;
}
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
  max-width: 400px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
  position: sticky;
  top: 0;
  background: #ffffff;
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
}

.close-btn:hover {
  background: #F1F5F9;
}

.modal-body {
  padding: 0 20px 20px;
}

/* Storage Section */
.storage-section {
  margin-bottom: 24px;
}

.storage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #1E293B;
  font-weight: 500;
}

.storage-value {
  margin-left: auto;
  font-size: 14px;
  color: #64748B;
}

.storage-bar {
  height: 8px;
  background: #E2E8F0;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
}

.storage-system {
  background: #14B8A6;
}

.storage-recordings {
  background: #F59E0B;
}

.storage-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #94A3B8;
}

/* Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #F8FAFC;
  border-radius: 12px;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-icon.driving {
  background: #DBEAFE;
  color: #3B82F6;
}

.setting-icon.geofence {
  background: #FEE2E2;
  color: #EF4444;
}

.setting-text {
  display: flex;
  flex-direction: column;
}

.setting-name {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
}

.setting-desc {
  font-size: 12px;
  color: #94A3B8;
}

/* Toggle Switch */
.toggle {
  position: relative;
  width: 48px;
  height: 28px;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: #CBD5E1;
  border-radius: 14px;
  transition: 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: #ffffff;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toggle input:checked + .toggle-slider {
  background: #14B8A6;
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

/* Upload Queue */
.upload-section {
  border-top: 1px solid #E2E8F0;
  padding-top: 20px;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.5px;
}

.syncing-badge {
  font-size: 12px;
  color: #14B8A6;
  font-weight: 500;
}

.upload-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon.uploading {
  background: #FEF3C7;
  color: #F59E0B;
}

.upload-icon.synced {
  background: #D1FAE5;
  color: #10B981;
}

.upload-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upload-name {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
}

.upload-status {
  font-size: 12px;
}

.upload-status.uploading {
  color: #F59E0B;
}

.upload-status.synced {
  color: #10B981;
}

.upload-progress {
  font-size: 14px;
  color: #64748B;
}
</style>
