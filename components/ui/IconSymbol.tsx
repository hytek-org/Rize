// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'sort-by-alpha': 'sort-by-alpha',
  'sort': 'sort',
  'checklist': 'checklist',
  'podcasts': 'podcasts',
  'forward-30': 'forward-30',
  'replay-30': 'replay-30',
  'play-arrow': 'play-arrow',
  'pause': 'pause',
  'close': 'close',
  'wb-sunny': 'wb-sunny',
  'nights-stay': 'nights-stay',
  'lock-clock': 'lock-clock',
  'add-task': 'add-task',
  'task-alt': 'task-alt',
  'note-add': 'note-add',
  'create': 'create',
  'add-circle-outline': 'add-circle-outline',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'filter-list': 'filter-list',
  'filter-list-off': 'filter-list-off',
  'circle': 'circle',
  'remove-circle-outline': 'remove-circle-outline',

  
  // Alert icons
  'error': 'error',
  'check-circle': 'check-circle',
  'info': 'info',
  'warning': 'warning',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]}    />;
}
