import React, { useCallback } from 'react';
import { View, Text, Pressable, useColorScheme, Modal } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNoteModal: () => void;
}

const MENU_ITEMS = [
  { icon: 'lock-clock', label: 'Routines', route: '/(tabs)/create' },
  { icon: 'add-task', label: 'Add Task', route: '/(tabs)/tasks' },
  { icon: 'note-add', label: 'Quick Note', action: 'note' },
  { icon: 'podcasts', label: 'Podcasts', route: '/podcast' },
] as const;

export const DrawerMenu = React.memo(({ isOpen, onClose, onOpenNoteModal }: DrawerMenuProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const handleNavigate = useCallback((item: typeof MENU_ITEMS[number]) => {
    if (item.action === 'note') {
      onOpenNoteModal(); // Just trigger the note modal
      return; // Don't close drawer here, let the layout handle it
    }
    onClose();
    setTimeout(() => {
      router.push(item.route);
    }, 100);
  }, [onClose, onOpenNoteModal]);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      onRequestClose={onClose}
      animationType="slide"
    >
      <View className="flex-1">
        <Pressable
          className="absolute inset-0 bg-black/20"
          onPress={onClose}
        />
        <View className="absolute bottom-0 w-full bg-white dark:bg-zinc-900 rounded-t-[2rem] pb-8">
          <View style={{ paddingBottom: insets.bottom }}>
            {/* Drawer Handle */}
            <View className="w-12 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto my-3" />

            {/* Menu Grid */}
            <View className="flex-row flex-wrap justify-evenly px-4 pt-2">
              {MENU_ITEMS.map((item, index) => (
                <Pressable
                  key={index}
                  className="w-[25%]  items-center mb-4"
                  onPress={() => handleNavigate(item)}
                >
                  <View className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center mb-2">
                    <IconSymbol
                      name={item.icon}
                      size={26}
                      color={isDark ? '#fff' : '#000'}
                    />
                  </View>
                  <Text className="text-sm font-medium text-center text-zinc-900 dark:text-zinc-100">
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

DrawerMenu.displayName = 'DrawerMenu';
