import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function TaskDashboard() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { authFetch, logout } = useAuth();

    const API_URL = import.meta.env.VITE_API_URL || "https://legendary-space-adventure-w6q44575754c7pp-8000.app.github.dev";

    // Función para obtener las tareas del usuario
    const fetchTasks = async () => {
        setIsLoading(true);
        setError("");
        try {
            console.log("Fetching tasks from:", `${API_URL}/tasks/`);
            
            const response = await authFetch(`${API_URL}/tasks/`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error(`Error al obtener tareas: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Tasks received:", data);
            setTasks(data);
        } catch(err) {
            console.error("Error fetching tasks:", err);
            setError(`Error al obtener tareas: ${err.message}`);
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
        setError("");
        try{
            const response = await authFetch(`${API_URL}/tasks/`, {
                method: "POST",
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDescription,
                    completed: false,
                }),
            });
            
            if (!response.ok){
                const errorText = await response.text();
                console.error("Error creating task:", errorText);
                throw new Error(`Error al crear tarea: ${response.status}`);
            }

            // Actualiza la lista de tareas con la tarea recién creada
            await fetchTasks();
            setNewTaskTitle("");
            setNewTaskDescription("");
        } catch (err) {
            console.error("Error creating task:", err);
            setError("Error al crear la tarea");
        }
    };

    // Función para eliminar una tarea
    const handleDeleteTask = async (taskId) => {
        setError("");
        try{
            const response = await authFetch(`${API_URL}/tasks/${taskId}`, {
                method: "DELETE",
            });
            
            if (response.status !== 204) {
                const errorText = await response.text();
                console.error("Error deleting task:", errorText);
                throw new Error(`Error al eliminar tarea: ${response.status}`);     
            }

            // Actualiza la lista de tareas después de eliminar
            await fetchTasks();
        } catch(err) {
            console.error("Error deleting task:", err);
            setError("Error al eliminar la tarea");
        }
    };

    const handleUpdateTask = async (taskId, updatedData) => {
        setError("");
        try{
            const response = await authFetch(`${API_URL}/tasks/${taskId}`, {
                method: "PUT",
                body: JSON.stringify(updatedData),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error updating task:", errorText);
                throw new Error(`Error al actualizar tarea: ${response.status}`);
            }

            // Actualiza la lista de tareas después de la actualización
            await fetchTasks();
        } catch (err) {
            console.error("Error updating task:", err);
            setError("Error al actualizar la tarea");
        }
    };
    
    // Mostrar un toggle para completar/incompleta
    const handleToggleComplete = async (task) => {
        await handleUpdateTask(task.id, { completed: !task.completed });
    };

    return(
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard de Tareas</h1>
                <button 
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Cerrar Sesión
                </button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {isLoading ? (
                <p>Cargando tareas...</p>
            ) : (
                <ul className="space-y-4">
                    {tasks.length === 0 && !isLoading ? (
                        <p>No hay tareas disponibles. Crea una nueva tarea abajo.</p>
                    ) : (
                        tasks.map((task) => (
                            <li key={task.id} className="p-4 border rounded flex justify-between items-center">
                                <div>
                                    <h2 className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                        {task.title}
                                    </h2>
                                    <p>{task.description}</p>
                                    <p className="text-sm text-gray-500">
                                        Estado: {task.completed ? "Completada" : "Pendiente"}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleToggleComplete(task)}
                                        className={`px-3 py-1 ${task.completed ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded`}
                                    >
                                        {task.completed ? "Marcar Pendiente" : "Completar"}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
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