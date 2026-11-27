import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useExercises } from "@/exercises/exercises-context";
import { useTheme } from "@/theme";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = useExercises();
  const { colors, spacing, fontSize, radius } = useTheme();

  const exercise = id ? getById(id) : undefined;

  if (!exercise) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <Stack.Screen options={{ title: "Exercício" }} />
        <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
          Exercício não encontrado.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { padding: spacing.lg, gap: spacing.lg }]}
    >
      <Stack.Screen options={{ title: exercise.name }} />

      {exercise.imageUrl ? (
        <Image
          source={{ uri: exercise.imageUrl }}
          style={[styles.image, { borderRadius: radius.lg, backgroundColor: colors.surfaceAlt }]}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.imagePlaceholder,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.lg,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="barbell-outline" size={48} color={colors.primary} />
          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>
            Imagem demonstrativa em breve
          </Text>
        </View>
      )}

      <View style={{ gap: spacing.xs }}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text, fontSize: fontSize.xl }]}>
            {exercise.name}
          </Text>
          {exercise.isCustom ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.full,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                },
              ]}
            >
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: "700" }}>
                Personalizado
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.md }}>
          Equipamento: {exercise.equipment}
        </Text>
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
          Músculos trabalhados
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
          Primários:{" "}
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {exercise.primaryMuscles.join(", ")}
          </Text>
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
          Secundários:{" "}
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {exercise.secondaryMuscles.length > 0
              ? exercise.secondaryMuscles.join(", ")
              : "Nenhum"}
          </Text>
        </Text>
      </View>

      {exercise.instructions && exercise.instructions.length > 0 ? (
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
            Execução
          </Text>
          {exercise.instructions.map((step, index) => (
            <Text key={index} style={{ color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 }}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      ) : null}
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
  image: {
    width: "100%",
    height: 200,
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontWeight: "700",
  },
  badge: {
    alignSelf: "flex-start",
  },
  card: {
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: "700",
  },
});
