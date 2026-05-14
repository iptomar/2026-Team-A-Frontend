import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh' 
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>Bem-vindo</h2>
          <p style={{ color: 'var(--text-muted)' }}>Inicie sessão para aceder ao sistema</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'var(--error-bg)', 
            color: 'var(--error-text)', 
            padding: '10px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1rem',
            fontSize: '0.9rem',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@ipt.pt"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Palavra-passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ padding: '12px', fontSize: '1rem', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'A autenticar...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Não tem conta? <Link to="/register" style={{ color: 'var(--primary-green)', fontWeight: 'bold', textDecoration: 'none' }}>Crie uma nova conta</Link>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © 2026 - Instituto Politécnico de Tomar
        </div>
      </div>
    </div>
  );
}

export default Login;
