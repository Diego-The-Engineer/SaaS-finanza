import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import '../styles/login.css';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await iniciarSesion(form.username, form.password); 
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <h1><span className="naranja">Pre</span>mier</h1>
        <p className="login-subtitulo">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              value={form.username}
              onChange={cambiar('username')}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              value={form.password}
              onChange={cambiar('password')}
              required
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>

          {cargando && (
            <p className="login-nota">Si el servidor estaba dormido, la primera vez puede tardar hasta un minuto.</p>
          )}
        </form>
      </div>
    </div>
  );
}
