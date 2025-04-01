import admin from 'firebase-admin';
import ServiceAccountKey from '../../private/serviceAccountkey.json' with { type: "json" };

const serviceAccount = ServiceAccountKey as admin.ServiceAccount;

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Failed to initialize firebase app:', error);
    }
}

export default admin;