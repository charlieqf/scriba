<template>
  <div class="app">
    <!-- Page Content -->
    <DevicePage v-if="currentTab === 'device'" />
    <PatientsPage v-else-if="currentTab === 'patients'" />
    <ProfilePage v-else-if="currentTab === 'profile'" />

    <!-- Bottom Navigation -->
    <BottomNavigation 
      :active-tab="currentTab" 
      @change="currentTab = $event" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DevicePage from './pages/DevicePage.vue';
import PatientsPage from './pages/PatientsPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import BottomNavigation from './components/BottomNavigation.vue';

const currentTab = ref('device');
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