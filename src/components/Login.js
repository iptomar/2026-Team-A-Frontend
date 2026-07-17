import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
function Login({
  onLogin
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      const data = await response.json();
      if (response.ok) {
        // Guarda o token e dados do utilizador
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Notifica o componente pai para redirecionar
        onLogin(data.user);
      } else {
        setError(data.error || 'Erro ao iniciar sessão.');
      }
    } catch (err) {
      setError('Erro de ligação ao servidor. Verifique se o backend está a correr.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="auth-page">





      <div className="card auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Bem-vindo</h2>
          <p className="auth-subtitle">Inicie sessão para aceder ao sistema</p>
        </div>

        {error && <div className="auth-error">









            {error}
          </div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="auth-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@ipt.pt" required disabled={loading} />

          </div>

          <div>
            <label className="auth-label">Palavra-passe</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />

          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>

            {loading ? 'A autenticar...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="auth-account-link">
          Não tem conta? <Link to="/register" className="auth-link">Crie uma nova conta</Link>
        </div>

        <div className="auth-footer">
          © 2026 - Instituto Politécnico de Tomar
        </div>
      </div>
    </div>;
}
export default Login;
