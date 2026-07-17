import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GerirPedidos.css';
function GerirPedidos() {
  const navigate = useNavigate();
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
  const pedidosFiltrados = pedidos.filter(pedido => {
    const correspondeEstado = filtroEstado === 'Todos' || pedido.estado === filtroEstado;
    const titulo = pedido.tituloFormulario || '';
    const correspondeNome = titulo.toLowerCase().includes(pesquisaNome.toLowerCase());
    return correspondeEstado && correspondeNome;
  });
  console.log('DEBUG: Pedidos filtrados para exibição:', pedidosFiltrados.length);
  return <div>
      <div className="request-manager__header">
        <h2>Gestão de Pedidos</h2>
        <p className="request-manager__intro">Motor de filtragem e visualização de submissões.</p>
      </div>

      <div className="request-filters">
        <div className="request-manager-filters__field">
          <label htmlFor="pesquisaNome" className="request-manager-filters__label">Pesquisar Nome:</label>
          <input id="pesquisaNome" type="text" placeholder="Filtrar por nome..." value={pesquisaNome} onChange={e => setPesquisaNome(e.target.value)} className="request-manager-filters__control" />

        </div>

        <div className="request-manager-filters__field">
          <label htmlFor="filtroEstado" className="request-manager-filters__label">Estado:</label>
          <select id="filtroEstado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="request-manager-filters__control">

            <option value="Todos">Todos os Estados</option>
            <option value="Pendente">Pendentes</option>
            <option value="Aprovado">Aprovados</option>
            <option value="Rejeitado">Rejeitados</option>
          </select>
        </div>
      </div>

      {loading ? <div className="request-manager__loading">A carregar dados do servidor...</div> : pedidos.length === 0 ? <div className="card request-manager__empty-state">
          Ainda não existem pedidos submetidos no sistema.
        </div> : pedidosFiltrados.length === 0 ? <div className="card request-manager__empty-state">
          Nenhum pedido corresponde aos critérios de filtragem.
        </div> : <div className="card request-table-card">
          <table className="request-table">
            <thead className="request-table__head">
              <tr>
                <th className="request-table__heading">Nome</th>
                <th className="request-table__heading">Data</th>
                <th className="request-table__heading">Professor</th>
                <th className="request-table__heading">Estado</th>
                <th className="request-table__heading">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => <tr key={pedido._id} className="request-table__row">
                  <td className="request-table__title">{pedido.tituloFormulario}</td>
                  <td className="request-table__cell">{new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}</td>
                  <td className="request-table__cell">{pedido.professor?.email || 'N/A'}</td>
                  <td className="request-table__cell">
                    <span className={`status-badge ${getStatusClass(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="request-table__cell">
                    <button className="btn-secondary request-table__details-button" onClick={() => navigate(`/detalhes-pedido/${pedido._id}`)}>

                      Analisar
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}
    </div>;
}
export default GerirPedidos;
