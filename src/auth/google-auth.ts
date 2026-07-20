import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '../../firebase.config';

// 1. Initialize the Google Sign-In configuration.
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  });
}
export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    console.log('[Step 1] Triggering native Google prompt...');
    const response = await GoogleSignin.signIn();
    console.log('[Step 2] Native response received:', JSON.stringify(response));

    if (isSuccessResponse(response)) {
      const idToken = response.data?.idToken;
      console.log('[Step 3] ID Token extracted:', idToken ? 'Valid (Token exists)' : 'MISSING / UNDEFINED');

      if (!idToken) {
        throw new Error('Google did not return an ID token. Verify webClientId configuration.');
      }

      console.log('[Step 4] Exchanging with Firebase...');
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      console.log('[Step 5] Firebase login SUCCESS:', userCredential.user.email);
      return userCredential;
    }
  } catch (error: any) {
    console.error('[ERROR DETAILS]:', {
      code: error?.code,
      message: error?.message,
      customData: error?.customData,
    });
    throw error;
  }
}