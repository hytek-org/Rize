import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { TabTaskIcon } from '@/components/navigation/TabBarIcon';
import { IconSymbol } from '@/components/ui/IconSymbol';
import FloatingLink from '@/components/FlotingLink';
import CustomAlert from '@/components/CustomAlert';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [loadingLogout, setLoadingLogout] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // CustomAlert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning'>('error');
  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
      await AsyncStorage.setItem('hasSeenGetStarted', 'false');
      setAlertTitle('Logged out');
      setAlertMessage('You have been logged out.');
      setAlertType('success');
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle('Error');
      setAlertMessage('Could not log out. Please try again.');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <Ionicons name="person-circle-outline" size={150} style={styles.headerImage} />
        }
      >
        <View style={styles.container} className='pt-20 '>
          {/* Profile Card */}

          <View className="bg-white dark:bg-black py-10 rounded-xl items-center shadow-md shadow-black mt-[-10]"
          >
            <ThemedText style={
              colorScheme === "dark"
                ? stylesDark.userName
                : styles.userName
            }>{user ? user.displayName || 'User' : 'Guest User'}</ThemedText>
            <View style={styles.infoContainer}>
              <ThemedText style={
                colorScheme === "dark"
                  ? stylesDark.infoText
                  : styles.infoText
              } >{user?.email || 'Not Available'}</ThemedText>
              {user?.emailVerified && <TabTaskIcon name="verified-user" size={20} style={
                styles.verifiedIcon
              } />}
            </View>

            <Link href="/settings" style={styles.settingsLink}>
              <Ionicons name="settings-outline" size={24} color={colorScheme === "dark"
                ? '#fff'
                : '#555'} />
            </Link>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {user ? (
              <Pressable
                className='py-3 rounded-full w-52 mx-auto mb-12 items-center my-1 bg-red-600'
                onPress={handleLogout}
                disabled={loadingLogout}
              >
                {loadingLogout ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className='text-white font-semibold'>Logout</Text>
                )}
              </Pressable>
            ) : (
              <>

                <Pressable className='py-3 rounded-full w-52 mx-auto items-center my-1 bg-green-500'

                  onPress={() => router.push('/(auth)/sign-up')}
                >
                  <Text className='text-white font-semibold'>Sign Up</Text>
                </Pressable>
                <Pressable
                  className='py-3 rounded-full items-center w-52 mx-auto my-1 bg-black/5 dark:bg-white/10 '
                  onPress={() => router.push('/(auth)/sign-in')}
                >
                  <Text className='text-black dark:text-white font-semibold'>Sign In</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Display Custom Alert */}
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
          type={alertType}
        />
      </ParallaxScrollView>
      <FloatingLink route='/podcast' iconName='podcasts' />

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
  },
  headerImage: {
    alignSelf: 'center',
    marginTop: 60,
    backgroundColor: '#0aaf1d',
    borderRadius: 90,
    padding: 10,
    color: 'white'
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
  },
  verifiedIcon: {
    color: '#0aaf1d',
    marginLeft: 8,
  },
  settingsLink: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  actionContainer: {
    marginTop: 20,
    width: '100%',
  }

});


const stylesDark = StyleSheet.create({
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#f1f1f1',
  },
})