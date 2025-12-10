import { ref, computed } from 'vue';
import { useBluetoothService } from './bluetoothService';

export type RecordingSource = 'badge' | 'mobile';
export type RecordingStatus = 'idle' | 'recording' | 'paused';

export interface Box {
    id: string;
    speaker: 'patient' | 'physio';
    text: string;
    final: boolean;
}

const status = ref<RecordingStatus>('idle');
const source = ref<RecordingSource>('badge');
const duration = ref(0);
const transcript = ref<Box[]>([]);
let timerInterval: any = null;
let transcriptionInterval: any = null;

// Mock transcription data
const MOCK_CONVERSATION = [
    { speaker: 'physio', text: "Alright, recording is on. How have you been since last week?" },
    { speaker: 'patient', text: "Not too bad. The exercises are getting easier." },
    { speaker: 'physio', text: "That's great to hear. Any pain during the squats?" },
    { speaker: 'patient', text: "Only if I go too deep. Around 4/10 pain." },
    { speaker: 'physio', text: "Okay, let's keep it shallow for now then." },
    { speaker: 'physio', text: "Have you been using the resistance bands?" },
    { speaker: 'patient', text: "Yes, every morning as you suggested." },
    { speaker: 'physio', text: "Perfect. Let's check your range of motion today." },
];

export function useRecordingService() {
    const { isConnected, onDisconnect } = useBluetoothService();

    // Setup failover listener
    onDisconnect(() => {
        if (status.value === 'recording' && source.value === 'badge') {
            handleFailover();
        }
    });

    function handleFailover() {
        console.log('Badge disconnected during recording. Switching to mobile...');
        source.value = 'mobile';
        // In a real app, this would verify mobile mic permission and switch audio stream
        // We will toggle a flag to show the UI notification
    }

    function startRecording(initialSource: RecordingSource) {
        status.value = 'recording';
        source.value = initialSource;
        duration.value = 0;
        transcript.value = [];

        startTimer();
        startMockTranscription();
    }

    function pauseRecording() {
        status.value = 'paused';
        stopTimer();
        stopMockTranscription();
    }

    function resumeRecording() {
        status.value = 'recording';
        startTimer();
        startMockTranscription();
    }

    function stopRecording() {
        status.value = 'idle';
        stopTimer();
        stopMockTranscription();
        // Here we would save the file
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            duration.value++;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function startMockTranscription() {
        // Add a new line every few seconds
        clearInterval(transcriptionInterval);
        let index = 0;

        // Add initial line immediately
        addTranscriptLine(index);
        index++;

        transcriptionInterval = setInterval(() => {
            if (index < MOCK_CONVERSATION.length) {
                addTranscriptLine(index);
                index++;
            }
        }, 3000);
    }

    function addTranscriptLine(index: number) {
        const line = MOCK_CONVERSATION[index];
        transcript.value.push({
            id: Date.now().toString() + index,
            speaker: line.speaker as 'patient' | 'physio',
            text: line.text,
            final: true
        });
    }

    function stopMockTranscription() {
        clearInterval(transcriptionInterval);
    }

    const formattedDuration = computed(() => {
        const minutes = Math.floor(duration.value / 60);
        const seconds = duration.value % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });

    return {
        status,
        source,
        duration,
        formattedDuration,
        transcript,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording
    };
}
