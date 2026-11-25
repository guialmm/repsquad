"""Exemplo de teste de propriedades (Hypothesis): modelo para copiar.

Em vez de escrever exemplos à mão, a gente descreve uma regra que vale para
QUALQUER entrada, e o Hypothesis gera centenas de textos (com acento, emoji,
espaços estranhos, vazio...) tentando quebrar a regra. Se achar um caso que
quebra, ele mostra o menor exemplo possível.
"""

from hypothesis import given
from hypothesis import strategies as st

from app.seed.exercises import normalize_alias


@given(st.text())
def test_normalizing_twice_changes_nothing(alias):
    once = normalize_alias(alias)
    assert normalize_alias(once) == once


@given(st.text())
def test_result_has_no_extra_spaces_and_no_uppercase(alias):
    result = normalize_alias(alias)

    assert result == result.strip()
    assert "  " not in result
    assert result == result.lower()


@given(st.text(alphabet=st.characters(categories=["L", "N"]), min_size=1))
def test_words_survive_surrounding_spaces(word):
    assert normalize_alias(f"   {word} \t\n") == word.lower()
