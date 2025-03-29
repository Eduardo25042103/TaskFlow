import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv() # Carga variables del archivo .env

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://usuario:contraseñaa@localhost:5432/mi_base")


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()