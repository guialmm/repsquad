"""As migrações sobem, descem e geram exatamente o schema dos models, no Postgres."""

from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, inspect

import app.models  # noqa: F401
from app.db import Base
from tests.conftest import alembic_config, create_database, drop_database, get_test_database_url


def test_migrations_up_down_and_match_the_models(pg_engine, monkeypatch):
    """Banco descartável: sobe tudo, compara com os models, desce tudo.

    Se falhar com diferenças, alguém mudou um model e esqueceu de gerar a migração
    (`uv run alembic revision --autogenerate -m "..."`).
    """
    url = get_test_database_url()
    url = url.set(database=f"{url.database}_migrations")
    drop_database(url)
    create_database(url)
    engine = create_engine(url.render_as_string(hide_password=False))
    try:
        config = alembic_config(url, monkeypatch)
        command.upgrade(config, "head")
        with engine.connect() as connection:
            diff = compare_metadata(MigrationContext.configure(connection), Base.metadata)
        assert diff == []

        command.downgrade(config, "base")
        assert set(inspect(engine).get_table_names()) <= {"alembic_version"}

        command.upgrade(config, "head")
    finally:
        engine.dispose()
        drop_database(url)
