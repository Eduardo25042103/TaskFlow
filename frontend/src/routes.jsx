import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import TaskDashboard from "./pages/TaskDashboard";


function ProtectedRoute({children}) { 
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login"/>;
}

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/dashboard" element={<ProtectedRoute><TaskDashboard/></ProtectedRoute>}/>
                <Route path="/*" element={<Navigate to="/login" />}/>
            </Routes>
        </Router>
    );
}


export default AppRoutes;