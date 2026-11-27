import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AuthField } from "@/components/auth-field";
import { FilterChips } from "@/components/filter-chips";
import { useExercises } from "@/exercises/exercises-context";
import {
  EQUIPMENT_LIST,
  MUSCLE_GROUPS,
  type Equipment,
  type MuscleGroup,
} from "@/exercises/types";
import { useTheme } from "@/theme";

export default function NewExerciseScreen() {
  const { addCustomExercise } = useExercises();
  const { colors, spacing, fontSize, radius } = useTheme();

  const [name, setName] = useState("");
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup | null>("Peito");
  const [equipment, setEquipment] = useState<Equipment | null>("Halter");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Informe o nome do exercício.");
      return;
    }
    if (!primaryMuscle || !equipment) {
      setFormError("Selecione o músculo principal e o equipamento.");
      return;
    }

    setNameError(null);
    setFormError(null);
    addCustomExercise({
      name: trimmed,
      equipment,
      primaryMuscles: [primaryMuscle],
      secondaryMuscles: [],
    });
    router.back();
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { padding: spacing.lg, gap: spacing.lg }]}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: "Novo exercício" }} />

      <AuthField
        label="Nome do exercício"
        value={name}
        onChangeText={setName}
        error={nameError}
        placeholder="Ex.: Supino inclinado no Smith"
      />

      <View style={{ gap: spacing.sm }}>
        <Text style={[styles.label, { color: colors.text, fontSize: fontSize.sm }]}>
          Grupo muscular principal
        </Text>
        <FilterChips
          options={MUSCLE_GROUPS}
          selected={primaryMuscle}
          onSelect={setPrimaryMuscle}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[styles.label, { color: colors.text, fontSize: fontSize.sm }]}>
          Equipamento
        </Text>
        <FilterChips options={EQUIPMENT_LIST} selected={equipment} onSelect={setEquipment} />
      </View>

      {formError ? (
        <Text style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: "500" }}>
          {formError}
        </Text>
      ) : null}

      <Pressable
        onPress={handleSave}
        style={[
          styles.saveButton,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.md,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <Text style={[styles.saveButtonText, { color: colors.primaryText, fontSize: fontSize.md }]}>
          Salvar exercício
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  label: {
    fontWeight: "600",
  },
  saveButton: {
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    fontWeight: "700",
  },
});
