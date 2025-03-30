from sqlalchemy.orm import Session
from app import models


def update_task(db:Session, task_id: int, task_data: dict, current_user:models.User):
    """
    Actualiza una tarea: busca la tarea por ID y que pertenezca al usuario autenticado.
    Si se encuentra, actualiza los campos enviados, hace commit y devuelve la tarea.
    Si no, devuelve None.
    """
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()
    if not task:
        return None
    

    #Actualiza únicamente los campos que se han enviado
    for key, value in task_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int, current_user: models.User):
    """
    Busca la tarea por ID que pertenezca al usuario autenticado.
    Si la encuentra, la elimina y realiza commit en la base de datos.
    Devuelve la tarea eliminada, o None si no se encontró.
    """
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()
    if not task:
        return None
    
    db.delete(task)
    db.commit()
    return task