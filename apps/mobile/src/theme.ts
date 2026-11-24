import { useColorScheme } from "react-native";

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  success: string;
  warning: string;
  danger: string;
};

const lightColors: ThemeColors = {
  background: "#F7F6F3",
  surface: "#FFFFFF",
  surfaceAlt: "#EFECE6",
  text: "#18181B",
  textMuted: "#6B7280",
  border: "#E2DFD7",
  primary: "#E85D2A",
  primaryText: "#FFFFFF",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
};

const darkColors: ThemeColors = {
  background: "#121316",
  surface: "#1C1E24",
  surfaceAlt: "#262932",
  text: "#F4F4F5",
  textMuted: "#9CA3AF",
  border: "#2E323D",
  primary: "#FF6B35",
  primaryText: "#FFFFFF",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  title: 28,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export type Theme = {
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  radius: typeof radius;
};

export function useTheme(): Theme {
  const isDark = useColorScheme() === "dark";
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    spacing,
    fontSize,
    radius,
  };
}
