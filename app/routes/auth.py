from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.auth_service import hash_password, verify_password, create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from datetime import timedelta
from pydantic import BaseModel

router = APIRouter(tags=["auth"])
security = HTTPBearer()


class RefreshRequest(BaseModel):
    refresh_token: str


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
def login(user: schemas.UserLogin, db: Session = Depends(get_db), response: Response = None):
    """Autentica un usuario y devuelve un token JWT."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    #print(f"Intento de login con email: {user.email}") -> debug email
    if not db_user or not verify_password(user.password, db_user.hashed_password):

        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    access_token = create_access_token(data={"sub": db_user.email}, expires_delta=timedelta(minutes=30))
    # Añadir headers CORS adicionales manualmente (Ya no es necesario)
    """if response:
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept""" 
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh-token")
def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    """Genera un nuevo token de acceso usando un token de refresh válido"""
    #Decodifica y verifica el token de refresh
    payload = decode_refresh_token(request.refresh_token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token", headers={"WWW-Authenticate": "Bearer"},)
    
    #Verifica que el usuario existe
    email = payload.get("sub")
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found", headers={"WWW-Authenticate": "Bearer"},)
    
    # Generar nuevo token de acceso
    access_token = create_access_token(data={"sub": email})

    return {"access_token": access_token, "token_type": "bearer"}


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

        