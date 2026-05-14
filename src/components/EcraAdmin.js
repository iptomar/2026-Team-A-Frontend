import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EcraAdmin() {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarFormularios = async () => {
    setLoading(true);
    try {
      const resposta = await fetch('http://localhost:3000/api/forms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setFormularios(dados);
      } else {
        console.error('Erro ao carregar formulários do servidor');
      }
    } catch (erro) {
      console.error('Erro de rede ao carregar:', erro);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFormularios();
  }, []);

  const apagarFormulario = async (id) => {
    if (!window.confirm('Tem a certeza que deseja apagar este formulário?')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      if (resposta.ok) {
        alert('Formulário apagado com sucesso!');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (erro) {
      console.error('Erro ao apagar:', erro);
    }
  };

  const getStatusClass = (estado) => {
    switch (estado) {
      case 'Publicado': return 'status-publicado';
      case 'Rascunho': return 'status-rascunho';
      default: return 'status-inativo';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Painel de Administração</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerir formulários e configurações do sistema.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/criar-formulario')}
          style={{ padding: '12px 25px' }}
        >
          + Criar Novo Formulário
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>A carregar formulários...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '15px 20px' }}>Título do Formulário</th>
                <th style={{ padding: '15px 20px' }}>Estado</th>
                <th style={{ padding: '15px 20px' }}>Data Criacão</th>
                <th style={{ padding: '15px 20px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {formularios.map((form) => (
                <tr key={form._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px 20px', fontWeight: '600' }}>{form.titulo}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span className={`status-badge ${getStatusClass(form.estado)}`}>
                      {form.estado}
                    </span>
                  </td>
                  <td style={{ padding: '15px 20px', color: 'var(--text-muted)' }}>
                    {new Date(form.dataCriacao || form.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-logout" 
                        style={{ padding: '5px 12px' }}
                        onClick={() => navigate('/editar-formulario')}
                        disabled={form.estado === 'Publicado'}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-logout" 
                        style={{ padding: '5px 12px', color: form.estado === 'Publicado' ? '#ccc' : 'var(--error-text)' }}
                        onClick={() => apagarFormulario(form._id)}
                        disabled={form.estado === 'Publicado'}
                      >
                        Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && formularios.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum formulário encontrado na base de dados.
          </div>
        )}
      </div>
    </div>
  );
}

export default EcraAdmin;
