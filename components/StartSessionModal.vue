<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content animate-pop-in">
        <!-- Icon -->
        <div class="icon-wrapper">
          <Mic :size="32" />
        </div>

        <h2>Start New Session?</h2>
        <p>This will immediately start recording audio from your {{ sourceText }}.</p>

        <div class="actions">
          <button class="confirm-btn" @click="$emit('confirm')">
            Start Recording
          </button>
          <button class="cancel-btn" @click="$emit('cancel')">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Mic } from 'lucide-vue-next';

const props = defineProps<{
  visible: boolean;
  isMobileMode: boolean;
}>();

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const sourceText = computed(() => props.isMobileMode ? 'mobile device' : 'Scriba badge');
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 320px;
  padding: 32px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background: #D1FAE5; /* Teal-100 */
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #0D9488; /* Teal-700 */
  margin-bottom: 20px;
}

h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 12px 0;
}

p {
  font-size: 15px;
  color: #64748B;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.confirm-btn {
  width: 100%;
  background: #0D9488;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.confirm-btn:hover {
  opacity: 0.9;
}

.cancel-btn {
  background: none;
  border: none;
  color: #64748B;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
}

.cancel-btn:hover {
  color: #1E293B;
}

/* Simple Pop-in Animation */
.animate-pop-in {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
