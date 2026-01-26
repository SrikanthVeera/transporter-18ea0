import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: Check if config is loaded
if (!firebaseConfig.apiKey) {
    console.error("Firebase Config Missing! Check your .env file.");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Force language to avoid issues
auth.useDeviceLanguage();

// IMPORTANT: Workaround for "auth/invalid-app-credential" on localhost
// This disables the strict App Check/Recaptcha verification for testing
// Remove this line in production!
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    // auth.settings.appVerificationDisabledForTesting = true;
    // console.log("App Verification Disabled for Testing (Localhost)");
}

export const initRecaptcha = async () => {
    const containerId = "recaptcha-container";
    const container = document.getElementById(containerId);

    if (!container) {
        console.error("Recaptcha container not found in DOM");
        return null;
    }

    if (!auth) {
        console.error("Firebase Auth not initialized");
        return null;
    }

    if (window.recaptchaVerifier) {
        // console.log("Recaptcha already initialized");
        // Ensure it's cleared if previously broken
        try {
            window.recaptchaVerifier.clear();
        } catch (e) { }
        window.recaptchaVerifier = null;
    }

    try {
        console.log("Initializing RecaptchaVerifier (Compat Signature)...");
        // We found that for this specific setup, (container, params, auth) works
        // while (auth, container, params) throws undefined 'appVerificationDisabledForTesting'.
        window.recaptchaVerifier = new RecaptchaVerifier(
            container,
            {
                'size': 'invisible',
                'callback': (response) => {
                    console.log("reCAPTCHA solved");
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expired');
                }
            },
            auth
        );
        console.log("RecaptchaVerifier initialized successfully.");
    } catch (error) {
        console.error("RecaptchaVerifier init error:", error);
        window.recaptchaVerifier = null;
    }

    return window.recaptchaVerifier;
};

export { signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword };
