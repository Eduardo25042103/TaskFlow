from fastapi import FastAPI
from app.routes import tasks, auth
from app import models
from app.database import engine
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title = "TaskFlow with Python and React", version = "1.0")
frontend_url = os.getenv("FRONTEND_URL", "https://legendary-space-adventure-w6q44575754c7pp-5173.app.github.dev")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["frontend_url"],  # En desarrollo, permite todos los orígenes
    allow_origin_regex=r"https://.*\.app\.github\.dev",  # Permite cualquier subdominio de github.dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

# Crea la base de datos si no existe
models.Base.metadata.create_all(bind=engine)


@app.get("/")
async def read_root():
    return {"message": "TaskFlow working"}