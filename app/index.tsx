import {  StyleSheet, Text, View, Pressable,  Image } from 'react-native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';


const Index: React.FC = () => {
  const router = useRouter();
   useEffect(() => {
     const checkIfFirstTime = async () => {
       try {
         const hasSeenGetStarted = await AsyncStorage.getItem('hasSeenGetStarted');
         if (hasSeenGetStarted === 'true') {
           router.replace('/(tabs)'); 
         }
       } catch (error) {
         console.error('Failed to check AsyncStorage', error);
       }
     };

     checkIfFirstTime();
   }, [router]);

   const handleGetStarted = async () => {
     try {
       await AsyncStorage.setItem('hasSeenGetStarted', 'true');
       router.replace('/(tabs)'); // Use replace to ensure the user cannot go back
     } catch (error) {
       console.error('Failed to set AsyncStorage', error);
     }
   };

  return (
    <View className='flex-1 justify-center items-center bg-black'>


      {/* Background Image */}
      <View className='p-20' style={styles.imageDiv} >
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.bgImage}

        />
      </View>

      {/* Brand Name */}
      <Text style={styles.brandName}>Rize</Text>

      {/* Content */}
      <View
        className='flex-1 w-full justify-end'

      >
        <View className='bg-zinc-900 border-2  border-white/30 border-se-0 rounded-t-3xl p-5'>
          <Text style={styles.heading} className='text-center'>Welcome to Rize</Text>
          <Text style={styles.subheading} className='text-center'>Let's keep the momentum going.</Text>
          <View className='px-2'>
            <Pressable
              onPress={()=> router.replace('/(auth)/sign-up')}
              className='mt-4 w-auto py-3 px-4 rounded-full  bg-white/90 '
            >
              <Text className='text-black text-center text-lg font-semibold'>Sign up</Text>
            </Pressable>
            <Pressable
               onPress={()=> router.replace('/(auth)/sign-in')}
              className='mt-4 w-auto py-3 px-4 rounded-full bg-white/10  '
            >
              <Text className='text-white text-center text-lg font-semibold'>Sign in</Text>
            </Pressable>
            <View className="border-t w-11/12 mx-auto border-white/50 mt-4" />
            <Pressable
              onPress={handleGetStarted}
              className='mt-4 w-auto py-3 px-4 rounded-full bg-transparent border  border-white/50 '
            >
              <Text className='text-white text-center text-lg font-semibold'>Continue as Guest</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({

  imageDiv: {
    ...StyleSheet.absoluteFillObject,
  },
  bgImage: {
    width: '100%',
    height: '70%',
    opacity: 0.5,
  },
  brandName: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
    
  },

  getStartedButton: {
    marginTop: 16,
    width: 200,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
