"""Prova que um teste nunca enxerga o que outro gravou (transação desfeita no fim).

Os dois testes rodam na ordem do arquivo: o primeiro grava e faz commit, o segundo
confere que não sobrou nada. Se o isolamento quebrar, o segundo falha.
"""

from sqlalchemy import func, select

from app.models import Exercise
from tests.factories import make_exercise

PROBE = "Isolation_Probe"


def test_1_writes_and_commits(db):
    make_exercise(db, source_id=PROBE)
    db.commit()

    assert db.scalar(select(func.count()).where(Exercise.source_id == PROBE)) == 1


def test_2_does_not_see_what_the_previous_test_wrote(db):
    assert db.scalar(select(func.count()).where(Exercise.source_id == PROBE)) == 0


def test_client_and_db_share_the_same_transaction(client, db):
    """O que o teste grava com `db` é visto pela API, e vice-versa."""
    make_exercise(db, source_id="Shared_Probe")

    assert client.get("/health").status_code == 200
    assert db.scalar(select(func.count()).where(Exercise.source_id == "Shared_Probe")) == 1
