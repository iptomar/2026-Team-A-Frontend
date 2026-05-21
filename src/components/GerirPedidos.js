import React, { useState, useEffect } from 'react';

function GerirPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Pendente');
  const [pesquisaNome, setPesquisaNome] = useState('');

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('DEBUG: Carregando pedidos para utilizador:', user?.role);
      
      const resposta = await fetch('http://localhost:3000/api/submissoes/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        console.log('DEBUG: Pedidos recebidos do servidor:', dados);
        setPedidos(dados);
      } else {
        const errorData = await resposta.json().catch(() => ({}));
        console.error('Resposta do servidor não foi OK:', resposta.status, errorData);
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

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const correspondeEstado = filtroEstado === 'Todos' || pedido.estado === filtroEstado;
    const titulo = pedido.tituloFormulario || '';
    const correspondeNome = titulo.toLowerCase().includes(pesquisaNome.toLowerCase());
    return correspondeEstado && correspondeNome;
  });

  console.log('DEBUG: Pedidos filtrados para exibição:', pedidosFiltrados.length);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Gestão de Pedidos (Coordenador)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Motor de filtragem e visualização de submissões.</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="pesquisaNome" style={{ fontWeight: '500' }}>Pesquisar Nome:</label>
          <input
            id="pesquisaNome"
            type="text"
            placeholder="Filtrar por nome..."
            value={pesquisaNome}
            onChange={(e) => setPesquisaNome(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', minWidth: '250px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="filtroEstado" style={{ fontWeight: '500' }}>Estado:</label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
          >
            <option value="Todos">Todos os Estados</option>
            <option value="Pendente">Pendentes</option>
            <option value="Aprovado">Aprovados</option>
            <option value="Rejeitado">Rejeitados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>A carregar dados do servidor...</div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Ainda não existem pedidos submetidos no sistema.
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Nenhum pedido corresponde aos critérios de filtragem.
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '15px' }}>Nome</th>
                <th style={{ padding: '15px' }}>Data</th>
                <th style={{ padding: '15px' }}>Professor</th>
                <th style={{ padding: '15px' }}>Estado</th>
                <th style={{ padding: '15px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{pedido.tituloFormulario}</td>
                  <td style={{ padding: '15px' }}>{new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}</td>
                  <td style={{ padding: '15px' }}>{pedido.professor?.email || 'N/A'}</td>
                  <td style={{ padding: '15px' }}>
                    <span className={`status-badge ${getStatusClass(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                      onClick={() => alert('Analisar pedido: ' + pedido.tituloFormulario)}
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
