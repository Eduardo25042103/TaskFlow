import { useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage'; 

function App() {
  const [token, setToken] = useState(null);


  const handleLogin = (token) => {
    // Aquí podria guardar en localStorage o actualizar un contexto global
  };

  //Si no hay token, mostrar la página de login; de lo contrario, mostrar el dashboard 

  return (
    <div>
      {token ? (
        <h1>Bienvenido al Dashboard de Taskflow</h1>
      ) : (
        <LoginPage onLogin={handleLogin}/> 
      )}
    </div>
  );  
}

export default App
