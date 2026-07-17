import React, { useState, useEffect, useMemo } from 'react';
import { agruparFormulariosPorCategoria, filtrarEOrdenarFormularios, obterCategorias } from '../utils/formUtils';
import './SelecaoFormularios.css';
const SelecaoFormularios = ({
  onSelectForm
}) => {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    pesquisa: '',
    categoria: 'Todas',
    ordenacao: 'recentes'
  });
  useEffect(() => {
    const carregarFormularios = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch('http://localhost:3000/api/forms', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (resposta.ok) {
          const dados = await resposta.json();
          setFormularios(dados.filter(f => f.estado === 'Publicado'));
        }
      } catch (erro) {
        console.error('Erro ao carregar:', erro);
      } finally {
        setLoading(false);
      }
    };
    carregarFormularios();
  }, []);
  const categorias = useMemo(() => obterCategorias(formularios), [formularios]);
  const formulariosFiltrados = useMemo(() => filtrarEOrdenarFormularios(formularios, filtros), [formularios, filtros]);
  const formulariosAgrupados = useMemo(() => agruparFormulariosPorCategoria(formulariosFiltrados), [formulariosFiltrados]);
  const atualizarFiltro = (nome, valor) => {
    setFiltros(filtrosAtuais => ({
      ...filtrosAtuais,
      [nome]: valor
    }));
  };
  const limparFiltros = () => {
    setFiltros({
      pesquisa: '',
      categoria: 'Todas',
      ordenacao: 'recentes'
    });
  };
  if (loading) {
    return <div className="form-selection__loading">A carregar formulários ativos...</div>;
  }
  if (formularios.length === 0) {
    return <div className="card form-selection__empty-state">
        <p>Não existem formulários ativos de momento.</p>
      </div>;
  }
  return <div className="selecao-formularios">
      <div className="form-selection__section">
        <h2>Selecione um Formulário</h2>
        <p className="form-selection__intro">Escolha um dos formulários abaixo para submeter o seu pedido.</p>
      </div>

      <div className="card form-filter-panel">








        <div className="form-filter-field form-filter-field--search">
          <label className="form-label">Pesquisar</label>
          <input type="search" className="form-input" placeholder="Título ou descrição..." value={filtros.pesquisa} onChange={event => atualizarFiltro('pesquisa', event.target.value)} />

        </div>

        <div className="form-filter-field form-filter-field--category">
          <label className="form-label">Categoria</label>
          <select className="form-input" value={filtros.categoria} onChange={event => atualizarFiltro('categoria', event.target.value)}>

            <option value="Todas">Todas as categorias</option>
            {categorias.map(categoria => <option key={categoria} value={categoria}>
                {categoria}
              </option>)}
          </select>
        </div>

        <div className="form-filter-field form-filter-field--sort">
          <label className="form-label">Ordenar</label>
          <select className="form-input" value={filtros.ordenacao} onChange={event => atualizarFiltro('ordenacao', event.target.value)}>

            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="titulo-asc">Título A–Z</option>
            <option value="titulo-desc">Título Z–A</option>
          </select>
        </div>

        <button type="button" className="btn-secondary form-filter-panel__clear-button" onClick={limparFiltros}>


          Limpar filtros
        </button>

        <div className="form-filter-panel__result-count">
          {formulariosFiltrados.length} de {formularios.length} formulário(s)
        </div>
      </div>

      <div>
        {formulariosFiltrados.length === 0 ? <div className="card form-selection__no-results">
            Nenhum formulário corresponde aos filtros selecionados.
          </div> : Object.entries(formulariosAgrupados).map(([categoria, itens]) => <section key={categoria} className="form-category">
            <div className="form-category__header">
              <h3 className="form-category__title">{categoria}</h3>
              <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
            </div>
            <div className="grid-container">
              {itens.map(form => <div key={form._id} className="card form-selection-card">
                  <div>
                    <h3 className="form-selection-card__title">{form.titulo}</h3>
                    <p className="form-selection-card__description">
                      {form.descricao || 'Sem descrição disponível.'}
                    </p>
                  </div>
                  <div className="form-selection-card__footer">
                    <span className="status-badge status-publicado">Ativo</span>
                    <button className="btn-primary form-selection-card__select-button" onClick={() => onSelectForm(form)}>


                      Selecionar
                    </button>
                  </div>
                </div>)}
            </div>
          </section>)}
      </div>
    </div>;
};
export default SelecaoFormularios;
