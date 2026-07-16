import React, { useState, useEffect, useMemo } from 'react';
import {
  agruparFormulariosPorCategoria,
  filtrarEOrdenarFormularios,
  obterCategorias
} from '../utils/formUtils';

function EcraCoordenador() {
  const [formularios, setFormularios] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ total: 0, pendentes: 0, aprovados: 0, taxaAprovacao: 0 });
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
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Carregar Formulários (Usando a mesma API do Admin para consistência)
      const resForms = await fetch('http://localhost:3000/api/forms', { headers });
      if (resForms.ok) {
        const data = await resForms.json();
        setFormularios(data);
      }

      // 2. Carregar Estatísticas (KPIs)
      const resStats = await fetch('http://localhost:3000/api/submissoes/estatisticas', { headers });
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

  const categorias = useMemo(
    () => obterCategorias(formularios),
    [formularios]
  );

  const formulariosFiltrados = useMemo(
    () => filtrarEOrdenarFormularios(formularios, {
      pesquisa: filtroNome,
      categoria: filtroCategoria,
      estado: filtroEstado,
      apenasComPendentes,
      ordenacao
    }),
    [
      formularios,
      filtroNome,
      filtroCategoria,
      filtroEstado,
      apenasComPendentes,
      ordenacao
    ]
  );

  const formulariosAgrupados = useMemo(
    () => agruparFormulariosPorCategoria(formulariosFiltrados),
    [formulariosFiltrados]
  );

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroCategoria('Todas');
    setFiltroEstado('Todos');
    setApenasComPendentes(false);
    setOrdenacao('recentes');
  };

  const kpiStyle = {
    flex: 1,
    minWidth: '200px',
    padding: '25px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Dashboard de Coordenação</h2>
        <p style={{ color: 'var(--text-muted)' }}>Visão analítica e acompanhamento do sistema SmartForms.</p>
      </div>

      {/* SECÇÃO DE KPIs */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <div className="card" style={kpiStyle}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total de Submissões</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{estatisticas.total}</span>
        </div>
        <div className="card" style={{ ...kpiStyle, borderLeft: '5px solid #f39c12' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pedidos Pendentes</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f39c12' }}>{estatisticas.pendentes}</span>
        </div>
        <div className="card" style={{ ...kpiStyle, borderLeft: '5px solid var(--primary-green)' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Taxa de Aprovação</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>{estatisticas.taxaAprovacao}%</span>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem' }}>Pesquisar Formulário</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ex: Requisição de Material..." 
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem' }}>Estado</label>
          <select 
            className="form-input" 
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="Todos">Todos os Estados</option>
            <option value="Publicado">Publicado</option>
            <option value="Rascunho">Rascunho</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>

        <div style={{ width: '200px' }}>
          <label className="form-label">Categoria</label>
          <select
            className="form-input"
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
          >
            <option value="Todas">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: '180px' }}>
          <label className="form-label">Ordenar</label>
          <select
            className="form-input"
            value={ordenacao}
            onChange={(event) => setOrdenacao(event.target.value)}
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="titulo-asc">Título A–Z</option>
            <option value="titulo-desc">Título Z–A</option>
          </select>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '42px'
          }}
        >
          <input
            type="checkbox"
            checked={apenasComPendentes}
            onChange={(event) =>
              setApenasComPendentes(event.target.checked)
            }
          />
          Apenas com pedidos pendentes
        </label>

        <button
          type="button"
          className="btn-secondary"
          onClick={limparFiltros}
          style={{ minHeight: '42px' }}
        >
          Limpar filtros
        </button>

        <div style={{ width: '100%', color: 'var(--text-muted)' }}>
          {formulariosFiltrados.length} de {formularios.length} formulário(s)
        </div>
      </div>

      <div>
        {loading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', fontWeight: '500' }}>
            A carregar dados da base de dados do IPT...
          </div>
        ) : (
          Object.entries(formulariosAgrupados).map(([categoria, itens]) => (
            <section key={categoria} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--muted-bg)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '15px 20px' }}>Formulário</th>
                      <th style={{ padding: '15px 20px' }}>Estado</th>
                      <th style={{ padding: '15px 20px' }}>Submissões</th>
                      <th style={{ padding: '15px 20px' }}>Pendentes</th>
                      <th style={{ padding: '15px 20px' }}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((form) => (
                      <tr key={form._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '15px 20px', fontWeight: '600' }}>{form.titulo}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            backgroundColor: form.estado === 'Publicado' ? '#e6f4ea' : '#fff4e5',
                            color: form.estado === 'Publicado' ? '#1e7e34' : '#d97706',
                          }}>
                            {form.estado}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                          <span style={{ fontWeight: '600' }}>{form.totalSubmissoes || 0}</span>
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                          {form.submissoesPendentes > 0 ? (
                            <span style={{ 
                              backgroundColor: '#fff3cd', 
                              color: '#856404', 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              border: '1px solid #ffeeba'
                            }}>
                              {form.submissoesPendentes} pendente(s)
                            </span>
                          ) : (
                            <span style={{ color: '#6c757d' }}>0</span>
                          )}
                        </td>
                        <td style={{ padding: '15px 20px', color: 'var(--text-muted)' }}>
                          {new Date(form.criadoEm || form.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}

        {!loading && formularios.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum formulário foi registado na base de dados até ao momento.
          </div>
        )}

        {!loading && formularios.length > 0 && formulariosFiltrados.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum formulário corresponde aos filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}

export default EcraCoordenador;
