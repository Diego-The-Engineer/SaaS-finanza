import './style.css'; 
import { AuthProvider, useAuth } from './auth/AuthContext';
import Dashboard from './pages/dashboard';
import Login from './pages/login';

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
