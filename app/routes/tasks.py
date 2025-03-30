from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = models.Task(**task.dict(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/", response_model=list[schemas.Task])
def get_tasks(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Obtiene todas las tareas del usuario autenticado."""
    return db.query(models.Task).filter(models.Task.user_id == user.id).all()
