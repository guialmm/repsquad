"""Importa a biblioteca de exercícios da free-exercise-db (domínio público) para o banco.

Uso (dentro de apps/api, com o banco rodando e as migrações aplicadas):

    uv run python -m app.seed.exercises

Rodar de novo é seguro: nada é duplicado, só o que mudou é atualizado.
Os nomes em pt-BR e os sinônimos vêm de data/exercises_pt_br.csv, se o arquivo existir.
"""

import argparse
import csv
import json
import re
import urllib.request
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Exercise, ExerciseAlias, ExerciseMuscle, ExerciseTranslation

SOURCE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
# Prefixo para montar a URL das imagens: IMAGE_BASE_URL + exercise.images[i]
IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/"
TRANSLATIONS_CSV = Path(__file__).resolve().parents[2] / "data" / "exercises_pt_br.csv"
LOCALE = "pt-BR"

# Campos copiados da fonte como estão: (campo no model, campo no JSON)
SIMPLE_FIELDS = [
    ("name", "name"),
    ("category", "category"),
    ("equipment", "equipment"),
    ("level", "level"),
    ("force", "force"),
    ("mechanic", "mechanic"),
    ("images", "images"),
    ("instructions", "instructions"),
]


@dataclass
class Translation:
    name_pt: str
    aliases: list[str]


@dataclass
class SeedResult:
    created: int = 0
    updated: int = 0
    warnings: list[str] = field(default_factory=list)


def load_source(source: str) -> list[dict]:
    """Lê a lista de exercícios de uma URL (http/https) ou de um arquivo JSON local."""
    if source.startswith(("http://", "https://")):
        with urllib.request.urlopen(source, timeout=60) as response:
            return json.load(response)
    return json.loads(Path(source).read_text(encoding="utf-8"))


def normalize_alias(alias: str) -> str:
    return re.sub(r"\s+", " ", alias).strip().lower()


def load_translations(path: Path) -> dict[str, Translation]:
    """Lê o CSV `source_id,name_pt,aliases` (sinônimos separados por `|`)."""
    translations: dict[str, Translation] = {}
    with Path(path).open(encoding="utf-8-sig", newline="") as file:
        for row in csv.DictReader(file):
            aliases: list[str] = []
            for alias in (row.get("aliases") or "").split("|"):
                normalized = normalize_alias(alias)
                if normalized and normalized not in aliases:
                    aliases.append(normalized)
            translations[row["source_id"].strip()] = Translation(
                name_pt=row["name_pt"].strip(), aliases=aliases
            )
    return translations


def _sync_muscles(exercise: Exercise, record: dict, now: datetime) -> bool:
    desired = {m: True for m in record.get("primaryMuscles") or []}
    for muscle in record.get("secondaryMuscles") or []:
        desired.setdefault(muscle, False)

    changed = False
    existing = {m.muscle: m for m in exercise.muscles}
    for muscle, is_primary in desired.items():
        row = existing.get(muscle)
        if row is None:
            exercise.muscles.append(ExerciseMuscle(muscle=muscle, is_primary=is_primary))
            changed = True
        elif row.is_primary != is_primary or row.deleted_at is not None:
            row.is_primary, row.deleted_at = is_primary, None
            changed = True
    for muscle, row in existing.items():
        if muscle not in desired and row.deleted_at is None:
            row.deleted_at = now
            changed = True
    return changed


def _sync_translation(exercise: Exercise, translation: Translation, now: datetime) -> None:
    current = next((t for t in exercise.translations if t.locale == LOCALE), None)
    if current is None:
        exercise.translations.append(ExerciseTranslation(locale=LOCALE, name=translation.name_pt))
    elif current.name != translation.name_pt or current.deleted_at is not None:
        current.name, current.deleted_at = translation.name_pt, None

    existing = {a.alias: a for a in exercise.aliases if a.locale == LOCALE}
    for alias in translation.aliases:
        row = existing.get(alias)
        if row is None:
            exercise.aliases.append(ExerciseAlias(locale=LOCALE, alias=alias))
        elif row.deleted_at is not None:
            row.deleted_at = None
    for alias, row in existing.items():
        if alias not in translation.aliases and row.deleted_at is None:
            row.deleted_at = now


def seed_exercises(
    session: Session,
    records: list[dict],
    translations: dict[str, Translation] | None = None,
) -> SeedResult:
    """Cria ou atualiza os exercícios (pela chave `source_id`) e faz commit no final."""
    result = SeedResult()
    now = datetime.now(UTC)
    translations = translations or {}
    existing = {
        e.source_id: e
        for e in session.scalars(select(Exercise).where(Exercise.source_id.is_not(None)))
    }

    for record in records:
        exercise = existing.get(record["id"])
        if exercise is None:
            exercise = Exercise(source_id=record["id"])
            for attr, key in SIMPLE_FIELDS:
                setattr(exercise, attr, record.get(key))
            _sync_muscles(exercise, record, now)
            session.add(exercise)
            existing[record["id"]] = exercise
            result.created += 1
        else:
            changed = False
            for attr, key in SIMPLE_FIELDS:
                if getattr(exercise, attr) != record.get(key):
                    setattr(exercise, attr, record.get(key))
                    changed = True
            changed = _sync_muscles(exercise, record, now) or changed
            if changed:
                result.updated += 1

        if record["id"] in translations:
            _sync_translation(exercise, translations[record["id"]], now)

    for source_id in translations:
        if source_id not in existing:
            result.warnings.append(f"{source_id}: não existe na base, ignorado")

    session.commit()
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", default=SOURCE_URL, help="URL ou arquivo JSON da base")
    parser.add_argument(
        "--translations", default=str(TRANSLATIONS_CSV), help="CSV com nomes pt-BR e sinônimos"
    )
    args = parser.parse_args()

    from app.db import SessionLocal

    records = load_source(args.source)
    translations_path = Path(args.translations)
    translations = load_translations(translations_path) if translations_path.exists() else {}
    if not translations:
        print(f"Sem traduções ({translations_path} não encontrado): seguindo só com a base.")

    with SessionLocal() as session:
        result = seed_exercises(session, records, translations)

    print(f"{len(records)} exercícios na base.")
    print(f"{result.created} criados, {result.updated} atualizados.")
    for warning in result.warnings:
        print(f"Aviso: {warning}")


if __name__ == "__main__":
    main()
