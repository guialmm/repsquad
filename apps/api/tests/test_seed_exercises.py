import json
from pathlib import Path

from sqlalchemy import func, select

from app.models import Exercise, ExerciseAlias, ExerciseMuscle, ExerciseTranslation
from app.seed.exercises import load_source, load_translations, seed_exercises

FIXTURES = Path(__file__).parent / "fixtures"
SOURCE = FIXTURES / "exercises_sample.json"
TRANSLATIONS = FIXTURES / "exercises_pt_br_sample.csv"


def count(session, model) -> int:
    return session.scalar(select(func.count()).select_from(model))


def by_source_id(session, source_id: str) -> Exercise:
    return session.scalar(select(Exercise).where(Exercise.source_id == source_id))


def test_load_source_reads_the_json_file():
    records = load_source(str(SOURCE))
    assert [r["id"] for r in records] == [
        "Barbell_Bench_Press_-_Medium_Grip",
        "Barbell_Squat",
        "90_90_Hamstring",
    ]


def test_load_translations_splits_and_normalizes_aliases():
    translations = load_translations(TRANSLATIONS)

    bench = translations["Barbell_Bench_Press_-_Medium_Grip"]
    assert bench.name_pt == "Supino reto com barra"
    assert bench.aliases == ["supino", "supino reto", "supino com barra"]
    assert translations["Barbell_Squat"].aliases == []


def test_seed_creates_exercises_with_muscles_and_images(session):
    result = seed_exercises(session, load_source(str(SOURCE)))

    assert result.created == 3
    assert result.updated == 0
    bench = by_source_id(session, "Barbell_Bench_Press_-_Medium_Grip")
    assert bench.name == "Barbell Bench Press - Medium Grip"
    assert bench.equipment == "barbell"
    assert bench.images == [
        "Barbell_Bench_Press_-_Medium_Grip/0.jpg",
        "Barbell_Bench_Press_-_Medium_Grip/1.jpg",
    ]
    assert {(m.muscle, m.is_primary) for m in bench.muscles} == {
        ("chest", True),
        ("shoulders", False),
        ("triceps", False),
    }
    stretch = by_source_id(session, "90_90_Hamstring")
    assert stretch.equipment is None
    assert stretch.mechanic is None


def test_seed_twice_does_not_duplicate_anything(session):
    records = load_source(str(SOURCE))
    translations = load_translations(TRANSLATIONS)
    seed_exercises(session, records, translations)

    second = seed_exercises(session, records, translations)

    assert second.created == 0
    assert second.updated == 0
    assert count(session, Exercise) == 3
    assert count(session, ExerciseMuscle) == 1 + 2 + 1 + 4 + 1
    assert count(session, ExerciseTranslation) == 2
    assert count(session, ExerciseAlias) == 3


def test_seed_updates_exercise_when_source_changes(session):
    records = load_source(str(SOURCE))
    seed_exercises(session, records)

    changed = json.loads(json.dumps(records))
    changed[1]["name"] = "Barbell Back Squat"
    changed[1]["secondaryMuscles"] = ["glutes"]
    result = seed_exercises(session, changed)

    assert result.updated == 1
    squat = by_source_id(session, "Barbell_Squat")
    assert squat.name == "Barbell Back Squat"
    active = {(m.muscle, m.is_primary) for m in squat.muscles if m.deleted_at is None}
    assert active == {("quadriceps", True), ("glutes", False)}


def test_seed_fills_pt_br_names_and_aliases(session):
    seed_exercises(session, load_source(str(SOURCE)), load_translations(TRANSLATIONS))

    bench = by_source_id(session, "Barbell_Bench_Press_-_Medium_Grip")
    assert [(t.locale, t.name) for t in bench.translations] == [("pt-BR", "Supino reto com barra")]
    assert sorted(a.alias for a in bench.aliases) == ["supino", "supino com barra", "supino reto"]
    assert all(a.locale == "pt-BR" for a in bench.aliases)


def test_unknown_source_id_in_translations_is_a_warning_not_an_error(session):
    result = seed_exercises(session, load_source(str(SOURCE)), load_translations(TRANSLATIONS))

    assert result.warnings == ["Exercicio_Que_Nao_Existe: não existe na base, ignorado"]


def test_alias_removed_from_csv_is_soft_deleted(session):
    records = load_source(str(SOURCE))
    translations = load_translations(TRANSLATIONS)
    seed_exercises(session, records, translations)

    translations["Barbell_Bench_Press_-_Medium_Grip"].aliases = ["supino"]
    seed_exercises(session, records, translations)

    bench = by_source_id(session, "Barbell_Bench_Press_-_Medium_Grip")
    active = sorted(a.alias for a in bench.aliases if a.deleted_at is None)
    assert active == ["supino"]
    assert count(session, ExerciseAlias) == 3
