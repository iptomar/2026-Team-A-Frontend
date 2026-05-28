import React, { useState, useEffect, useMemo } from 'react';
import { agruparFormulariosPorCategoria } from '../utils/formUtils';

function EcraCoordenador() {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chamada assíncrona real à API local do backend
  const carregarDadosDoServidor = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/formularios');
      if (response.ok) {
        const data = await response.json();
        setFormularios(data);
      } else {
        console.error('O servidor respondeu com um erro ao obter os formulários.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro de ligação com a API do backend:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDoServidor();
  }, []);

  const formulariosAgrupados = useMemo(() => agruparFormulariosPorCategoria(formularios), [formularios]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Dashboard de Coordenação</h2>
        <p style={{ color: 'var(--text-muted)' }}>Acompanhamento em tempo real dos formulários criados no sistema.</p>
      </div>

      <div>
        {loading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', fontWeight: '500' }}>
            A carregar dados da base de dados do IPT...
          </div>
        ) : (
          Object.entries(formulariosAgrupados).map(([categoria, itens]) => (
            <section key={categoria} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '15px 20px' }}>Título do Formulário</th>
                      <th style={{ padding: '15px 20px' }}>Estado Atual</th>
                      <th style={{ padding: '15px 20px' }}>Data de Criação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((form) => (
                      <tr key={form._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '15px 20px', fontWeight: '600' }}>{form.titulo}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <span 
                            style={{
                              padding: '5px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: form.estado === 'Publicado' ? '#e2f0d9' : '#fff2cc',
                              color: form.estado === 'Publicado' ? 'green' : '#b8860b',
                              display: 'inline-block'
                            }}
                          >
                            {form.estado}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', color: 'var(--text-muted)' }}>
                          {new Date(form.dataCriacao || form.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}

        {!loading && formularios.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum formulário foi registado na base de dados até ao momento.
          </div>
        )}
      </div>
    </div>
  );
}

export default EcraCoordenador;