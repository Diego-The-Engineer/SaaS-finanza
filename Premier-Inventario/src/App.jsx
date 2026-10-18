import './style.css'; 
import { AuthProvider, useAuth } from './auth/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function Contenido() {
  const { autenticado } = useAuth();
  return autenticado ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Contenido />
    </AuthProvider>
  );
}
