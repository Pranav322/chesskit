import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getAnalytics,
  isSupported,
  logEvent,
  Analytics,
} from "firebase/analytics";

// Ensure all required environment variables are present
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// DEBUG LOG — remove after testing
console.log("API KEY at runtime:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("AUTH DOMAIN at runtime:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("PROJECT ID at runtime:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("STORAGE BUCKET at runtime:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log("MESSAGING SENDER ID at runtime:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log("APP ID at runtime:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
console.log("MEASUREMENT ID at runtime:", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);

// Initialize Firebase only if all required config values are present
const app = !getApps().length && !missingEnvVars.length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported && !missingEnvVars.length) {
      analytics = getAnalytics(app);
    }
  });
}

export const logAnalyticsEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>,
) => {
  if (!analytics) return;
  logEvent(analytics, eventName, eventParams);
};

export { app, auth, db };
