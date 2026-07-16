import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="os-meus-pedidos-extracted-1">
        <div>
          <h2>Os Meus Pedidos</h2>
          <p className="os-meus-pedidos-extracted-2">Consulte aqui o estado das suas submissões.</p>
        </div>
        <button className="btn-primary" onClick={() => window.location.href = user?.role === 'aluno' ? '/aluno' : '/professor'}>

          Nova Requisição
        </button>
      </div>

      <div className="os-meus-pedidos-extracted-3">
        <div className="os-meus-pedidos-extracted-4">
          <label htmlFor="filtroEstado" className="os-meus-pedidos-extracted-5">Filtrar por estado:</label>
          <select id="filtroEstado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="os-meus-pedidos-extracted-6">


            <option value="Todos">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
          </select>
        </div>

        <div className="os-meus-pedidos-extracted-7">
          <span className="os-meus-pedidos-extracted-8">Ordenar por data:</span>
          <button className="btn-secondary os-meus-pedidos-extracted-9" type="button" onClick={() => setOrdenacaoData(current => current === 'desc' ? 'asc' : 'desc')}>


            {ordenacaoData === 'desc' ? 'Mais recentes' : 'Mais antigos'}
          </button>
        </div>
      </div>

      {loading ? <div className="os-meus-pedidos-extracted-10">A carregar os seus pedidos...</div> : pedidos.length === 0 ? <div className="card os-meus-pedidos-extracted-11">
          Ainda não efetuou nenhum pedido.
        </div> : pedidosFiltrados.length === 0 ? <div className="card os-meus-pedidos-extracted-12">
          Nenhum pedido correspondente ao filtro "{filtroEstado}".
        </div> : <div className="card os-meus-pedidos-extracted-13">
          <table className="os-meus-pedidos-extracted-14">
            <thead className="os-meus-pedidos-extracted-15">
              <tr>
                <th className="os-meus-pedidos-extracted-16">Nome</th>
                <th className="os-meus-pedidos-extracted-17">Data</th>
                <th className="os-meus-pedidos-extracted-18">Estado</th>
                <th className="os-meus-pedidos-extracted-19">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => <tr key={pedido._id} className="os-meus-pedidos-extracted-20">
                  <td className="os-meus-pedidos-extracted-21">{pedido.tituloFormulario}</td>
                  <td className="os-meus-pedidos-extracted-22">{new Date(pedido.dataSubmissao).toLocaleDateString('pt-PT')}</td>
                  <td className="os-meus-pedidos-extracted-23">
                    <span className={`status-badge ${getStatusClass(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="os-meus-pedidos-extracted-24">
                    <button className="btn-secondary os-meus-pedidos-extracted-25" onClick={() => navigate(`/detalhes-pedido/${pedido._id}`)}>

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
