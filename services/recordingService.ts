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
        clearInterval(transcriptionInterval);

        let lineIndex = 0;
        let charIndex = 0;
        let isPausing = false;
        let pauseCounter = 0;

        // Reset if we are restarting? 
        // ideally we should continue from where we left off if paused, 
        // but for simplicity of this mock, we can just continue appending if the list isn't empty
        if (transcript.value.length > 0) {
            const lastItem = transcript.value[transcript.value.length - 1];
            // Find where we are in the mock conversation based on the last item's text
            // This is a bit tricky for a simple mock, let's just say resume behavior 
            // clears and starts over OR we just keep adding new lines. 
            // To be simple and robust: if "resuming", we just pick up from lineIndex = transcript.length
            lineIndex = transcript.value.length;
            // If the last one wasn't finished, we should probably finish it, but let's assume pause marks it final for now
        }

        transcriptionInterval = setInterval(() => {
            if (lineIndex >= MOCK_CONVERSATION.length) {
                clearInterval(transcriptionInterval);
                return;
            }

            const currentLineDef = MOCK_CONVERSATION[lineIndex];

            // If we are pausing between lines
            if (isPausing) {
                pauseCounter++;
                if (pauseCounter > 20) { // 20 * 50ms = 1 sec pause
                    isPausing = false;
                    pauseCounter = 0;
                    lineIndex++; // Move to next line
                    charIndex = 0;
                }
                return;
            }

            // Start a new box if needed
            if (charIndex === 0) {
                transcript.value.push({
                    id: Date.now().toString() + lineIndex,
                    speaker: currentLineDef.speaker as 'patient' | 'physio',
                    text: '',
                    final: false
                });
            }

            // Append next chunk (simulating words or characters)
            // Let's do 2 characters at a time for speedier 'speaking' feel
            const chunk = currentLineDef.text.slice(charIndex, charIndex + 2);

            if (chunk) {
                const lastIdx = transcript.value.length - 1;
                transcript.value[lastIdx].text += chunk;
                charIndex += 2;
            }

            // Check if line is done
            if (charIndex >= currentLineDef.text.length) {
                const lastIdx = transcript.value.length - 1;
                transcript.value[lastIdx].final = true;
                isPausing = true;
            }

        }, 50); // 50ms interval for fluid typing effect
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
