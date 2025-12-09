// Bluetooth Service - Mock implementation for UI development
// Will be replaced with real BLE implementation when Capacitor is added

import { ref, computed } from 'vue';

export interface BluetoothDevice {
    id: string;
    name: string;
    rssi: number; // Signal strength in dBm
    batteryLevel?: number;
}

export interface DeviceSettings {
    storageUsed: number; // GB
    storageTotal: number; // GB
    systemStorage: number; // GB
    recordingsStorage: number; // GB
    autoStopDriving: boolean;
    autoStopGeofence: boolean;
}

export interface UploadQueueItem {
    id: string;
    filename: string;
    size: string;
    status: 'uploading' | 'synced' | 'pending';
    progress?: number;
}

// Reactive state
const isScanning = ref(false);
const isConnected = ref(false);
const connectedDevice = ref<BluetoothDevice | null>(null);
const availableDevices = ref<BluetoothDevice[]>([]);

const deviceSettings = ref<DeviceSettings>({
    storageUsed: 12.4,
    storageTotal: 32,
    systemStorage: 2,
    recordingsStorage: 10.4,
    autoStopDriving: true,
    autoStopGeofence: false,
});

const uploadQueue = ref<UploadQueueItem[]>([
    { id: '1', filename: 'Session_Oct24_1030.mp3', size: '14MB', status: 'uploading', progress: 45 },
    { id: '2', filename: 'Session_Oct23_1415.mp3', size: '8MB', status: 'synced' },
    { id: '3', filename: 'Session_Oct23_0900.mp3', size: '22MB', status: 'synced' },
]);

// Mock devices for scanning simulation
const mockDevices: BluetoothDevice[] = [
    { id: 'scriba-204', name: 'Scriba Badge SC-204', rssi: -45 },
    { id: 'unknown-1', name: 'Unknown Device', rssi: -80 },
];

// Service functions
export function useBluetoothService() {
    const connectionStatus = computed(() => {
        if (isConnected.value) return 'READY';
        return 'OFFLINE';
    });

    async function startScan(): Promise<void> {
        isScanning.value = true;
        availableDevices.value = [];

        // Simulate scanning delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return mock devices
        availableDevices.value = [...mockDevices];
        isScanning.value = false;
    }

    async function connectToDevice(deviceId: string): Promise<boolean> {
        const device = availableDevices.value.find(d => d.id === deviceId);
        if (!device) return false;

        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        connectedDevice.value = {
            ...device,
            batteryLevel: 84, // Mock battery level
        };
        isConnected.value = true;
        return true;
    }

    async function disconnect(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        connectedDevice.value = null;
        isConnected.value = false;
    }

    function updateSettings(key: keyof DeviceSettings, value: boolean): void {
        if (key === 'autoStopDriving' || key === 'autoStopGeofence') {
            deviceSettings.value[key] = value;
        }
    }

    return {
        // State
        isScanning,
        isConnected,
        connectedDevice,
        availableDevices,
        connectionStatus,
        deviceSettings,
        uploadQueue,

        // Actions
        startScan,
        connectToDevice,
        disconnect,
        updateSettings,
    };
}
