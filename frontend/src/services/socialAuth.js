const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';

let googleScriptPromise = null;
let facebookScriptPromise = null;

const loadScript = (src, id) => new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
        resolve();
        return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Khong the tai SDK tu ${src}`));
    document.body.appendChild(script);
});

export const hasGoogleSocialAuth = () => Boolean(GOOGLE_CLIENT_ID);
export const hasFacebookSocialAuth = () => Boolean(FACEBOOK_APP_ID);

export const getSocialAuthConfigError = (provider) => {
    if (provider === 'google' && !GOOGLE_CLIENT_ID) {
        return 'Chua cau hinh REACT_APP_GOOGLE_CLIENT_ID';
    }

    if (provider === 'facebook' && !FACEBOOK_APP_ID) {
        return 'Chua cau hinh REACT_APP_FACEBOOK_APP_ID';
    }

    return '';
};

export const requestGoogleAccessToken = async () => {
    if (!GOOGLE_CLIENT_ID) {
        throw new Error(getSocialAuthConfigError('google'));
    }

    if (!googleScriptPromise) {
        googleScriptPromise = loadScript('https://accounts.google.com/gsi/client', 'google-gsi-sdk');
    }

    await googleScriptPromise;

    if (!window.google?.accounts?.oauth2) {
        throw new Error('Khong the khoi tao Google SDK');
    }

    return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: (response) => {
                if (response?.error) {
                    reject(new Error(response.error_description || response.error || 'Dang nhap Google that bai'));
                    return;
                }

                if (!response?.access_token) {
                    reject(new Error('Khong nhan duoc access token tu Google'));
                    return;
                }

                resolve(response.access_token);
            }
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
    });
};

export const requestFacebookAccessToken = async () => {
    if (!FACEBOOK_APP_ID) {
        throw new Error(getSocialAuthConfigError('facebook'));
    }

    if (!facebookScriptPromise) {
        facebookScriptPromise = new Promise((resolve, reject) => {
            if (window.FB) {
                window.FB.init({
                    appId: FACEBOOK_APP_ID,
                    cookie: false,
                    xfbml: false,
                    version: 'v19.0'
                });
                resolve();
                return;
            }

            window.fbAsyncInit = function initFacebookSdk() {
                window.FB.init({
                    appId: FACEBOOK_APP_ID,
                    cookie: false,
                    xfbml: false,
                    version: 'v19.0'
                });
                resolve();
            };

            loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk').catch(reject);
        });
    }

    await facebookScriptPromise;

    if (!window.FB) {
        throw new Error('Khong the khoi tao Facebook SDK');
    }

    return new Promise((resolve, reject) => {
        window.FB.login((response) => {
            if (!response?.authResponse?.accessToken) {
                reject(new Error('Dang nhap Facebook that bai'));
                return;
            }

            resolve(response.authResponse.accessToken);
        }, { scope: 'public_profile,email' });
    });
};
