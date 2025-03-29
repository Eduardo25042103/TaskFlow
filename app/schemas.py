from pydantic import BaseModel
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: str = None


class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime

    class Config:
        orn_mode = True
