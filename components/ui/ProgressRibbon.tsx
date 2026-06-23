import React from 'react';
import { View, type DimensionValue, type ViewProps } from 'react-native';

type ProgressRibbonProps = ViewProps & {
  value: number; // 0..1
  height?: number;
};

export function ProgressRibbon({ value, height = 12, style, ...rest }: ProgressRibbonProps) {
  const pct: DimensionValue = `${Math.max(0, Math.min(1, value)) * 100}%`;

  return (
    <View className="w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden" style={[{ height }, style]} {...rest}>
      <View className="h-full bg-momentum" style={{ width: pct }} />
    </View>
  );
}

export default ProgressRibbon;
