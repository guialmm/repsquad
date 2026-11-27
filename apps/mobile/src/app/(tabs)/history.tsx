import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { formatDuration, formatVolumeKg, formatWorkoutDate } from "@/history/formatters";
import { SAMPLE_WORKOUTS } from "@/history/sample-data";
import { useTheme } from "@/theme";

export default function HistoryScreen() {
  const { colors, spacing, fontSize, radius } = useTheme();
  const workouts = SAMPLE_WORKOUTS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { padding: spacing.md, gap: spacing.sm }]}
        ListEmptyComponent={
          <View style={[styles.empty, { padding: spacing.xl, gap: spacing.sm }]}>
            <Ionicons name="time-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: fontSize.md }]}>
              Nenhum treino registrado ainda
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted, fontSize: fontSize.sm }]}>
              Seus treinos finalizados aparecerão aqui.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/history/${item.id}`)}
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
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.title, { color: colors.text, fontSize: fontSize.md }]}>
                  {item.title}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
                  {formatWorkoutDate(item.startedAt)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>

            <View style={[styles.statsRow, { borderTopColor: colors.border, paddingTop: spacing.sm }]}>
              <View style={styles.stat}>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Duração</Text>
                <Text style={[styles.statValue, { color: colors.text, fontSize: fontSize.sm }]}>
                  {formatDuration(item.durationSeconds)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Volume</Text>
                <Text style={[styles.statValue, { color: colors.text, fontSize: fontSize.sm }]}>
                  {formatVolumeKg(item.totalVolumeKg)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Exercícios</Text>
                <Text style={[styles.statValue, { color: colors.text, fontSize: fontSize.sm }]}>
                  {item.exercises.length}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
  },
  stat: {
    gap: 2,
  },
  statValue: {
    fontWeight: "600",
  },
});
