import React, { useState, useEffect } from 'react';

function OsMeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Pendente');
  const [ordenacaoData, setOrdenacaoData] = useState('desc');

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

  const getStatusClass = (status) => {
    switch (status) {
      case 'Aprovado': return 'status-publicado';
      case 'Pendente': return 'status-rascunho';
      case 'Rejeitado': return 'status-inativo';
      default: return '';
    }
  };

  const pedidosFiltrados = pedidos
    .filter((pedido) => filtroEstado === 'Todos' || pedido.estado === filtroEstado)
    .sort((a, b) => {
      const dataA = new Date(a.dataSubmissao).getTime();
      const dataB = new Date(b.dataSubmissao).getTime();
      return ordenacaoData === 'asc' ? dataA - dataB : dataB - dataA;
    });

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

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="filtroEstado" style={{ fontWeight: '500' }}>Filtrar por estado:</label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
          >
            <option value="Todos">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: '500' }}>Ordenar por data:</span>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setOrdenacaoData((current) => (current === 'desc' ? 'asc' : 'desc'))}
            style={{ padding: '8px 12px', minWidth: 'max-content' }}
          >
            {ordenacaoData === 'desc' ? 'Mais recentes' : 'Mais antigos'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>A carregar os seus pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Ainda não efetuou nenhum pedido.
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Nenhum pedido correspondente ao filtro "{filtroEstado}".
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '15px' }}>Nome</th>
                <th style={{ padding: '15px' }}>Data</th>
                <th style={{ padding: '15px' }}>Estado</th>
                <th style={{ padding: '15px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{pedido.tituloFormulario}</td>
                  <td style={{ padding: '15px' }}>{new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}</td>
                  <td style={{ padding: '15px' }}>
                    <span className={`status-badge ${getStatusClass(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                      onClick={() => alert('Visualizar detalhes do pedido ' + pedido._id)}
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
