import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agruparFormulariosPorCategoria, filtrarEOrdenarFormularios, obterCategorias } from '../utils/formUtils';
import './EcraAdmin.css';
function EcraAdmin() {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    pesquisa: '',
    categoria: 'Todas',
    estado: 'Todos',
    apenasComPendentes: false,
    ordenacao: 'recentes'
  });
  const navigate = useNavigate();
  const carregarFormularios = async () => {
    setLoading(true);
    try {
      const resposta = await fetch('http://localhost:3000/api/forms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setFormularios(dados);
      } else {
        console.error('Erro ao carregar formulários do servidor');
      }
    } catch (erro) {
      console.error('Erro de rede ao carregar:', erro);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
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
      estado: 'Todos',
      apenasComPendentes: false,
      ordenacao: 'recentes'
    });
  };
  const apagarFormulario = async id => {
    if (!window.confirm('Tem a certeza que deseja apagar este formulário?')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resposta.ok) {
        alert('Formulário apagado com sucesso!');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        // Mostrar a mensagem de erro específica do backend (ex: pedidos pendentes)
        alert(`Erro: ${data.error || 'Não foi possível apagar o formulário.'}`);
      }
    } catch (erro) {
      console.error('Erro ao apagar:', erro);
      alert('Erro de rede ao tentar apagar o formulário.');
    }
  };
  const clonarFormulario = async id => {
    if (!window.confirm('Deseja criar uma cópia deste formulário?')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}/clonar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resposta.ok) {
        alert('Formulário clonado com sucesso! A cópia foi criada como rascunho.');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        alert(`Erro ao clonar: ${data.error}`);
      }
    } catch (erro) {
      console.error('Erro ao clonar:', erro);
      alert('Erro de rede ao tentar clonar o formulário.');
    }
  };
  const arquivarFormulario = async id => {
    if (!window.confirm('Tem a certeza que deseja arquivar este formulário? Esta ação é irreversível.')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}/arquivar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resposta.ok) {
        alert('Formulário arquivado com sucesso!');
        carregarFormularios();
      }
    } catch (erro) {
      console.error('Erro ao arquivar:', erro);
    }
  };
  const despublicarFormulario = async id => {
    if (!window.confirm('Deseja retirar este formulário de circulação e voltá-lo para Rascunho? Isto permitirá editá-lo novamente.')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}/despublicar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resposta.ok) {
        alert('Formulário revertido para Rascunho!');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (erro) {
      console.error('Erro ao despublicar:', erro);
    }
  };
  const publicarFormulario = async id => {
    if (!window.confirm('Deseja publicar este formulário? Ele ficará visível para todos os professores.')) return;
    try {
      const resposta = await fetch(`http://localhost:3000/api/forms/${id}/publicar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resposta.ok) {
        alert('Formulário publicado com sucesso!');
        carregarFormularios();
      } else {
        const data = await resposta.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (erro) {
      console.error('Erro ao publicar:', erro);
    }
  };
  const getStatusClass = estado => {
    switch (estado) {
      case 'Publicado':
        return 'status-publicado';
      case 'Rascunho':
        return 'status-rascunho';
      case 'Arquivado':
        return 'status-inativo';
      default:
        return 'status-inativo';
    }
  };
  return <div>
      <div className="admin__header">
        <div>
          <h2>Painel de Administração</h2>
          <p className="admin__intro">Gerir formulários e configurações do sistema.</p>
        </div>

        {/* Agrupamento dos botões de ação do topo */}
        <div className="admin__header-actions">
          <button className="btn-secondary admin__rooms-button" onClick={() => navigate('/gerir-salas')}>


            🏢 Gerir Salas
          </button>
          <button className="btn-primary admin__create-form-button" onClick={() => navigate('/criar-formulario')}>


            + Criar Novo Formulário
          </button>
        </div>
      </div>

      <div className="card admin-filters">








        <div className="admin-filters__field">
          <label className="form-label">Pesquisar</label>
          <input type="search" className="form-input" placeholder="Título ou descrição..." value={filtros.pesquisa} onChange={event => atualizarFiltro('pesquisa', event.target.value)} />

        </div>

        <div className="admin-filters__field">
          <label className="form-label">Categoria</label>
          <select className="form-input" value={filtros.categoria} onChange={event => atualizarFiltro('categoria', event.target.value)}>

            <option value="Todas">Todas as categorias</option>
            {categorias.map(categoria => <option key={categoria} value={categoria}>
                {categoria}
              </option>)}
          </select>
        </div>

        <div className="admin-filters__field">
          <label className="form-label">Estado</label>
          <select className="form-input" value={filtros.estado} onChange={event => atualizarFiltro('estado', event.target.value)}>

            <option value="Todos">Todos os estados</option>
            <option value="Rascunho">Rascunho</option>
            <option value="Publicado">Publicado</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>

        <div className="admin-filters__field">
          <label className="form-label">Ordenar</label>
          <select className="form-input" value={filtros.ordenacao} onChange={event => atualizarFiltro('ordenacao', event.target.value)}>

            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="titulo-asc">Título A–Z</option>
            <option value="titulo-desc">Título Z–A</option>
          </select>
        </div>

        <label className="admin-filters__toggle">







          <input type="checkbox" checked={filtros.apenasComPendentes} onChange={event => atualizarFiltro('apenasComPendentes', event.target.checked)} />

          Apenas com pedidos pendentes
        </label>

        <button type="button" className="btn-secondary admin-filters__clear-button" onClick={limparFiltros}>


          Limpar filtros
        </button>

        <div className="admin-filters__result-count">
          {formulariosFiltrados.length} de {formularios.length} formulário(s)
        </div>
      </div>

      {/* Lista de formulários agrupada por categoria */}
      <div>
        {loading ? <div className="admin__loading-grid">
            {[1, 2, 3].map(i => <div key={i} className="card admin__loading-card">
                <div className="skeleton skeleton-text admin__loading-line"></div>
                <div className="skeleton skeleton-row"></div>
                <div className="skeleton skeleton-row"></div>
                <div className="skeleton skeleton-row"></div>
              </div>)}
          </div> : Object.entries(formulariosAgrupados).map(([categoria, itens]) => <section key={categoria} className="form-category">
              <div className="form-category__header">
                <h3 className="form-category__title">{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="card admin-table-card">
                <table className="admin-table">
                  <thead>
                    <tr className="admin-table__head-row">
                      <th className="admin-table__heading">Título do Formulário</th>
                      <th className="admin-table__heading">Estado</th>
                      <th className="admin-table__heading">Preenchimentos</th>
                      <th className="admin-table__heading">Pendentes</th>
                      <th className="admin-table__heading">Data Criacão</th>
                      <th className="admin-table__heading">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map(form => <tr key={form._id} className="admin-table__row">
                        <td className="admin-table__title">{form.titulo}</td>
                        <td className="admin-table__cell">
                          <span className={`status-badge ${getStatusClass(form.estado)}`}>
                            {form.estado}
                          </span>
                        </td>
                        <td className="admin-table__cell">
                          <span className="admin-table__submission-count">{form.totalSubmissoes || 0}</span>
                        </td>
                        <td className="admin-table__cell">
                          {form.submissoesPendentes > 0 ? <span className="status-badge status-rascunho admin-table__pending-count">
                              {form.submissoesPendentes} pendente(s)
                            </span> : <span className="admin-table__empty-count">0</span>}
                        </td>
                        <td className="admin-table__cell">
                          {new Date(form.criadoEm || form.createdAt).toLocaleDateString()}
                        </td>
                        <td className="admin-table__actions-cell">
                          <div className="admin-table__actions">
                            <button className="btn-primary admin-table__action-button" onClick={() => clonarFormulario(form._id)}>

                              Clonar
                            </button>
                            {form.estado === 'Rascunho' && <button className="btn-primary admin-table__action-button" onClick={() => publicarFormulario(form._id)}>

                                Publicar
                              </button>}
                            <button className="btn-logout admin-table__action-button" onClick={() => navigate(`/editar-formulario/${form._id}`)} disabled={form.estado === 'Publicado' || form.estado === 'Arquivado'}>

                              Editar
                            </button>
                            {/* Apenas para formulários Publicados */}
                            {form.estado === 'Publicado' && <>
                                <button className="btn-secondary admin-table__action-button" onClick={() => despublicarFormulario(form._id)}>

                                  Retirar para Rascunho
                                </button>
                                <button className="btn-primary admin-table__action-button" onClick={() => arquivarFormulario(form._id)}>

                                  Arquivar
                                </button>
                              </>}
                            {form.estado !== 'Publicado' && form.estado !== 'Arquivado' && <button className="btn-logout admin-table__delete-button" onClick={() => apagarFormulario(form._id)}>

                                Apagar
                              </button>}
                          </div>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </section>)}

        {/* Mensagem caso não existam formulários */}
        {!loading && formularios.length === 0 && <div className="card admin__empty-state">
            Nenhum formulário encontrado na base de dados.
          </div>}

        {!loading && formularios.length > 0 && formulariosFiltrados.length === 0 && <div className="card admin__empty-state">
            Nenhum formulário corresponde aos filtros selecionados.
          </div>}
      </div>
    </div>;
}
export default EcraAdmin;
