import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

function TaskDashboard() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const { authFetch, logout, user } = useAuth();

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

    // Obtener el número de tareas completadas
    const completedTaskCount = tasks.filter(task => task.completed).length;
    
    // Calcular el progreso
    const progressPercentage = tasks.length > 0 
        ? Math.round((completedTaskCount / tasks.length) * 100) 
        : 0;

    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header con estadísticas */}
                <header className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Taskflow</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Tu panel de tareas</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Tareas completadas</p>
                                <p className="text-lg font-semibold">{completedTaskCount}/{tasks.length}</p>
                            </div>
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div 
                                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-4 rounded-full" 
                                    style={{ width: `${progressPercentage}%` }}>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={logout}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all duration-200 flex items-center space-x-2 btn-transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Salir</span>
                        </button>
                    </div>

                    {/* Progreso en móvil */}
                    <div className="mt-4 flex items-center space-x-2 md:hidden">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full" 
                                style={{ width: `${progressPercentage}%` }}>
                            </div>
                        </div>
                        <span className="text-sm font-medium">{progressPercentage}%</span>
                    </div>
                </header>

                {/* Mostrar errores */}
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg shadow-md fade-in">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón para mostrar/ocultar formulario en móvil */}
                <div className="md:hidden mb-6">
                    <button 
                        onClick={() => setIsFormExpanded(!isFormExpanded)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg shadow-md flex items-center justify-center space-x-2 btn-transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Nueva Tarea</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Columna de tareas */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Mis Tareas
                        </h2>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                {tasks.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center fade-in">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="mt-4 text-gray-600 dark:text-gray-300">No tienes tareas pendientes</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Crea una nueva tarea para comenzar</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {tasks.map((task) => (
                                            <div 
                                                key={task.id} 
                                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden card-hover fade-in"
                                            >
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                                                                {task.title}
                                                            </h3>
                                                            <p className={`mt-2 text-sm ${task.completed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                {task.description || 'Sin descripción'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                task.completed 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            }`}>
                                                                {task.completed ? 'Completada' : 'Pendiente'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleToggleComplete(task)}
                                                        className={`btn-transition px-3 py-1.5 text-sm font-medium rounded-lg ${
                                                            task.completed 
                                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                                        }`}
                                                    >
                                                        {task.completed ? (
                                                            <span className="flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Pendiente
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Completar
                                                            </span>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="btn-transition px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg flex items-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Columna de formulario */}
                    <div className={`${isFormExpanded || window.innerWidth >= 768 ? 'block' : 'hidden'}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-6 slide-in">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Nueva Tarea
                            </h2>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Título
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="title"
                                            type="text"
                                            placeholder="¿Qué necesitas hacer?"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Descripción (opcional)
                                    </label>
                                    <textarea
                                        id="description"
                                        placeholder="Añade los detalles de la tarea"
                                        value={newTaskDescription}
                                        onChange={(e) => setNewTaskDescription(e.target.value)}
                                        rows="4"
                                        className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 btn-transition"
                                >
                                    Crear Tarea
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <ThemeToggle />
        </div>
    );
}

export default TaskDashboard;