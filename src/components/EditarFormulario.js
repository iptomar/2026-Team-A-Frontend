import React, { useState, useRef, useEffect } from 'react';

const TEMPLATES = [
  { type: 'Texto Curto', label: 'Texto Curto', w: 6 },
  { type: 'Texto Longo', label: 'Texto Longo', w: 12 },
  { type: 'Número', label: 'Número', w: 4 },
  { type: 'Data', label: 'Data', w: 4 },
  { type: 'Dropdown', label: 'Dropdown', w: 6 }
];

function EditarFormulario() {
  const [titulo, setTitulo] = useState('Edição de Formulário');
  const [campos, setCampos] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Dados iniciais simulados
    setCampos([
      { id: 'c1', x: 1, y: 1, w: 12, label: 'Nome do Aluno', type: 'Texto Curto', obrigatorio: true }
    ]);
  }, []);

  const onDragStart = (e, template) => {
    e.dataTransfer.setData('template', JSON.stringify(template));
  };

  const onDrop = (e) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('template');
    if (!dataStr) return;

    const template = JSON.parse(dataStr);
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
  };

  const atualizarCampo = (id, prop, val) => setCampos(campos.map(c => c.id === id ? { ...c, [prop]: val } : c));
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
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'move';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2>Editor de Layout Livre</h2>
        <button onClick={() => setIsPreview(!isPreview)}>{isPreview ? 'Editor' : '👁 Ver'}</button>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {!isPreview && (
          <div style={{ width: '250px', flexShrink: 0 }}>
            <div className="card" style={{ padding: '20px' }}>
              <h4>Ferramentas</h4>
              {TEMPLATES.map((t, i) => (
                <div key={i} draggable onDragStart={(e) => onDragStart(e, t)} style={{ padding: '12px', backgroundColor: '#f8f9fa', border: '1px solid #eee', borderRadius: '6px', marginBottom: '8px', cursor: 'grab', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  + {t.label}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }}>
          {isPreview ? (
            <div className="card" style={{ padding: '40px', minHeight: '800px' }}>
              <h1>{titulo}</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', marginTop: '40px' }}>
                {campos.map(c => (
                  <div key={c.id} style={{ gridColumn: `${c.x} / span ${c.w}`, gridRowStart: c.y }}>
                    <label style={{ fontWeight: 'bold', display: 'block' }}>{c.label}</label>
                    <input style={{ width: '100%', padding: '10px' }} disabled placeholder={c.type} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input style={{ width: '100%', fontSize: '1.5rem', fontWeight: 'bold' }} value={titulo} onChange={e => setTitulo(e.target.value)} />
              
              <div 
                ref={canvasRef}
                onDragOver={e => e.preventDefault()}
                onDrop={onDrop}
                style={{ 
                  backgroundColor: '#fff', border: '2px solid #ddd', borderRadius: '12px', minHeight: '1000px', 
                  display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: '100px',
                  backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: 'calc(100% / 12) 100px'
                }}
              >
                {campos.map(c => (
                  <div key={c.id} style={{ gridColumn: `${c.x} / span ${c.w}`, gridRowStart: c.y, backgroundColor: '#fff', border: '1px solid #28a745', borderRadius: '8px', padding: '15px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div onMouseDown={(e) => startMove(e, c.id)} style={{ cursor: 'move', color: '#ccc', padding: '2px 5px', fontSize: '1.2rem' }}>⠿</div>
                      <span style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase' }}>{c.type}</span>
                      <button onClick={() => removerCampo(c.id)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>×</button>
                    </div>
                    <input style={{ border: 'none', borderBottom: '1px solid #eee', fontWeight: 'bold', width: '100%' }} value={c.label} onChange={e => atualizarCampo(c.id, 'label', e.target.value)} />
                    <div onMouseDown={e => startResize(e, c.id)} style={{ position: 'absolute', right: 0, bottom: 0, width: '15px', height: '15px', cursor: 'nwse-resize', borderRight: '2px solid #28a745', borderBottom: '2px solid #28a745' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditarFormulario;
