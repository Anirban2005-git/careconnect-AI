import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { cert } from "firebase-admin/app";

let firebaseReady = false;

export function initFirebase(): boolean {
  if (firebaseReady) return true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey || projectId === "MY_FIREBASE_PROJECT_ID") {
    console.log("Firebase Admin not configured — demo auth mode enabled");
    return false;
  }

  try {
    admin.initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    firebaseReady = true;
    console.log("Firebase Admin initialized");
    return true;
  } catch (error) {
    console.warn("Firebase Admin init failed — demo auth mode enabled:", error);
    return false;
  }
}

export function isFirebaseReady(): boolean {
  return firebaseReady;
}

export async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email?: string; name?: string } | null> {
  if (!firebaseReady) return null;
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email, name: decoded.name };
  } catch {
    return null;
  }
}
