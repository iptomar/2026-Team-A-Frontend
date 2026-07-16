import React, { useState, useEffect, useMemo } from 'react';
import { agruparFormulariosPorCategoria, filtrarEOrdenarFormularios, obterCategorias } from '../utils/formUtils';
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
      <div className="ecra-coordenador-extracted-1">
        <h2>Dashboard de Coordenação</h2>
        <p className="ecra-coordenador-extracted-2">Visão analítica e acompanhamento do sistema SmartForms.</p>
      </div>

      {/* SECÇÃO DE KPIs */}
      <div className="ecra-coordenador-extracted-3">
        <div className="card coordinator-kpi">
          <span className="ecra-coordenador-extracted-4">Total de Submissões</span>
          <span className="ecra-coordenador-extracted-5">{estatisticas.total}</span>
        </div>
        <div className="card coordinator-kpi coordinator-kpi-pending">
          <span className="ecra-coordenador-extracted-6">Pedidos Pendentes</span>
          <span className="ecra-coordenador-extracted-7">{estatisticas.pendentes}</span>
        </div>
        <div className="card coordinator-kpi coordinator-kpi-approved">
          <span className="ecra-coordenador-extracted-8">Taxa de Aprovação</span>
          <span className="ecra-coordenador-extracted-9">{estatisticas.taxaAprovacao}%</span>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="card ecra-coordenador-extracted-10">
        <div className="ecra-coordenador-extracted-11">
          <label className="ecra-coordenador-extracted-12">Pesquisar Formulário</label>
          <input type="text" className="form-input" placeholder="Ex: Requisição de Material..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)} />

        </div>
        <div className="ecra-coordenador-extracted-13">
          <label className="ecra-coordenador-extracted-14">Estado</label>
          <select className="form-input" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>

            <option value="Todos">Todos os Estados</option>
            <option value="Publicado">Publicado</option>
            <option value="Rascunho">Rascunho</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>

        <div className="ecra-coordenador-extracted-15">
          <label className="form-label">Categoria</label>
          <select className="form-input" value={filtroCategoria} onChange={event => setFiltroCategoria(event.target.value)}>

            <option value="Todas">Todas as categorias</option>
            {categorias.map(categoria => <option key={categoria} value={categoria}>
                {categoria}
              </option>)}
          </select>
        </div>

        <div className="ecra-coordenador-extracted-16">
          <label className="form-label">Ordenar</label>
          <select className="form-input" value={ordenacao} onChange={event => setOrdenacao(event.target.value)}>

            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="titulo-asc">Título A–Z</option>
            <option value="titulo-desc">Título Z–A</option>
          </select>
        </div>

        <label className="ecra-coordenador-extracted-17">







          <input type="checkbox" checked={apenasComPendentes} onChange={event => setApenasComPendentes(event.target.checked)} />

          Apenas com pedidos pendentes
        </label>

        <button type="button" className="btn-secondary ecra-coordenador-extracted-18" onClick={limparFiltros}>


          Limpar filtros
        </button>

        <div className="ecra-coordenador-extracted-19">
          {formulariosFiltrados.length} de {formularios.length} formulário(s)
        </div>
      </div>

      <div>
        {loading ? <div className="card ecra-coordenador-extracted-20">
            A carregar dados da base de dados do IPT...
          </div> : Object.entries(formulariosAgrupados).map(([categoria, itens]) => <section key={categoria} className="ecra-coordenador-extracted-21">
              <div className="ecra-coordenador-extracted-22">
                <h3 className="ecra-coordenador-extracted-23">{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="card ecra-coordenador-extracted-24">
                <table className="ecra-coordenador-extracted-25">
                  <thead>
                    <tr className="ecra-coordenador-extracted-26">
                      <th className="ecra-coordenador-extracted-27">Formulário</th>
                      <th className="ecra-coordenador-extracted-28">Estado</th>
                      <th className="ecra-coordenador-extracted-29">Submissões</th>
                      <th className="ecra-coordenador-extracted-30">Pendentes</th>
                      <th className="ecra-coordenador-extracted-31">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map(form => <tr key={form._id} className="ecra-coordenador-extracted-32">
                        <td className="ecra-coordenador-extracted-33">{form.titulo}</td>
                        <td className="ecra-coordenador-extracted-34">
                          <span className={`publication-status ${form.estado === 'Publicado' ? 'is-published' : 'is-draft'}`}>
                            {form.estado}
                          </span>
                        </td>
                        <td className="ecra-coordenador-extracted-35">
                          <span className="ecra-coordenador-extracted-36">{form.totalSubmissoes || 0}</span>
                        </td>
                        <td className="ecra-coordenador-extracted-37">
                          {form.submissoesPendentes > 0 ? <span className="ecra-coordenador-extracted-38">








                              {form.submissoesPendentes} pendente(s)
                            </span> : <span className="ecra-coordenador-extracted-39">0</span>}
                        </td>
                        <td className="ecra-coordenador-extracted-40">
                          {new Date(form.criadoEm || form.createdAt).toLocaleDateString()}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </section>)}

        {!loading && formularios.length === 0 && <div className="card ecra-coordenador-extracted-41">
            Nenhum formulário foi registado na base de dados até ao momento.
          </div>}

        {!loading && formularios.length > 0 && formulariosFiltrados.length === 0 && <div className="card ecra-coordenador-extracted-42">
            Nenhum formulário corresponde aos filtros selecionados.
          </div>}
      </div>
    </div>;
}
export default EcraCoordenador;
