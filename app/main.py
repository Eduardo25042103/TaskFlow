from fastapi import FastAPI
from app.routes import tasks

app = FastAPI(title = "TaskFlow with Python and React", version = "1.0")


app.include_router(tasks.router)


@app.get("/")
async def read_root():
    return {"message": "TaskFlow working"}