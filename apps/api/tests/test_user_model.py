import pytest
from sqlalchemy.exc import IntegrityError

from app.models import User


def make_user(email: str = "gui@exemplo.com") -> User:
    return User(email=email, name="Gui", password_hash="hash-de-teste")


def test_user_gets_timestamps_and_is_not_deleted(db):
    user = make_user()
    db.add(user)
    db.commit()

    assert user.id is not None
    assert user.created_at is not None
    assert user.updated_at is not None
    assert user.deleted_at is None


def test_email_is_stored_trimmed_and_lowercase():
    assert make_user("  Gui@Exemplo.COM ").email == "gui@exemplo.com"


def test_email_is_unique_ignoring_case(db):
    db.add_all([make_user("gui@exemplo.com"), make_user("GUI@exemplo.com")])
    with pytest.raises(IntegrityError):
        db.commit()


@pytest.mark.parametrize("field", ["email", "name", "password_hash"])
def test_required_fields(db, field):
    user = make_user()
    setattr(user, field, None)
    db.add(user)
    with pytest.raises(IntegrityError):
        db.commit()
