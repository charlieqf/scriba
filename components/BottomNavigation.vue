<template>
  <nav class="bottom-nav">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="['nav-item', { active: activeTab === tab.id }]"
      @click="$emit('change', tab.id)"
    >
      <component :is="tab.icon" :size="24" :stroke-width="1.5" />
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { Smartphone, Users, User } from 'lucide-vue-next';
import { markRaw } from 'vue';

defineProps<{
  activeTab: string;
}>();

defineEmits<{
  (e: 'change', tab: string): void;
}>();

const tabs = [
  { id: 'device', label: 'Device', icon: markRaw(Smartphone) },
  { id: 'patients', label: 'Patients', icon: markRaw(Users) },
  { id: 'profile', label: 'Profile', icon: markRaw(User) },
];
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #ffffff;
  border-top: 1px solid #E2E8F0;
  padding: 8px 0 24px 0; /* Extra padding for safe area */
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94A3B8;
  transition: color 0.2s ease;
}

.nav-item span {
  font-size: 12px;
  font-weight: 500;
}

.nav-item.active {
  color: #14B8A6;
}

.nav-item:hover {
  color: #14B8A6;
}
</style>
