export const CATEGORIA_PADRAO = 'Sem categoria';
const normalizarTexto = (valor = '') => {
  return String(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
};
export const normalizarCategoria = formulario => {
  const categoria = formulario?.categoria;
  if (typeof categoria === 'string') {
    const valorNormalizado = categoria.trim();
    return valorNormalizado || CATEGORIA_PADRAO;
  }
  return CATEGORIA_PADRAO;
};
export const obterCategorias = (formularios = []) => {
  const categorias = formularios.map(normalizarCategoria);
  return [...new Set(categorias)].sort((categoriaA, categoriaB) => categoriaA.localeCompare(categoriaB, 'pt', {
    sensitivity: 'base'
  }));
};
export const filtrarEOrdenarFormularios = (formularios = [], {
  pesquisa = '',
  categoria = 'Todas',
  estado = 'Todos',
  apenasComPendentes = false,
  ordenacao = 'recentes'
} = {}) => {
  const pesquisaNormalizada = normalizarTexto(pesquisa);
  const resultados = formularios.filter(formulario => {
    const correspondePesquisa = !pesquisaNormalizada || normalizarTexto(formulario.titulo).includes(pesquisaNormalizada) || normalizarTexto(formulario.descricao).includes(pesquisaNormalizada);
    const correspondeCategoria = categoria === 'Todas' || normalizarCategoria(formulario) === categoria;
    const correspondeEstado = estado === 'Todos' || formulario.estado === estado;
    const correspondePendentes = !apenasComPendentes || Number(formulario.submissoesPendentes || 0) > 0;
    return correspondePesquisa && correspondeCategoria && correspondeEstado && correspondePendentes;
  });
  return [...resultados].sort((formularioA, formularioB) => {
    if (ordenacao === 'titulo-asc') {
      return formularioA.titulo.localeCompare(formularioB.titulo, 'pt', {
        sensitivity: 'base'
      });
    }
    if (ordenacao === 'titulo-desc') {
      return formularioB.titulo.localeCompare(formularioA.titulo, 'pt', {
        sensitivity: 'base'
      });
    }
    const dataA = new Date(formularioA.criadoEm || formularioA.createdAt || 0).getTime();
    const dataB = new Date(formularioB.criadoEm || formularioB.createdAt || 0).getTime();
    return ordenacao === 'antigos' ? dataA - dataB : dataB - dataA;
  });
};
export const agruparFormulariosPorCategoria = (formularios = []) => {
  const agrupado = formularios.reduce((resultado, formulario) => {
    const categoria = normalizarCategoria(formulario);
    if (!resultado[categoria]) {
      resultado[categoria] = [];
    }
    resultado[categoria].push(formulario);
    return resultado;
  }, {});
  return Object.fromEntries(Object.entries(agrupado).sort(([categoriaA], [categoriaB]) => categoriaA.localeCompare(categoriaB, 'pt', {
    sensitivity: 'base'
  })));
};
export const obterClassesPosicaoCampo = ({
  x = 1,
  y = 'auto',
  w = 12
} = {}) => {
  const coluna = Math.min(12, Math.max(1, Number(x) || 1));
  const largura = Math.min(12, Math.max(1, Number(w) || 12));
  const linha = y === 'auto' ? 'auto' : Math.min(50, Math.max(1, Number(y) || 1));
  return `grid-column-${coluna}-span-${largura} grid-row-${linha}`;
};
