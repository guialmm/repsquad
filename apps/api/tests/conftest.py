"""Fixtures compartilhadas pelos testes da API. Guia: docs/TESTES.md.

- Testes unitários não usam banco e não precisam de nada daqui.
- Testes de integração pedem a fixture `db` (sessão do SQLAlchemy) ou `client`
  (cliente HTTP da API). Eles rodam no Postgres de teste, cada um dentro de uma
  transação desfeita no final: um teste nunca enxerga o que o outro gravou.
- O banco de teste é recriado do zero e migrado com o Alembic a cada execução.
"""

import os
from collections.abc import Iterator

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_session
from app.main import app

API_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Fixtures que dependem do Postgres: o teste que usar qualquer uma delas é
# marcado como "integration" sozinho (para rodar só os rápidos: -m "not integration").
DB_FIXTURES = {"pg_engine", "db", "client"}


def get_test_database_url() -> URL:
    """Banco de teste: TEST_DATABASE_URL, ou o DATABASE_URL com o nome terminado em _test."""
    if os.environ.get("TEST_DATABASE_URL"):
        url = make_url(os.environ["TEST_DATABASE_URL"])
    else:
        url = make_url(settings.database_url)
        url = url.set(database=f"{url.database}_test")
    # Trava de segurança: este banco é apagado a cada execução dos testes.
    if "test" not in (url.database or ""):
        raise RuntimeError(
            f"O banco de teste precisa ter 'test' no nome (recebi {url.database!r}). "
            "Ele é apagado a cada execução: nunca aponte para um banco de verdade."
        )
    return url


def _url_str(url: URL) -> str:
    return url.render_as_string(hide_password=False)


def create_database(url: URL) -> None:
    """Cria o banco se ele ainda não existir (no Neon, crie pelo painel e pule esta parte)."""
    admin = create_engine(_url_str(url.set(database="postgres")), isolation_level="AUTOCOMMIT")
    try:
        with admin.connect() as connection:
            exists = connection.scalar(
                text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": url.database}
            )
            if not exists:
                connection.execute(text(f'CREATE DATABASE "{url.database}"'))
    finally:
        admin.dispose()


def drop_database(url: URL) -> None:
    admin = create_engine(_url_str(url.set(database="postgres")), isolation_level="AUTOCOMMIT")
    try:
        with admin.connect() as connection:
            connection.execute(text(f'DROP DATABASE IF EXISTS "{url.database}" WITH (FORCE)'))
    finally:
        admin.dispose()


def alembic_config(url: URL, monkeypatch: pytest.MonkeyPatch) -> Config:
    """Config do Alembic apontando para `url` (o env.py lê a URL do settings)."""
    monkeypatch.setattr(settings, "database_url", _url_str(url))
    return Config(os.path.join(API_DIR, "alembic.ini"))


def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    for item in items:
        if DB_FIXTURES & set(getattr(item, "fixturenames", ())):
            item.add_marker(pytest.mark.integration)


@pytest.fixture(scope="session")
def pg_engine() -> Iterator[Engine]:
    """Postgres de teste, recriado e migrado uma vez por execução do pytest."""
    url = get_test_database_url()
    engine = create_engine(_url_str(url))
    try:
        try:
            with engine.connect():
                pass
        except OperationalError:
            # O banco ainda não existe (primeira vez na máquina ou no CI): cria e tenta de novo.
            create_database(url)
            with engine.connect():
                pass
    except OperationalError as error:
        message = (
            f"Postgres de teste indisponível em {url.render_as_string(hide_password=True)}. "
            "Suba o banco com `docker compose up -d db` (na raiz do repo) ou defina "
            "TEST_DATABASE_URL. Os testes de integração foram pulados; o CI roda todos."
        )
        if os.environ.get("REQUIRE_TEST_DB") == "1":
            pytest.fail(f"{message}\n{error}")
        pytest.skip(message)

    with engine.begin() as connection:
        connection.execute(text("DROP SCHEMA public CASCADE"))
        connection.execute(text("CREATE SCHEMA public"))
    with pytest.MonkeyPatch.context() as monkeypatch:
        command.upgrade(alembic_config(url, monkeypatch), "head")

    yield engine
    engine.dispose()


@pytest.fixture
def db(pg_engine: Engine) -> Iterator[Session]:
    """Sessão no Postgres de teste. Tudo o que o teste gravar é desfeito no final.

    Pode chamar `db.commit()` à vontade: ele vira um savepoint dentro da transação
    do teste, então o código testado funciona igual ao de produção.
    """
    with pg_engine.connect() as connection:
        transaction = connection.begin()
        session = Session(
            bind=connection,
            join_transaction_mode="create_savepoint",
            autoflush=False,
            expire_on_commit=False,
        )
        try:
            yield session
        finally:
            session.close()
            transaction.rollback()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    """Cliente HTTP da API usando a mesma sessão `db` do teste.

    Assim o teste pode preparar dados com `db` e conferir no banco o que a API gravou.
    """

    def _session_override() -> Iterator[Session]:
        yield db

    app.dependency_overrides[get_session] = _session_override
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_session, None)
