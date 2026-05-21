import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DefinicoesVisuais() {
  // Estados para guardar as escolhas do Admin
  const [corPrincipal, setCorPrincipal] = useState('#0056b3'); // Azul padrão
  const [logoApresentacao, setLogoApresentacao] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const navigate = useNavigate();

  // Função para lidar com o upload da imagem e criar uma pré-visualização
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // O FileReader permite ler o ficheiro localmente para o mostrar logo no ecrã
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoApresentacao(reader.result); // Guarda a imagem em formato base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    
    const definicoes = {
      corPrincipal: corPrincipal,
      logo: logoApresentacao
    };
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/settings/visual', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(definicoes)
      });

      if (!response.ok) {
        throw new Error('Erro ao guardar definições no servidor.');
      }

      localStorage.setItem('corPrincipal', corPrincipal);
      if (logoApresentacao) {
        localStorage.setItem('logo', logoApresentacao);
      }
      
      setMensagem('Definições visuais guardadas com sucesso!');
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      setMensagem('Erro: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Definições Visuais do Sistema</h2>
      <p>Personalize o aspeto dos formulários para os docentes.</p>

      {mensagem && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensagem}</p>}

      <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Secção da Cor */}
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3 style={{ marginTop: 0 }}>Cor Principal</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
            <input 
              type="color" 
              value={corPrincipal} 
              onChange={(e) => setCorPrincipal(e.target.value)} 
              style={{ width: '60px', height: '60px', padding: '0', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '16px' }}>Clique no quadrado para escolher a cor de destaque</span>
          </label>
        </div>

        {/* Secção do Logótipo */}
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3 style={{ marginTop: 0 }}>Logótipo da Instituição</h3>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleLogoChange} 
            style={{ marginBottom: '15px', width: '100%' }}
          />
          
          {/* Caixa de Pré-visualização Dinâmica */}
          {logoApresentacao && (
            <div style={{ marginTop: '15px', padding: '20px', backgroundColor: '#f8f9fa', textAlign: 'center', borderRadius: '5px', border: '1px dashed #ccc' }}>
              <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Pré-visualização do Cabeçalho</p>
              
              <div style={{ borderTop: `6px solid ${corPrincipal}`, paddingTop: '15px', backgroundColor: 'white', paddingBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <img src={logoApresentacao} alt="Logótipo" style={{ maxHeight: '80px', objectFit: 'contain' }} />
              </div>
            </div>
          )}
        </div>

        {/* Botão de Guardar que também adota a cor escolhida */}
        <button 
          type="submit" 
          style={{ 
            padding: '15px', 
            backgroundColor: corPrincipal, 
            color: 'white', 
            border: 'none', 
            fontSize: '16px', 
            fontWeight: 'bold',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          Guardar Definições
        </button>
      </form>
    </div>
  );
}

export default DefinicoesVisuais;