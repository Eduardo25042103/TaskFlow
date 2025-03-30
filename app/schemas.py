from pydantic import BaseModel, EmailStr
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
        orm_mode = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True
