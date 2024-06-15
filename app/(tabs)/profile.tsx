import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform,useColorScheme,View,Text } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  return (
    <ParallaxScrollView 
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={150} name="man" style={styles.headerImage}   />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Profile</ThemedText>
      </ThemedView>
      <View className='mx-auto'>
      <Link href="/settings" className='dark:text-white border border-black rounded-lg py-2 dark:border-white text-center  w-52'> <ThemedText type='subtitle'>View Settings</ThemedText></Link>
      </View>
      <ThemedText>This information will be displayed publicly so be careful what you share.</ThemedText>
     
      <View className='border-b-[1px] border-b-[rgba(0,0,0,0.1)] dark:border-b-white/50 pb-12' >
      <Text className='text-base font-semibold leading-7 text-gray-900 dark:text-gray-50'>Notifications</Text>
      <Text className='mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300'>
        We'll always let you know about important changes, but you pick what else you want to hear about.
      </Text>

      <View className='mt-10 space-y-10'>
        {/* Email Notifications */}
        <View>
          <Text className='text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50'>By Email</Text>
          <View className='mt-6 space-y-6'>
            {/* Checkbox for Comments */}
            <View className='relative flex gap-x-3'>
              {/* <CheckBox /> */}
              <View className='ml-4'>
                <Text className='font-medium text-gray-900 dark:text-gray-50'>Comments</Text>
                <Text className='text-gray-500 dark:text-gray-200'>Get notified when someone posts a comment on a posting.</Text>
              </View>
            </View>

            {/* Checkbox for Candidates */}
            <View className='relative flex gap-x-3'>
              {/* <CheckBox /> */}
              <View className="ml-10">
                <Text className="font-medium text-gray-900 dark:text-gray-50">Candidates</Text>
                <Text className="text-gray-500 dark:text-gray-200">Get notified when a candidate applies for a job.</Text>
              </View>
            </View>

            {/* Checkbox for Offers */}
            <View className='relative flex gap-x-3'>
              {/* <CheckBox /> */}
              <View className="ml-10">
                <Text className="font-medium text-gray-900 dark:text-gray-50">Offers</Text>
                <Text className="text-gray-500 dark:text-gray-200">Get notified when a candidate accepts or rejects an offer.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Push Notifications */}
        <View style={{ marginTop: 20 }}>
          <Text className='text-base font-semibold leading-7 text-gray-900 dark:text-gray-50'>Push Notifications</Text>
          <Text className='font-medium text-gray-900 dark:text-gray-50'>
            These are delivered via SMS to your mobile phone.
          </Text>

          {/* Radio buttons for Push Notifications */}
          <View className='relative flex gap-x-3'>
            <View >
              {/* <RadioButton /> */}
              <Text className="text-gray-500 dark:text-gray-200">Everything</Text>
            </View>

            <View className='relative flex gap-x-3'>
              {/* <RadioButton /> */}
              <Text className="text-gray-500 dark:text-gray-200">Same as email</Text>
            </View>

            <View className='relative flex gap-x-3'>
              {/* <RadioButton /> */}
              <Text className="text-gray-500 dark:text-gray-200">No push notifications</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
     
     
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  headerImage: {
   alignSelf:'center',
   marginTop:60,
   backgroundColor:'#0aaf1d',
   borderRadius:90,
   padding:10,
   color:'white'
   
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

 