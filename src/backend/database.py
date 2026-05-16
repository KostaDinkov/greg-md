from sqlmodel import create_engine, Session
from config import settings

# Using standard synchronous psycopg2 for MVP ease, can switch to asyncpg later
engine = create_engine(settings.database_url, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
