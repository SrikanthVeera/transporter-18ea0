import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";

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
} else {
    console.log("Firebase initialized with project:", firebaseConfig.projectId);
    console.log("Firebase API Key (first 10 chars):", firebaseConfig.apiKey.substring(0, 10) + "...");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Force language to avoid issues
auth.useDeviceLanguage();

// Optional: Local testing helper (keep disabled for real SMS)
// Local testing helper: Bypasses reCAPTCHA for 'Test Phone Numbers' configured in Firebase Console.
// Real phone numbers will NOT work on localhost with this enabled.
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    // auth.settings.appVerificationDisabledForTesting = true;
    console.log("App Verification Disabled for Testing (Localhost) - Use Firebase Test Phone Numbers only.");
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
        try {
            window.recaptchaVerifier.clear();
        } catch (e) {
            console.warn("Failed to clear existing recaptcha:", e);
        }
        window.recaptchaVerifier = null;
    }

    try {
        console.log("Initializing RecaptchaVerifier...");
        window.recaptchaVerifier = new RecaptchaVerifier(
            containerId,
            {
                size: 'invisible',
                callback: (response) => {
                    console.log("reCAPTCHA solved");
                },
                'expired-callback': () => {
                    console.warn('reCAPTCHA expired');
                    // Do not nullify immediately, standard behavior is to allow reset
                    // window.recaptchaVerifier = null; 
                }
            },
            auth
        );

        await window.recaptchaVerifier.render();
        console.log("RecaptchaVerifier initialized successfully.");
        return window.recaptchaVerifier;

    } catch (error) {
        console.error("RecaptchaVerifier init error:", error);
        // Clear the broken verifier
        window.recaptchaVerifier = null;
        throw error;
    }
};

export { signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCustomToken };
