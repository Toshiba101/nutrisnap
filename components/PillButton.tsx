import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}

export default function PillButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
}: PillButtonProps) {
  const isDisabled = disabled || loading;
  const base = "w-full py-4 rounded-full items-center justify-center flex-row";
  const styles = {
    primary: `${base} bg-accent`,
    outline: `${base} bg-transparent border border-line`,
    ghost: `${base} bg-surface2`,
  }[variant];
  const textStyles = {
    primary: "text-bg font-bold text-base",
    outline: "text-text font-semibold text-base",
    ghost: "text-text font-semibold text-base",
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${styles} ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#0E0E10" : "#F5F5F7"} />
      ) : (
        <Text className={textStyles}>{label}</Text>
      )}
    </Pressable>
  );
}
