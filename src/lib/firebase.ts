import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Fill these in from Firebase Console -> Project Settings -> General ->
// "Your apps" -> Web app. All values here are public identifiers (not
// secrets) - access is enforced by Realtime Database security rules plus
// Firebase Auth, not by hiding this config. See ../../README.md.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasConfig = !!firebaseConfig.databaseURL && !!firebaseConfig.projectId;

export const app = hasConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : undefined;

// db/auth are only used from client components (after LoginGate), by which
// point NEXT_PUBLIC_* vars are always present in the browser bundle. The
// `undefined` fallback only matters for server-side prerendering (e.g.
// Next's /_not-found page), where these are imported but never called.
export const db = app ? getDatabase(app) : (undefined as unknown as ReturnType<typeof getDatabase>);
export const auth = app ? getAuth(app) : (undefined as unknown as ReturnType<typeof getAuth>);
