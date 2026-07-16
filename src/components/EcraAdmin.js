import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { agruparFormulariosPorCategoria, filtrarEOrdenarFormularios, obterCategorias } from '../utils/formUtils';
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
      <div className="ecra-admin-extracted-1">
        <div>
          <h2>Painel de Administração</h2>
          <p className="ecra-admin-extracted-2">Gerir formulários e configurações do sistema.</p>
        </div>

        {/* Agrupamento dos botões de ação do topo */}
        <div className="ecra-admin-extracted-3">
          <button className="btn-secondary ecra-admin-extracted-4" onClick={() => navigate('/gerir-salas')}>


            🏢 Gerir Salas
          </button>
          <button className="btn-primary ecra-admin-extracted-5" onClick={() => navigate('/criar-formulario')}>


            + Criar Novo Formulário
          </button>
        </div>
      </div>

      <div className="card ecra-admin-extracted-6">








        <div className="ecra-admin-extracted-7">
          <label className="form-label">Pesquisar</label>
          <input type="search" className="form-input" placeholder="Título ou descrição..." value={filtros.pesquisa} onChange={event => atualizarFiltro('pesquisa', event.target.value)} />

        </div>

        <div className="ecra-admin-extracted-8">
          <label className="form-label">Categoria</label>
          <select className="form-input" value={filtros.categoria} onChange={event => atualizarFiltro('categoria', event.target.value)}>

            <option value="Todas">Todas as categorias</option>
            {categorias.map(categoria => <option key={categoria} value={categoria}>
                {categoria}
              </option>)}
          </select>
        </div>

        <div className="ecra-admin-extracted-9">
          <label className="form-label">Estado</label>
          <select className="form-input" value={filtros.estado} onChange={event => atualizarFiltro('estado', event.target.value)}>

            <option value="Todos">Todos os estados</option>
            <option value="Rascunho">Rascunho</option>
            <option value="Publicado">Publicado</option>
            <option value="Arquivado">Arquivado</option>
          </select>
        </div>

        <div className="ecra-admin-extracted-10">
          <label className="form-label">Ordenar</label>
          <select className="form-input" value={filtros.ordenacao} onChange={event => atualizarFiltro('ordenacao', event.target.value)}>

            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="titulo-asc">Título A–Z</option>
            <option value="titulo-desc">Título Z–A</option>
          </select>
        </div>

        <label className="ecra-admin-extracted-11">







          <input type="checkbox" checked={filtros.apenasComPendentes} onChange={event => atualizarFiltro('apenasComPendentes', event.target.checked)} />

          Apenas com pedidos pendentes
        </label>

        <button type="button" className="btn-secondary ecra-admin-extracted-12" onClick={limparFiltros}>


          Limpar filtros
        </button>

        <div className="ecra-admin-extracted-13">
          {formulariosFiltrados.length} de {formularios.length} formulário(s)
        </div>
      </div>

      {/* Lista de formulários agrupada por categoria */}
      <div>
        {loading ? <div className="ecra-admin-extracted-14">
            {[1, 2, 3].map(i => <div key={i} className="card ecra-admin-extracted-15">
                <div className="skeleton skeleton-text ecra-admin-extracted-16"></div>
                <div className="skeleton skeleton-row"></div>
                <div className="skeleton skeleton-row"></div>
                <div className="skeleton skeleton-row"></div>
              </div>)}
          </div> : Object.entries(formulariosAgrupados).map(([categoria, itens]) => <section key={categoria} className="ecra-admin-extracted-17">
              <div className="ecra-admin-extracted-18">
                <h3 className="ecra-admin-extracted-19">{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="card ecra-admin-extracted-20">
                <table className="ecra-admin-extracted-21">
                  <thead>
                    <tr className="ecra-admin-extracted-22">
                      <th className="ecra-admin-extracted-23">Título do Formulário</th>
                      <th className="ecra-admin-extracted-24">Estado</th>
                      <th className="ecra-admin-extracted-25">Preenchimentos</th>
                      <th className="ecra-admin-extracted-26">Pendentes</th>
                      <th className="ecra-admin-extracted-27">Data Criacão</th>
                      <th className="ecra-admin-extracted-28">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map(form => <tr key={form._id} className="ecra-admin-extracted-29">
                        <td className="ecra-admin-extracted-30">{form.titulo}</td>
                        <td className="ecra-admin-extracted-31">
                          <span className={`status-badge ${getStatusClass(form.estado)}`}>
                            {form.estado}
                          </span>
                        </td>
                        <td className="ecra-admin-extracted-32">
                          <span className="ecra-admin-extracted-33">{form.totalSubmissoes || 0}</span>
                        </td>
                        <td className="ecra-admin-extracted-34">
                          {form.submissoesPendentes > 0 ? <span className="status-badge status-rascunho ecra-admin-extracted-35">
                              {form.submissoesPendentes} pendente(s)
                            </span> : <span className="ecra-admin-extracted-36">0</span>}
                        </td>
                        <td className="ecra-admin-extracted-37">
                          {new Date(form.criadoEm || form.createdAt).toLocaleDateString()}
                        </td>
                        <td className="ecra-admin-extracted-38">
                          <div className="ecra-admin-extracted-39">
                            <button className="btn-primary ecra-admin-extracted-40" onClick={() => clonarFormulario(form._id)}>

                              Clonar
                            </button>
                            {form.estado === 'Rascunho' && <button className="btn-primary ecra-admin-extracted-41" onClick={() => publicarFormulario(form._id)}>

                                Publicar
                              </button>}
                            <button className="btn-logout ecra-admin-extracted-42" onClick={() => navigate(`/editar-formulario/${form._id}`)} disabled={form.estado === 'Publicado' || form.estado === 'Arquivado'}>

                              Editar
                            </button>
                            {/* Apenas para formulários Publicados */}
                            {form.estado === 'Publicado' && <>
                                <button className="btn-secondary ecra-admin-extracted-43" onClick={() => despublicarFormulario(form._id)}>

                                  Retirar para Rascunho
                                </button>
                                <button className="btn-primary ecra-admin-extracted-44" onClick={() => arquivarFormulario(form._id)}>

                                  Arquivar
                                </button>
                              </>}
                            {form.estado !== 'Publicado' && form.estado !== 'Arquivado' && <button className="btn-logout ecra-admin-extracted-45" onClick={() => apagarFormulario(form._id)}>

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
        {!loading && formularios.length === 0 && <div className="card ecra-admin-extracted-46">
            Nenhum formulário encontrado na base de dados.
          </div>}

        {!loading && formularios.length > 0 && formulariosFiltrados.length === 0 && <div className="card ecra-admin-extracted-47">
            Nenhum formulário corresponde aos filtros selecionados.
          </div>}
      </div>
    </div>;
}
export default EcraAdmin;
