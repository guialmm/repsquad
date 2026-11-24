"""Todos os models ficam registrados aqui, para o Alembic enxergar as tabelas."""

from app.models.exercise import Exercise, ExerciseAlias, ExerciseMuscle, ExerciseTranslation

__all__ = ["Exercise", "ExerciseAlias", "ExerciseMuscle", "ExerciseTranslation"]
