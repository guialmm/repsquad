from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base de todas as tabelas (models) do SQLAlchemy."""


def get_session() -> Iterator[Session]:
    """Dependência do FastAPI: abre uma sessão por request e fecha no final."""
    with SessionLocal() as session:
        yield session
