
import React, { useState } from "react";
import { View, Text, Pressable, Linking, ScrollView, Switch, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from "@/contexts/AuthProvider";
import { updateProfile } from "firebase/auth";
import { useColorScheme } from 'react-native';
import { auth } from '../../firebase.config';
import { router } from "expo-router";
import CustomAlert from "@/components/CustomAlert";

export default function Settings() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const [loadingPersonal, setLoadingPersonal] = useState<boolean>(false);
  const [loadingnotification, setLoadingNotification] = useState<boolean>(false);
  const [loadingsecurity, setLoadingSecurity] = useState<boolean>(false);
  const [loadingappearance, setLoadingAppearance] = useState<boolean>(false);
  const [loadingacmanage, setLoadingAcmanage] = useState<boolean>(false);

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [password, setPassword] = useState('');
  // CustomAlert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning'>('error');
  const handleSaveProfile = async () => {
    if (user) {
      try {
        setLoadingPersonal(true);
        await updateProfile(auth.currentUser!, {
          displayName: name,

        });
        // Show success alert
        setAlertTitle("Success");
        setAlertMessage("Profile updated!");
        setAlertType("success");
        setAlertVisible(true);
      } catch (error) {
        // Show error alert
        setAlertTitle("Error");
        setAlertMessage("Could not update profile.");
        setAlertType("error");
        setAlertVisible(true);
      } finally {
        setLoadingPersonal(false);
      }
    }
  };
  const handleDeleteUser = () => {
    Alert.alert(
      "Account Deletion Request",
      "To delete your account, please send an email request to support@hytek.org.in. We'll process your request as soon as possible.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send Email",
          onPress: () => Linking.openURL('mailto:support@hytek.org.in'),
        },
      ]
    );
  };
  return (
    <ScrollView className="flex-1 bg-white dark:bg-zinc-950">
      {user ? <View className="p-6 mt-4">

        {/* App Management Section */}
        <Text className="text-xl font-bold text-gray-800 dark:text-neutral-200 mb-4">
          App Management
        </Text>
        <Text className="text-sm text-gray-600 dark:text-neutral-400 mb-8">
          Manage your name, password, and account settings.
        </Text>

        <View className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Personal Information Section */}
          <View className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-8">
            <Text className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-2">
              Personal Information
            </Text>
            <Text className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
              Update your name, photo, and other personal details.
            </Text>

            <View className="mb-4">
              <Text className="text-gray-800 dark:text-white mb-2">Name:</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#ccc"
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-sm text-gray-800 dark:text-white"
              />
            </View>



            <View className="mb-4">
              <Text className="text-gray-800 dark:text-white mb-2">Email:</Text>
              <TextInput
                value={email}
                editable={false}
                placeholder="Email"
                placeholderTextColor="#ccc"
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
              />
            </View>

            <Pressable onPress={handleSaveProfile} disabled={loadingPersonal} className="bg-green-500 dark:bg-green-600 py-2 px-4 rounded-full">
              {loadingPersonal ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg text-white text-center font-semibold">Save Changes</Text>
              )}
            </Pressable>
          </View>

          {/* Notification Settings Section */}
          <View className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-8">
            <Text className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-2">
              Notification Settings
            </Text>
            <Text className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
              Manage your notification preferences.
            </Text>

            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 dark:text-white">Push Notifications:</Text>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: "#ccc", true: "#34D399" }}
                thumbColor="#ffffff"
                className="transform scale-75"
              />
            </View>

            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 dark:text-white">Email Notifications:</Text>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: "#ccc", true: "#34D399" }}
                thumbColor="#ffffff"
                className="transform scale-75"
              />
            </View>
            <Pressable onPress={() => Alert.alert("Success", "Notification settings saved.")} disabled={loadingnotification} className="bg-green-500 dark:bg-green-600 py-2 px-4 rounded-full">
              {loadingnotification ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg text-white text-center font-semibold">Save Changes</Text>
              )}
            </Pressable>
          </View>

          {/* Security Settings Section */}
          <View className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-8">
            <Text className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-2">
              Security Settings
            </Text>
            <Text className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
              Manage your password and security preferences.
            </Text>

            <View className="mb-4">
              <Text className="text-gray-800 dark:text-white mb-2">Change Password:</Text>
              <TextInput
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                placeholderTextColor="#ccc"
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-sm text-gray-800 dark:text-white"
              />
            </View>
            <Pressable onPress={() => Alert.alert("Success", "Password updated successfully")} disabled={loadingsecurity} className="bg-green-500 dark:bg-green-600 py-2 px-4 rounded-full">
              {loadingsecurity ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg text-white text-center font-semibold">Save Changes</Text>
              )}
            </Pressable>
          </View>

          {/* Appearance Settings Section */}
          <View className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-8">
            <Text className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-2">
              Appearance Settings
            </Text>
            <Text className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
              Personalize the app's appearance.
            </Text>

            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 dark:text-white">Dark Mode:</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#ccc", true: "#34D399" }}
                thumbColor="#ffffff"
                className="transform scale-75"
              />
            </View>

            <Pressable onPress={() => Alert.alert("Success", "Appearance settings saved.")} disabled={loadingappearance} className="bg-green-500 dark:bg-green-600 py-2 px-4 rounded-full">
              {loadingappearance ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg text-white text-center font-semibold">Save Changes</Text>
              )}
            </Pressable>
          </View>

          {/* Account Management Section */}
          <View className="col-span-full bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-8 flex md:flex-row justify-between">
            <View>
              <Text className="text-lg font-bold text-gray-800 dark:text-neutral-200 mb-2">
                Account Management
              </Text>
              <Text className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
                Manage your account and preferences.
              </Text>
            </View>
            <Pressable onPress={handleDeleteUser} disabled={loadingacmanage} className="bg-red-500 dark:bg-red-600 py-2 px-4 rounded-full">
              {loadingacmanage ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg text-white text-center font-semibold">Delete Account</Text>
              )}
            </Pressable>
          </View>

        </View>
      </View> :
        <View className="flex-1 justify-center pt-96 px-20">
          <Pressable
            className='py-3 rounded-full items-center my-1 bg-green-500'
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text className='text-white font-semibold'>Sign Up</Text>
          </Pressable>
          <Pressable
            className='py-3 rounded-full items-center my-1 bg-black/5 dark:bg-white/10'
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text className='text-black dark:text-white font-semibold'>Sign In</Text>
          </Pressable>
        </View>

      }
      {/* Display Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        type={alertType}
      />
    </ScrollView>
  );
}


