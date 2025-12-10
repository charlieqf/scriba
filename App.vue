<template>
  <div class="app">
    <!-- Recording Overlay -->
    <RecordingPage 
      v-if="isAuthenticated && isRecordingActive" 
      @finish="handleRecordingFinish" 
    />

    <SessionRecordedModal
      :visible="showSessionModal"
      @close="showSessionModal = false"
      @save="handleSavePatientDetails"
    />

    <DuplicatePatientModal
      v-if="tempPatientDetails"
      :visible="showDuplicateModal"
      :first-name="tempPatientDetails.firstName"
      :last-name="tempPatientDetails.lastName"
      @add-to-existing="handleAddToExisting"
      @create-new="handleCreateNewPatient"
      @cancel="showDuplicateModal = false"
    />

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
        v-if="!isRecordingActive"
        :active-tab="currentTab" 
        @change="currentTab = $event" 
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { authService } from './services/authService';
import { useRecordingService } from './services/recordingService';
import { patientService, type Patient } from './services/patientService';
import LoginPage from './pages/LoginPage.vue';
import DevicePage from './pages/DevicePage.vue';
import RecordingPage from './pages/RecordingPage.vue';
import SessionRecordedModal from './components/SessionRecordedModal.vue';
import DuplicatePatientModal from './components/DuplicatePatientModal.vue';
import PatientsPage from './pages/PatientsPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import BottomNavigation from './components/BottomNavigation.vue';

const { status: recordingStatus } = useRecordingService();
const isAuthenticated = ref(false);
const currentUser = ref<any>(null);
const currentTab = ref('device');

// Session Completion State
const showSessionModal = ref(false);
const showDuplicateModal = ref(false);
const tempPatientDetails = ref<{firstName: string, lastName: string} | null>(null);
const foundDuplicatePatient = ref<Patient | null>(null);

const isRecordingActive = computed(() => recordingStatus.value !== 'idle');

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

function handleRecordingFinish() {
  recordingStatus.value = 'idle'; // Ensure overlay closes
  showSessionModal.value = true;
}

function handleSavePatientDetails(details: { firstName: string, lastName: string }) {
  tempPatientDetails.value = details;
  
  // Check duplication
  const duplicate = patientService.checkDuplicate(details.firstName, details.lastName);
  
  if (duplicate) {
    foundDuplicatePatient.value = duplicate;
    showDuplicateModal.value = true;
  } else {
    // No duplicate, create directly
    createNewPatientAndFinish(details);
  }
}

function handleAddToExisting() {
  if (foundDuplicatePatient.value) {
    // Logic to add session to existing patient
    console.log(`Adding session to existing patient: ${foundDuplicatePatient.value.id}`);
    closeAllModals();
    currentTab.value = 'patients'; // Navigate to patients list
  }
}

function handleCreateNewPatient() {
  if (tempPatientDetails.value) {
    createNewPatientAndFinish(tempPatientDetails.value);
  }
}

function createNewPatientAndFinish(details: { firstName: string, lastName: string }) {
  const newPatient = patientService.createPatient(details.firstName, details.lastName);
  console.log('Created new patient:', newPatient);
  closeAllModals();
  currentTab.value = 'patients'; // Navigate to patients list
}

function closeAllModals() {
  showSessionModal.value = false;
  showDuplicateModal.value = false;
  tempPatientDetails.value = null;
  foundDuplicatePatient.value = null;
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
</style>// force update
