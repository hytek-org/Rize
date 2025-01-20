import { router, Tabs, } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBarIcon, TabCreateIcon, TabProfileIcon } from '@/components/navigation/TabBarIcon';
import FloatingPlayer from '@/components/podcast/FloatingPlayer';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const CreateDrawer = () => (
    <View className="absolute  w-full bottom-0 bg-white rounded-t-[4rem] shadow-lg px-4 pt-4">
      <View className='flex flex-row flex-wrap justify-center items-center'>
        <Pressable
          className="flex flex-col items-center px-4 py-3 space-x-3"
          onPress={() => { router.push('/(tabs)/create'); setIsDrawerOpen(false); }}
        >
          <IconSymbol name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
          <Text className="text-base font-medium text-zinc-900 dark:text-zinc-100">New Template</Text>
        </Pressable>

        <Pressable
          className="flex flex-col items-center px-4 py-3 space-x-3"
          onPress={() => { router.push('/(tabs)/create'); setIsDrawerOpen(false); }}
        >
          <IconSymbol name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
          <Text className="text-base font-medium text-zinc-900 dark:text-zinc-100">Quick Task</Text>
        </Pressable>

        <Pressable
          className="flex flex-col items-center px-4 py-3 space-x-3"
          onPress={() => { router.push('/(tabs)/create'); setIsDrawerOpen(false); }}
        >
          <IconSymbol name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
          <Text className="text-base font-medium text-zinc-900 dark:text-zinc-100">New Note</Text>
        </Pressable>
      </View>

      <Pressable className='mx-auto' onPress={() => setIsDrawerOpen(!isDrawerOpen)}>
        <IconSymbol
          size={40}
          name={isDrawerOpen ? "close" : "add-circle-outline"}

        />
      </Pressable>
    </View >
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name={'home-outline'} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="lock-clock" color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <Pressable onPress={() => setIsDrawerOpen(!isDrawerOpen)}>
                <IconSymbol
                  size={30}
                  name={isDrawerOpen ? "close" : "add-circle-outline"}
                  color={color}
                />
              </Pressable>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent default navigation
              e.preventDefault();
              setIsDrawerOpen(!isDrawerOpen);
            },
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color }) => <TabCreateIcon name="filetext1" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'You',
            tabBarIcon: ({ color }) => <TabProfileIcon name='user' color={color} />,
          }}
        />
      </Tabs>
      {isDrawerOpen && <CreateDrawer />}
      <FloatingPlayer />
    </>
  );
}
