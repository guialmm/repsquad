import type { WorkoutRecord } from "./types";

// TODO(#14): buscar histórico e recordes da API quando #14 entrar na main.
export const SAMPLE_WORKOUTS: WorkoutRecord[] = [
  {
    id: "w-4",
    title: "Treino A — Peito e Tríceps",
    startedAt: "2026-11-26T18:30:00-03:00",
    durationSeconds: 3240,
    totalVolumeKg: 4860,
    exercises: [
      {
        exerciseId: "1",
        exerciseName: "Supino reto com barra",
        sets: [
          { id: "s-1", setNumber: 1, weightKg: 60, reps: 10 },
          { id: "s-2", setNumber: 2, weightKg: 70, reps: 8 },
          { id: "s-3", setNumber: 3, weightKg: 75, reps: 6, isPr: true },
        ],
      },
      {
        exerciseId: "8",
        exerciseName: "Tríceps corda na polia",
        sets: [
          { id: "s-4", setNumber: 1, weightKg: 25, reps: 12 },
          { id: "s-5", setNumber: 2, weightKg: 30, reps: 10 },
          { id: "s-6", setNumber: 3, weightKg: 30, reps: 10 },
        ],
      },
    ],
  },
  {
    id: "w-3",
    title: "Treino C — Pernas",
    startedAt: "2026-11-24T19:00:00-03:00",
    durationSeconds: 4080,
    totalVolumeKg: 6420,
    exercises: [
      {
        exerciseId: "2",
        exerciseName: "Agachamento livre",
        sets: [
          { id: "s-7", setNumber: 1, weightKg: 80, reps: 8 },
          { id: "s-8", setNumber: 2, weightKg: 90, reps: 6, isPr: true },
          { id: "s-9", setNumber: 3, weightKg: 90, reps: 6 },
        ],
      },
      {
        exerciseId: "9",
        exerciseName: "Leg press 45°",
        sets: [
          { id: "s-10", setNumber: 1, weightKg: 160, reps: 12 },
          { id: "s-11", setNumber: 2, weightKg: 180, reps: 10 },
        ],
      },
    ],
  },
  {
    id: "w-2",
    title: "Treino B — Costas e Bíceps",
    startedAt: "2026-11-21T10:15:00-03:00",
    durationSeconds: 2880,
    totalVolumeKg: 3910,
    exercises: [
      {
        exerciseId: "3",
        exerciseName: "Puxada frente na polia",
        sets: [
          { id: "s-12", setNumber: 1, weightKg: 50, reps: 10 },
          { id: "s-13", setNumber: 2, weightKg: 55, reps: 8 },
        ],
      },
      {
        exerciseId: "7",
        exerciseName: "Rosca direta com barra",
        sets: [
          { id: "s-14", setNumber: 1, weightKg: 26, reps: 10 },
          { id: "s-15", setNumber: 2, weightKg: 28, reps: 8, isPr: true },
        ],
      },
    ],
  },
  {
    id: "w-1",
    title: "Treino A — Peito e Tríceps",
    startedAt: "2026-11-18T18:45:00-03:00",
    durationSeconds: 3000,
    totalVolumeKg: 4210,
    exercises: [
      {
        exerciseId: "1",
        exerciseName: "Supino reto com barra",
        sets: [
          { id: "s-16", setNumber: 1, weightKg: 60, reps: 10 },
          { id: "s-17", setNumber: 2, weightKg: 65, reps: 8 },
          { id: "s-18", setNumber: 3, weightKg: 70, reps: 6 },
        ],
      },
    ],
  },
];
