from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import create_engine

import app.models  # noqa: F401
from app.db import Base


def test_migrations_create_exactly_the_models_schema(tmp_path, monkeypatch):
    """Garante que ninguém esqueceu de gerar a migração depois de mudar um model."""
    url = f"sqlite:///{tmp_path / 'migrations.db'}"
    monkeypatch.setattr("app.config.settings.database_url", url)

    config = Config("alembic.ini")
    command.upgrade(config, "head")

    engine = create_engine(url)
    with engine.connect() as connection:
        diff = compare_metadata(MigrationContext.configure(connection), Base.metadata)
    engine.dispose()
    assert diff == []

    command.downgrade(config, "base")
