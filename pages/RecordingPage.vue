<template>
  <div class="recording-page">
    <!-- Header -->
    <header class="status-bar">
      <div class="recording-indicator">
        <div class="red-dot"></div>
        <span>REC</span>
      </div>
      <div class="timer">{{ formattedDuration }}</div>
      <div class="status-icons">
        <!-- Shows connection type: Bluetooth or Mobile -->
        <span v-if="source === 'badge'" class="source-icon">
          <Bluetooth :size="14" />
        </span>
        <span v-else class="source-icon mobile">
          <Mic :size="14" />
        </span>
        <div class="battery" v-if="source === 'badge'">
          <Battery :size="14" />
          <span>84%</span>
        </div>
      </div>
    </header>

    <!-- Banner for Safe to Screen Off -->
    <div class="safe-banner">
      <Lock :size="12" />
      <span>SAFE TO SCREEN OFF • {{ source === 'badge' ? 'BADGE' : 'MOBILE' }} RECORDING</span>
    </div>

    <!-- Visualization -->
    <div class="visualizer">
      <div class="waveform">
        <div v-for="n in 20" :key="n" class="bar" :style="{ animationDelay: `${n * 0.1}s` }"></div>
      </div>
      <h2 class="session-title">New Patient Session</h2>
      <p class="status-text">{{ status === 'paused' ? 'Recording paused' : 'Recording in progress' }}</p>
    </div>

    <!-- Transcription Area -->
    <div class="transcription-area" ref="transcriptContainer">
      <div v-for="item in transcript" :key="item.id" :class="['message-box', item.speaker]">
        <div class="speaker-label">{{ item.speaker.toUpperCase() }}</div>
        <div class="message-content">{{ item.text }}</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-area">
      <button class="control-btn pause" @click="togglePause">
        <component :is="status === 'paused' ? Play : Pause" :size="24" />
        <span>{{ status === 'paused' ? 'RESUME' : 'PAUSE' }}</span>
      </button>

      <button class="control-btn stop" @click="handleStop">
        <div class="stop-inner"></div>
        <span>END SESSION</span>
        <!-- Ripple effect could be added here -->
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { Bluetooth, Mic, Battery, Lock, Pause, Play } from 'lucide-vue-next';
import { useRecordingService } from '../services/recordingService';

const { 
  status, 
  source, 
  formattedDuration, 
  transcript,
  pauseRecording,
  resumeRecording,
  stopRecording
} = useRecordingService();

const transcriptContainer = ref<HTMLElement | null>(null);

const emit = defineEmits(['finish']);

// Auto-scroll logic
watch(() => transcript.value.length, () => {
  nextTick(() => {
    if (transcriptContainer.value) {
      transcriptContainer.value.scrollTop = transcriptContainer.value.scrollHeight;
    }
  });
});

function togglePause() {
  if (status.value === 'paused') {
    resumeRecording();
  } else {
    pauseRecording();
  }
}

function handleStop() {
  stopRecording();
  emit('finish');
}
</script>

<style scoped>
.recording-page {
  height: 100vh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100; /* overlay Everything */
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 8px; /* Extra top padding for notch driven via global css usually, using safe area implicitly */
  font-family: monospace;
  font-weight: 600;
  color: #1E293B;
  background: #fff;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #EF4444;
  font-size: 14px;
}

.Timer {
  font-size: 16px;
  color: #EF4444;
}

.red-dot {
  width: 8px;
  height: 8px;
  background: #EF4444;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748B;
  font-size: 12px;
}

.source-icon.mobile {
  color: #14B8A6;
}

.battery {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Safe Banner */
.safe-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 10px 20px;
  padding: 8px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 10px;
  color: #94A3B8;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Visualizer */
.visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  background: #fff;
  border-bottom: 1px solid #F1F5F9;
}

.waveform {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 40px;
  margin-bottom: 16px;
}

.bar {
  width: 3px;
  height: 100%;
  background: #14B8A6;
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { height: 10px; opacity: 0.5; }
  50% { height: 30px; opacity: 1; }
}

.session-title {
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 4px 0;
}

.status-text {
  font-size: 12px;
  color: #64748B;
  margin: 0;
}

/* Transcription */
.transcription-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #F8FAFC;
}

.message-box {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  font-size: 14px;
  line-height: 1.5;
}

.message-box.patient {
  align-self: flex-start;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-top-left-radius: 4px;
}

.message-box.physio {
  align-self: flex-end;
  background: #D1FAE5; /* Mint green bg */
  color: #064E3B;
  border-top-right-radius: 4px;
}

.speaker-label {
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 4px;
  opacity: 0.7;
  letter-spacing: 0.5px;
}

.message-box.patient .speaker-label { color: #818CF8; } /* Indigo for Patient */
.message-box.physio .speaker-label { color: #059669; } /* Green for Physio */

/* Controls */
.controls-area {
  background: #fff;
  padding: 20px 40px 40px; /* Safe area bottom */
  display: flex;
  align-items: flex-end; /* Align bottom */
  justify-content: center;
  gap: 40px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}

.control-btn {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.control-btn span {
  font-size: 10px;
  font-weight: 700;
  color: #64748B;
  letter-spacing: 0.5px;
}

.control-btn.pause {
  padding-bottom: 10px; /* Minor adjustment for alignment */
}

.control-btn.pause svg {
  color: #94A3B8;
  padding: 12px;
  background: #F1F5F9;
  border-radius: 50%;
  width: 48px;
  height: 48px;
}

.control-btn.stop .stop-inner {
  width: 72px;
  height: 72px;
  background: #EF4444;
  border-radius: 24px; /* Soft square */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  margin-bottom: 4px;
}

.control-btn.stop .stop-inner::after {
  content: '';
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 4px;
}

.control-btn.stop span {
  color: #1E293B;
}
</style>
