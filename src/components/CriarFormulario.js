import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Itens da Toolbox Iniciais
const INITIAL_TEMPLATES = [
  { type: 'Texto Curto', label: 'Texto Curto', w: 6 },
  { type: 'Texto Longo', label: 'Texto Longo', w: 12 },
  { type: 'Número', label: 'Número', w: 4 },
  { type: 'Data', label: 'Data', w: 4 },
  { type: 'Nome', label: 'Nome Completo', w: 12 },
  { type: 'Email', label: 'Email', w: 6 }
];

function CriarFormulario({ onFormularioCriado }) {
  const [titulo, setTitulo] = useState('');
  const [campos, setCampos] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 1. Gestão de Modelos (Padrão + Personalizados)
  const [templates, setTemplates] = useState({
    TIPOS: INITIAL_TEMPLATES,
    PERSONALIZADOS: []
  });
  const [novoModeloNome, setNovoModeloNome] = useState('');
  const [novoModeloTipo, setNovoModeloTipo] = useState('Texto Curto');

  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Adicionar uma nova ferramenta personalizada à sidebar
  const adicionarCustom = () => {
    if (!novoModeloNome.trim()) return;
    const novo = { type: novoModeloTipo, label: novoModeloNome, w: 6 };
    setTemplates(prev => ({ ...prev, PERSONALIZADOS: [...prev.PERSONALIZADOS, novo] }));
    setNovoModeloNome('');
  };

  const onDragStart = (e, template) => {
    window._draggedTemplate = template;
  };

  const onDrop = (e) => {
    e.preventDefault();
    const template = window._draggedTemplate;
    if (!template) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const colWidth = canvasRect.width / 12;
    const rowHeight = 100;

    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const x = Math.floor(mouseX / colWidth) + 1;
    const y = Math.floor(mouseY / rowHeight) + 1;

    const novoCampo = {
      id: `campo-${Date.now()}`,
      x: Math.min(x, 12 - (template.w - 1)),
      y: y,
      w: template.w,
      label: template.label,
      type: template.type,
      obrigatorio: false
    };

    setCampos([...campos, novoCampo]);
    window._draggedTemplate = null;
  };

  const atualizarCampo = (id, prop, val) => {
    setCampos(campos.map(c => c.id === id ? { ...c, [prop]: val } : c));
  };

  const removerCampo = (id) => setCampos(campos.filter(c => c.id !== id));

  const startResize = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const campo = campos.find(c => c.id === id);
    const startW = campo.w;
    const colWidth = canvasRef.current.offsetWidth / 12;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const colDelta = Math.round(deltaX / colWidth);
      const newW = Math.max(2, Math.min(12 - (campo.x - 1), startW + colDelta));
      atualizarCampo(id, 'w', newW);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startMove = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const campo = campos.find(c => c.id === id);
    const startGridX = campo.x;
    const startGridY = campo.y;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const colWidth = canvasRect.width / 12;
    const rowHeight = 100;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      const colDelta = Math.round(deltaX / colWidth);
      const rowDelta = Math.round(deltaY / rowHeight);
      const newX = Math.max(1, Math.min(12 - (campo.w - 1), startGridX + colDelta));
      const newY = Math.max(1, startGridY + rowDelta);
      if (newX !== campo.x || newY !== campo.y) {
        setCampos(prev => prev.map(c => c.id === id ? { ...c, x: newX, y: newY } : c));
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSubmit = async (acao) => {
    if (titulo.trim() === "") {
      setMensagem("Erro: O Título é obrigatório.");
      return;
    }
    setLoading(true);
    setMensagem("");
    const data = {
      titulo,
      descricao: "Layout Livre",
      estado: acao,
      campos: campos.map(c => ({
        etiqueta: c.label,
        tipo: c.type,
        obrigatorio: c.obrigatorio,
        x: c.x,
        y: c.y,
        w: c.w
      }))
    };
    try {
      const response = await fetch("http://localhost:3000/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Erro no servidor");
      setMensagem("Sucesso!");
      if (onFormularioCriado) onFormularioCriado();
      if (acao === 'Publicado') setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      setMensagem(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2>Painel de Desenho Livre</h2>
        <button onClick={() => setIsPreview(!isPreview)}>{isPreview ? 'Voltar ao Editor' : '👁 Ver Formulário'}</button>
      </div>

      {mensagem && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: mensagem.includes('Erro') ? '#fff1f0' : '#f6ffed', 
          border: `1px solid ${mensagem.includes('Erro') ? '#ffa39e' : '#b7eb8f'}`,
          borderRadius: '4px',
          marginBottom: '20px', 
          textAlign: 'center',
          color: mensagem.includes('Erro') ? '#cf1322' : '#52c41a',
          fontWeight: 'bold'
        }}>
          {mensagem}
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px' }}>
        {!isPreview && (
          <div style={{ width: '280px', flexShrink: 0 }}>
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '15px' }}>Ferramentas</h4>
              <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#999' }}>TIPOS BÁSICOS</p>
              {templates.TIPOS.map((t, i) => (
                <div key={`tipo-${i}`} draggable onDragStart={(e) => onDragStart(e, t)} style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', marginBottom: '5px', cursor: 'grab', borderRadius: '4px' }}>
                  + {t.label}
                </div>
              ))}
              
              {templates.PERSONALIZADOS.length > 0 && (
                <>
                  <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#28a745', marginTop: '15px' }}>PERSONALIZADOS</p>
                  {templates.PERSONALIZADOS.map((t, i) => (
                    <div key={`custom-${i}`} draggable onDragStart={(e) => onDragStart(e, t)} style={{ padding: '10px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: '5px', cursor: 'grab', borderRadius: '4px' }}>
                      ★ {t.label}
                    </div>
                  ))}
                </>
              )}

              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>Criar Ferramenta</p>
                <input 
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', marginBottom: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                  placeholder="Nome da pergunta..." 
                  value={novoModeloNome} 
                  onChange={e => setNovoModeloNome(e.target.value)} 
                />
                <select 
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  value={novoModeloTipo}
                  onChange={e => setNovoModeloTipo(e.target.value)}
                >
                  <option value="Texto Curto">Texto Curto</option>
                  <option value="Texto Longo">Texto Longo</option>
                  <option value="Número">Número</option>
                  <option value="Data">Data</option>
                </select>
                <button onClick={adicionarCustom} style={{ width: '100%', padding: '8px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Adicionar</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ flex: 1 }}>
          {isPreview ? (
            <div className="card" style={{ padding: '40px', minHeight: '800px', position: 'relative' }}>
               <h1>{titulo || 'Sem Título'}</h1>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', marginTop: '40px' }}>
                  {campos.map(c => (
                    <div key={c.id} style={{ gridColumn: `${c.x} / span ${c.w}`, gridRowStart: c.y }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{c.label} {c.obrigatorio && <span style={{color:'red'}}>*</span>}</label>
                      <input style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} disabled placeholder={`Resposta (${c.type})...`} />
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input 
                style={{ width: '100%', fontSize: '2rem', fontWeight: 'bold', border: 'none', borderBottom: '2px solid #28a745', outline: 'none', padding: '10px 0' }} 
                value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título do Formulário" 
              />
              
              <div 
                ref={canvasRef}
                onDragOver={e => e.preventDefault()}
                onDrop={onDrop}
                style={{ 
                  backgroundColor: '#fff', border: '2px solid #ddd', borderRadius: '12px', minHeight: '1000px', 
                  display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: '100px',
                  backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: 'calc(100% / 12) 100px',
                  padding: '10px', gap: '10px'
                }}
              >
                {campos.map(c => (
                  <div key={c.id} style={{ gridColumn: `${c.x} / span ${c.w}`, gridRowStart: c.y, backgroundColor: '#fff', border: '1px solid #28a745', borderRadius: '8px', padding: '15px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div onMouseDown={(e) => startMove(e, c.id)} style={{ cursor: 'move', fontSize: '1.2rem', color: '#ccc' }}>⠿</div>
                      <span style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', fontWeight: 'bold' }}>{c.type}</span>
                      <button onClick={() => removerCampo(c.id)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </div>
                    <input style={{ border: 'none', borderBottom: '1px solid #eee', fontWeight: 'bold', width: '100%', outline: 'none' }} value={c.label} onChange={e => atualizarCampo(c.id, 'label', e.target.value)} />
                    
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input type="checkbox" checked={c.obrigatorio} onChange={e => atualizarCampo(c.id, 'obrigatorio', e.target.checked)} />
                      <span style={{ fontSize: '0.7rem', color: '#888' }}>Obrigatório</span>
                    </div>

                    <div onMouseDown={e => startResize(e, c.id)} style={{ position: 'absolute', right: 0, bottom: 0, width: '15px', height: '15px', cursor: 'nwse-resize', borderRight: '2px solid #28a745', borderBottom: '2px solid #28a745', borderRadius: '0 0 8px 0' }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <button className="btn-logout" style={{ flex: 1, padding: '15px', fontWeight: 'bold' }} onClick={() => handleSubmit('Rascunho')}>Gravar Rascunho</button>
                <button className="btn-primary" style={{ flex: 1, padding: '15px', fontWeight: 'bold' }} onClick={() => handleSubmit('Publicado')}>Publicar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CriarFormulario;
