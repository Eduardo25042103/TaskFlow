from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class TaskBase(BaseModel):
    title: str
    description: str = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

    class Config:
        orm_mode = True


class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    user_id: int

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
