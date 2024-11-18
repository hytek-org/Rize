import React from 'react';
import { View, Text, Pressable, Modal, Image } from 'react-native';

// Define the possible alert types
type AlertType = 'error' | 'success' | 'info' | 'warning';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type: AlertType; // Alert type can be 'error', 'success', 'info', or 'warning'
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, onClose, type }) => {
  // Define styles based on alert type
  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case 'error':
        return { backgroundColor: 'bg-red-100', textColor: 'text-red-800', icon: require('../assets/images/icon.png') };
      case 'success':
        return { backgroundColor: 'bg-green-100', textColor: 'text-green-800', icon: require('../assets/images/icon.png') };
      case 'info':
        return { backgroundColor: 'bg-blue-100', textColor: 'text-blue-800', icon: require('../assets/images/icon.png') };
      case 'warning':
        return { backgroundColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: require('../assets/images/icon.png') };
      default:
        return { backgroundColor: 'bg-white', textColor: 'text-black', icon: require('../assets/images/icon.png') };
    }
  };

  const { backgroundColor, textColor, icon } = getAlertStyles(type);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className={`w-80 p-5 rounded-xl ${backgroundColor} shadow-lg`}>
          <View className={`w-full p-2 rounded-md flex flex-row items-center justify-center mb-4 ${textColor}`}>
            {icon && <Image source={icon} className="w-5 h-5 mr-2 rounded-full" />}
            <Text className={`text-xl font-bold ${textColor}`}>{title}</Text>
          </View>
          <Text className="text-lg text-gray-800  text-center mb-5">{message}</Text>
          <Pressable onPress={onClose} className="py-2 px-5 w-32 mx-auto rounded-full bg-green-600 ">
            <Text className="text-white font-bold text-center text-lg">Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
