import { ref } from 'vue';

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    sessions: SessionRecord[];
}

export interface SessionRecord {
    id: string;
    date: Date;
    duration: number; // seconds
    transcriptPreview: string;
}

// Mock database
const patients = ref<Patient[]>([
    {
        id: 'p1',
        firstName: 'Sarah',
        lastName: 'Thompson',
        sessions: []
    },
    {
        id: 'p2',
        firstName: 'John',
        lastName: 'Doe',
        sessions: []
    }
]);

export const patientService = {
    // Check if a patient with the same name exists
    checkDuplicate(firstName: string, lastName: string): Patient | null {
        const normalize = (str: string) => str.trim().toLowerCase();
        return patients.value.find(p =>
            normalize(p.firstName) === normalize(firstName) &&
            normalize(p.lastName) === normalize(lastName)
        ) || null;
    },

    // Create a new patient profile
    createPatient(firstName: string, lastName: string): Patient {
        const newPatient: Patient = {
            id: 'p' + Date.now(),
            firstName,
            lastName,
            sessions: []
        };
        patients.value.push(newPatient);
        return newPatient;
    },

    // Add a session to an existing patient
    addSessionToPatient(patientId: string, session: SessionRecord): void {
        const patient = patients.value.find(p => p.id === patientId);
        if (patient) {
            patient.sessions.push(session);
        }
    },

    getPatientById(id: string): Patient | undefined {
        return patients.value.find(p => p.id === id);
    },

    getAllPatients(): Patient[] {
        return patients.value;
    }
};
