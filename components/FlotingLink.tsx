// FloatingLink.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { TabCreateIcon, TabTaskIcon } from "@/components/navigation/TabBarIcon"; // Adjust the import according to your project structure
import { Link } from 'expo-router';

interface FloatingLinkProps {
  route: string; // Route to navigate to when the button is pressed
  iconName?: string; // Optional icon name
}

const FloatingLink: React.FC<FloatingLinkProps> = ({ route,iconName }) => {
  return (
    <Link href={route} asChild>
      <TouchableOpacity style={styles.button}>
        <TabTaskIcon name={iconName?iconName:'add-circle-outline'} size={28} color="white" />
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0aaf1d',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 60,
    right: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FloatingLink;
