import React from 'react';
import { View, Text, TouchableOpacity, Image,ScrollView } from 'react-native';


export default function Guide() {
    // State for active tab
    const [activeTab, setActiveTab] = React.useState(1);

    return (
        <ScrollView >
        <View className="px-4 py-10 sm:px-6  lg:py-14 mx-auto  ">
            <View className="flex flex-col sm:flex-row-reverse ">
            <View className="flex-1 ">
                <Text className="text-2xl text-gray-800 font-bold dark:text-neutral-200 ">
                    Fully customizable rules to match your unique needs
                </Text>
                <View className="mt-10">
                    <TouchableOpacity onPress={() => setActiveTab(1)} className="p-4 mb-5 rounded-xl bg-white shadow-md">
                        <Text className="text-lg font-semibold text-blue-600">Advanced tools</Text>
                        <Text>Use Preline thoroughly thought and automated libraries to manage your businesses.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab(2)} className="p-4 mb-5 rounded-xl bg-white shadow-md">
                        <Text className="text-lg font-semibold text-blue-600">Smart dashboards</Text>
                        <Text>Quickly Preline sample components, copy-paste codes, and start right off.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab(3)} className="p-4 mb-5  rounded-xl bg-white shadow-md">
                        <Text className="text-lg font-semibold text-blue-600">Powerful features</Text>
                        <Text>Reduce time and effort on building modern look design with Preline only.</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex-1 w-full mr-5  ">
                {activeTab === 1 && <Image className="w-full h-full shadow-xl shadow-gray-200 rounded-xl dark:shadow-gray-900/20" source={{ uri: 'https://images.unsplash.com/photo-1605629921711-2f6b00c6bbf4' }}  />}
                {activeTab === 2 && <Image className="w-full h-full shadow-xl shadow-gray-200 rounded-xl dark:shadow-gray-900/20" source={{ uri: 'https://images.unsplash.com/photo-1665686306574-1ace09918530' }}  />}
                {activeTab === 3 && <Image className="w-full h-full shadow-xl shadow-gray-200 rounded-xl dark:shadow-gray-900/20" source={{ uri: 'https://images.unsplash.com/photo-1598929213452-52d72f63e307' }}  />}
            </View>
           
            </View>
          
           
        </View>
        </ScrollView>
    );
}
