import { loadScript } from './scriptLoader';

const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_SERVICE_ID || '';
const REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin;

declare global {
    interface Window {
        AppleID: any;
    }
}

export const appleAuth = {
    initialized: false,

    async init() {
        if (this.initialized) return;
        if (!APPLE_CLIENT_ID) {
            console.warn("Apple Service ID not found (VITE_APPLE_SERVICE_ID)");
            return;
        }

        await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js', 'apple-jssdk');

        window.AppleID.auth.init({
            clientId: APPLE_CLIENT_ID,
            scope: 'name email',
            redirectURI: REDIRECT_URI,
            usePopup: true
        });

        this.initialized = true;
    },

    async login(): Promise<{ token: string; user: any } | null> {
        if (!APPLE_CLIENT_ID) {
            alert("Apple Login is not configured (Missing Service ID)");
            return null;
        }

        try {
            await this.init();
        } catch (e) {
            console.error(e);
            return null;
        }

        try {
            const data = await window.AppleID.auth.signIn();
            // Apple returns { authorization: { id_token, code }, user: { name: { firstName, lastName } } }
            // 'user' object is only returned on FIRST login.
            return {
                token: data.authorization.id_token,
                user: data.user
            };
        } catch (error) {
            console.error("Apple Sign In failed:", error);
            return null;
        }
    }
};
