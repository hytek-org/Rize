import React from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { TabCreateIcon } from "@/components/navigation/TabBarIcon"; // Adjust the import according to your project structure

interface FloatingButtonProps {
  onPress: () => void;
  iconName?: string; // Optional icon name
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress, iconName }) => {
  const colorScheme = useColorScheme(); // For handling light/dark themes

  // Dynamically adjust the background color based on the theme
  const buttonColor = colorScheme === 'dark' ? '#1db954' : '#0aaf1d'; // Green shades for light and dark mode
  const icon: string = iconName ? iconName : "pluscircleo";
  return (
    <Pressable
      style={[styles.button, { backgroundColor: buttonColor }]}
      onPress={onPress}
    >
      {/* Icon rendered with a fallback to 'pluscircleo' */}
      <TabCreateIcon name={icon} size={24} color="white" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
    right: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FloatingButton;
