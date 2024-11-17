// Import Firebase modules you need
import { initializeApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
// Define Firebase configuration with a TypeScript interface
const firebaseConfig: FirebaseOptions = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebase?.appId,
  measurementId: Constants.expoConfig?.extra?.firebase?.measurementId,
};


// Initialize Firebase app with explicit typing
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence, specifying types
const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Export the initialized auth instance for use throughout the app
export { auth, app };
