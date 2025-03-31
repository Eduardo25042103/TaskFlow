import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_delete_task(client, test_user):
    """
    1. Se autentica el usuario de prueba.
    2. Se crea una tarea mediante el endpoint POST /tasks/.
    3. Se elimina la tarea con DELETE /tasks/{task_id}.
    4. Se verifica que la tarea ya no existe.
    """
    #Autenticación para obtener un token válido
    login_response = client.post("/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert login_response.status_code == 200, f"Login failed {login_response.json()}"
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}


    #Crear una tarea de prueba
    task_data = {"title": "Tarea a eliminar", "description": "Descripción", "completed": False}
    create_response = client.post("/tasks/", json=task_data, headers=headers)
    assert create_response.status_code == 201, f"Task creation failed: {create_response.json()}"
    created_task = create_response.json()
    task_id = created_task["id"]


    #Eliminar la tarea
    delete_response = client.delete(f"/tasks/{task_id}", headers=headers)
    assert delete_response.status_code == 204, f"Task deletion failed: {delete_response.json()}"


    #Intentar obtener la tarea eliminada
    get_response = client.get(f"/tasks/{task_id}", headers=headers)
    assert get_response.status_code == 404, "La tarea eliminada aún está accesible"


def test_delete_task_not_found(client, test_user): 
    """
    1. Se autentica el usuario de prueba.
    2. Se intenta eliminar una tarea con un ID inexistente.
    3. Se espera que devuelva un código 404.
    """
    #Autenticación
    login_response = client.post("/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}


    #Intentar eliminar una tarea con un ID inexistente
    non_existent_task_id = 9999
    delete_response = client.delete(f"/tasks/{non_existent_task_id}", headers=headers)


    #Verificar que devuelve 404 Not Found
    assert delete_response.status_code == 404, f"Expected 404, got {delete_response.status_code}: {delete_response.json()}"
    assert delete_response.json()["detail"] == "Task not found or not permitted", "El mensaje de error no coincide"