import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// Separate app name prevents the public worker session from sharing admin auth state.
const app = initializeApp(firebaseConfig, 'DailyWageWorker');
export const auth = getAuth(app);
export const db = getFirestore(app);
export { signInAnonymously, doc, getDoc, setDoc, serverTimestamp };
