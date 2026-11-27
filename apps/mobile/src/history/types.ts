export type WorkoutSetItem = {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isPr?: boolean;
};

export type WorkoutExerciseItem = {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSetItem[];
};

export type WorkoutRecord = {
  id: string;
  title: string;
  startedAt: string;
  durationSeconds: number;
  totalVolumeKg: number;
  exercises: WorkoutExerciseItem[];
};

export type ExerciseChartPoint = {
  workoutId: string;
  dateLabel: string;
  estimated1RM: number;
  bestSetLabel: string;
};

export type ExerciseRepRecord = {
  reps: number;
  weightKg: number;
  dateLabel: string;
};

export type ExerciseSessionEntry = {
  workoutId: string;
  workoutTitle: string;
  dateLabel: string;
  sets: WorkoutSetItem[];
};
