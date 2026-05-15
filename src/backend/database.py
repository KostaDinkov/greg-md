from sqlmodel import create_engine, Session
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # Default to localhost if not specified
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/gregmd")
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()

# Using standard synchronous psycopg2 for MVP ease, can switch to asyncpg later
engine = create_engine(settings.database_url, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
