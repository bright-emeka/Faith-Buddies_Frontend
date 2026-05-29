import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required Firebase config values before initialization
const requiredKeys = [
  "apiKey",
  "authDomain",
  "databaseURL",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(
    `Firebase configuration missing: ${missingKeys.join(", ")}. ` +
      "Create a frontend/.env file and set VITE_FIREBASE_* values from your Firebase project."
  );
}

const invalidKeys = [];
if (
  firebaseConfig.apiKey &&
  !/^AIza[0-9A-Za-z_-]{35}$/.test(firebaseConfig.apiKey)
) {
  invalidKeys.push("apiKey");
}
if (
  firebaseConfig.authDomain &&
  !/^[a-z0-9-]+\.firebaseapp\.com$/.test(firebaseConfig.authDomain)
) {
  invalidKeys.push("authDomain");
}
if (
  firebaseConfig.projectId &&
  !/^[a-z0-9-]+$/.test(firebaseConfig.projectId)
) {
  invalidKeys.push("projectId");
}
if (
  firebaseConfig.databaseURL &&
  !/^https:\/\/[a-z0-9-]+\.(firebaseio\.com|firebasedatabase\.app)\/?$/.test(
    firebaseConfig.databaseURL
  )
) {
  invalidKeys.push("databaseURL");
}

if (invalidKeys.length > 0) {
  throw new Error(
    `Firebase configuration invalid: ${invalidKeys.join(", ")}. ` +
      "Make sure your frontend/.env contains the API key and authDomain exactly from Firebase Console."
  );
}

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;