import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../../firebase.config';

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export async function signUpWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await sendEmailVerification(credential.user);
}

export const sendPasswordReset = (email: string) =>
  sendPasswordResetEmail(auth, email.trim());



export const signOut = async () => {
  if (Platform.OS !== 'web') {
    try {
      const isSignedIn = GoogleSignin.hasPreviousSignIn();
      if (isSignedIn) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.warn('Failed to clear Google Signin session', error);
    }
  }
  return firebaseSignOut(auth);
};

export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : '';

  switch (code) {
    case 'auth/invalid-email': return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'The email or password is incorrect.';
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/weak-password': return 'Choose a stronger password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed': return 'Check your internet connection and try again.';
    case 'auth/operation-not-allowed': return 'Email and password sign-in is not enabled in Firebase yet.';
    case 'auth/configuration-not-found': return 'Firebase Authentication is not configured for this app.';
    case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
    case 'auth/account-exists-with-different-credential': return 'This email is already linked to another sign-in method.';
    case '12501': return 'Google sign-in was cancelled.';
    case '10': return 'Google sign-in is not configured for this Android build.';
    case '7': return 'Check your internet connection and try again.';
    default: {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('development build') || message.includes('not configured')) return message;
      if (message.includes('ID token')) return 'Google sign-in did not return a valid credential.';
      return 'Something went wrong. Please try again.';
    }
  }
}