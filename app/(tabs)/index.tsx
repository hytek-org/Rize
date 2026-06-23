import { Button } from '@/components/ui/Button';
import { ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView 
      className="flex-1 bg-zinc-50 dark:bg-zinc-950" 
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Insight */}
      <View className="mb-16">
        <Text className="font-inter-bold text-[40px] text-zinc-900 dark:text-white tracking-tight mb-8 leading-tight">
          Good Morning, Kuldeep.
        </Text>
        
        <Text className="font-inter-medium text-xl text-momentum mb-6">
          You have built momentum for 12 days.
        </Text>
        
        <Text className="font-inter text-[19px] text-zinc-600 dark:text-zinc-300 mb-2 leading-relaxed">
          Today is ideal for strategic work.
        </Text>
        
        <Text className="font-inter text-[19px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Protect your focus between{'\n'}9:30 AM and 12:15 PM.
        </Text>
      </View>

      {/* Primary Action */}
      <View className="mb-16">
        <Button title="Focus Session" variant="primary" />
      </View>

      {/* Key Metrics */}
      <View className="gap-8 px-2">
        <View>
          <Text className="font-inter-semibold text-xs text-zinc-500 uppercase tracking-widest mb-1">
            Momentum Score
          </Text>
          <Text className="font-inter-bold text-[32px] text-zinc-900 dark:text-white tracking-tight">87<Text className="text-xl text-zinc-500">%</Text></Text>
        </View>

        <View>
          <Text className="font-inter-semibold text-xs text-zinc-500 uppercase tracking-widest mb-1">
            Growth Trend
          </Text>
          <Text className="font-inter-bold text-[32px] text-momentum tracking-tight">+12% <Text className="font-inter-medium text-base text-zinc-500 tracking-normal lowercase">this week</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
}
