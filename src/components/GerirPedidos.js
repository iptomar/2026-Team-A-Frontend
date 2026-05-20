import React, { useState, useEffect } from 'react';

function GerirPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch('http://localhost:3000/api/submissoes/todos', {
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'Aprovado': return 'status-publicado';
      case 'Pendente': return 'status-rascunho';
      case 'Rejeitado': return 'status-inativo';
      default: return '';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Gestão de Pedidos (Coordenador)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Visualize e gira todas as submissões dos professores (ordenados por mais antigos).</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>A carregar todos os pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Ainda não existem pedidos submetidos no sistema.
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '15px' }}>Professor</th>
                <th style={{ padding: '15px' }}>Título do Pedido</th>
                <th style={{ padding: '15px' }}>Data de Submissão</th>
                <th style={{ padding: '15px' }}>Estado</th>
                <th style={{ padding: '15px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px' }}>{pedido.professor?.email || 'N/A'}</td>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{pedido.tituloFormulario}</td>
                  <td style={{ padding: '15px' }}>{new Date(pedido.dataSubmissao).toLocaleString('pt-PT')}</td>
                  <td style={{ padding: '15px' }}>
                    <span className={`status-badge ${getStatusClass(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                      onClick={() => alert('Funcionalidade de análise do pedido ' + pedido._id)}
                    >
                      Analisar
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

export default GerirPedidos;
