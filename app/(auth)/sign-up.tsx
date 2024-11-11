import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthProvider';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already associated with an account. Please sign in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    default:
      return 'An error occurred. Please try again later.';
  }
};

const Signup: React.FC = () => {
  const colorScheme = useColorScheme();
  const { setUser } = useAuth();
  const [name, setName] = useState<string>('');  // New state for name
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setLoading(true);


    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await sendEmailVerification(user);
      setUser(user);
      Alert.alert('Verification email sent! Please check your inbox.');
      router.replace('/(tabs)/profile');

      // Clear the form fields
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorCode = (error as { code: string }).code;
      setErrorMessage(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#282C35' }}
      headerImage={
        <Image
        source={require('../../assets/images/signup.png')}
       className="w-52 h-72 mt-10 mx-auto "
      />
      }
    >
     <View className='flex-1 justify-center items-center '>
    
      <ThemedText type='title' className='mb-4' >Sign up</ThemedText>

      <TextInput
        placeholderTextColor={colorScheme === 'dark' ? '#A3A3A3' : '#666666'}
        placeholder="Full Name"
        value={name}
        onChangeText={handleInputChange(setName)}
        className="w-full p-3 mb-2 text-white border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 "
      />

      <TextInput
        placeholderTextColor={colorScheme === 'dark' ? '#A3A3A3' : '#666666'}
        placeholder="Email"
        value={email}
        onChangeText={handleInputChange(setEmail)}
        keyboardType="email-address"
        className="w-full p-3 mb-2 text-white border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 "
      />

      <TextInput
        placeholderTextColor={colorScheme === 'dark' ? '#A3A3A3' : '#666666'}
        placeholder="Password"
        value={password}
        onChangeText={handleInputChange(setPassword)}
        secureTextEntry
        className="w-full p-3 mb-2 text-white border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 "
      />

      <TextInput
        placeholderTextColor={colorScheme === 'dark' ? '#A3A3A3' : '#666666'}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={handleInputChange(setConfirmPassword)}
        secureTextEntry
        className="w-full p-3 mb-2 text-white border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 "
      />

      {errorMessage && (
        <Text style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</Text>
      )}

      <Pressable onPress={handleSignup} disabled={loading} className='bg-green-500 py-4  rounded-full w-full'>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className='text-center text-xl text-white font-semibold'>Sign up</Text>
        )}
      </Pressable>

      <View style={{ marginTop: 16 }}>
        <ThemedText>
          Already have an account?{' '}
          <Text style={{ color: '#007BFF', fontWeight: 'bold' }} onPress={() => router.replace('/(auth)/sign-in')}>Sign In</Text>
        </ThemedText>
      </View>
    </View>
    </ParallaxScrollView>
  
  );
};

export default Signup;
