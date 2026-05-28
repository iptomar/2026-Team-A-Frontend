export const CATEGORIA_PADRAO = 'Sem categoria';

export const normalizarCategoria = (formulario) => {
  const categoria = formulario?.categoria;
  if (typeof categoria === 'string') {
    const valorNormalizado = categoria.trim();
    return valorNormalizado || CATEGORIA_PADRAO;
  }

  return CATEGORIA_PADRAO;
};

export const agruparFormulariosPorCategoria = (formularios = []) => {
  return formularios.reduce((agrupado, formulario) => {
    const categoria = normalizarCategoria(formulario);

    if (!agrupado[categoria]) {
      agrupado[categoria] = [];
    }

    agrupado[categoria].push(formulario);
    return agrupado;
  }, {});
};
