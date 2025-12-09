import { onMounted, onUnmounted, ref } from 'vue';

const SCRIPT_ID = 'google-gsi-script';

declare global {
    interface Window {
        google: any;
    }
}

export function useGoogleLogin(clientId: string, callback: (response: any) => void) {
    const isReady = ref(false);

    const loadScript = () => {
        if (document.getElementById(SCRIPT_ID)) {
            if (window.google) {
                initialize(clientId, callback);
                isReady.value = true;
            } else {
                // Script tag exists but window.google not ready yet, check regularly
                const checkGoogle = setInterval(() => {
                    if (window.google) {
                        clearInterval(checkGoogle);
                        initialize(clientId, callback);
                        isReady.value = true;
                    }
                }, 100);
            }
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.id = SCRIPT_ID;

        script.onload = () => {
            isReady.value = true;
            initialize(clientId, callback);
        };

        document.head.appendChild(script);
    };

    const login = () => {
        if (window.google && tokenClient) {
            tokenClient.requestAccessToken();
        } else {
            console.error('Google Token Client not initialized');
        }
    };

    let tokenClient: any = null;

    const initialize = (client_id: string, cb: (r: any) => void) => {
        if (!window.google) return;

        // Initialize for Render Button (ID Token) if still needed
        window.google.accounts.id.initialize({
            client_id: client_id,
            callback: cb
        });

        // Initialize for Custom Button (Access Token)
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: client_id,
            scope: 'openid profile email',
            callback: (tokenResponse: any) => {
                // Wrapper to match expected format somewhat or just pass through
                if (tokenResponse && tokenResponse.access_token) {
                    cb({ credential: tokenResponse.access_token, provider: 'google_access_token' });
                    // Note: 'credential' prop usually means ID token in GIS terms, 
                    // but we'll use it to pass the token. 
                    // The receiver (GoogleLoginButton or LoginPage) needs to handle this.
                    // Actually, let's keep it simple: just pass the response.
                    // But the existing callback expects { credential: ... } from `id.initialize`.
                    // We should align the callback contract or check type.
                }
            },
        });
    };

    const renderButton = (elementId: string, options: any = {}) => {
        if (!window.google) return;

        const target = document.getElementById(elementId);
        if (target) {
            window.google.accounts.id.renderButton(
                target,
                { theme: 'outline', size: 'large', ...options }
            );
        }
    };

    onMounted(() => {
        loadScript();
    });

    return {
        isReady,
        renderButton,
        login // Export login
    };
}
