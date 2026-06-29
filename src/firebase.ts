import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let app;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let isFirebaseConfigured = false;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Explicitly pass firestoreDatabaseId if configured
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    isFirebaseConfigured = true;
    console.log('Firebase successfully initialized!');
  }
} catch (error) {
  console.warn('Firebase initialization failed. Falling back.', error);
}

export { auth, db, isFirebaseConfigured };
