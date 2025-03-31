import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_read_tasks(client, test_user):
    """
    1. Se autentica el usuario de prueba para obtener un token JWT.
    2. Se crean varias tareas mediante el endpoint POST /tasks/.
    3. Se realiza una solicitud GET a /tasks/ para obtener todas las tareas del usuario.
    4. Se verifica que el número de tareas retornadas coincida con las creadas y se comparan algunos datos.
    """
    #Autenticación para obtener un token válido
    login_response = client.post("/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}


    #Crear varias tareas de prueba
    tasks_to_create = [
        {"title": "Tarea 1", "description": "Descripción 1", "completed": False},
        {"title": "Tarea 2", "description": "Descripción 2", "completed": True},
        {"title": "Tarea 3", "description": "Descripción 3", "completed": False},
    ]
    created_tasks = []
    for task in tasks_to_create:
        create_response = client.post("/tasks/", json=task, headers=headers)
        assert create_response.status_code == 201, f"Task creation failed: {create_response.json()}"
        created_tasks.append(create_response.json())


    #Leer todas las tareas del usuario autenticado
    read_response = client.get("tasks/", headers=headers)
    assert read_response.status_code == 200, f"Reading tasks failed: {read_response.json()}"
    read_tasks = read_response.json()


    #Verificar que se han creado todas las tareas
    assert len(read_tasks) == len(tasks_to_create), "El número de tareas leídas no coincide con las creadas."
    
    #Opcional: comparar títulos y otros campos
    for created, read in zip(created_tasks, read_tasks):
        assert created["title"] == read["title"]
        assert created["description"] == read["description"]
        assert created["completed"] == read["completed"]


def test_read_task_by_id(client, test_user):
    """
    1. Se autentica al usuario de prueba para obtener un token.
    2. Se crea una tarea específica.
    3. Se lee la tarea utilizando GET /tasks/{task_id}.
    4. Se verifica que los datos retornados coinciden con los enviados.
    """
    #Autenticación para obtener un token válido
    login_response = client.post("/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}


    #Crear una tarea específica
    task_data = {"title": "Tarea específica", "description": "Descripción", "completed": False}
    create_response = client.post("/tasks/", json=task_data, headers=headers)
    assert create_response.status_code == 201, f"Task creation failed: {create_response.json()}"
    created_task = create_response.json()


    #Leer la tarea por su ID
    task_id = created_task["id"]
    read_response = client.get(f"/tasks/{task_id}", headers=headers)
    assert read_response.status_code == 200, f"Reading task failed: {read_response.json()}"
    read_task = read_response.json()


    #Verificar que los datos coinciden
    assert read_task["title"] == task_data["title"]
    assert read_task["description"] == task_data["description"]
    assert read_task["completed"] == task_data["completed"]
