from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # API settings
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/gregmd")
    
    # AI settings
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
