import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { useTheme } from "@/theme";

type FilterChipsProps<T extends string> = {
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T | null) => void;
  allLabel?: string;
};

export function FilterChips<T extends string>({
  options,
  selected,
  onSelect,
  allLabel,
}: FilterChipsProps<T>) {
  const { colors, spacing, fontSize, radius } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { gap: spacing.xs }]}
    >
      {allLabel ? (
        <Pressable
          onPress={() => onSelect(null)}
          style={[
            styles.chip,
            {
              backgroundColor: selected === null ? colors.primary : colors.surface,
              borderColor: selected === null ? colors.primary : colors.border,
              borderRadius: radius.full,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs + 2,
            },
          ]}
        >
          <Text
            style={{
              color: selected === null ? colors.primaryText : colors.text,
              fontSize: fontSize.xs,
              fontWeight: "600",
            }}
          >
            {allLabel}
          </Text>
        </Pressable>
      ) : null}
      {options.map((option) => {
        const active = selected === option;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(active && allLabel ? null : option)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: radius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs + 2,
              },
            ]}
          >
            <Text
              style={{
                color: active ? colors.primaryText : colors.text,
                fontSize: fontSize.xs,
                fontWeight: "600",
              }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
  },
  chip: {
    borderWidth: 1,
  },
});
