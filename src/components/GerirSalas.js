import React, { useState, useEffect } from 'react';
import './GerirSalas.css';

function GerirSalas() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salaSelecionada, setSalaSelecionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novaSala, setNovaSala] = useState({
    nome: '',
    bloco: '',
    piso: '',
    tipo: '',
    lotacao: '',
    equipamentos: {
      projetor: false,
      tomadas: false
    }
  });

  const carregarSalas = async () => {
    setLoading(true);
    try {
      const resposta = await fetch('http://localhost:3000/api/salas');
      if (resposta.ok) {
        const dados = await resposta.json();
        setSalas(dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar salas:', erro);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSalas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'projetor' || name === 'tomadas') {
      setNovaSala(prev => ({
        ...prev,
        equipamentos: {
          ...prev.equipamentos,
          [name]: checked
        }
      }));
    } else {
      setNovaSala(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const submeterSala = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch('http://localhost:3000/api/salas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(novaSala)
      });

      if (resposta.ok) {
        alert('Sala adicionada com sucesso!');
        setMostrarFormulario(false);
        setNovaSala({
          nome: '', bloco: '', piso: '', tipo: '', lotacao: '',
          equipamentos: { projetor: false, tomadas: false }
        });
        carregarSalas();
      } else {
        const erro = await resposta.json();
        alert(`Erro: ${erro.error}`);
      }
    } catch (erro) {
      console.error('Erro ao criar sala:', erro);
      alert('Erro de rede ao criar sala.');
    }
  };

  return (
    <div className="gerir-salas-container">
      <div className="header-salas">
        <h2>Gestão de Salas</h2>
        <button className="btn-primary" onClick={() => {
          setMostrarFormulario(true);
          setSalaSelecionada(null);
        }}>
          + Adicionar Sala
        </button>
      </div>

      <div className="salas-layout">
        <aside className="salas-lista">
          {loading ? (
            <p>A carregar salas...</p>
          ) : (
            salas.map(sala => (
              <div 
                key={sala._id} 
                className={`sala-item ${salaSelecionada?._id === sala._id ? 'active' : ''}`}
                onClick={() => {
                  setSalaSelecionada(sala);
                  setMostrarFormulario(false);
                }}
              >
                <strong>{sala.nome}</strong>
                <span>{sala.tipo}</span>
              </div>
            ))
          )}
          {!loading && salas.length === 0 && <p>Nenhuma sala registada.</p>}
        </aside>

        <main className="sala-detalhes-main">
          {mostrarFormulario ? (
            <div className="card form-sala">
              <h3>Nova Sala</h3>
              <form onSubmit={submeterSala}>
                <div className="form-group">
                  <label>Nome da Sala (ex: B214)</label>
                  <input type="text" name="nome" value={novaSala.nome} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bloco</label>
                    <input type="text" name="bloco" value={novaSala.bloco} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Piso</label>
                    <input type="text" name="piso" value={novaSala.piso} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tipo de Sala</label>
                  <select name="tipo" value={novaSala.tipo} onChange={handleInputChange} required>
                    <option value="">Selecione um tipo...</option>
                    <option value="Laboratório de Informática">Laboratório de Informática</option>
                    <option value="Anfiteatro">Anfiteatro</option>
                    <option value="Sala de Aula Comum">Sala de Aula Comum</option>
                    <option value="Laboratório de Eletrónica">Laboratório de Eletrónica</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lotação (Capacidade)</label>
                  <input type="number" name="lotacao" value={novaSala.lotacao} onChange={handleInputChange} required />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" name="projetor" checked={novaSala.equipamentos.projetor} onChange={handleInputChange} />
                    Projetor Funcional
                  </label>
                  <label>
                    <input type="checkbox" name="tomadas" checked={novaSala.equipamentos.tomadas} onChange={handleInputChange} />
                    Tomadas para Alunos
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary">Guardar Sala</button>
                </div>
              </form>
            </div>
          ) : salaSelecionada ? (
            <div className="card sala-info">
              <h3>Detalhes da Sala: {salaSelecionada.nome}</h3>
              <div className="detalhes-grid">
                <div className="detalhe-item">
                  <strong>Bloco / Piso:</strong>
                  <span>{salaSelecionada.bloco} / {salaSelecionada.piso}</span>
                </div>
                <div className="detalhe-item">
                  <strong>Tipo:</strong>
                  <span>{salaSelecionada.tipo}</span>
                </div>
                <div className="detalhe-item">
                  <strong>Lotação:</strong>
                  <span>{salaSelecionada.lotacao} pessoas</span>
                </div>
                <div className="detalhe-item">
                  <strong>Equipamentos:</strong>
                  <ul>
                    <li>Projetor: {salaSelecionada.equipamentos.projetor ? '✅ Sim' : '❌ Não'}</li>
                    <li>Tomadas: {salaSelecionada.equipamentos.tomadas ? '✅ Sim' : '❌ Não'}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="vazio-state">
              <p>Selecione uma sala para ver os detalhes ou clique em "Adicionar Sala".</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default GerirSalas;