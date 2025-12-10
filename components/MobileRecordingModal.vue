<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Connection Failed</h2>
          <button class="close-btn" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div class="icon-wrapper">
             <AlertCircle :size="48" class="alert-icon" />
          </div>
          <p class="description">
            We are unable to connect to your badge after multiple attempts.
          </p>
          <p class="description sub">
            Would you like to switch to <strong>Mobile Recording Mode</strong>?
          </p>

          <div class="footer-actions">
            <button class="btn-primary" @click="$emit('switch')">
              Switch to Mobile Recording
            </button>
            <button class="btn-secondary" @click="$emit('retry')">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, AlertCircle } from 'lucide-vue-next';

defineProps<{
  visible: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'switch'): void;
  (e: 'retry'): void;
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
  z-index: 210; /* Higher than device modal */
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 320px;
  padding: 24px;
  text-align: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  display: flex;
}

.icon-wrapper {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.alert-icon {
  color: #EF4444; /* Red warning color */
}

.description {
  font-size: 14px;
  color: #1E293B;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.description.sub {
  color: #64748B;
  margin-bottom: 24px;
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #14B8A6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0D9488;
}

.btn-secondary {
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #64748B;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #CBD5E1;
  color: #1E293B;
}
</style>
