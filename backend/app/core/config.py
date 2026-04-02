from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PROCURA"
    GEMINI_API_KEY: str = "AIzaSyDDfC3PuithIFWjPbqsR2oQMOPF_SZZpJM"
    AI_MODEL: str = "gemini-2.5-flash"
    AI_PROVIDER: str = "google_genai"
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./procura.db"

    class Config:
        env_file = ".env"

settings = Settings()
