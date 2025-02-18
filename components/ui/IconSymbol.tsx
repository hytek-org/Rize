import React from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const MAPPING: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  // Basic UI icons
  "close": "close",
  "edit": "edit",
  "delete": "delete",
  "add-circle": "add-circle",
  "remove-circle-outline": "remove-circle-outline",
  
  // Task related icons
  "schedule": "schedule",
  "task-alt": "task-alt",
  "add-task": "add-task",
  "check-circle": "check-circle",
  "radio-button-unchecked": "radio-button-unchecked",
  "expand-more": "expand-more",
  "expand-less": "expand-less",
  "mode-edit-outline": "edit",
  
  // Navigation icons
  "wb-sunny": "wb-sunny",
  "nights-stay": "nights-stay",
  "lock-clock": "lock-clock",
  
  // Status icons
  "info": "info",
  "warning": "warning",
  "error": "error",
  "check": "check",
  
  // Additional UI elements
  "keyboard-arrow-up": "keyboard-arrow-up",
  "keyboard-arrow-down": "keyboard-arrow-down",
  "filter-list": "filter-list",
  "filter-list-off": "filter-list-off",
  "chevron-right": "chevron-right",
};

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <MaterialIcons
      name={MAPPING[name] || "help-outline"}
      size={size}
      color={color}
      style={style}
    />
  );
}
