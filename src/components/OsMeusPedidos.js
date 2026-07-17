import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OsMeusPedidos.css';
function OsMeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Pendente');
  const [ordenacaoData, setOrdenacaoData] = useState('desc');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
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
  const getStatusClass = status => {
    switch (status) {
      case 'Aprovado':
        return 'status-publicado';
      case 'Pendente':
        return 'status-rascunho';
      case 'Rejeitado':
        return 'status-inativo';
      default:
        return '';
    }
  };
  const pedidosFiltrados = pedidos.filter(pedido => filtroEstado === 'Todos' || pedido.estado === filtroEstado).sort((a, b) => {
    const dataA = new Date(a.dataSubmissao).getTime();
    const dataB = new Date(b.dataSubmissao).getTime();
    return ordenacaoData === 'asc' ? dataA - dataB : dataB - dataA;
  });
  return <div>
      <div className="my-requests__header">
        <div>
          <h2>Os Meus Pedidos</h2>
          <p className="my-requests__intro">Consulte aqui o estado das suas submissões.</p>
        </div>
        <button className="btn-primary" onClick={() => window.location.href = user?.role === 'aluno' ? '/aluno' : '/professor'}>

          Nova Requisição
        </button>
      </div>

      <div className="request-filters">
        <div className="my-request-filters__field">
          <label htmlFor="filtroEstado" className="my-request-filters__label">Filtrar por estado:</label>
          <select id="filtroEstado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="my-request-filters__control">


            <option value="Todos">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
          </select>
        </div>

        <div className="my-request-filters__field">
          <span className="my-request-filters__label">Ordenar por data:</span>
          <button className="btn-secondary my-request-filters__sort-button" type="button" onClick={() => setOrdenacaoData(current => current === 'desc' ? 'asc' : 'desc')}>


            {ordenacaoData === 'desc' ? 'Mais recentes' : 'Mais antigos'}
          </button>
        </div>
      </div>

      {loading ? <div className="my-requests__loading">A carregar os seus pedidos...</div> : pedidos.length === 0 ? <div className="card my-requests__empty-state">
          Ainda não efetuou nenhum pedido.
        </div> : pedidosFiltrados.length === 0 ? <div className="card my-requests__empty-state">
          Nenhum pedido correspondente ao filtro "{filtroEstado}".
        </div> : <div className="card request-table-card">
          <table className="request-table">
            <thead className="request-table__head">
              <tr>
                <th className="request-table__heading">Nome</th>
                <th className="request-table__heading">Data</th>
                <th className="request-table__heading">Estado</th>
                <th className="request-table__heading">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => <tr key={pedido._id} className="request-table__row">
                  <td className="request-table__title">{pedido.tituloFormulario}</td>
                  <td className="request-table__cell">{new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}</td>
                  <td className="request-table__cell">
                    <span className={`status-badge ${getStatusClass(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="request-table__cell">
                    <button className="btn-secondary request-table__details-button" onClick={() => navigate(`/detalhes-pedido/${pedido._id}`)}>

                      Ver Detalhes
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}
    </div>;
}
export default OsMeusPedidos;
