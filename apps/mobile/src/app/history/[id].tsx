import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  calculateEstimated1RM,
  formatDuration,
  formatVolumeKg,
  formatWorkoutDate,
} from "@/history/formatters";
import { SAMPLE_WORKOUTS } from "@/history/sample-data";
import { useTheme } from "@/theme";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, fontSize, radius } = useTheme();

  const workout = SAMPLE_WORKOUTS.find((item) => item.id === id);

  if (!workout) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <Stack.Screen options={{ title: "Treino" }} />
        <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
          Treino não encontrado.
        </Text>
      </View>
    );
  }

  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { padding: spacing.md, gap: spacing.md }]}
    >
      <Stack.Screen options={{ title: workout.title }} />

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
          {formatWorkoutDate(workout.startedAt)}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Duração</Text>
            <Text style={[styles.summaryValue, { color: colors.text, fontSize: fontSize.md }]}>
              {formatDuration(workout.durationSeconds)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Volume total</Text>
            <Text style={[styles.summaryValue, { color: colors.text, fontSize: fontSize.md }]}>
              {formatVolumeKg(workout.totalVolumeKg)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Séries</Text>
            <Text style={[styles.summaryValue, { color: colors.text, fontSize: fontSize.md }]}>
              {totalSets}
            </Text>
          </View>
        </View>
      </View>

      {workout.exercises.map((exercise) => (
        <View
          key={exercise.exerciseId}
          style={[
            styles.exerciseCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              gap: spacing.sm,
            },
          ]}
        >
          <Pressable
            onPress={() => router.push(`/history/exercise/${exercise.exerciseId}`)}
            style={styles.exerciseHeader}
          >
            <Text style={[styles.exerciseTitle, { color: colors.primary, fontSize: fontSize.md }]}>
              {exercise.exerciseName}
            </Text>
            <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
          </Pressable>

          <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.colSet, { color: colors.textMuted, fontSize: fontSize.xs }]}>
              Série
            </Text>
            <Text style={[styles.colVal, { color: colors.textMuted, fontSize: fontSize.xs }]}>
              Carga
            </Text>
            <Text style={[styles.colVal, { color: colors.textMuted, fontSize: fontSize.xs }]}>
              Reps
            </Text>
            <Text style={[styles.colVal, { color: colors.textMuted, fontSize: fontSize.xs }]}>
              1RM est.
            </Text>
          </View>

          {exercise.sets.map((set) => (
            <View key={set.id} style={styles.tableRow}>
              <View style={styles.colSetRow}>
                <Text style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: "600" }}>
                  {set.setNumber}
                </Text>
                {set.isPr ? (
                  <View
                    style={[
                      styles.prBadge,
                      { backgroundColor: colors.surfaceAlt, borderRadius: radius.full },
                    ]}
                  >
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "800" }}>
                      PR
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.colVal, { color: colors.text, fontSize: fontSize.sm }]}>
                {set.weightKg} kg
              </Text>
              <Text style={[styles.colVal, { color: colors.text, fontSize: fontSize.sm }]}>
                {set.reps}
              </Text>
              <Text style={[styles.colVal, { color: colors.textMuted, fontSize: fontSize.sm }]}>
                {calculateEstimated1RM(set.weightKg, set.reps)} kg
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingBottom: 32,
  },
  summaryCard: {
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    gap: 2,
  },
  summaryValue: {
    fontWeight: "700",
  },
  exerciseCard: {
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseTitle: {
    fontWeight: "700",
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  colSet: {
    width: 60,
  },
  colSetRow: {
    width: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  colVal: {
    flex: 1,
    textAlign: "right",
  },
  prBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
});
