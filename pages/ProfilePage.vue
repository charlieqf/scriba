<template>
  <div class="profile-page">
    <header class="page-header">
      <h1>Profile</h1>
    </header>
    <main class="page-content">
      <div class="profile-card">
        <div class="avatar">
          <User :size="40" />
        </div>
        <div class="user-info">
          <h2>Sarah Thompson</h2>
          <p>Physical Therapist (PT)</p>
        </div>
      </div>

      <div class="menu-section">
        <button class="menu-item">
          <Settings :size="20" />
          <span>Account Settings</span>
          <ChevronRight :size="20" />
        </button>
        <button class="menu-item">
          <HelpCircle :size="20" />
          <span>Help & Support</span>
          <ChevronRight :size="20" />
        </button>
        <button class="menu-item" @click="handleContactAdmin">
          <Mail :size="20" />
          <span>Contact Administrator</span>
          <ChevronRight :size="20" />
        </button>
        <button class="menu-item logout" @click="handleLogout">
          <LogOut :size="20" />
          <span>Log Out</span>
          <ChevronRight :size="20" />
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { User, Settings, HelpCircle, Mail, LogOut, ChevronRight } from 'lucide-vue-next';

const emit = defineEmits(['logout']);

function handleContactAdmin() {
  alert('Contact Administrator feature - for role change requests and support.');
}

function handleLogout() {
  // Logic is handled by parent App.vue via event
  emit('logout');
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding-bottom: 100px;
}

.page-header {
  padding: 16px 20px;
  background: #ffffff;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.page-content {
  padding: 20px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  margin-bottom: 24px;
}

.avatar {
  width: 64px;
  height: 64px;
  background: #14B8A6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.user-info h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 4px 0;
}

.user-info p {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.menu-section {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: none;
  border: none;
  border-bottom: 1px solid #F1F5F9;
  cursor: pointer;
  text-align: left;
  color: #1E293B;
  font-size: 15px;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item span {
  flex: 1;
}

.menu-item:hover {
  background: #F8FAFC;
}

.menu-item.logout {
  color: #EF4444;
}
</style>
