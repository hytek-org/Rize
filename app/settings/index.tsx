import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch,TextInput } from 'react-native';

export default function History() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-zinc-950">
    <View className="p-6 mt-4">
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
          Update your name, email, and other personal details.
        </Text>

        <View className="mb-4">
          <Text className="text-gray-800 dark:text-white mb-2">Name:</Text>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#ccc"
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-sm text-gray-800 dark:text-white"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-800 dark:text-white mb-2">Email:</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#ccc"
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-sm text-gray-800 dark:text-white"
          />
        </View>

        <TouchableOpacity
          className="bg-blue-500 dark:bg-blue-600 py-2 px-4 rounded-md text-white text-center"
          onPress={() => {}}
        >
          <Text className="text-sm font-semibold">Save Changes</Text>
        </TouchableOpacity>
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
            value={true}
            trackColor={{ false: "#ccc", true: "#34D399" }}
            thumbColor="#ffffff"
            className="transform scale-75"
          />
        </View>

        <View className="flex flex-row justify-between items-center mb-4">
          <Text className="text-gray-800 dark:text-white">Email Notifications:</Text>
          <Switch
            value={true}
            trackColor={{ false: "#ccc", true: "#34D399" }}
            thumbColor="#ffffff"
            className="transform scale-75"
          />
        </View>

        <TouchableOpacity
          className="bg-blue-500 dark:bg-blue-600 py-2 px-4 rounded-md text-white text-center"
          onPress={() => {}}
        >
          <Text className="text-sm font-semibold">Save Changes</Text>
        </TouchableOpacity>
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
            placeholder="Enter new password"
            placeholderTextColor="#ccc"
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-sm text-gray-800 dark:text-white"
          />
        </View>

        <TouchableOpacity
          className="bg-blue-500 dark:bg-blue-600 py-2 px-4 rounded-md text-white text-center"
          onPress={() => {}}
        >
          <Text className="text-sm font-semibold">Change Password</Text>
        </TouchableOpacity>
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
            value={true}
            trackColor={{ false: "#ccc", true: "#34D399" }}
            thumbColor="#ffffff"
            className="transform scale-75"
          />
        </View>

        <TouchableOpacity
          className="bg-blue-500 dark:bg-blue-600 py-2 px-4 rounded-md text-white text-center"
          onPress={() => {}}
        >
          <Text className="text-sm font-semibold">Save Changes</Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          className=" w-52 bg-red-500 dark:bg-red-600 py-2 px-4 rounded-md text-white text-center"
          onPress={() => {}}
        >
          <Text className="text-lg md:text-2xl md:mt-3 font-semibold text-white/90">Delete Account</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  </ScrollView>
  );
}
