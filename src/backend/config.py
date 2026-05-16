from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # API settings
    api_host: str = "0.0.0.0"
    api_port: int = 8089

    # Database settings
    database_url: str = "postgresql://postgres:postgres@localhost:5432/gregmd"

    # Test mode settings
    test_mode: bool = False

    # AI settings
    google_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    use_dummy_llm: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
