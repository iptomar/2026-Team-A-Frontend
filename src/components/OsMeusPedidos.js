import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OsMeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch('http://localhost:3000/api/submissoes/meus', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setPedidos(dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar pedidos:', erro);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado': return 'var(--success-text)';
      case 'Rejeitado': return 'var(--error-text)';
      case 'Pendente': return 'var(--text-muted)';
      default: return 'inherit';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Os Meus Pedidos</h2>
          <p style={{ color: 'var(--text-muted)' }}>Consulte aqui o estado das suas submissões.</p>
        </div>
        <button className="btn-primary" onClick={() => window.location.href = '/professor'}>
          Nova Requisição
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>A carregar os seus pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Ainda não efetuou nenhum pedido.
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '15px' }}>Título do Pedido</th>
                <th style={{ padding: '15px' }}>Data de Submissão</th>
                <th style={{ padding: '15px' }}>Estado</th>
                <th style={{ padding: '15px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{pedido.tituloFormulario}</td>
                  <td style={{ padding: '15px' }}>{new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      fontWeight: '700', 
                      color: getStatusColor(pedido.estado),
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: pedido.estado === 'Pendente' ? '#f0f0f0' : 'transparent'
                    }}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                      onClick={() => navigate(`/detalhes-pedido/${pedido._id}`)}
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OsMeusPedidos;
