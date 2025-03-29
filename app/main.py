from fastapi import FastAPI

app = FastAPI(title = "TaskFlow with Python and React", version = "1.0")

@app.get("/")
async def read_root():
    return {"message": "TaskFlow working"}