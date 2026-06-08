import React, { useState, useEffect } from 'react';

function GerirPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Pendente');
  const [pesquisaNome, setPesquisaNome] = useState('');
  
  // Estados para o modal de decisão
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [justificacao, setJustificacao] = useState('');
  const [processando, setProcessando] = useState(false);

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

  const tomarDecisao = async (novoEstado) => {
    if (novoEstado === 'Rejeitado' && !justificacao.trim()) {
      alert('Por favor, indique uma justificação para a rejeição.');
      return;
    }

    setProcessando(true);
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch(`http://localhost:3000/api/submissoes/${pedidoSelecionado._id}/decisao`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          estado: novoEstado,
          justificacaoRejeicao: justificacao
        })
      });

      if (resposta.ok) {
        // Atualizar lista local
        setPedidos(pedidos.map(p => p._id === pedidoSelecionado._id ? { ...p, estado: novoEstado, justificacaoRejeicao: justificacao } : p));
        setPedidoSelecionado(null);
        setJustificacao('');
        alert(`Pedido ${novoEstado.toLowerCase()} com sucesso!`);
      } else {
        alert('Erro ao registar decisão.');
      }
    } catch (erro) {
      console.error('Erro:', erro);
    } finally {
      setProcessando(false);
    }
  };

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

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Gestão de Pedidos (Coordenador)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analise e decida sobre as submissões dos professores.</p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="pesquisaNome" style={{ fontWeight: '500' }}>Pesquisar:</label>
          <input
            id="pesquisaNome"
            type="text"
            placeholder="Nome do formulário..."
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
      ) : pedidosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '15px' }}>Formulário</th>
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
                    {pedido.estado === 'Pendente' ? (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                        onClick={() => setPedidoSelecionado(pedido)}
                      >
                        Analisar
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Decidido</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Decisão */}
      {pedidoSelecionado && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Analisar Pedido</h3>
              <button onClick={() => {setPedidoSelecionado(null); setJustificacao('');}} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p><strong>Formulário:</strong> {pedidoSelecionado.tituloFormulario}</p>
              <p><strong>Professor:</strong> {pedidoSelecionado.professor?.email}</p>
              <div style={{ marginTop: '1rem', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Respostas:</h4>
                {Object.entries(pedidoSelecionado.respostas).map(([key, val]) => (
                  <div key={key} style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
                    <span style={{ color: '#666' }}>{key}:</span> {val}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Justificação (obrigatória em caso de rejeição):
              </label>
              <textarea
                value={justificacao}
                onChange={(e) => setJustificacao(e.target.value)}
                placeholder="Escreva aqui o motivo..."
                rows="4"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn-logout" 
                onClick={() => setPedidoSelecionado(null)}
                disabled={processando}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                style={{ backgroundColor: '#dc3545' }}
                onClick={() => tomarDecisao('Rejeitado')}
                disabled={processando}
              >
                Rejeitar
              </button>
              <button 
                className="btn-primary" 
                style={{ backgroundColor: '#28a745' }}
                onClick={() => tomarDecisao('Aprovado')}
                disabled={processando}
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GerirPedidos;
