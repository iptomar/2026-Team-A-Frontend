import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CriarFormulario({ onFormularioCriado }) {
  // Estados para os dados base do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 2. Configuração de Novos Campos ---
  const [campos, setCampos] = useState([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState("");
  const [novoTipo, setNovoTipo] = useState("Texto Curto");
  const [novoObrigatorio, setNovoObrigatorio] = useState(false);
  const [novaOpcao, setNovaOpcao] = useState('');
  const [opcoesCampo, setOpcoesCampo] = useState([]);

  // Validações específicas do campo
  const [novoMinValue, setNovoMinValue] = useState("");
  const [novoMaxValue, setNovoMaxValue] = useState("");
  const [novoCharLimit, setNovoCharLimit] = useState("");

  // --- 3. Agendamento e Controle de UI ---
  const [tipoAlteracao, setTipoAlteracao] = useState("Adiar");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  // --- 4. Helper Functions ---
  const isDataFutura = (data) => {
    if (!data) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataInserida = new Date(data);
    return dataInserida > hoje;
  };

const adicionarCampo = () => {
    // 1. Validação Única de Etiqueta
    if (novaEtiqueta.trim() === '') {
      setMensagem('Erro: A etiqueta do campo é obrigatória.');
      return;
    }

    const tiposComOpcoes = ['Dropdown', 'Radio Button', 'Checkbox'];
    const novoTipoComOpcoes = tiposComOpcoes.includes(novoTipo);

    // 2. Validação de Data
    if (novoTipo === "Data") {
      if (!dataSelecionada || !isDataFutura(dataSelecionada)) {
        setMensagem("Erro: Deve selecionar uma data futura válida.");
        return;
      }
    }

    // 3. Validação de Número
    if (novoTipo === 'Número') {
      if (novoMinValue === '' || novoMaxValue === '' || parseFloat(novoMinValue) >= parseFloat(novoMaxValue)) {
        setMensagem('Erro: Verifique os valores de Mínimo e Máximo.');
        return;
      }
    }

    // 4. Validação de Texto
    if (novoTipo.includes('Texto')) {
      if (novoCharLimit === '' || parseInt(novoCharLimit) <= 0) {
        setMensagem('Erro: O Limite de Caracteres deve ser um número positivo.');
        return;
      }
    }

    if (novoTipoComOpcoes && opcoesCampo.length === 0) {
      setMensagem('Erro: Adicione pelo menos uma opção.');
      return;
    }

    // 5. Criação do Objeto (Sem chaves duplicadas)
    const novoCampo = {
      id: Date.now(),
      etiqueta: novaEtiqueta,
      tipo: novoTipo,
      obrigatorio: novoObrigatorio,
      detalhesData: novoTipo === "Data" ? { tipoAlteracao, data: dataSelecionada } : null,
      opcoes: novoTipoComOpcoes ? opcoesCampo : [],
    };

    // 6. Adicionar metadados extras
    if (novoTipo === 'Número') {
      novoCampo.min_value = parseFloat(novoMinValue);
      novoCampo.max_value = parseFloat(novoMaxValue);
    } else if (novoTipo.includes('Texto')) {
      novoCampo.char_limit = parseInt(novoCharLimit);
    }

    // 7. Atualizar Estado e Resetar campos
    setCampos([...campos, novoCampo]);
    setNovaEtiqueta("");
    setNovoTipo("Texto Curto");
    setNovoObrigatorio(false);
    setDataSelecionada("");
    setNovoMinValue("");
    setNovoMaxValue("");
    setNovoCharLimit("");
    setNovaOpcao('');
    setOpcoesCampo([]);
    setMensagem("");
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
    setCampos(campos.filter((campo) => campo.id !== id));
  };

  // Main Submission Logic
  const handleSubmit = async (acao) => {
    if (titulo.trim() === "") {
      setMensagem("Erro: O Título é obrigatório.");
      return;
    }

    if (acao === "Publicado" && campos.length === 0) {
      setMensagem("Erro: Não é possível publicar um formulário sem campos.");
      return;
    }

    setLoading(true);
    setMensagem("");

    const novoFormulario = {
      titulo: titulo,
      descricao: descricao,
      estado: acao,
      campos: campos.map(({ id, ...rest }) => rest), // Remove o ID temporário antes de enviar
    };

    try {
      const response = await fetch("http://localhost:3000/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(novoFormulario),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao comunicar com o servidor");
      }

      setMensagem(
        `Sucesso! Formulário "${titulo}" ${acao === "Publicado" ? "Publicado" : "gravado como Rascunho"}.`,
      );

      if (acao === "Publicado") {
        setTitulo("");
        setDescricao("");
        setCampos([]);
      }
    } catch (error) {
      setMensagem(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>{isPreview ? 'Modo de Leitura (Vista do Professor)' : 'Criar Novo Formulário'}</h2>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          style={{ padding: '10px 15px', backgroundColor: isPreview ? '#6c757d' : '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isPreview ? 'Voltar à Edição' : '👁 Pré-visualizar'}
        </button>
      </div>
      {mensagem && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "4px",
            backgroundColor: mensagem.includes("Erro") ? "#ffebee" : "#e8f5e9",
            color: mensagem.includes("Erro") ? "#c62828" : "#2e7d32",
            border: `1px solid ${mensagem.includes("Erro") ? "#ef9a9a" : "#a5d6a7"}`,
            fontWeight: "bold",
          }}
        >
          {mensagem}
        </div>
      )}

      {isPreview ? (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>{titulo || 'Sem Título'}</h1>
            <p style={{ margin: 0, color: '#666' }}>{descricao || 'Sem descrição'}</p>
          </div>
          {campos.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#999' }}>Nenhum campo adicionado ainda.</p>
          ) : (
            campos.map((campo, index) => (
              <div key={campo.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold', color: '#444' }}>
                  {index + 1}. {campo.etiqueta} {campo.obrigatorio && <span style={{ color: 'red' }}>*</span>}
                </label>
                {campo.tipo === 'Texto Curto' && <input type="text" disabled placeholder="A sua resposta curta..." style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }} />}
                {campo.tipo === 'Texto Longo' && <textarea disabled rows="3" placeholder="A sua resposta detalhada..." style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }} />}
                {campo.tipo === 'Número' && <input type="number" disabled placeholder="Digite um número..." style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }} />}
                {campo.tipo === 'Data' && <input type="date" disabled style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }} />}
              </div>
            ))
          )}
        </div>
      ) : (
        <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Basic Info Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                htmlFor="titulo"
                style={{ fontWeight: "bold", marginBottom: "5px" }}
              >
                Título do Formulário (Obrigatório) *
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Alteração de Horário - Engenharia Informática"
                style={{ padding: "8px", fontSize: "16px" }}
                disabled={loading}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                htmlFor="descricao"
                style={{ fontWeight: "bold", marginBottom: "5px" }}
              >
                Descrição (Opcional)
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows="3"
                placeholder="Instruções para o preenchimento deste formulário..."
                style={{ padding: "8px", fontSize: "16px" }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Add Fields Section */}
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Adicionar Campos</h3>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px' }}>
                <label htmlFor="etiqueta" style={{ fontSize: '14px', marginBottom: '5px' }}>Pergunta / Etiqueta</label>
                <input
                  id="etiqueta"
                  type="text"
                  value={novaEtiqueta}
                  onChange={(e) => setNovaEtiqueta(e.target.value)}
                  placeholder="Ex: Nome do Aluno"
                  style={{ padding: '8px', fontSize: '14px' }}
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="tipo" style={{ fontSize: '14px', marginBottom: '5px' }}>Tipo de Campo</label>
                <select
                  id="tipo"
                  value={novoTipo}
                  onChange={(e) => {
                    setNovoTipo(e.target.value);
                    setNovoMinValue('');
                    setNovoMaxValue('');
                    setNovoCharLimit('');
                    const novoValor = e.target.value;
                    const tiposComOpcoes = ['Dropdown', 'Radio Button', 'Checkbox'];
                    if (!tiposComOpcoes.includes(novoValor)) {
                      setOpcoesCampo([]);
                      setNovaOpcao('');
                    }
                    setNovoTipo(novoValor);
                  }}
                  style={{ padding: '8px', fontSize: '14px' }}
                  disabled={loading}
                >
                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Número">Número</option>
                  <option value="Data">Data</option>
<option value="DataAlteracao">Data (Alteração de Aula)</option>
                  <option value="Dropdown">Dropdown</option>
                  <option value="Radio Button">Radio Button</option>
                  <option value="Checkbox">Checkbox</option>
                </select>
              </div>

              {/* Conditional Inputs for Número */}
              {novoTipo === 'Número' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="minValue" style={{ fontSize: '14px', marginBottom: '5px' }}>Mínimo</label>
                    <input
                      id="minValue"
                      type="number"
                      value={novoMinValue}
                      onChange={(e) => setNovoMinValue(e.target.value)}
                      placeholder="Ex: 0"
                      style={{ padding: '8px', fontSize: '14px' }}
                      disabled={loading}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="maxValue" style={{ fontSize: '14px', marginBottom: '5px' }}>Máximo</label>
                    <input
                      id="maxValue"
                      type="number"
                      value={novoMaxValue}
                      onChange={(e) => setNovoMaxValue(e.target.value)}
                      placeholder="Ex: 100"
                      style={{ padding: '8px', fontSize: '14px' }}
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {/* Conditional Inputs for Texto */}
              {novoTipo.includes('Texto') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label htmlFor="charLimit" style={{ fontSize: '14px', marginBottom: '5px' }}>Limite de Caracteres</label>
                  <input
                    id="charLimit"
                    type="number"
                    value={novoCharLimit}
                    onChange={(e) => setNovoCharLimit(e.target.value)}
                    placeholder="Ex: 50"
                    style={{ padding: '8px', fontSize: '14px' }}
                    disabled={loading}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px', height: '35px' }}>
                <input
                  id="obrigatorio"
                  type="checkbox"
                  checked={novoObrigatorio}
                  onChange={(e) => setNovoObrigatorio(e.target.checked)}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  disabled={loading}
                />
                <label htmlFor="obrigatorio" style={{ fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Obrigatório?
                </label>
              </div>
            </div>

            {/* Dynamic Data Section */}
            {novoTipo === "Data" && (
              <div style={{ display: 'flex', gap: '15px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '13px', marginBottom: '5px' }}>Ação:</label>
                  <select
                    value={tipoAlteracao}
                    onChange={(e) => setTipoAlteracao(e.target.value)}
                    style={{ padding: '5px' }}
                    disabled={loading}
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
                    disabled={loading}
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
              style={{ alignSelf: 'flex-start', padding: '9px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}
              disabled={loading}
            >
              Adicionar Campo
            </button>
          </div>

          {/* List of Added Fields */}
          {campos.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                Campos no Rascunho:
              </h4>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {campos.map((campo) => (
                  <li key={campo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px', backgroundColor: '#fff', border: '1px solid #ddd', marginBottom: '5px', borderRadius: '4px' }}>
                    <div>
                      <strong>{campo.etiqueta}</strong>
                      {campo.obrigatorio && <span style={{ color: 'red', marginLeft: '3px' }}>*</span>}
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        ({campo.tipo === 'Data' 
                          ? `${campo.detalhesData.tipoAlteracao} para ${campo.detalhesData.data}` 
                          : campo.tipo})
                      </span>
                      {campo.tipo === 'Número' && (
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                          Min: {campo.min_value}, Max: {campo.max_value}
                        </div>
                      )}
                      {campo.tipo.includes('Texto') && (
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                          Limite: {campo.char_limit} caracteres
                        </div>
                      )}
                      {campo.opcoes && campo.opcoes.length > 0 && (
                        <span style={{ color: '#333', fontSize: '12px', marginLeft: '15px' }}>
                          Opções: {campo.opcoes.join(', ')}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removerCampo(campo.id)}
                      style={{ color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      disabled={loading}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Final Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => handleSubmit("Rascunho")}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? 'A processar...' : 'Gravar Rascunho'}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("Publicado")}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#0056b3',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                fontWeight: 'bold',
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              {loading ? 'A processar...' : 'Publicar Formulário'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CriarFormulario;
