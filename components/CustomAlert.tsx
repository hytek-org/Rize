import React, { useEffect } from 'react';
import { View, Text, Modal, Animated, StatusBar } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

type AlertType = 'error' | 'success' | 'info' | 'warning';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type: AlertType;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, onClose, type }) => {
  const translateY = new Animated.Value(-100); // Changed from 100 to -100
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Show toast from top
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          mass: 1,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100, // Changed from 100 to -100
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => onClose());
  };

  const getToastStyles = (type: AlertType) => {
    switch (type) {
      case 'error':
        return { bgColor: 'bg-red-600', icon: 'error' };
      case 'success':
        return { bgColor: 'bg-green-600', icon: 'check-circle' };
      case 'info':
        return { bgColor: 'bg-blue-500', icon: 'info' };
      case 'warning':
        return { bgColor: 'bg-yellow-500', icon: 'warning' };
      default:
        return { bgColor: 'bg-zinc-800', icon: 'info' };
    }
  };

  const { bgColor, icon } = getToastStyles(type);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1 items-center pointer-events-none">
        <StatusBar backgroundColor="rgba(0,0,0,0.3)" />
        <Animated.View 
          style={{ 
            transform: [{ translateY }],
            opacity,
          }}
          className={`${bgColor} px-4 py-3 rounded-lg mx-4 flex-row items-center shadow-lg w-[90%] max-w-md mt-8`}
        >
          <IconSymbol  name={icon} size={24} color="white"  />
          <View className="ml-3 flex-1">
            <Text className="text-white font-medium">{title}</Text>
            {message && (
              <Text className="text-white/90 text-sm mt-1">{message}</Text>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
