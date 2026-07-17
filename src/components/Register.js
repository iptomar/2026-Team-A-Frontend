import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('professor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [curso, setCurso] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async e => {
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          role,
          curso
        })
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
  return <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Criar Conta</h2>
          <p className="auth-subtitle">Registe-se para aceder ao sistema</p>
        </div>

        {error && <div className="auth-error">
            {error}
          </div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div>
            <label className="auth-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@ipt.pt" required disabled={loading} />

          </div>

          <div>
            <label className="auth-label">Tipo de Utilizador</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)} disabled={loading}>

              <option value="professor">Professor</option>
              <option value="aluno">Aluno</option>
              <option value="coordenador">Coordenador</option>
              <option value="diretor">Diretor de Curso</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {(role === 'aluno' || role === 'diretor' || role === 'professor') && <div>
              <label className="auth-label">Curso</label>
              <input type="text" className="form-input" value={curso} onChange={e => setCurso(e.target.value)} placeholder="Ex: Engenharia Informática, Design, etc." required disabled={loading} />

            </div>}

          <div>
            <label className="auth-label">Palavra-passe</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />

          </div>

          <div>
            <label className="auth-label">Confirmar Palavra-passe</label>
            <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />

          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>

            {loading ? 'A criar conta...' : 'Registar'}
          </button>
        </form>

        <div className="auth-account-link">
          Já tem uma conta? <Link to="/" className="auth-link">Faça Login</Link>
        </div>
      </div>
    </div>;
}
export default Register;
