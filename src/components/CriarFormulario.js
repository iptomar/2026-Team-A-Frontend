import React, { useState } from 'react';

function CriarFormulario() {
  // Estados para guardar o que o utilizador escreve
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Função que corre quando clica em "Gravar"
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que a página recarregue

    // Validação extra por segurança (embora o HTML 'required' já ajude)
    if (titulo.trim() === '') {
      setMensagem('Erro: O Título é obrigatório.');
      return;
    }

    // Estrutura de dados que será enviada para o Backend (critério de aceitação: deve conter título, descrição e estado)
    const novoFormulario = {
      titulo: titulo,
      descricao: descricao,
      estado: 'Rascunho' // Critério de aceitação: assume automaticamente "Rascunho"
    };

    // Aqui vai ser feita a chamada à API (ex: fetch ou axios para o Node.js)
    console.log('A enviar para a Base de Dados:', novoFormulario);
    setMensagem(`Sucesso! Formulário "${titulo}" gravado como Rascunho.`);

    // Limpar os campos depois de gravar
    setTitulo('');
    setDescricao('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>Criar Novo Formulário</h2>
      
      {/* Exibir mensagens de sucesso ou erro */}
      {mensagem && <p style={{ color: mensagem.includes('Erro') ? 'red' : 'green' }}>{mensagem}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Campo Título - Obrigatório */}
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

        {/* Campo Descrição - Opcional */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="descricao" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Descrição (Opcional)
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows="4"
            placeholder="Instruções para o preenchimento deste formulário..."
            style={{ padding: '8px', fontSize: '16px' }}
          />
        </div>

        {/* Botão de Gravar */}
        <button 
          type="submit" 
          style={{ padding: '10px', fontSize: '16px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          Gravar Rascunho
        </button>
      </form>
    </div>
  );
}

export default CriarFormulario;