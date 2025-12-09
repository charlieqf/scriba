<template>
  <div class="app">
    <!-- Unauthenticated State -->
    <LoginPage 
      v-if="!isAuthenticated" 
      @login-success="handleLoginSuccess" 
    />

    <!-- Authenticated State -->
    <template v-else>
      <!-- Page Content -->
      <DevicePage v-if="currentTab === 'device'" :user="currentUser" />
      <PatientsPage v-else-if="currentTab === 'patients'" />
      <ProfilePage v-else-if="currentTab === 'profile'" :user="currentUser" @logout="handleLogout" />

      <!-- Bottom Navigation -->
      <BottomNavigation 
        :active-tab="currentTab" 
        @change="currentTab = $event" 
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authService } from './services/authService';
import LoginPage from './pages/LoginPage.vue';
import DevicePage from './pages/DevicePage.vue';
import PatientsPage from './pages/PatientsPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import BottomNavigation from './components/BottomNavigation.vue';

const isAuthenticated = ref(false);
const currentUser = ref<any>(null);
const currentTab = ref('device');

// Check for existing session on mount
onMounted(() => {
  const user = authService.getCurrentUser();
  if (user) {
    currentUser.value = user;
    isAuthenticated.value = true;
  }
});

function handleLoginSuccess(user: any) {
  currentUser.value = user;
  isAuthenticated.value = true;
}

function handleLogout() {
  authService.logout();
  isAuthenticated.value = false;
  currentUser.value = null;
  currentTab.value = 'device'; // Reset tab
}
</script>

<style>
/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #F8FAFC;
  color: #1E293B;
}

button {
  font-family: inherit;
}

.app {
  min-height: 100vh;
}
</style>