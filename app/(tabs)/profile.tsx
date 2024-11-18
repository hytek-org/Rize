import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
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

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [loadingLogout, setLoadingLogout] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
      await AsyncStorage.setItem('hasSeenGetStarted', 'false');
      Alert.alert("Logged out", "You have been logged out.");
    } catch (error) {
      Alert.alert("Error", "Could not log out. Please try again.");
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
      <View style={styles.container} className='pt-32'>
        {/* Profile Card */}

        <View className="bg-white dark:bg-black  p-10 rounded-xl items-center shadow-md shadow-black mt-[-10]"
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
            } >Email: {user?.email || 'Not Available'}</ThemedText>
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
              className='py-3 rounded-full items-center my-1 bg-red-600'
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

              <Pressable className='py-3 rounded-full items-center my-1 bg-green-500'

                onPress={() => router.push('/(auth)/sign-up')}
              >
                <Text className='text-white font-semibold'>Sign Up</Text>
              </Pressable>
              <Pressable
                className='py-3 rounded-full items-center my-1 bg-black/5 dark:bg-white/10 '
                onPress={() => router.push('/(auth)/sign-in')}
              >
                <Text className='text-black dark:text-white font-semibold'>Sign In</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
  
      
    </ParallaxScrollView>
    <FloatingLink route='/podcast' iconName='podcasts' />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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