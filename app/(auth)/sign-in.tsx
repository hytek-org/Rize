import React, { useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator, Image, Text, useColorScheme } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from '@/components/ParallaxScrollView';

// Error handling function to map Firebase errors to user-friendly messages
const getErrorMessage = (errorCode: string): string => {

    switch (errorCode) {
        case 'auth/invalid-credential':
            return 'No account found with this email. Please check your email or sign up.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/missing-password':
            return 'Please enter a password.';
        default:
            return 'An error occurred. Please try again later.';
    }
};

const SignIn: React.FC = () => {
    const [checked, setChecked] = useState(false);
    const colorScheme = useColorScheme();
    const handlePress = () => {
        setChecked(!checked);
    };
    const { setUser } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter(value);
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setUser(user); // Set user in conThemedText
            await AsyncStorage.setItem('hasSeenGetStarted', 'false');
            router.replace('/(tabs)'); // Adjust the route as per your navigation setup
        } catch (error) {
            const errorCode = (error as { code: string }).code;
            setErrorMessage(getErrorMessage(errorCode)); // Show custom error message


        } finally {
            setLoading(false);
        }
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#282C35' }}
            headerImage={
                <Image
                    source={require('../../assets/images/signin.png')}
                    className="w-52 h-72 mt-10 mx-auto "
                />
            }
        >
            <View className='flex-1 justify-center items-center ' >
                <ThemedText type='title' className='mb-4' >Sign In</ThemedText>

                <TextInput
                    placeholderTextColor={colorScheme === 'dark' ? '#A3A3A3' : '#666666'}
                    placeholder="Email"
                    value={email}
                    onChangeText={handleInputChange(setEmail)}
                    keyboardType="email-address"
                    className="w-full p-3 mb-2 text-black dark:text-white border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 "
                />

                <TextInput
                    placeholderTextColor={colorScheme === 'dark' ? '#A3A3A3' : '#666666'}
                    placeholder="Password"
                    value={password}
                    onChangeText={handleInputChange(setPassword)}
                    secureTextEntry
                    className="w-full p-3 mb-2 text-black dark:text-white border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 "
                />
                <View className='flex flex-row justify-between  items-center w-full py-4 '>
                    <Pressable onPress={handlePress} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                            height: 24,
                            width: 24,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: 'zinc',
                            backgroundColor: checked ? '#28a745' : 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8,
                        }}>
                            {checked && <ThemedText style={{ color: 'white' }}>✓</ThemedText>}
                        </View>
                        <ThemedText>Remember me</ThemedText>
                    </Pressable>
                    <Text className='text-blue-500 dark:text-white ' onPress={() => router.navigate('/(auth)/forgot')}>
                        Forgot Password?
                    </Text>
                </View>
                {errorMessage && (
                    <ThemedText style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</ThemedText>
                )}

                <Pressable onPress={handleSignIn} disabled={loading}
                    className='bg-green-500 py-4  rounded-full w-full'
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className='text-center text-xl text-white font-semibold'>Sign In</Text>
                    )}
                </Pressable>

                <View style={{ marginTop: 16 }}>
                    <ThemedText>
                        Don't have an account?{' '}
                        <ThemedText style={{ color: '#007BFF', fontWeight: 'bold' }} onPress={() => router.replace('/(auth)/sign-up')}>Sign Up</ThemedText>
                    </ThemedText>

                </View>
            </View>
        </ParallaxScrollView>
    );
};

export default SignIn;
