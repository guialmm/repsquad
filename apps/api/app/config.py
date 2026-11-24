from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração lida de variáveis de ambiente ou do arquivo .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://treinos:treinos@localhost:5432/treinos"
    jwt_secret: str = "dev-secret-troque"
    cors_origins: list[str] = ["*"]


settings = Settings()
