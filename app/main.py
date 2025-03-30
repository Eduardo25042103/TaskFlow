from fastapi import FastAPI
from app.routes import tasks, auth
from app import models
from app.database import engine

app = FastAPI(title = "TaskFlow with Python and React", version = "1.0")


app.include_router(tasks.router)
app.include_router(auth.router)

# Crea la base de datos si no existe
models.Base.metadata.create_all(bind=engine)


@app.get("/")
async def read_root():
    return {"message": "TaskFlow working"}