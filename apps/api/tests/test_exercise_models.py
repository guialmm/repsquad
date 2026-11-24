import pytest
from sqlalchemy.exc import IntegrityError

from app.models import Exercise, ExerciseAlias, ExerciseMuscle, ExerciseTranslation


def make_exercise(source_id: str = "Barbell_Squat") -> Exercise:
    return Exercise(source_id=source_id, name="Barbell Squat", category="strength")


def test_exercise_gets_timestamps_and_is_not_deleted(session):
    exercise = make_exercise()
    session.add(exercise)
    session.commit()

    assert exercise.id is not None
    assert exercise.created_at is not None
    assert exercise.updated_at is not None
    assert exercise.deleted_at is None


def test_exercise_source_id_is_unique(session):
    session.add_all([make_exercise("Same_Id"), make_exercise("Same_Id")])
    with pytest.raises(IntegrityError):
        session.commit()


def test_exercise_has_primary_and_secondary_muscles(session):
    exercise = make_exercise()
    exercise.muscles = [
        ExerciseMuscle(muscle="quadriceps", is_primary=True),
        ExerciseMuscle(muscle="glutes", is_primary=False),
    ]
    session.add(exercise)
    session.commit()
    session.expire_all()

    loaded = session.get(Exercise, exercise.id)
    assert {(m.muscle, m.is_primary) for m in loaded.muscles} == {
        ("quadriceps", True),
        ("glutes", False),
    }


def test_only_one_translation_per_locale(session):
    exercise = make_exercise()
    exercise.translations = [
        ExerciseTranslation(locale="pt-BR", name="Agachamento livre"),
        ExerciseTranslation(locale="pt-BR", name="Agachamento"),
    ]
    session.add(exercise)
    with pytest.raises(IntegrityError):
        session.commit()


def test_alias_is_unique_per_exercise_and_locale(session):
    exercise = make_exercise()
    exercise.aliases = [
        ExerciseAlias(locale="pt-BR", alias="agachamento"),
        ExerciseAlias(locale="pt-BR", alias="agachamento"),
    ]
    session.add(exercise)
    with pytest.raises(IntegrityError):
        session.commit()
