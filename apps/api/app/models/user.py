from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, validates

from app.db import Base
from app.models.mixins import TimestampMixin


class User(TimestampMixin, Base):
    """Pessoa com conta no app.

    A tabela se chama `app_user` porque `user` é palavra reservada no Postgres
    (`SELECT * FROM user` devolve o usuário do banco, não a tabela).
    Só o hash da senha é guardado, nunca a senha.
    """

    __tablename__ = "app_user"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Sempre em minúsculas e sem espaços (ver normalize_email): é a chave do login.
    email: Mapped[str] = mapped_column(String(320), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(255))

    @validates("email")
    def normalize_email(self, _key: str, email: str | None) -> str | None:
        return email.strip().lower() if email is not None else None
