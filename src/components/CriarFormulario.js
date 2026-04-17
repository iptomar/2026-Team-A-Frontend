import React, { useState } from 'react';

function CriarFormulario() {
  // Estados para os dados base do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Estados para gerir a adição de campos dinâmicos
  const [campos, setCampos] = useState([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState('');
  const [novoTipo, setNovoTipo] = useState('Texto Curto');
  const [novoObrigatorio, setNovoObrigatorio] = useState(false);

  // Para lógica de Data (Adiar/Anticipar)
  const [tipoAlteracao, setTipoAlteracao] = useState('Adiar');
  const [dataSelecionada, setDataSelecionada] = useState('');

  // Função para validar se a data é futura
  const isDataFutura = (data) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataInserida = new Date(data);
    return dataInserida > hoje;
  };

  // Função para adicionar um novo campo à lista
  const adicionarCampo = () => {
    if (novaEtiqueta.trim() === '') {
      setMensagem('Erro: A etiqueta do campo é obrigatória.');
      return;
    }

    // Validação específica para o tipo Data
    if (novoTipo === 'Data') {
      if (!dataSelecionada) {
        setMensagem('Erro: Deve selecionar uma data.');
        return;
      }
      if (!isDataFutura(dataSelecionada)) {
        setMensagem('Erro: A data deve ser superior ao dia de hoje.');
        return;
      }
    }

    const novoCampo = {
      id: Date.now(),
      etiqueta: novaEtiqueta,
      tipo: novoTipo,
      obrigatorio: novoObrigatorio,
      // Propriedades extra se for do tipo Data
      detalhesData: novoTipo === 'Data' ? { tipoAlteracao, data: dataSelecionada } : null
    };

    setCampos([...campos, novoCampo]);
    
    // Limpar os inputs após adicionar
    setNovaEtiqueta('');
    setNovoTipo('Texto Curto');
    setNovoObrigatorio(false);
    setDataSelecionada('');
    setMensagem('');
  };

  const removerCampo = (id) => {
    setCampos(campos.filter(campo => campo.id !== id));
  };

  const handleSalvar = async (e, acao) => {
    e.preventDefault();

    if (titulo.trim() === '') {
      setMensagem('Erro: O Título é obrigatório.');
      return;
    }

    // Validação solicitada na Tarefa #13: Se for Publicado, tem de ter > 0 campos
    if (acao === 'Publicado' && campos.length === 0) {
      setMensagem('Erro: Não é possível publicar um formulário sem campos.');
      return;
    }

    const novoFormulario = {
      titulo: titulo,
      descricao: descricao,
      estado: acao,
      campos: campos
    };

    console.log(`A enviar para o Backend (${acao}):`, novoFormulario);
    
    // Simulação de sucesso (Futuramente será fetch para /forms)
    setMensagem(`Sucesso! Formulário "${titulo}" ${acao === 'Publicado' ? 'Publicado' : 'gravado como Rascunho'} com ${campos.length} campo(s).`);

    if (acao === 'Publicado') {
      setTitulo('');
      setDescricao('');
      setCampos([]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>Criar Novo Formulário</h2>
      
      {mensagem && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '4px', 
          backgroundColor: mensagem.includes('Erro') ? '#ffebee' : '#e8f5e9',
          color: mensagem.includes('Erro') ? '#c62828' : '#2e7d32',
          border: `1px solid ${mensagem.includes('Erro') ? '#ef9a9a' : '#a5d6a7'}`,
          fontWeight: 'bold'
        }}>
          {mensagem}
        </div>
      )}

      <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="titulo" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              Título do Formulário (Obrigatório) *
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ex: Alteração de Horário - Engenharia Informática"
              style={{ padding: '8px', fontSize: '16px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="descricao" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              Descrição (Opcional)
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows="3"
              placeholder="Instruções para o preenchimento deste formulário..."
              style={{ padding: '8px', fontSize: '16px' }}
            />
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ marginTop: 0, fontSize: '18px' }}>Adicionar Campos</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
                <label htmlFor="etiqueta" style={{ fontSize: '14px', marginBottom: '5px' }}>Pergunta / Etiqueta</label>
                <input
                  id="etiqueta"
                  type="text"
                  value={novaEtiqueta}
                  onChange={(e) => setNovaEtiqueta(e.target.value)}
                  placeholder="Ex: Sugestão de nova data"
                  style={{ padding: '8px', fontSize: '14px' }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="tipo" style={{ fontSize: '14px', marginBottom: '5px' }}>Tipo de Campo</label>
                <select
                  id="tipo"
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  style={{ padding: '8px', fontSize: '14px' }}
                >
                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Data">Data (Alteração de Aula)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px', height: '35px' }}>
                <input
                  id="obrigatorio"
                  type="checkbox"
                  checked={novoObrigatorio}
                  onChange={(e) => setNovoObrigatorio(e.target.checked)}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
                <label htmlFor="obrigatorio" style={{ fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Obrigatório?
                </label>
              </div>
            </div>

            {/* SEÇÃO DINÂMICA: Apenas aparece se o tipo for Data */}
            {novoTipo === 'Data' && (
              <div style={{ display: 'flex', gap: '15px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '13px', marginBottom: '5px' }}>Ação:</label>
                  <select 
                    value={tipoAlteracao} 
                    onChange={(e) => setTipoAlteracao(e.target.value)}
                    style={{ padding: '5px' }}
                  >
                    <option value="Adiar">Adiar Aula</option>
                    <option value="Antecipar">Antecipar Aula</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '13px', marginBottom: '5px' }}>Nova Data (Futura):</label>
                  <input 
                    type="date" 
                    value={dataSelecionada}
                    onChange={(e) => setDataSelecionada(e.target.value)}
                    style={{ padding: '5px' }}
                  />
                </div>
              </div>
            )}
            
            <button 
              type="button" 
              onClick={adicionarCampo}
              style={{ alignSelf: 'flex-start', padding: '9px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            >
              Adicionar Campo
            </button>
          </div>

          {/* Lista de Campos Adicionados */}
          {campos.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>Campos no Rascunho:</h4>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {campos.map((campo) => (
                  <li key={campo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#fff', border: '1px solid #ddd', marginBottom: '5px', borderRadius: '4px' }}>
                    <span>
                      <strong>{campo.etiqueta}</strong> 
                      {campo.obrigatorio && <span style={{ color: 'red', marginLeft: '3px' }}>*</span>}
                      <span style={{ color: '#666', fontSize: '12px', marginLeft: '5px' }}>
                        ({campo.tipo === 'Data' 
                          ? `${campo.detalhesData.tipoAlteracao} para ${campo.detalhesData.data}` 
                          : campo.tipo})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removerCampo(campo.id)}
                      style={{ color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Botões de Ação Final */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <button 
            type="button" 
            onClick={(e) => handleSalvar(e, 'Rascunho')}
            style={{ flex: 1, padding: '12px', fontSize: '16px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
          >
            Gravar Rascunho
          </button>
          
          <button 
            type="button" 
            onClick={(e) => handleSalvar(e, 'Publicado')}
            style={{ flex: 1, padding: '12px', fontSize: '16px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Publicar Formulário
          </button>
        </div>
      </form>
    </div>
  );
}

export default CriarFormulario;