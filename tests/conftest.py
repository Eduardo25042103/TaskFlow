import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.models import User
from app.routes.auth import hash_password
from app.main import app
from fastapi.testclient import TestClient

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # Crea las tablas al inicio del test
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    # Limpia la base de datos al final del test
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="function")
def test_user(db_session):
    """Crea un usuario de prueba en la base de datos."""
    # Verifica si el usuario ya existe (solo para evitar duplicados si la BD persiste)
    existing_user = db_session.query(User).filter(User.email == "test@example.com").first()
    if existing_user:
        return existing_user

    new_user = User(
        email="test@example.com",
        hashed_password=hash_password("testpassword")  # Hashea la contraseña antes de guardarla
    )
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)
    return new_user
