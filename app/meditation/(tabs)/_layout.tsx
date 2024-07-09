import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from "react";

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(tabs)",
};

const Page = () => {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            }}
        >
            <Tabs.Screen
                name="nature-meditate"
                options={{
                    tabBarLabel: "Meditate",
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="flower-tulip"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="inspirations"
                options={{
                    tabBarLabel: "Inspirations",
                    tabBarIcon: ({ color }) => (
                        <Entypo name="open-book" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default Page;
