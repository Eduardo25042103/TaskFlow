import { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if(token) {
      localStorage.setItem('token', token) //Guarda el token al iniciar sesión
    }
  }, [token]);

  const handleLogin = (newToken) => {
     setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  //Si no hay token, mostrar la página de login; de lo contrario, mostrar el dashboard 

  return (
    <div>
      {token ? (
        <Dashboard onLogout={handleLogout}/>
      ) : (
        <LoginPage onLogin={handleLogin}/> 
      )}
    </div>
  );  
}

function Dashboard({onLogout}) {
  return(
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Bienvenido al Dashboard</h1>
      <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
        Cerrar Sesión</button>
    </div>
  );
}

export default App
