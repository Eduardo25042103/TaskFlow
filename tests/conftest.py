import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.database import Base, get_db
from app.main import app

#Configuración de la base de datos en memoria con SQLite.
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

#Para SQLite se requiere el argumento "check_same_thread" en True o False dependiendo.
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread":False})


#Crea una sesión para pruebas
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


#Crear todas las tablas en la base de datos de prueba
Base.metadata.create_all(bind=engine)


#Override de la dependencia get_db para usar la sesión de testing
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


#Sobrescribe la dependencia en la aplicación
app.dependency_overrides[get_db] = override_get_db


#Fixture de pytest para el cliente de pruebas.
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c