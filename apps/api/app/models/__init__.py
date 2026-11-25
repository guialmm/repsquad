"""Todos os models ficam registrados aqui, para o Alembic enxergar as tabelas."""

from app.models.exercise import Exercise, ExerciseAlias, ExerciseMuscle, ExerciseTranslation
from app.models.user import User

__all__ = ["Exercise", "ExerciseAlias", "ExerciseMuscle", "ExerciseTranslation", "User"]
