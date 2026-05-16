from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    # API settings
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8089"))

    # Database settings
    database_url: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/gregmd"
    )

    # Test mode settings
    test_mode: bool = os.getenv("TEST_MODE", "false").lower() == "true"

    # AI settings
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    use_dummy_llm: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
