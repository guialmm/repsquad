import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme";

type PlaceholderScreenProps = {
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

export function PlaceholderScreen({ title, description, icon }: PlaceholderScreenProps) {
  const { colors, spacing, fontSize, radius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.full,
            padding: spacing.md,
          },
        ]}
      >
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.xl }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textMuted, fontSize: fontSize.md }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  iconBadge: {
    marginBottom: 4,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    maxWidth: 280,
  },
});
