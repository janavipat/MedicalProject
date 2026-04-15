import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

const hasCredentials =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasCredentials && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (e) {
    console.warn('⚠️  Firebase Admin init failed:', e.message);
  }
} else if (!hasCredentials) {
  console.warn('⚠️  Firebase Admin credentials not set — token verification disabled (dev mode)');
}

export const isFirebaseAdminReady = hasCredentials && admin.apps.length > 0;
export default admin;
