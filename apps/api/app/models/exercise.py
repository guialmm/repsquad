from sqlalchemy import JSON, Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.mixins import TimestampMixin


class Exercise(TimestampMixin, Base):
    """Exercício da biblioteca.

    Os da base aberta free-exercise-db têm `source_id` (o `id` de lá); exercícios
    personalizados de usuários (issue futura) terão `source_id` nulo.
    `name` é o nome original em inglês; o nome exibido vem de `translations`.
    """

    __tablename__ = "exercise"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[str | None] = mapped_column(String(200), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str | None] = mapped_column(String(50))
    equipment: Mapped[str | None] = mapped_column(String(50), index=True)
    level: Mapped[str | None] = mapped_column(String(30))
    force: Mapped[str | None] = mapped_column(String(30))
    mechanic: Mapped[str | None] = mapped_column(String(30))
    # Caminhos relativos das imagens na free-exercise-db, ex.: "Barbell_Squat/0.jpg"
    images: Mapped[list[str]] = mapped_column(JSON, default=list)
    # Passo a passo em inglês, como vem da fonte
    instructions: Mapped[list[str]] = mapped_column(JSON, default=list)

    muscles: Mapped[list["ExerciseMuscle"]] = relationship(
        back_populates="exercise", cascade="all, delete-orphan"
    )
    translations: Mapped[list["ExerciseTranslation"]] = relationship(
        back_populates="exercise", cascade="all, delete-orphan"
    )
    aliases: Mapped[list["ExerciseAlias"]] = relationship(
        back_populates="exercise", cascade="all, delete-orphan"
    )


class ExerciseMuscle(TimestampMixin, Base):
    """Músculo trabalhado. Tabela separada (e não lista JSON) para filtrar por músculo
    e calcular séries por grupo muscular (primário vale 1, secundário 0,5)."""

    __tablename__ = "exercise_muscle"
    __table_args__ = (UniqueConstraint("exercise_id", "muscle"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercise.id"), index=True)
    muscle: Mapped[str] = mapped_column(String(50), index=True)
    is_primary: Mapped[bool] = mapped_column(Boolean)

    exercise: Mapped[Exercise] = relationship(back_populates="muscles")


class ExerciseTranslation(TimestampMixin, Base):
    """Nome do exercício num idioma (ex.: locale "pt-BR")."""

    __tablename__ = "exercise_translation"
    __table_args__ = (UniqueConstraint("exercise_id", "locale"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercise.id"), index=True)
    locale: Mapped[str] = mapped_column(String(10))
    name: Mapped[str] = mapped_column(String(200))

    exercise: Mapped[Exercise] = relationship(back_populates="translations")


class ExerciseAlias(TimestampMixin, Base):
    """Outro nome pelo qual o exercício é conhecido (ex.: "supino reto").
    Usado pela busca e pelo importador de ficha."""

    __tablename__ = "exercise_alias"
    __table_args__ = (UniqueConstraint("exercise_id", "locale", "alias"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercise.id"), index=True)
    locale: Mapped[str] = mapped_column(String(10))
    alias: Mapped[str] = mapped_column(String(200), index=True)

    exercise: Mapped[Exercise] = relationship(back_populates="aliases")
