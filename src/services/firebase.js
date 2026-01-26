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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const initRecaptcha = () => {
    if (window.recaptchaVerifier) {
        return window.recaptchaVerifier;
    }

    try {
        const container = document.getElementById("recaptcha-container");
        if (!container) {
            console.error("Recaptcha container not found");
            return null;
        }

        console.log("Initializing RecaptchaVerifier with auth:", auth ? "exists" : "missing");

        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            container,
            {
                size: "invisible",
                callback: () => {
                    console.log("reCAPTCHA solved");
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expired.');
                }
            }
        );
    } catch (error) {
        console.error("RecaptchaVerifier init error:", error);
    }

    return window.recaptchaVerifier;
};

export { signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword };
