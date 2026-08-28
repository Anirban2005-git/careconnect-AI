import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== "MY_FIREBASE_API_KEY" &&
      firebaseConfig.projectId &&
      firebaseConfig.projectId !== "MY_FIREBASE_PROJECT_ID"
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
  return auth;
}

export async function firebaseLogin(email: string, password: string) {
  const a = getFirebaseAuth();
  if (!a) throw new Error("Firebase not configured");
  try {
    const cred = await signInWithEmailAndPassword(a, email, password);
    return cred.user.getIdToken();
  } catch (error: any) {
    if (error?.code === "auth/invalid-credential" || error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password") {
      throw new Error("Incorrect email or password. Create the account first or check your Firebase user.");
    }
    if (error?.code === "auth/operation-not-allowed") {
      throw new Error("Firebase Email/Password sign-in is disabled. Enable it in Firebase Console > Authentication > Sign-in method.");
    }
    if (error?.code === "auth/invalid-api-key") {
      throw new Error("The Firebase Web API key is invalid or belongs to another project.");
    }
    throw new Error(error?.message || "Firebase sign-in failed");
  }
}

export async function firebaseRegister(email: string, password: string) {
  const a = getFirebaseAuth();
  if (!a) throw new Error("Firebase not configured");
  const cred = await createUserWithEmailAndPassword(a, email, password);
  return cred.user.getIdToken();
}

export async function firebaseResetPassword(email: string) {
  const a = getFirebaseAuth();
  if (!a) throw new Error("Firebase not configured");
  await sendPasswordResetEmail(a, email);
}

export async function firebaseLogout() {
  const a = getFirebaseAuth();
  if (a) await signOut(a);
}
