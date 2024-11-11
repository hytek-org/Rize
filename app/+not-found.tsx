import { Link, Stack } from 'expo-router';
import {  View,Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="bg-white dark:bg-black">
      <ThemedView className='mx-auto max-w-sm flex flex-col justify-center items-center h-screen'>
     
        <Text className='text-2xl font-semibold'>This screen doesn't exist.</Text>
        <Link href="/" >
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
      </View>
     
    </>
  );
}


