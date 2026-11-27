import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { buildExerciseProgress } from "@/history/formatters";
import { SAMPLE_WORKOUTS } from "@/history/sample-data";
import { useTheme } from "@/theme";

const CHART_MAX_HEIGHT = 120;

export default function ExerciseProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, fontSize, radius } = useTheme();

  const { exerciseName, points, repRecords, history } = buildExerciseProgress(
    SAMPLE_WORKOUTS,
    id ?? "",
  );

  if (!exerciseName) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <Stack.Screen options={{ title: "Evolução" }} />
        <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
          Nenhum registro encontrado para este exercício.
        </Text>
      </View>
    );
  }

  const max1RM = Math.max(...points.map((p) => p.estimated1RM), 1);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { padding: spacing.md, gap: spacing.md }]}
    >
      <Stack.Screen options={{ title: exerciseName }} />

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            gap: spacing.md,
          },
        ]}
      >
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.md }]}>
            1RM estimado ao longo do tempo
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
            Fórmula de Epley com base na melhor série de cada treino
          </Text>
        </View>

        <View style={styles.chartArea}>
          {points.map((point) => {
            const barHeight = Math.max(20, Math.round((point.estimated1RM / max1RM) * CHART_MAX_HEIGHT));
            return (
              <View key={point.workoutId} style={styles.barColumn}>
                <Text style={{ color: colors.text, fontSize: fontSize.xs, fontWeight: "700" }}>
                  {point.estimated1RM} kg
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: colors.primary,
                      borderRadius: radius.sm,
                    },
                  ]}
                />
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                  {point.dateLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.md }]}>
          Recordes por repetições
        </Text>
        {repRecords.map((record) => (
          <View key={record.reps} style={styles.recordRow}>
            <Text style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: "600" }}>
              {record.reps} {record.reps === 1 ? "rep" : "reps"}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>{record.dateLabel}</Text>
            <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: "700" }}>
              {record.weightKg} kg
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.md }]}>
          Histórico completo
        </Text>
        {history.map((entry) => (
          <View
            key={entry.workoutId}
            style={[styles.historyEntry, { borderTopColor: colors.border, paddingTop: spacing.sm }]}
          >
            <Text style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: "600" }}>
              {entry.workoutTitle}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginBottom: 4 }}>
              {entry.dateLabel}
            </Text>
            {entry.sets.map((set) => (
              <Text key={set.id} style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                Série {set.setNumber}: {set.weightKg} kg × {set.reps} reps
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    minHeight: CHART_MAX_HEIGHT + 44,
    paddingTop: 8,
  },
  barColumn: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  bar: {
    width: 28,
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  historyEntry: {
    borderTopWidth: 1,
    gap: 2,
  },
});
