import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password);
      // No need to navigate here, the login function will handle it
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-80 rounded-xl shadow-2xl overflow-hidden transition-colors duration-300">
          {/* Logo y encabezado */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-8 text-center transition-colors duration-300">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-400 to-blue-300 dark:from-blue-500 dark:to-blue-300 rounded-full flex items-center justify-center shadow-md transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-800 dark:text-blue-300 transition-colors duration-300">Taskflow</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-300">Gestiona tus tareas de manera eficiente</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-blue-300 mb-6 transition-colors duration-300">Iniciar Sesión</h3>
            
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-yellow-900/30 border-l-4 border-red-500 dark:border-yellow-500 p-4 rounded transition-colors duration-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500 dark:text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-yellow-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-400 focus:border-blue-500 transition-colors duration-300"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 transition-colors duration-300" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-400 focus:border-blue-500 transition-colors duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-300" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-500 hover:text-blue-400 dark:text-blue-300 dark:hover:text-blue-200 transition-colors duration-300">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 dark:from-blue-400 dark:to-blue-300 dark:hover:from-blue-500 dark:hover:to-blue-400 dark:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-300"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Iniciar Sesión"}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                ¿No tienes cuenta? <a href="#" className="font-medium text-blue-500 hover:text-blue-400 dark:text-blue-300 dark:hover:text-blue-200 transition-colors duration-300">Regístrate</a>
              </p>
            </div>
          </form>
        </div>
      </div>
      

      
      {/* Integrar el ThemeToggle */}
      <ThemeToggle />
    </div>
  );
}


export default LoginPage;