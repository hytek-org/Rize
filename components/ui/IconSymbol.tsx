import React from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Mapping SF Symbols to Material Icons for cross-platform consistency
const MAPPING: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  "house.fill": "home",
  "sort-by-alpha": "sort-by-alpha",
  "sort": "sort",
  "checklist": "checklist",
  "podcasts": "podcasts",
  "forward-30": "forward-30",
  "replay-30": "replay-30",
  "play-arrow": "play-arrow",
  "pause": "pause",
  "close": "close",
  "wb-sunny": "wb-sunny",
  "nights-stay": "nights-stay",
  "lock-clock": "lock-clock",
  "add-task": "add-task",
  "task-alt": "task-alt",
  "mode-edit-outline": "mode-edit-outline",
  "note-add": "note-add",
  "create": "create",
  "add-circle-outline": "add-circle-outline",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "filter-list": "filter-list",
  "filter-list-off": "filter-list-off",
  "circle": "circle",
  "remove-circle-outline": "remove-circle-outline",
  "keyboard-arrow-up": "keyboard-arrow-up",
  "keyboard-arrow-down": "keyboard-arrow-down",
  "error": "error",
  "check-circle": "check-circle",
  "info": "info",
  "warning": "warning",
};

// Define allowed icon names based on the mapping
export type IconSymbolName = keyof typeof MAPPING;

/**
 * A cross-platform icon component using SF Symbols on iOS and Material Icons on Android/Web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>; // ✅ Fixed type from ViewStyle to TextStyle
}) {
  return (
    <MaterialIcons
      name={MAPPING[name] || "help-outline"} // Fallback to "help-outline" if icon is missing
      size={size}
      color={color}
      style={style} // Now correctly typed as TextStyle
    />
  );
}
