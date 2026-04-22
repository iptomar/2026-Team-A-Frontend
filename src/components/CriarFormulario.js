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
  const [novoMinValue, setNovoMinValue] = useState('');
  const [novoMaxValue, setNovoMaxValue] = useState('');
  const [novoCharLimit, setNovoCharLimit] = useState('');

  // Função para adicionar um novo campo à lista
  const adicionarCampo = () => {
    if (novaEtiqueta.trim() === '') {
      setMensagem('Erro: A etiqueta do campo é obrigatória.');
      return;
    }

    // Validações específicas para tipo Número
    if (novoTipo === 'Número') {
      if (novoMinValue === '' || novoMaxValue === '') {
        setMensagem('Erro: Mínimo e Máximo são obrigatórios para campos Número.');
        return;
      }
      if (parseFloat(novoMinValue) >= parseFloat(novoMaxValue)) {
        setMensagem('Erro: Mínimo deve ser menor que Máximo.');
        return;
      }
    }

    // Validações específicas para tipo Texto
    if (novoTipo.includes('Texto')) {
      if (novoCharLimit === '') {
        setMensagem('Erro: Limite de Caracteres é obrigatório para campos Texto.');
        return;
      }
      if (parseInt(novoCharLimit) <= 0) {
        setMensagem('Erro: Limite de Caracteres deve ser um número positivo.');
        return;
      }
    }

    const novoCampo = {
      id: Date.now(), // ID temporário para identificação na lista
      etiqueta: novaEtiqueta,
      tipo: novoTipo
    };

    // Adicionar metadados conforme o tipo
    if (novoTipo === 'Número') {
      novoCampo.min_value = parseFloat(novoMinValue);
      novoCampo.max_value = parseFloat(novoMaxValue);
    } else if (novoTipo.includes('Texto')) {
      novoCampo.char_limit = parseInt(novoCharLimit);
    }

    setCampos([...campos, novoCampo]);
    
    // Limpar os inputs de criação de campo
    setNovaEtiqueta('');
    setNovoTipo('Texto Curto');
    setNovoMinValue('');
    setNovoMaxValue('');
    setNovoCharLimit('');
    setMensagem(''); 
  };

  // Função para remover um campo da lista antes de gravar
  const removerCampo = (id) => {
    setCampos(campos.filter(campo => campo.id !== id));
  };

  // Função que corre quando clica em "Gravar Rascunho"
  const handleSubmit = (e) => {
    e.preventDefault();

    if (titulo.trim() === '') {
      setMensagem('Erro: O Título é obrigatório.');
      return;
    }

    // Estrutura de dados atualizada para o Backend com os novos campos
    const novoFormulario = {
      titulo: titulo,
      descricao: descricao,
      estado: 'Rascunho',
      campos: campos.map(({ id, ...rest }) => rest) // Remove o ID temporário antes de enviar
    };

    console.log('A enviar para a Base de Dados:', novoFormulario);

    // Enviar para o backend
    fetch('http://localhost:3000/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoFormulario)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao guardar formulário no servidor');
        }
        return response.json();
      })
      .then(data => {
        setMensagem(`Sucesso! Formulário "${titulo}" gravado como Rascunho com ${campos.length} campo(s).`);
        
        // Limpar o formulário após gravar com sucesso
        setTitulo('');
        setDescricao('');
        setCampos([]);
      })
      .catch(error => {
        console.error('Erro:', error);
        setMensagem(`Erro ao guardar: ${error.message}`);
      });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>Criar Novo Formulário</h2>
      
      {mensagem && (
        <p style={{ color: mensagem.includes('Erro') ? 'red' : 'green', fontWeight: 'bold' }}>
          {mensagem}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Informação Base do Formulário */}
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

        {/* Secção de Adição de Campos (Critérios de Aceitação) */}
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
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="tipo" style={{ fontSize: '14px', marginBottom: '5px' }}>Tipo de Campo</label>
              <select
                id="tipo"
                value={novoTipo}
                onChange={(e) => {
                  setNovoTipo(e.target.value);
                  // Limpar valores de validação ao mudar tipo
                  setNovoMinValue('');
                  setNovoMaxValue('');
                  setNovoCharLimit('');
                }}
                style={{ padding: '8px', fontSize: '14px' }}
              >
                <option value="Texto Curto">Texto Curto</option>
                <option value="Texto Longo">Texto Longo</option>
                <option value="Número">Número</option>
                <option value="Data">Data</option>
              </select>
            </div>

            {/* Inputs Condicionais para Número */}
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
                  />
                </div>
              </>
            )}

            {/* Inputs Condicionais para Texto */}
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
                />
              </div>
            )}
            
            <button 
              type="button" 
              onClick={adicionarCampo}
              style={{ padding: '9px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            >
              Adicionar
            </button>
          </div>

          {/* Lista de Campos Adicionados */}
          {campos.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>Campos no Rascunho:</h4>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {campos.map((campo) => (
                  <li key={campo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px', backgroundColor: '#fff', border: '1px solid #ddd', marginBottom: '5px', borderRadius: '4px' }}>
                    <div>
                      <strong>{campo.etiqueta}</strong> 
                      <span style={{ color: '#666', fontSize: '12px' }}>({campo.tipo})</span>
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
                    </div>
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

        {/* Botão de Submissão Principal */}
        <button 
          type="submit" 
          style={{ padding: '12px', fontSize: '16px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}
        >
          Gravar Rascunho do Formulário
        </button>
      </form>
    </div>
  );
}

export default CriarFormulario;