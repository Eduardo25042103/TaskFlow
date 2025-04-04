import React, { useState, useEffect } from "react";

function TaskDashboard() {
    const [tasks, setTask] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    //Función para obtener el token desde localStorage
    const getToken = () => localStorage.getItem("token");


    // Función para obtener las tareas del usuario
    const fetchTasks = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
              method: "GET",
              headers: {
                "Contend-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`,
              },
            });
            if (!response.ok) {
                throw new Error(`Error al obtener tareas: ${response.status}`);
            }
            const data = await response.json();
            setTask(data);
        } catch(err) {
            console.error(err);
            setError("Error al obtener tareas");
        } finally {
            setIsLoading(false);
        }

    };

    // Se llama a fetchTasks al montar el componente
    useEffect(() => {
        fetchTasks();
    }, []);

    // Función para crear una nueva tarea
    const handleCreateTask = async (e) => {
        e.preventDefault();
        setError();
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDescription,
                    completed: false,
                }),
            });
            if (!response.ok){
                throw new Error(`Error al crear tarea ${response.status}`);
            }

            // Actualiza la lista de tareas con la tarea recién creada
            await fetchTasks();
            setNewTaskTitle("");
            setNewTaskDescription("");
        } catch (err) {
            console.error(err);
            setError("Error al crear la tarea");
        }
    };

    // Función para eliminar una tarea
    const handleDeleteTask = async (taskId) => {
        setError("");
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
            });
            if (response.status !== 204) {
                throw new Error (`Error al eliminar tarea: ${response.status}`);     
            }

            // Actualiza la lista de tareas después de eliminar
            await fetchTasks();
        } catch(err) {
            console.log(err);
            setError("Error al eliminar la tarea");
        }
    };

    const handleUpdateTask = async (taskId, updatedData) => {
        setError("");
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) {
                throw new Error(`Error al actualizar tarea: ${response.status}`);
            }

            // Actualiza la lista de tareas después de la actualización
            await fetchTasks();
        } catch (err) {
            console.error(err);
            setError("Error al actualizar la tarea");
        }
    };
    return(
        <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard de Tareas</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading ? (
        <p>Cargando tareas...</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{task.title}</h2>
                <p>{task.description}</p>
                <p className="text-sm text-gray-500">
                  Estado: {task.completed ? "Completada" : "Pendiente"}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handleUpdateTask(task.id, {
                      // Aquí puedes actualizar más campos según el formulario de edición
                      title: task.title + " (actualizado)",
                    })
                  }
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Formulario para crear una tarea */}
      <form onSubmit={handleCreateTask} className="mt-8 space-y-4">
        <h2 className="text-2xl font-bold">Crear Nueva Tarea</h2>
        <input
          type="text"
          placeholder="Título"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <textarea
          placeholder="Descripción"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        ></textarea>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Crear Tarea
        </button>
      </form>
    </div>     
    );
}

export default TaskDashboard;