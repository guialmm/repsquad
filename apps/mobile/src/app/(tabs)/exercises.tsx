import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { FilterChips } from "@/components/filter-chips";
import { useExercises } from "@/exercises/exercises-context";
import { filterExercises } from "@/exercises/filters";
import {
  EQUIPMENT_LIST,
  MUSCLE_GROUPS,
  type Equipment,
  type MuscleGroup,
} from "@/exercises/types";
import { useTheme } from "@/theme";

const SEARCH_DEBOUNCE_MS = 300;

export default function ExercisesScreen() {
  const { exercises } = useExercises();
  const { colors, spacing, fontSize, radius } = useTheme();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtered = useMemo(
    () => filterExercises(exercises, { search: debouncedSearch, muscle, equipment }),
    [exercises, debouncedSearch, muscle, equipment],
  );

  const hasActiveFilters = Boolean(searchInput || muscle || equipment);

  function clearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setMuscle(null);
    setEquipment(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.controls, { padding: spacing.md, gap: spacing.sm }]}>
        <View style={[styles.searchRow, { gap: spacing.sm }]}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                paddingHorizontal: spacing.sm + 4,
              },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Buscar exercício..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text, fontSize: fontSize.md }]}
              autoCorrect={false}
            />
            {searchInput ? (
              <Pressable onPress={() => setSearchInput("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={() => router.push("/exercises/new")}
            style={[
              styles.newButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <Ionicons name="add" size={20} color={colors.primaryText} />
            <Text style={[styles.newButtonText, { color: colors.primaryText, fontSize: fontSize.sm }]}>
              Novo
            </Text>
          </Pressable>
        </View>

        <FilterChips
          options={MUSCLE_GROUPS}
          selected={muscle}
          onSelect={setMuscle}
          allLabel="Todos os músculos"
        />
        <FilterChips
          options={EQUIPMENT_LIST}
          selected={equipment}
          onSelect={setEquipment}
          allLabel="Todos os equipamentos"
        />

        {hasActiveFilters ? (
          <View style={styles.filterStatusRow}>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
              {filtered.length} {filtered.length === 1 ? "exercício" : "exercícios"}
            </Text>
            <Pressable onPress={clearFilters} hitSlop={8}>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: "700" }}>
                Limpar filtros
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: spacing.md, gap: spacing.sm }]}
        ListEmptyComponent={
          <View style={[styles.empty, { padding: spacing.xl, gap: spacing.sm }]}>
            <Ionicons name="barbell-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted, fontSize: fontSize.md }]}>
              Nenhum exercício encontrado.
            </Text>
            {hasActiveFilters ? (
              <Pressable
                onPress={clearFilters}
                style={[
                  styles.clearButton,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.sm,
                    paddingVertical: spacing.xs + 2,
                    paddingHorizontal: spacing.md,
                  },
                ]}
              >
                <Text style={{ color: colors.text, fontSize: fontSize.sm, fontWeight: "600" }}>
                  Limpar filtros
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/exercises/${item.id}`)}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text, fontSize: fontSize.md }]}>
                  {item.name}
                </Text>
                {item.isCustom ? (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: colors.surfaceAlt,
                        borderRadius: radius.full,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 2,
                      },
                    ]}
                  >
                    <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: "600" }}>
                      Personalizado
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                {item.primaryMuscles.join(", ")} · {item.equipment}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
  controls: {
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    gap: 8,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
  },
  newButtonText: {
    fontWeight: "700",
  },
  filterStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 2,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  cardTitle: {
    fontWeight: "600",
  },
  badge: {
    alignSelf: "flex-start",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  clearButton: {
    marginTop: 4,
  },
});
