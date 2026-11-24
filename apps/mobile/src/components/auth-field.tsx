import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { useTheme } from "@/theme";

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function AuthField({ label, error, ...inputProps }: AuthFieldProps) {
  const { colors, spacing, fontSize, radius } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.text, fontSize: fontSize.sm }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...inputProps}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            color: colors.text,
            fontSize: fontSize.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 4,
          },
        ]}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.danger, fontSize: fontSize.xs }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
  },
  error: {
    fontWeight: "500",
  },
});
