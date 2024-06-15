// FloatingButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { TabCreateIcon } from "@/components/navigation/TabBarIcon"; // Adjust the import according to your project structure

interface FloatingButtonProps {
  onPress: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <TabCreateIcon name={"pluscircleo"} size={24} color="white" />
    </TouchableOpacity>
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
