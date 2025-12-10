<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Duplicate Patient Found</h2>
        </div>

        <p class="description">
          A patient named <strong>{{ firstName }} {{ lastName }}</strong> already exists.
        </p>
        <p class="description sub">
          Would you like to create a new profile or add this session to the existing patient?
        </p>

        <div class="actions">
          <button class="action-btn existing" @click="$emit('addToExisting')">
            <UserCheck :size="20" />
            <div class="btn-text">
              <span class="title">Add to Existing</span>
              <span class="subtitle">Append session to {{ firstName }}</span>
            </div>
          </button>
          
          <button class="action-btn new" @click="$emit('createNew')">
            <UserPlus :size="20" />
            <div class="btn-text">
              <span class="title">Create New Patient</span>
              <span class="subtitle">Create a separate profile</span>
            </div>
          </button>
        </div>

         <button class="cancel-link" @click="$emit('cancel')">Cancel</button>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { UserCheck, UserPlus } from 'lucide-vue-next';

defineProps<{
  visible: boolean;
  firstName: string;
  lastName: string;
}>();

defineEmits<{
  (e: 'addToExisting'): void;
  (e: 'createNew'): void;
  (e: 'cancel'): void;
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
  z-index: 210; /* Above session modal */
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 340px;
  padding: 24px;
  text-align: center;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 16px 0;
}

.description {
  font-size: 15px;
  color: #1E293B;
  margin: 0 0 8px 0;
}

.description.sub {
  font-size: 13px;
  color: #64748B;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  background: #F8FAFC;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #14B8A6;
  background: rgba(20, 184, 166, 0.05);
}

.action-btn.existing {
  color: #0F766E;
}

.action-btn.new {
  color: #1E293B;
}

.btn-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-text .title {
  font-size: 14px;
  font-weight: 600;
}

.btn-text .subtitle {
  font-size: 12px;
  color: #64748B;
  font-weight: 400;
}

.cancel-link {
  background: none;
  border: none;
  color: #94A3B8;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}
</style>
