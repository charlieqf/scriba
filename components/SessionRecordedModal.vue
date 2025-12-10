<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Session Recorded</h2>
          <button class="close-btn" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <p class="subtitle">Create a new patient profile to save this recording.</p>

        <div class="form-body">
          <div class="input-group">
            <label>FIRST NAME</label>
            <input 
              v-model="firstName" 
              type="text" 
              placeholder="e.g. John" 
              class="text-input"
            />
          </div>

          <div class="input-group">
            <label>LAST NAME</label>
            <input 
              v-model="lastName" 
              type="text" 
              placeholder="e.g. Doe" 
              class="text-input"
            />
          </div>

          <button class="save-btn" @click="handleSave" :disabled="!isValid">
            <FileText :size="18" />
            <span>Save & Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, FileText } from 'lucide-vue-next';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', details: { firstName: string; lastName: string }): void;
}>();

const firstName = ref('');
const lastName = ref('');

const isValid = computed(() => firstName.value.trim() && lastName.value.trim());

function handleClose() {
  if (confirm('Are you sure you want to discard this recording?')) {
    emit('close');
    resetForm();
  }
}

function handleSave() {
  if (isValid.value) {
    emit('save', {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim()
    });
    // Form reset happens if modal is reused or re-mounted
  }
}

function resetForm() {
  firstName.value = '';
  lastName.value = '';
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
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.close-btn {
  background: #F1F5F9;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748B;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #E2E8F0;
}

.subtitle {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 24px;
  line-height: 1.4;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 11px;
  font-weight: 700;
  color: #94A3B8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.text-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 16px;
  color: #1E293B;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #14B8A6;
}

.save-btn {
  margin-top: 8px;
  width: 100%;
  padding: 14px;
  background: #0D9488; /* Teal-700 approx based on design */
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style>
