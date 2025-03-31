import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_create_task(client, test_user):
    #Prueba la creación de una tarea
    
    #Simulación de autenticación para obtener un token válido
    login_response = client.post("/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}


    #Datos de prueba para la tarea
    task_data = {
        "title": "Nueva tarea",
        "description": "Descripción de la tarea de prueba",
        "completed": False
    }


    #Enviar la solicitud para crear la tarea
    create_response = client.post("/tasks/", json=task_data, headers=headers)


    #Verificar que la tarea se haya creado exitosamente
    assert create_response.status_code == 201, f"Task creation failed: {create_response.json()}"
    task = create_response.json()
    assert task["title"] == task_data["title"]
    assert task["description"] == task_data["description"]
    assert task["completed"] == task_data["completed"]


def test_create_task_missing_field(client, test_user):

    # Primero, obtén un token válido
    login_response = client.post("/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    

    response = client.post("/tasks/", json={"description": "Sin título"}, headers=headers)
    assert response.status_code == 422, f"Expected 422 but got {response.status_code}: {response.json()}"

