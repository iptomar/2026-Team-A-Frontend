import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  return <div className="login-style-1">





      <div className="card login-style-2">
        <div className="login-style-3">
          <h2 className="login-style-4">Bem-vindo</h2>
          <p className="login-style-5">Inicie sessão para aceder ao sistema</p>
        </div>

        {error && <div className="login-style-6">









            {error}
          </div>}

        <form onSubmit={handleSubmit} className="login-style-7">
          <div>
            <label className="login-style-8">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@ipt.pt" required disabled={loading} />

          </div>

          <div>
            <label className="login-style-9">Palavra-passe</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />

          </div>

          <button type="submit" className="btn-primary login-style-10" disabled={loading}>

            {loading ? 'A autenticar...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="login-style-11">
          Não tem conta? <Link to="/register" className="login-style-12">Crie uma nova conta</Link>
        </div>

        <div className="login-style-13">
          © 2026 - Instituto Politécnico de Tomar
        </div>
      </div>
    </div>;
}
export default Login;
