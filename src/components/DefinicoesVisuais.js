import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DefinicoesVisuais.css';
import { useRuntimeColorClass } from '../utils/runtimeStyles';
function DefinicoesVisuais() {
  // Estados para guardar as escolhas do Admin
  const [corPrincipal, setCorPrincipal] = useState('#0056b3'); // Azul padrão
  const [logoApresentacao, setLogoApresentacao] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();
  const previewColorClass = useRuntimeColorClass('settings-preview-color', corPrincipal, '--settings-preview-color');

  // Função para lidar com o upload da imagem e criar uma pré-visualização
  const handleLogoChange = event => {
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
  const handleGuardar = async e => {
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
  return <div className={`settings-container ${previewColorClass}`}>
      <h2>Definições Visuais do Sistema</h2>
      <p>Personalize o aspeto dos formulários para os docentes.</p>

      {mensagem && <p className="definicoes-visuais-style-1">{mensagem}</p>}

      <form onSubmit={handleGuardar} className="definicoes-visuais-style-2">

        {/* Secção da Cor */}
        <div className="settings-section">
          <h3 className="settings-title">Cor Principal</h3>
          <label className="color-label">
            <input type="color" value={corPrincipal} onChange={e => setCorPrincipal(e.target.value)} className="color-input" />

            <span className="definicoes-visuais-style-3">Clique no quadrado para escolher a cor de destaque</span>
          </label>
        </div>

        {/* Secção do Logótipo */}
        <div className="settings-section">
          <h3 className="settings-title">Logótipo da Instituição</h3>
          <input type="file" accept="image/*" onChange={handleLogoChange} className="file-input" />


          {/* Caixa de Pré-visualização Dinâmica */}
          {logoApresentacao && <div className="preview-box">
              <p className="preview-label">Pré-visualização do Cabeçalho</p>

              <div className="preview-header settings-color-border">
                <img src={logoApresentacao} alt="Logótipo" className="preview-img" />
              </div>
            </div>}
        </div>

        {/* Botão de Guardar que também adota a cor escolhida */}
        <button type="submit" className="btn-save-settings settings-color-background">

          Guardar Definições
        </button>
      </form>
    </div>;
}
export default DefinicoesVisuais;
