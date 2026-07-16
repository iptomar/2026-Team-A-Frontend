import React, { useState, useEffect, useMemo } from 'react';
import {
  agruparFormulariosPorCategoria,
  filtrarEOrdenarFormularios,
  obterCategorias
} from '../utils/formUtils';

const SelecaoFormularios = ({ onSelectForm }) => {
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

  const categorias = useMemo(
    () => obterCategorias(formularios),
    [formularios]
  );

  const formulariosFiltrados = useMemo(
    () => filtrarEOrdenarFormularios(formularios, filtros),
    [formularios, filtros]
  );

  const formulariosAgrupados = useMemo(
    () => agruparFormulariosPorCategoria(formulariosFiltrados),
    [formulariosFiltrados]
  );

  const atualizarFiltro = (nome, valor) => {
    setFiltros((filtrosAtuais) => ({
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
    return <div style={{ textAlign: 'center', padding: '40px' }}>A carregar formulários ativos...</div>;
  }

  if (formularios.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        <p>Não existem formulários ativos de momento.</p>
      </div>
    );
  }

  return (
    <div className="selecao-formularios">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Selecione um Formulário</h2>
        <p style={{ color: 'var(--text-muted)' }}>Escolha um dos formulários abaixo para submeter o seu pedido.</p>
      </div>

      <div
        className="card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <label className="form-label">Pesquisar</label>
          <input
            type="search"
            className="form-input"
            placeholder="Título ou descrição..."
            value={filtros.pesquisa}
            onChange={(event) =>
              atualizarFiltro('pesquisa', event.target.value)
            }
          />
        </div>

        <div style={{ minWidth: '190px' }}>
          <label className="form-label">Categoria</label>
          <select
            className="form-input"
            value={filtros.categoria}
            onChange={(event) =>
              atualizarFiltro('categoria', event.target.value)
            }
          >
            <option value="Todas">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '170px' }}>
          <label className="form-label">Ordenar</label>
          <select
            className="form-input"
            value={filtros.ordenacao}
            onChange={(event) =>
              atualizarFiltro('ordenacao', event.target.value)
            }
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="titulo-asc">Título A–Z</option>
            <option value="titulo-desc">Título Z–A</option>
          </select>
        </div>

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
        {formulariosFiltrados.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Nenhum formulário corresponde aos filtros selecionados.
          </div>
        ) : Object.entries(formulariosAgrupados).map(([categoria, itens]) => (
          <section key={categoria} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{categoria}</h3>
              <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
            </div>
            <div className="grid-container">
              {itens.map((form) => (
                <div key={form._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{form.titulo}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      {form.descricao || 'Sem descrição disponível.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="status-badge status-publicado">Ativo</span>
                    <button
                      className="btn-primary"
                      onClick={() => onSelectForm(form)}
                      style={{ padding: '8px 15px' }}
                    >
                      Selecionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SelecaoFormularios;
