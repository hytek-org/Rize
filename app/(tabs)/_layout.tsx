import { router, Tabs, } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBarIcon, TabCreateIcon, TabProfileIcon } from '@/components/navigation/TabBarIcon';
import FloatingPlayer from '@/components/podcast/FloatingPlayer';
import CustomAlert from '@/components/CustomAlert';
import { DrawerMenu } from '@/components/navigation/DrawerMenu';
import { NoteModal } from '@/components/notes/NoteModal';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [modalVisibleNotes, setModalVisibleNotes] = useState(false);
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error' as const
  });

  const handleNoteSuccess = () => {
    setAlertState({
      visible: true,
      title: 'Success',
      message: 'Note added successfully!',
      type: 'success'
    });
  };

  const handleNoteError = (message: string) => {
    setAlertState({
      visible: true,
      title: 'Error',
      message,
      type: 'error'
    });
  };

  const handleOpenDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleOpenNoteModal = useCallback(() => {
    handleCloseDrawer(); // Close drawer first
    setTimeout(() => {
      setModalVisibleNotes(true); // Then open note modal
    }, 300); // Increased delay for smoother transition
  }, [handleCloseDrawer]);

  const handleCloseNoteModal = useCallback(() => {
    setModalVisibleNotes(false);
  }, []);

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
              <IconSymbol
                size={30}
                name={isDrawerOpen ? 'close' : 'add-circle-outline'}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleOpenDrawer();
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

      <DrawerMenu 
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onOpenNoteModal={handleOpenNoteModal}
      />

      <NoteModal
        visible={modalVisibleNotes}
        onClose={handleCloseNoteModal}
        onSuccess={handleNoteSuccess}
        onError={handleNoteError}
      />

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState(prev => ({ ...prev, visible: false }))}
        type={alertState.type}
      />
      
      <FloatingPlayer />
    </>
  );
}
