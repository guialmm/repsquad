from collections.abc import Iterator

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session

import app.models  # noqa: F401  (registra todas as tabelas no Base.metadata)
from app.db import Base


@pytest.fixture
def session() -> Iterator[Session]:
    """Banco SQLite em memória, recriado a cada teste (não precisa de Docker)."""
    engine = create_engine("sqlite://")

    @event.listens_for(engine, "connect")
    def _enable_foreign_keys(dbapi_connection, _record):
        dbapi_connection.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    engine.dispose()
