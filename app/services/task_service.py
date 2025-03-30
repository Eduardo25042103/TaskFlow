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