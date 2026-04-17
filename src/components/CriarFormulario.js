import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CriarFormulario({ onFormularioCriado }) {
  // Estados para os dados base do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Estados para gerir a adição de campos dinâmicos
  const [campos, setCampos] = useState([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState('');
  const [novoTipo, setNovoTipo] = useState('Texto Curto');
  const [novoObrigatorio, setNovoObrigatorio] = useState(false);
  const [novaOpcao, setNovaOpcao] = useState('');
  const [opcoesCampo, setOpcoesCampo] = useState([]);

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
    const tiposComOpcoes = ['Dropdown', 'Radio Button', 'Checkbox'];
    const novoTipoComOpcoes = tiposComOpcoes.includes(novoTipo);

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

    if (novoTipoComOpcoes && opcoesCampo.length === 0) {
      setMensagem('Erro: Deve adicionar pelo menos uma opção para este tipo de campo.');
      return;
    }

    const novoCampo = {
      id: Date.now(),
      etiqueta: novaEtiqueta,
      tipo: novoTipo,
      obrigatorio: novoObrigatorio,
      opcoes: novoTipoComOpcoes ? opcoesCampo : [],
      // Propriedades extra se for do tipo Data
      detalhesData: novoTipo === 'Data' ? { tipoAlteracao, data: dataSelecionada } : null
    };

    setCampos([...campos, novoCampo]);
    
    // Limpar os inputs após adicionar
    setNovaEtiqueta('');
    setNovoTipo('Texto Curto');
    setNovoObrigatorio(false);
    setNovaOpcao('');
    setOpcoesCampo([]);
    setDataSelecionada('');
    setMensagem('');
  };

  const adicionarOpcaoCampo = () => {
    const valor = novaOpcao.trim();
    if (!valor) {
      setMensagem('Erro: A opção não pode ficar vazia.');
      return;
    }
    if (opcoesCampo.includes(valor)) {
      setMensagem('Erro: Esta opção já existe.');
      return;
    }
    setOpcoesCampo([...opcoesCampo, valor]);
    setNovaOpcao('');
    setMensagem('');
  };

  const removerOpcaoCampo = (indice) => {
    setOpcoesCampo(opcoesCampo.filter((_, index) => index !== indice));
  };

  const removerCampo = (id) => {
    setCampos(campos.filter(campo => campo.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (titulo.trim() === '') {
      setMensagem('Erro: O Título é obrigatório.');
      return;
    }

    const novoFormulario = {
      titulo: titulo,
      descricao: descricao,
      estado: 'Rascunho',
      campos: campos
    };

    console.log('A enviar para a Base de Dados:', novoFormulario);
    setMensagem(`Sucesso! Formulário "${titulo}" gravado como Rascunho com ${campos.length} campo(s).`);

    if (onFormularioCriado) {
      onFormularioCriado(novoFormulario);
    }

    setTitulo('');
    setDescricao('');
    setCampos([]);
  };

  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>Criar Novo Formulário</h2>
      
      {mensagem && (
        <p style={{ color: mensagem.includes('Erro') ? 'red' : 'green', fontWeight: 'bold' }}>
          {mensagem}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
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
                  onChange={(e) => {
                    const novoValor = e.target.value;
                    const tiposComOpcoes = ['Dropdown', 'Radio Button', 'Checkbox'];
                    if (!tiposComOpcoes.includes(novoValor)) {
                      setOpcoesCampo([]);
                      setNovaOpcao('');
                    }
                    setNovoTipo(novoValor);
                  }}
                  style={{ padding: '8px', fontSize: '14px' }}
                >
                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Data">Data (Alteração de Aula)</option>
                  <option value="Dropdown">Dropdown</option>
                  <option value="Radio Button">Radio Button</option>
                  <option value="Checkbox">Checkbox</option>
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

            {/* SEÇÃO DINÂMICA: Apenas aparece para campos com opções */}
            {['Dropdown', 'Radio Button', 'Checkbox'].includes(novoTipo) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="novaOpcao" style={{ fontSize: '13px', marginBottom: '5px' }}>Adicionar opção</label>
                    <input
                      id="novaOpcao"
                      type="text"
                      value={novaOpcao}
                      onChange={(e) => setNovaOpcao(e.target.value)}
                      placeholder="Ex: Opção A"
                      style={{ padding: '8px', fontSize: '14px' }}
                    />
                  </div>
                  <button type="button" onClick={adicionarOpcaoCampo} style={{ height: '38px', padding: '8px 12px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Adicionar Opção
                  </button>
                </div>
                {opcoesCampo.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Opções atuais:</span>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
                      {opcoesCampo.map((opcao, index) => (
                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                          <span>{opcao}</span>
                          <button type="button" onClick={() => removerOpcaoCampo(index)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>
                            Remover
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                    {campo.opcoes && campo.opcoes.length > 0 && (
                      <span style={{ color: '#333', fontSize: '12px', marginLeft: '15px' }}>
                        Opções: {campo.opcoes.join(', ')}
                      </span>
                    )}
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

        <button 
          type="submit" 
          style={{ padding: '12px', fontSize: '16px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}
        >
          Gravar Rascunho do Formulário
        </button>
        <button onClick={() => navigate('/editar-formulario')} style={{ padding: '12px', fontSize: '16px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>
          Editar Formulário (Ir para Ecrã de Edição)
        </button>
      </form>
    </div>
  );
}

export default CriarFormulario;