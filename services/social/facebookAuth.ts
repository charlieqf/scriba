import { loadScript } from './scriptLoader';

const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

export const facebookAuth = {
    initialized: false,

    async init() {
        if (this.initialized) return;
        if (!FB_APP_ID) {
            console.warn("Facebook App ID not found (VITE_FACEBOOK_APP_ID)");
            return;
        }

        await loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk');

        return new Promise<void>((resolve) => {
            window.fbAsyncInit = () => {
                window.FB.init({
                    appId: FB_APP_ID,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
                this.initialized = true;
                resolve();
            };

            // If script loaded but window.FB already exists (race condition)
            if (window.FB) {
                window.fbAsyncInit();
            }
        });
    },

    async login(): Promise<{ token: string; userID: string } | null> {
        if (!FB_APP_ID) {
            alert("Facebook Login is not configured (Missing App ID)");
            return null;
        }

        try {
            await this.init();
        } catch (e) {
            console.error(e);
            return null;
        }

        return new Promise((resolve, reject) => {
            window.FB.login((response: any) => {
                if (response.authResponse) {
                    resolve({
                        token: response.authResponse.accessToken,
                        userID: response.authResponse.userID
                    });
                } else {
                    // User cancelled login or did not fully authorize
                    resolve(null);
                }
            }, { scope: 'public_profile,email' });
        });
    }
};
