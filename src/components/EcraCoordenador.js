import React, { useState, useEffect, useMemo } from 'react';
import { agruparFormulariosPorCategoria, filtrarEOrdenarFormularios, obterCategorias } from '../utils/formUtils';
import './EcraCoordenador.css';
function EcraCoordenador() {
  const [formularios, setFormularios] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    pendentes: 0,
    aprovados: 0,
    taxaAprovacao: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados para Filtros Avançados
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [apenasComPendentes, setApenasComPendentes] = useState(false);
  const [ordenacao, setOrdenacao] = useState('recentes');
  const carregarDadosDoServidor = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // 1. Carregar Formulários (Usando a mesma API do Admin para consistência)
      const resForms = await fetch('http://localhost:3000/api/forms', {
        headers
      });
      if (resForms.ok) {
        const data = await resForms.json();
        setFormularios(data);
      }

      // 2. Carregar Estatísticas (KPIs)
      const resStats = await fetch('http://localhost:3000/api/submissoes/estatisticas', {
        headers
      });
      if (resStats.ok) {
        const stats = await resStats.json();
        setEstatisticas(stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro de ligação com a API:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    carregarDadosDoServidor();
  }, []);
  const categorias = useMemo(() => obterCategorias(formularios), [formularios]);
  const formulariosFiltrados = useMemo(() => filtrarEOrdenarFormularios(formularios, {
    pesquisa: filtroNome,
    categoria: filtroCategoria,
    estado: filtroEstado,
    apenasComPendentes,
    ordenacao
  }), [formularios, filtroNome, filtroCategoria, filtroEstado, apenasComPendentes, ordenacao]);
  const formulariosAgrupados = useMemo(() => agruparFormulariosPorCategoria(formulariosFiltrados), [formulariosFiltrados]);
  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroCategoria('Todas');
    setFiltroEstado('Todos');
    setApenasComPendentes(false);
    setOrdenacao('recentes');
  };
  return <div>
      <div className="coordinator__header">
        <h2>Dashboard de Coordenação</h2>
        <p className="coordinator__intro">Visão analítica e acompanhamento do sistema SmartForms.</p>
      </div>

      {/* SECÇÃO DE KPIs */}
      <div className="coordinator-kpis">
        <div className="card coordinator-kpi">
          <span className="coordinator-kpi__label">Total de Submissões</span>
          <span className="coordinator-kpi__value">{estatisticas.total}</span>
        </div>
        <div className="card coordinator-kpi coordinator-kpi-pending">
          <span className="coordinator-kpi__label">Pedidos Pendentes</span>
          <span className="coordinator-kpi__value--pending">{estatisticas.pendentes}</span>
        </div>
        <div className="card coordinator-kpi coordinator-kpi-approved">
          <span className="coordinator-kpi__label">Taxa de Aprovação</span>
          <span className="coordinator-kpi__value--approved">{estatisticas.taxaAprovacao}%</span>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="card coordinator-filters">
        <div className="coordinator-filters__field">
          <label className="coordinator-filters__label">Pesquisar Formulário</label>
          <input type="text" className="form-input" placeholder="Ex: Requisição de Material..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)} />

        </div>
        <div className="coordinator-filters__field">
          <label className="coordinator-filters__label">Estado</label>
          <select className="form-input" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>

            <option value="Todos">Todos os Estados</option>
            <option value="Publicado">Publicado</option>
            <option value="Rascunho">Rascunho</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>

        <div className="coordinator-filters__field">
          <label className="form-label">Categoria</label>
          <select className="form-input" value={filtroCategoria} onChange={event => setFiltroCategoria(event.target.value)}>

            <option value="Todas">Todas as categorias</option>
            {categorias.map(categoria => <option key={categoria} value={categoria}>
                {categoria}
              </option>)}
          </select>
        </div>

        <div className="coordinator-filters__field">
          <label className="form-label">Ordenar</label>
          <select className="form-input" value={ordenacao} onChange={event => setOrdenacao(event.target.value)}>

            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="titulo-asc">Título A–Z</option>
            <option value="titulo-desc">Título Z–A</option>
          </select>
        </div>

        <label className="coordinator-filters__toggle">







          <input type="checkbox" checked={apenasComPendentes} onChange={event => setApenasComPendentes(event.target.checked)} />

          Apenas com pedidos pendentes
        </label>

        <button type="button" className="btn-secondary coordinator-filters__clear-button" onClick={limparFiltros}>


          Limpar filtros
        </button>

        <div className="coordinator-filters__result-count">
          {formulariosFiltrados.length} de {formularios.length} formulário(s)
        </div>
      </div>

      <div>
        {loading ? <div className="card coordinator__loading">
            A carregar dados da base de dados do IPT...
          </div> : Object.entries(formulariosAgrupados).map(([categoria, itens]) => <section key={categoria} className="form-category">
              <div className="form-category__header">
                <h3 className="form-category__title">{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="card coordinator-table-card">
                <table className="coordinator-table">
                  <thead>
                    <tr className="coordinator-table__head-row">
                      <th className="coordinator-table__heading">Formulário</th>
                      <th className="coordinator-table__heading">Estado</th>
                      <th className="coordinator-table__heading">Submissões</th>
                      <th className="coordinator-table__heading">Pendentes</th>
                      <th className="coordinator-table__heading">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map(form => <tr key={form._id} className="coordinator-table__row">
                        <td className="coordinator-table__title">{form.titulo}</td>
                        <td className="coordinator-table__cell">
                          <span className={`publication-status ${form.estado === 'Publicado' ? 'is-published' : 'is-draft'}`}>
                            {form.estado}
                          </span>
                        </td>
                        <td className="coordinator-table__cell">
                          <span className="coordinator-table__submission-count">{form.totalSubmissoes || 0}</span>
                        </td>
                        <td className="coordinator-table__cell">
                          {form.submissoesPendentes > 0 ? <span className="coordinator-table__pending-count">








                              {form.submissoesPendentes} pendente(s)
                            </span> : <span className="coordinator-table__empty-count">0</span>}
                        </td>
                        <td className="coordinator-table__cell">
                          {new Date(form.criadoEm || form.createdAt).toLocaleDateString()}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </section>)}

        {!loading && formularios.length === 0 && <div className="card coordinator__empty-state">
            Nenhum formulário foi registado na base de dados até ao momento.
          </div>}

        {!loading && formularios.length > 0 && formulariosFiltrados.length === 0 && <div className="card coordinator__empty-state">
            Nenhum formulário corresponde aos filtros selecionados.
          </div>}
      </div>
    </div>;
}
export default EcraCoordenador;
