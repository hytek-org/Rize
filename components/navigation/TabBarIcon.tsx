import React from 'react';
import { StyleProp, TextStyle, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { IconProps } from '@expo/vector-icons/build/createIconSet';
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

// Define type for icon props with style, color, and className support
type CustomIconProps<T extends string> = IconProps<T> & {
  style?: StyleProp<TextStyle>;
  color?: string; // Allow custom color
  className?: string; // Allow custom tailwind-like className
};

// Default icon component with conditional styling based on theme and explicit color support
export function TabBarIcon({ style, color, className, ...rest }: CustomIconProps<React.ComponentProps<typeof Ionicons>['name']>) {
  const themeColor = useColorScheme() === 'dark' ? 'white' : 'black';  // Default theme-based color
  const iconColor = color || themeColor;  // Use the provided color or fallback to theme color

  return (
    <Ionicons
      className={className} // Use Tailwind-like class names for styling
      size={28}
      style={[{ marginBottom: -3, color: iconColor }, style]} // Apply conditional color
      {...rest}
    />
  );
}

export function TabCreateIcon({ style, color, className, ...rest }: CustomIconProps<React.ComponentProps<typeof AntDesign>['name']>) {
  const themeColor = useColorScheme() === 'dark' ? 'white' : 'black';
  const iconColor = color || themeColor;

  return (
    <AntDesign
      className={className}
      size={28}
      style={[{ marginBottom: -3, color: iconColor }, style]}
      {...rest}
    />
  );
}

export function TabTaskIcon({ style, color, className, ...rest }: CustomIconProps<React.ComponentProps<typeof MaterialIcons>['name']>) {
  const themeColor = useColorScheme() === 'dark' ? 'white' : 'black';
  const iconColor = color || themeColor;

  return (
    <MaterialIcons
      className={className}
      size={28}
      style={[{ marginBottom: -3, color: iconColor }, style]}
      {...rest}
    />
  );
}

export function TabProfileIcon({ style, color, className, ...rest }: CustomIconProps<React.ComponentProps<typeof FontAwesome5>['name']>) {
  const themeColor = useColorScheme() === 'dark' ? 'white' : 'black';
  const iconColor = color || themeColor;

  return (
    <FontAwesome5
      className={className}
      size={28}
      style={[{ marginBottom: -3, color: iconColor }, style]}
      {...rest}
    />
  );
}

export function TabFontAwesomenew({ style, color, className, ...rest }: CustomIconProps<React.ComponentProps<typeof FontAwesome6>['name']>) {
  const themeColor = useColorScheme() === 'dark' ? 'white' : 'black';
  const iconColor = color || themeColor;

  return (
    <FontAwesome6
      className={className}
      size={28}
      style={[{ marginBottom: -3, color: iconColor }, style]}
      {...rest}
    />
  );
}
