from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user
from app.services.task_service import update_task, delete_task



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


@router.put("/{task_id}", response_model=schemas.Task)
def update_task_endpoint(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    #Convertimos el esquema a dict, excluyendo los campos que no se han enviado
    task_data = task_update.dict(exclude_unset=True)
    updated_task = update_task(db, task_id, task_data, current_user)
    if updated_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or not permitted")
    return updated_task


@router.delete("{task_id}")
def delete_task_endpoint(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    deleted_task = delete_task(db, task_id, current_user)
    if deleted_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or not permitted")
    return {"detail": "Task deleted successfully"}