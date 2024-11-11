import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Image } from 'react-native';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';

const ForgotPassword: React.FC = () => {
    const colorScheme = useColorScheme();
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const router = useRouter();

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter(value);
        if (errorMessage || successMessage) {
            setErrorMessage(null);  // Clear any previous error messages
            setSuccessMessage(null);  // Clear any previous success messages
        }
    };

    const handleForgotPassword = async () => {
        setLoading(true);
        setErrorMessage(null); // Clear previous error messages
        setSuccessMessage(null); // Clear previous success messages

        try {
            // If email exists, send the password reset email
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('Password reset email sent! Please check your inbox.');
            setEmail(''); // Clear the email input
        } catch (error: any) {
            const errorCode = error.code;
            setErrorMessage(getErrorMessage(errorCode)); // Use the function to get friendly error message
        } finally {
            setLoading(false);
        }
    };

    // Error handling function to map Firebase errors to user-friendly messages
    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/missing-email':
                return 'Please provide an email address.';
            case 'auth/invalid-credential':
                return 'No account found with this email.';
            default:
                return 'An error occurred. Please try again later.';
        }
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#282C35' }}
            headerImage={
                <Image
                    source={require('../../assets/images/forgot.png')}
                    className="w-52 h-72 mt-10 mx-auto "
                />
            }
        >
            <View className='flex-1 justify-center items-center '>
                <ThemedText type='title' className='mb-4' >Forgot Password</ThemedText>

                <TextInput
                    placeholderTextColor={colorScheme === 'dark' ? '#A3A3A3' : '#666666'}
                    placeholder="Email"
                    value={email}
                    onChangeText={handleInputChange(setEmail)}
                    keyboardType="email-address"
                    className="w-full p-3 mb-2 text-white border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 "
                />

                {errorMessage && (
                    <Text style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</Text>
                )}

                {successMessage && (
                    <Text style={{ color: 'green', marginBottom: 8 }}>{successMessage}</Text>
                )}

                <Pressable onPress={handleForgotPassword} disabled={loading} className='bg-green-500 py-4  rounded-full w-full'>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className='text-center text-xl text-white font-semibold'>Send Reset Email</Text>
                    )}
                </Pressable>

                <View style={{ marginTop: 16 }}>
                    <ThemedText>
                        Remembered your password?{' '}
                        <Text style={{ color: '#007BFF', fontWeight: 'bold' }} onPress={() => router.replace('/(auth)/sign-in')}>Sign In</Text>
                    </ThemedText>
                </View>
            </View>
        </ParallaxScrollView>
    );
};

export default ForgotPassword;
