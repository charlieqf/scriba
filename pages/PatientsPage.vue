<template>
  <div class="patients-page">
    <header class="page-header">
      <h1>Patients</h1>
    </header>
    <main class="page-content">
      <div class="placeholder">
        <Users :size="64" />
        <h2>Patient Management</h2>
        <p>Coming in Week 2 - Recording & Patient Assignment</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Users } from 'lucide-vue-next';
</script>

<style scoped>
.patients-page {
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
  padding: 60px 20px;
  display: flex;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #94A3B8;
}

.placeholder h2 {
  margin: 16px 0 8px;
  color: #64748B;
  font-size: 18px;
}

.placeholder p {
  font-size: 14px;
}
</style>
