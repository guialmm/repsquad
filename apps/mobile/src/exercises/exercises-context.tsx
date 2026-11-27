import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { SAMPLE_EXERCISES } from "./sample-data";
import type { Equipment, Exercise, MuscleGroup } from "./types";

type NewExerciseInput = {
  name: string;
  equipment: Equipment;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
};

type ExercisesContextValue = {
  exercises: Exercise[];
  getById: (id: string) => Exercise | undefined;
  addCustomExercise: (input: NewExerciseInput) => Exercise;
};

const ExercisesContext = createContext<ExercisesContextValue>({
  exercises: SAMPLE_EXERCISES,
  getById: () => undefined,
  addCustomExercise: (input) => ({
    id: "0",
    ...input,
    isCustom: true,
  }),
});

export function ExercisesProvider({ children }: { children: ReactNode }) {
  // TODO(#6): buscar da API e enviar criação de exercício personalizado quando #6 entrar na main.
  const [exercises, setExercises] = useState<Exercise[]>(SAMPLE_EXERCISES);

  const getById = useCallback(
    (id: string) => exercises.find((item) => item.id === id),
    [exercises],
  );

  const addCustomExercise = useCallback((input: NewExerciseInput): Exercise => {
    const created: Exercise = {
      id: `custom-${Date.now()}`,
      name: input.name.trim(),
      equipment: input.equipment,
      primaryMuscles: input.primaryMuscles,
      secondaryMuscles: input.secondaryMuscles,
      isCustom: true,
    };
    setExercises((prev) => [created, ...prev]);
    return created;
  }, []);

  return (
    <ExercisesContext.Provider value={{ exercises, getById, addCustomExercise }}>
      {children}
    </ExercisesContext.Provider>
  );
}

export function useExercises() {
  return useContext(ExercisesContext);
}
