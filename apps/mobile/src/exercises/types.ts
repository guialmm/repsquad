export const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Pernas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Core",
] as const;

export const EQUIPMENT_LIST = [
  "Barra",
  "Halter",
  "Máquina",
  "Cabo",
  "Peso corporal",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type Equipment = (typeof EQUIPMENT_LIST)[number];

export type Exercise = {
  id: string;
  name: string;
  equipment: Equipment;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  imageUrl?: string;
  isCustom: boolean;
  instructions?: string[];
};

export type ExerciseFilters = {
  search: string;
  muscle: MuscleGroup | null;
  equipment: Equipment | null;
};
