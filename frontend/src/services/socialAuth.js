const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

let googleScriptPromise = null;

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
    script.onerror = () => reject(new Error(`Không thể tải SDK từ ${src}`));
    document.body.appendChild(script);
});

export const hasGoogleSocialAuth = () => Boolean(GOOGLE_CLIENT_ID);

export const getSocialAuthConfigError = (provider) => {
    if (provider === 'google' && !GOOGLE_CLIENT_ID) {
        return 'Chưa cấu hình REACT_APP_GOOGLE_CLIENT_ID';
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
        throw new Error('Không thể khởi tạo Google SDK');
    }

    return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: (response) => {
                if (response?.error) {
                    reject(new Error(response.error_description || response.error || 'Đăng nhập Google thất bại'));
                    return;
                }

                if (!response?.access_token) {
                    reject(new Error('Không nhận được access token từ Google'));
                    return;
                }

                resolve(response.access_token);
            }
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
    });
};
