import admin, { isFirebaseAdminReady } from '../firebaseAdmin.js';

/**
 * Verifies the Firebase ID token sent in the Authorization header.
 * If Firebase Admin credentials are not configured (dev mode), allows all requests through.
 */
export async function verifyToken(req, res, next) {
  // Dev mode: no Firebase Admin credentials — skip token check
  if (!isFirebaseAdminReady) {
    req.user = { uid: 'dev-user', email: 'dev@local', name: 'Dev User' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}
