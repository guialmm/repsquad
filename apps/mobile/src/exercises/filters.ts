import type { Exercise, ExerciseFilters } from "./types";

export const DEFAULT_PAGE_SIZE = 20;

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterExercises(exercises: Exercise[], filters: ExerciseFilters): Exercise[] {
  const query = normalizeText(filters.search);

  return exercises.filter((exercise) => {
    if (filters.muscle) {
      const matchesMuscle =
        exercise.primaryMuscles.includes(filters.muscle) ||
        exercise.secondaryMuscles.includes(filters.muscle);
      if (!matchesMuscle) return false;
    }

    if (filters.equipment && exercise.equipment !== filters.equipment) {
      return false;
    }

    if (query) {
      const matchesName = normalizeText(exercise.name).includes(query);
      if (!matchesName) return false;
    }

    return true;
  });
}

export function paginateExercises(
  exercises: Exercise[],
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Exercise[] {
  const safePage = Math.max(1, page);
  return exercises.slice(0, safePage * pageSize);
}

export function buildExerciseQueryParams(
  filters: ExerciseFilters,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Record<string, string> {
  const params: Record<string, string> = {
    page: String(Math.max(1, page)),
    limit: String(pageSize),
  };
  if (filters.search.trim()) params.q = filters.search.trim();
  if (filters.muscle) params.muscle = filters.muscle;
  if (filters.equipment) params.equipment = filters.equipment;
  return params;
}
