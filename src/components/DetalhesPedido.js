import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DetalhesPedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [processando, setProcessando] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdminOrCoordenador = user && (user.role === 'admin' || user.role === 'coordenador');

  useEffect(() => {
    const carregarDetalhes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const resposta = await fetch(`http://localhost:3000/api/submissoes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (resposta.ok) {
          const dados = await resposta.json();
          setPedido(dados);
        } else {
          const errorData = await resposta.json();
          setErro(errorData.error || 'Erro ao carregar detalhes.');
        }
      } catch (err) {
        console.error('Erro:', err);
        setErro('Erro de ligação ao servidor.');
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhes();
  }, [id]);

  const handleUpdateStatus = async (novoEstado) => {
    if (!window.confirm(`Tem a certeza que deseja definir o estado como ${novoEstado}?`)) return;

    setProcessando(true);
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch(`http://localhost:3000/api/submissoes/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: novoEstado })
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        setPedido(dados);
        alert(`Pedido ${novoEstado} com sucesso!`);
      } else {
        const errorData = await resposta.json();
        alert(errorData.error || 'Erro ao atualizar estado.');
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro de ligação ao servidor.');
    } finally {
      setProcessando(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado': return 'var(--success-text)';
      case 'Rejeitado': return 'var(--error-text)';
      case 'Pendente': return 'var(--text-muted)';
      default: return 'inherit';
    }
  };

  const handleBack = () => {
    if (isAdminOrCoordenador) {
      navigate('/gerir-pedidos');
    } else {
      navigate('/meus-pedidos');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>A carregar detalhes do pedido...</div>;
  }

  if (erro) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--error-text)', fontWeight: 'bold' }}>{erro}</p>
        <button className="btn-secondary" onClick={handleBack}>
          Voltar
        </button>
      </div>
    );
  }

  if (!pedido) return null;

  const logoTema = pedido.formulario?.logo || localStorage.getItem('logo');
  const codigoDocumento = pedido.formulario?.codigoDocumento || 'PT.SIGQ.MOD ACA 30 60 - 3';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={handleBack} 
        className="btn-logout"
        style={{ marginBottom: '20px' }}
      >
        ← Voltar
      </button>

      <div className="card">
        {/* Cabeçalho Estruturado Estilo IPT */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr 200px',
          border: '1px solid var(--border-color)',
          marginBottom: '0px',
          fontFamily: 'sans-serif',
          backgroundColor: '#fff'
        }}>
          <div style={{
            borderRight: '1px solid var(--border-color)',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {logoTema ? (
              <img src={logoTema} alt="Logo" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Sem Logótipo</div>
            )}
          </div>
          
          <div style={{
            borderRight: '1px solid var(--border-color)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-main)' }}>
              Requerimento
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px', marginTop: '5px', color: 'var(--primary-green)' }}>
              {pedido.tituloFormulario}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '0.8rem'
          }}>
            <div style={{
              borderBottom: '1px solid var(--border-color)',
              padding: '8px 10px',
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              color: 'var(--text-main)'
            }}>
              {codigoDocumento}
            </div>
            <div style={{
              padding: '8px 10px',
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              Página 1 de 1
            </div>
          </div>
        </div>

        {/* Caixa de Checkboxes das Escolas */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          padding: '10px',
          border: '1px solid var(--border-color)',
          borderTop: 'none',
          marginBottom: '20px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          backgroundColor: '#fff'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <input type="checkbox" defaultChecked disabled /> ESGT
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <input type="checkbox" disabled /> ESTA
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <input type="checkbox" disabled /> ESTT
          </label>
        </div>

        <div style={{ 
          borderBottom: '1px solid var(--border-color)', 
          marginBottom: '2rem', 
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
              Submetido por: <strong>{pedido.professor?.email || 'N/A'}</strong> em {new Date(pedido.dataSubmissao).toLocaleString('pt-PT')}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <span style={{ 
              fontWeight: '700', 
              color: getStatusColor(pedido.estado),
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: pedido.estado === 'Pendente' ? '#f0f0f0' : 'rgba(0,0,0,0.05)',
              fontSize: '0.9rem'
            }}>
              {pedido.estado}
            </span>
            
            {isAdminOrCoordenador && pedido.estado === 'Pendente' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => handleUpdateStatus('Aprovado')}
                  disabled={processando}
                  style={{ padding: '5px 15px', fontSize: '0.85rem', backgroundColor: '#28a745' }}
                >
                  Aprovar
                </button>
                <button 
                  className="btn-logout" 
                  onClick={() => handleUpdateStatus('Rejeitado')}
                  disabled={processando}
                  style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                >
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pedido.formulario && pedido.formulario.campos ? (
            pedido.formulario.campos.map((campo) => {
              const valor = pedido.respostas[campo._id] || 'Não preenchido';
              const renderValor = () => {
                if (valor === 'Não preenchido') return valor;
                if (campo.tipo === 'Data') return new Date(valor).toLocaleDateString('pt-PT');
                if (campo.tipo === 'Ficheiro') {
                  try {
                    const fileData = JSON.parse(valor);
                    if (fileData && fileData.name && fileData.content) {
                      const isImage = fileData.type?.startsWith('image/') || fileData.content.startsWith('data:image/');
                      return (
                        <div style={{ marginTop: '5px' }}>
                          <a 
                            href={fileData.content} 
                            download={fileData.name} 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              padding: '8px 12px', 
                              backgroundColor: '#007bff', 
                              color: 'white', 
                              borderRadius: '6px', 
                              textDecoration: 'none', 
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            📥 Descarregar {fileData.name} ({(fileData.size / 1024).toFixed(1)} KB)
                          </a>
                          {isImage && (
                            <div style={{ marginTop: '10px' }}>
                              <img 
                                src={fileData.content} 
                                alt={fileData.name} 
                                style={{ 
                                  maxHeight: '200px', 
                                  maxWidth: '100%', 
                                  borderRadius: '6px', 
                                  border: '1px solid #ddd',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }} 
                              />
                            </div>
                          )}
                        </div>
                      );
                    }
                  } catch (e) {
                    // raw string fallback
                  }
                }
                return valor;
              };

              return (
                <div key={campo._id} style={{ padding: '15px', backgroundColor: 'var(--muted-bg)', borderRadius: '8px' }}>
                  <label style={{ fontWeight: '600', display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '5px' }}>
                    {campo.etiqueta.toUpperCase()}
                  </label>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    {renderValor()}
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Os detalhes do formulário original já não estão disponíveis.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalhesPedido;
