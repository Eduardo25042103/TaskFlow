from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.auth_service import hash_password, verify_password, create_access_token, decode_access_token
from datetime import timedelta


router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario en la base de datos."""
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")


    hashed_password = hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Autentica un usuario y devuelve un token JWT."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    token = create_access_token(data={"sub": db_user.email}, expires_delta=timedelta(minutes=30))
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials  # Extrae solo el token sin "Bearer "
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == payload.get("sub")).first()
    if user is None:
        raise credentials_exception

    return user
        