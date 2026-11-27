import type {
  ExerciseChartPoint,
  ExerciseRepRecord,
  ExerciseSessionEntry,
  WorkoutRecord,
} from "./types";

const MONTHS_PT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatWorkoutDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  const day = pad2(date.getDate());
  const month = MONTHS_PT[date.getMonth()] ?? "";
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  return `${day} ${month} · ${hours}:${minutes}`;
}

export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${pad2(minutes)}min`;
}

export function formatVolumeKg(volumeKg: number): string {
  const rounded = Math.round(volumeKg);
  return `${rounded.toLocaleString("pt-BR")} kg`;
}

export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export function buildExerciseProgress(
  workouts: WorkoutRecord[],
  exerciseId: string,
): {
  exerciseName: string | null;
  points: ExerciseChartPoint[];
  repRecords: ExerciseRepRecord[];
  history: ExerciseSessionEntry[];
} {
  let exerciseName: string | null = null;
  const points: ExerciseChartPoint[] = [];
  const history: ExerciseSessionEntry[] = [];
  const bestByReps = new Map<number, ExerciseRepRecord>();

  const chronological = [...workouts].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  for (const workout of chronological) {
    const match = workout.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (!match || match.sets.length === 0) continue;

    exerciseName = match.exerciseName;
    const dateLabel = formatShortDate(workout.startedAt);

    let best1RM = 0;
    let bestSetLabel = "";

    for (const set of match.sets) {
      const est1RM = calculateEstimated1RM(set.weightKg, set.reps);
      if (est1RM > best1RM) {
        best1RM = est1RM;
        bestSetLabel = `${set.weightKg} kg × ${set.reps}`;
      }

      const existing = bestByReps.get(set.reps);
      if (!existing || set.weightKg > existing.weightKg) {
        bestByReps.set(set.reps, {
          reps: set.reps,
          weightKg: set.weightKg,
          dateLabel,
        });
      }
    }

    points.push({
      workoutId: workout.id,
      dateLabel,
      estimated1RM: best1RM,
      bestSetLabel,
    });

    history.unshift({
      workoutId: workout.id,
      workoutTitle: workout.title,
      dateLabel: formatWorkoutDate(workout.startedAt),
      sets: match.sets,
    });
  }

  const repRecords = Array.from(bestByReps.values()).sort((a, b) => a.reps - b.reps);

  return { exerciseName, points, repRecords, history };
}
