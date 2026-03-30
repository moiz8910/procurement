from backend.app.db.session import engine, Base
from backend.app.utils.dummy_data import generate_dummy_data

def init_db():
    print("[DB] Re-initializing database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    generate_dummy_data()

if __name__ == "__main__":
    init_db()
