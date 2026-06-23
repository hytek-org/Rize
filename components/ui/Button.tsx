import React from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'ghost';
};

export function Button({ title, variant = 'primary', style, ...props }: ButtonProps) {
  const base = 'px-6 py-4 rounded-[20px] items-center justify-center w-full';
  const primary = 'bg-zinc-900 dark:bg-white active:bg-zinc-800 dark:active:bg-zinc-200';
  const ghost = 'bg-transparent border border-zinc-300 dark:border-zinc-700 active:bg-zinc-100 dark:active:bg-zinc-800/50';
  const textPrimary = 'text-white dark:text-black font-inter-semibold text-[17px]';
  const textGhost = 'text-zinc-900 dark:text-white font-inter-semibold text-[17px]';

  return (
    <Pressable
      className={`${base} ${variant === 'primary' ? primary : ghost}`}
      style={style}
      {...props}
    >
      <Text className={variant === 'primary' ? textPrimary : textGhost}>{title}</Text>
    </Pressable>
  );
}

export default Button;
