import { ref, onMounted } from 'vue';

const SCRIPT_ID = 'apple-id-script';

declare global {
    interface Window {
        AppleID: any;
    }
}

export function useAppleLogin(clientId: string, redirectURI: string) {
    const isReady = ref(false);

    const loadScript = () => {
        if (document.getElementById(SCRIPT_ID)) {
            if (window.AppleID) {
                isReady.value = true;
            }
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        script.id = SCRIPT_ID;

        script.onload = () => {
            // Initialize Apple ID
            window.AppleID.auth.init({
                clientId: clientId,
                scope: 'name email',
                redirectURI: redirectURI,
                state: 'origin:web',
                usePopup: true
            });
            isReady.value = true;
        };

        document.head.appendChild(script);
    };

    const signIn = async () => {
        if (!isReady.value || !window.AppleID) {
            console.error('Apple SDK not ready');
            return { success: false, error: 'SDK not ready' };
        }

        try {
            const data = await window.AppleID.auth.signIn();
            return { success: true, data: data };
        } catch (error) {
            console.error('Apple Sign In Error:', error);
            return { success: false, error };
        }
    };

    onMounted(() => {
        // Only load if clientId is present to avoid errors
        if (clientId) {
            loadScript();
        }
    });

    return {
        isReady,
        signIn
    };
}
