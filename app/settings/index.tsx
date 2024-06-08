import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View } from "react-native";

export default function Settings() {
  return (
    <View className="flex-1 items-center justify-center bg-red-500">
      <Text className="text-5xl font-bold">Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}
