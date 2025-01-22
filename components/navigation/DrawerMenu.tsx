import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable, useColorScheme, useWindowDimensions, BackHandler } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Animation configuration
const SPRING_CONFIG = {
  damping: 15,
  mass: 0.6,
  stiffness: 120,
  overshootClamping: false,
  restSpeedThreshold: 0.3,
  restDisplacementThreshold: 0.3,
};

const TIMING_CONFIG = {
  duration: 150,
};

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNoteModal: () => void;
}

const MENU_ITEMS = [
  { icon: 'lock-clock', label: 'Routines', route: '/(tabs)/create' },
  { icon: 'add-task', label: 'Quick Task', route: '/(tabs)/tasks' },
  { icon: 'note-add', label: 'Quick Note', action: 'note' },
  { icon: 'podcasts', label: 'Podcast', route: '/podcast' },
] as const;

export const DrawerMenu = React.memo(({ isOpen, onClose, onOpenNoteModal }: DrawerMenuProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);

  const handleNavigate = useCallback((item: typeof MENU_ITEMS[number]) => {
    if (item.action === 'note') {
      onOpenNoteModal();
      onClose;
    } else {
      router.push(item.route);
    }
    onClose();
  }, [onClose, onOpenNoteModal]);

  // Handle back button press for Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpen) {
        onClose(); // Close modal when back button is pressed
        return true; // Indicate we handled the event
      }
      return false; // Default back press behavior
    });

    // Cleanup back handler on component unmount
    return () => backHandler.remove();
  }, [isOpen, onClose]);
  React.useEffect(() => {
    // Faster spring animation for opening/closing
    translateY.value = withSpring(
      isOpen ? 0 : height,
      SPRING_CONFIG
    );
  }, [isOpen, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }), []);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 1 : 0, TIMING_CONFIG),
    pointerEvents: isOpen ? 'auto' : 'none',
  }));

  const handlePressBackdrop = useCallback(() => {
    // Trigger close with spring animation
    translateY.value = withSpring(height, {
      ...SPRING_CONFIG,
      velocity: 20, // Add initial velocity for faster closing
    });
    onClose();
  }, [height, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <Animated.View
        style={backdropAnimatedStyle}
        className="absolute inset-0 bg-black/20"
      >
        <Pressable
          className="flex-1"
          onPress={handlePressBackdrop}
        />
      </Animated.View>

      <Animated.View
        style={[animatedStyle]}
        className="absolute z-10 bottom-0 w-full bg-white dark:bg-zinc-900 rounded-t-[2rem] pb-8"
      >
        <View style={{ paddingBottom: insets.bottom }}>
          {/* Drawer Handle */}
          <View className="w-12 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto my-3" />

          {/* Menu Grid */}
          <View className="flex-row flex-wrap justify-evenly px-4 pt-2">
            {MENU_ITEMS.map((item, index) => (
              <Pressable
                key={index}
                className="w-[25%] items-center mb-4"
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
      </Animated.View>
    </>
  );
});

DrawerMenu.displayName = 'DrawerMenu';
