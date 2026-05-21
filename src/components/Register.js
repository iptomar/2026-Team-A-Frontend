import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('professor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Conta criada com sucesso! Faça login para continuar.');
        navigate('/');
      } else {
        setError(data.error || 'Erro ao criar conta.');
      }
    } catch (err) {
      setError('Erro de ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>Criar Conta</h2>
          <p style={{ color: 'var(--text-muted)' }}>Registe-se para aceder ao sistema</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
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
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Tipo de Utilizador</label>
            <select 
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="professor">Professor</option>
              <option value="admin">Administrador</option>
              <option value="coordenador">Coordenador</option>
            </select>
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

          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px' }}>Confirmar Palavra-passe</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'A criar conta...' : 'Registar'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Já tem uma conta? <Link to="/" style={{ color: 'var(--primary-green)', fontWeight: 'bold', textDecoration: 'none' }}>Faça Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
