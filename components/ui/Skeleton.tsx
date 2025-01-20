import React from 'react';
import { DimensionValue, useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  className?: string;
}

export const Skeleton = ({ 
  width = '100%', 
  height = 20, 
  className = '' 
}: SkeletonProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const animatedStyle = useAnimatedStyle(() => {
    const progress = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0, { duration: 750 }),
      ),
      -1,
      true
    );

    return {
      width,
      height,
      backgroundColor: interpolateColor(
        progress,
        [0, 1],
        isDark 
          ? ['#27272a', '#3f3f46'] // dark mode colors (zinc-800 to zinc-700)
          : ['#e4e4e7', '#f4f4f5']  // light mode colors (zinc-200 to zinc-100)
      ),
    };
  }, [isDark]);

  return (
    <Animated.View
      className={`rounded-md overflow-hidden ${className}`}
      style={animatedStyle}
    />
  );
};
