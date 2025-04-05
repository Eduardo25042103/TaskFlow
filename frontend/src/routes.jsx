import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import TaskDashboard from "./pages/TaskDashboard";
import { useAuth } from "./contexts/AuthContext";


function ProtectedRoute({ children }) { 
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
}


// Wrapper para proporcionar el contexto de autenticación
function AuthenticatedApp() {
    return(
        <Routes>
            <Route path="/login" element={<LoginPage />}/>
            <Route path="/dashboard" element={<ProtectedRoute><TaskDashboard /></ProtectedRoute>}/>
            <Route path="/*" element={<Navigate to="/login" />}/>
       </Routes>
    );
}

function AppRoutes() {
    return (
        <Router>
            <AuthProvider>
                <AuthenticatedApp />
            </AuthProvider>
        </Router>
    );
}


export default AppRoutes;