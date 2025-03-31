import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_update_task(client, test_user):
    """
    1. Se autentica el usuario de prueba para obtener un token JWT.
    2. Se crea una tarea mediante el endpoint POST /tasks/.
    3. Se actualiza la tarea usando PUT /tasks/{task_id}.
    4. Se verifica que la respuesta tenga los datos actualizados correctamente.
    """
    #Autenticación para obtener un token válido
    login_response = client.post("/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = login_response.json()["access_token"]
    print(login_response.json())
    print(token)
    headers = {"Authorization": f"Bearer {token}"}


    #Crear una tarea de prueba
    task_data = {"title": "Tareaa", "description": "Descripción", "completed": False}
    create_response = client.post("/tasks/", json=task_data, headers=headers)
    assert create_response.status_code == 201, f"Task creation failed: {create_response.json()}"
    created_task = create_response.json()
    task_id = created_task["id"]

    
    #Datos de actualización
    updated_data = {"title": "Tarea actualizada", "description": "Descripción actualizada", "completed": True}


    #Enviar solicitud de actualización
    updated_response = client.put(f"/tasks/{task_id}", json=updated_data, headers=headers)
    assert updated_response.status_code == 200, f"Task update failed: {updated_response.json()}"
    updated_task = updated_response.json()

    
    #Verificar que los datos han cambiado correctamente
    assert updated_task["id"] == task_id, "El ID de la tarea debería ser el mismo después de actualizar."
    assert updated_task["title"] == updated_data["title"], "El título no se actualizó correctamente."
    assert updated_task["description"] == updated_data["description"], "La descripción no se actualizó correctamente."
    assert updated_task["completed"] == updated_data["completed"], "El estado de completado no se actualizó correctamente."


def test_update_task_not_found(client, test_user):
    """
    1. Se autentica el usuario de prueba.
    2. Se intenta actualizar una tarea con un ID inexistente.
    3. Se espera que devuelva un código 404.
    """
    #Autenticación
    login_response = client.post("/auth/login", json={"email": "test@example.com", "password": "testpassword"})
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}


    #Intentar actualizar una tarea con un ID que no existe
    non_existent_task_id = 9999
    updated_data = {"title": "Titulo", "description": "Descripción", "completed": True}

    update_response = client.put(f"tasks/{non_existent_task_id}", json=updated_data, headers=headers)
    

    #Verificar que devuelve 404 Not Found
    assert update_response.status_code == 404, f"Expected 404, got {update_response.status_code}: {update_response.json()}"
    assert update_response.json()["detail"] == "Task not found or not permitted", "El mensaje de error no coincide"