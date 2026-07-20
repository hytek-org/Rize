import { Pressable, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  return (
    <View className="flex-1 px-8 pt-20 bg-white dark:bg-black">
      <Text className="text-[#12D18E] font-medium text-xs tracking-widest uppercase mb-3">RIZE</Text>
      <Text className="text-black dark:text-white font-medium text-4xl tracking-tight mb-6">Your momentum starts here.</Text>
      
      <View className="w-full p-6 rounded-[28px] bg-neutral-50 border border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800 mb-6">
        <Text className="font-medium text-base text-black dark:text-white mb-1.5">Account Status</Text>
        <Text className="font-normal text-sm text-neutral-500 dark:text-neutral-400 mb-2">{user?.email ?? 'Signed in'}</Text>
        {user && !user.emailVerified ? (
          <Text className="font-medium text-amber-600 dark:text-amber-400 text-sm mt-2">Check your inbox to verify your email address.</Text>
        ) : null}
      </View>
      
      <View className="flex-1 justify-end pb-12">
        <Pressable 
          onPress={signOut} 
          className="w-full h-14 rounded-full bg-[#12D18E] items-center justify-center active:opacity-85 active:scale-[0.985] transition-all"
        >
          <Text className="text-black font-medium text-[15px] tracking-wide">Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}
