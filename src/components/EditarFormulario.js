import React, { useState, useEffect } from 'react';

// Finge que recebe o ID do formulário pela URL (ex: editar-formulario/1)
function EditarFormulario() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [campos, setCampos] = useState([]); // Array para guardar as perguntas
  const [mensagem, setMensagem] = useState('');
  const tiposComOpcoes = ['Dropdown', 'Radio Button', 'Checkbox'];

  // 1. CARREGAR OS DADOS (Critério de Aceitação 1)
  useEffect(() => {
    // Aqui seria o fetch para: GET /api/formularios/1
    // Enquanto nao é feito o backend, simulamos uma resposta da Base de Dados:
    const dadosSimulados = {
      titulo: 'Alteração de Horário - Engenharia Informática',
      descricao: 'Formulário para docentes.',
      campos: [
        { id: Date.now(), rotulo: 'Motivo da alteração', tipo: 'Texto Curto', obrigatorio: true, opcoes: [], novaOpcao: '' }
      ]
    };

    setTitulo(dadosSimulados.titulo);
    setDescricao(dadosSimulados.descricao);
    setCampos(dadosSimulados.campos);
  }, []);

  // 2. ADICIONAR UM NOVO CAMPO (Critério de Aceitação 2)
  const adicionarCampo = () => {
    const novoCampo = {
      id: Date.now(), // ID temporário
      rotulo: '',
      tipo: 'Texto Curto',
      obrigatorio: false,
      opcoes: [],
      novaOpcao: ''
    };
    setCampos([...campos, novoCampo]);
  };

  // 3. APAGAR UM CAMPO EXISTENTE (Critério de Aceitação 2)
  const removerCampo = (idParaRemover) => {
    setCampos(campos.filter(campo => campo.id !== idParaRemover));
  };

  // Atualizar os valores de um campo específico enquanto o admin escreve
  const atualizarCampo = (id, propriedade, valor) => {
    const camposAtualizados = campos.map(campo => {
      if (campo.id === id) {
        if (propriedade === 'tipo' && !tiposComOpcoes.includes(valor)) {
          return { ...campo, [propriedade]: valor, opcoes: [], novaOpcao: '' };
        }
        return { ...campo, [propriedade]: valor };
      }
      return campo;
    });
    setCampos(camposAtualizados);
  };

  const adicionarOpcaoNoCampo = (id) => {
    const campo = campos.find((item) => item.id === id);
    if (!campo) return;

    const valor = (campo.novaOpcao || '').trim();
    if (!valor) {
      setMensagem('Erro: A opção não pode ficar vazia.');
      return;
    }
    if (campo.opcoes.includes(valor)) {
      setMensagem('Erro: Esta opção já existe.');
      return;
    }

    const camposAtualizados = campos.map((item) => {
      if (item.id === id) {
        return { ...item, opcoes: [...(item.opcoes || []), valor], novaOpcao: '' };
      }
      return item;
    });

    setMensagem('');
    setCampos(camposAtualizados);
  };

  const removerOpcaoDoCampo = (id, indice) => {
    const camposAtualizados = campos.map((campo) => {
      if (campo.id === id) {
        return { ...campo, opcoes: (campo.opcoes || []).filter((_, index) => index !== indice) };
      }
      return campo;
    });
    setCampos(camposAtualizados);
  };

  // 4. GUARDAR O PROGRESSO COMO RASCUNHO (Critério de Aceitação 3)
  const handleSave = (e) => {
    e.preventDefault();
    
    const formularioAtualizado = {
      titulo,
      descricao,
      estado: 'Rascunho', // Mantém-se em Rascunho
      campos
    };

    // Aqui seria o fetch para: PUT /api/formularios/1
    console.log('A gravar na Base de Dados:', formularioAtualizado);
    setMensagem('Progresso guardado com sucesso (Continua em Rascunho).');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Editar Formulário (Rascunho)</h2>
      {mensagem && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensagem}</p>}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Dados Básicos */}
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Dados Gerais</h3>
          <input 
            type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} 
            placeholder="Título do Formulário" required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          />
          <textarea 
            value={descricao} onChange={(e) => setDescricao(e.target.value)} 
            placeholder="Descrição (Opcional)" rows="3" style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Gestão de Campos / Perguntas */}
        <div style={{ padding: '15px', border: '1px solid #0056b3', borderRadius: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Campos do Formulário</h3>
            <button type="button" onClick={adicionarCampo} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}>
              + Adicionar Campo
            </button>
          </div>

          {campos.map((campo, index) => (
            <React.Fragment key={campo.id}>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa' }}>
                <span style={{ fontWeight: 'bold' }}>{index + 1}.</span>
                <input 
                  type="text" value={campo.rotulo} onChange={(e) => atualizarCampo(campo.id, 'rotulo', e.target.value)}
                  placeholder="Ex: Qual a sala?" required style={{ flex: 1, padding: '5px' }}
                />
                <select value={campo.tipo} onChange={(e) => atualizarCampo(campo.id, 'tipo', e.target.value)} style={{ padding: '5px' }}>
                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Data">Data</option>
                  <option value="Dropdown">Dropdown</option>
                  <option value="Radio Button">Radio Button</option>
                  <option value="Checkbox">Checkbox</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" checked={campo.obrigatorio} onChange={(e) => atualizarCampo(campo.id, 'obrigatorio', e.target.checked)} />
                  Obrig.
                </label>
                <button type="button" onClick={() => removerCampo(campo.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px' }}>
                  Apagar
                </button>
              </div>
              {tiposComOpcoes.includes(campo.tipo) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={campo.novaOpcao || ''}
                      onChange={(e) => atualizarCampo(campo.id, 'novaOpcao', e.target.value)}
                      placeholder="Nova opção (Ex: Opção A)"
                      style={{ flex: 1, padding: '5px' }}
                    />
                    <button type="button" onClick={() => adicionarOpcaoNoCampo(campo.id)} style={{ padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer' }}>
                      Adicionar Opção
                    </button>
                  </div>
                  {campo.opcoes && campo.opcoes.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>Opções:</p>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
                        {campo.opcoes.map((opcao, index) => (
                          <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                            <span>{opcao}</span>
                            <button type="button" onClick={() => removerOpcaoDoCampo(campo.id, index)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
          {campos.length === 0 && <p style={{ fontStyle: 'italic', color: '#666' }}>Ainda não adicionou nenhum campo.</p>}
        </div>

        <button type="submit" style={{ padding: '12px', backgroundColor: '#0056b3', color: 'white', border: 'none', fontSize: '16px', borderRadius: '5px' }}>
          Guardar Progresso (Rascunho)
        </button>
      </form>
    </div>
  );
}

export default EditarFormulario;