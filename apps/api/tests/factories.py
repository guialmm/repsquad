"""Fábricas de dados para os testes: criam registros válidos com o mínimo de código.

Uso:
    exercise = make_exercise(db)                         # tudo padrão
    exercise = make_exercise(db, equipment="dumbbell")   # muda só o que importa no teste

Cada chamada gera valores únicos (ex.: source_id), então dá para criar vários
no mesmo teste sem bater em restrição de unicidade. Novas tabelas ganham a sua
fábrica aqui (ex.: make_user na #4, make_routine na #8).
"""

from itertools import count

from sqlalchemy.orm import Session

from app.models import Exercise, ExerciseAlias, ExerciseMuscle, ExerciseTranslation

_sequence = count(1)


def make_exercise(
    db: Session,
    *,
    name_pt: str | None = None,
    aliases: list[str] | None = None,
    primary_muscles: list[str] | None = None,
    secondary_muscles: list[str] | None = None,
    **overrides,
) -> Exercise:
    """Cria um exercício (e, se pedir, nome em pt-BR, sinônimos e músculos) e faz flush."""
    n = next(_sequence)
    data = {
        "source_id": f"Test_Exercise_{n}",
        "name": f"Test Exercise {n}",
        "category": "strength",
        "equipment": "barbell",
    } | overrides
    exercise = Exercise(**data)
    if name_pt is not None:
        exercise.translations.append(ExerciseTranslation(locale="pt-BR", name=name_pt))
    for alias in aliases or []:
        exercise.aliases.append(ExerciseAlias(locale="pt-BR", alias=alias))
    for muscle in primary_muscles or []:
        exercise.muscles.append(ExerciseMuscle(muscle=muscle, is_primary=True))
    for muscle in secondary_muscles or []:
        exercise.muscles.append(ExerciseMuscle(muscle=muscle, is_primary=False))
    db.add(exercise)
    db.flush()
    return exercise
