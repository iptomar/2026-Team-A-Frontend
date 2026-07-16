import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="gerir-pedidos-style-1">
        <h2>Gestão de Pedidos</h2>
        <p className="gerir-pedidos-style-2">Motor de filtragem e visualização de submissões.</p>
      </div>

      <div className="gerir-pedidos-style-3">
        <div className="gerir-pedidos-style-4">
          <label htmlFor="pesquisaNome" className="gerir-pedidos-style-5">Pesquisar Nome:</label>
          <input id="pesquisaNome" type="text" placeholder="Filtrar por nome..." value={pesquisaNome} onChange={e => setPesquisaNome(e.target.value)} className="gerir-pedidos-style-6" />

        </div>

        <div className="gerir-pedidos-style-7">
          <label htmlFor="filtroEstado" className="gerir-pedidos-style-8">Estado:</label>
          <select id="filtroEstado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="gerir-pedidos-style-9">

            <option value="Todos">Todos os Estados</option>
            <option value="Pendente">Pendentes</option>
            <option value="Aprovado">Aprovados</option>
            <option value="Rejeitado">Rejeitados</option>
          </select>
        </div>
      </div>

      {loading ? <div className="gerir-pedidos-style-10">A carregar dados do servidor...</div> : pedidos.length === 0 ? <div className="card gerir-pedidos-style-11">
          Ainda não existem pedidos submetidos no sistema.
        </div> : pedidosFiltrados.length === 0 ? <div className="card gerir-pedidos-style-12">
          Nenhum pedido corresponde aos critérios de filtragem.
        </div> : <div className="card gerir-pedidos-style-13">
          <table className="gerir-pedidos-style-14">
            <thead className="gerir-pedidos-style-15">
              <tr>
                <th className="gerir-pedidos-style-16">Nome</th>
                <th className="gerir-pedidos-style-17">Data</th>
                <th className="gerir-pedidos-style-18">Professor</th>
                <th className="gerir-pedidos-style-19">Estado</th>
                <th className="gerir-pedidos-style-20">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => <tr key={pedido._id} className="gerir-pedidos-style-21">
                  <td className="gerir-pedidos-style-22">{pedido.tituloFormulario}</td>
                  <td className="gerir-pedidos-style-23">{new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}</td>
                  <td className="gerir-pedidos-style-24">{pedido.professor?.email || 'N/A'}</td>
                  <td className="gerir-pedidos-style-25">
                    <span className={`status-badge ${getStatusClass(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="gerir-pedidos-style-26">
                    <button className="btn-secondary gerir-pedidos-style-27" onClick={() => navigate(`/detalhes-pedido/${pedido._id}`)}>

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
