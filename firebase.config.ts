import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { Auth, getAuth, initializeAuth, Persistence } from "firebase/auth";
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getReactNativePersistence = (
  firebaseAuth as typeof firebaseAuth & {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

const firebaseConfig: FirebaseOptions = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebase?.appId,
  measurementId: Constants.expoConfig?.extra?.firebase?.measurementId,
};


const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

const db: Firestore = getFirestore(app);

export { app, auth, db };
