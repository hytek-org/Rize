import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

type HeroProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function Hero({ title, subtitle, actionLabel = 'Get Started', onAction }: HeroProps) {
  return (
    <View className="px-6 pt-8 pb-6">
      <Text className="text-3xl font-bold text-white dark:text-white leading-tight mb-2">{title}</Text>
      {subtitle ? (
        <Text className="text-base text-zinc-200 dark:text-zinc-300 mb-4">{subtitle}</Text>
      ) : null}

      <Button title={actionLabel} onPress={onAction} />
    </View>
  );
}

export default Hero;
