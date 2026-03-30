from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PROCURA"
    GEMINI_API_KEY: str = "AIzaSyBBLDkLERTlTmcATSbGuGnckUJS9dpW_9o"
    AI_MODEL: str = "gemini-2.5-flash"
    AI_PROVIDER: str = "google_genai"
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./procura.db"

    class Config:
        env_file = ".env"

settings = Settings()
