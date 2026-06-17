import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DetalhesPedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [processando, setProcessando] = useState(false);
  // Controlam a abertura do campo e guardam o texto da justificação
  const [mostrarJustificacao, setMostrarJustificacao] = useState(false);
  const [justificacao, setJustificacao] = useState('');

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

  const handleUpdateStatus = async (novoEstado, justificacaoTexto = '') => {
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
        body: JSON.stringify({
          estado: novoEstado,
          justificacao: justificacaoTexto
        })
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        setPedido(dados);
        alert(`Pedido ${novoEstado} com sucesso!`);
        // Fecha o painel de justificação e limpa o texto inserido
        setMostrarJustificacao(false);
        setJustificacao('');
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
        <div style={{
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h2 style={{ margin: 0 }}>{pedido.tituloFormulario}</h2>
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
                  disabled={processando || mostrarJustificacao}
                  style={{ padding: '5px 15px', fontSize: '0.85rem', backgroundColor: '#28a745' }}
                >
                  Aprovar
                </button>
                {!mostrarJustificacao ? (
                  <button
                    className="btn-logout"
                    onClick={() => setMostrarJustificacao(true)}
                    disabled={processando}
                    style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                  >
                    Rejeitar
                  </button>
                ) : (
                  <button
                    className="btn-secondary"
                    onClick={() => { setMostrarJustificacao(false); setJustificacao(''); }}
                    disabled={processando}
                    style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Painel para envio da justificação */}
        {mostrarJustificacao && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <label style={{ fontWeight: '600', color: 'var(--error-text)', fontSize: '0.9rem' }}>
              Justificação da Rejeição <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              rows="3"
              placeholder="Indique o motivo da rejeição (campo obrigatório)..."
              value={justificacao}
              onChange={(e) => setJustificacao(e.target.value)}
              style={{
                width: '100%',
                resize: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => { setMostrarJustificacao(false); setJustificacao(''); }}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={() => handleUpdateStatus('Rejeitado', justificacao)}
                // SEGURANÇA: Botão desativado se o campo estiver vazio ou apenas com espaços
                disabled={!justificacao.trim() || processando}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  backgroundColor: !justificacao.trim() ? 'var(--skeleton-bg)' : 'var(--error-text)',
                  color: 'white',
                  border: 'none',
                  cursor: !justificacao.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        )}

        {/* Exibição da justificativa ao ler um pedido que já foi rejeitado */}
        {pedido.estado === 'Rejeitado' && pedido.justificacao && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            borderLeft: '5px solid var(--error-text)',
            padding: '15px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}>
            <strong style={{ color: 'var(--error-text)', display: 'block', marginBottom: '5px' }}>Motivo da
              Rejeição:</strong>
            <span style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>{pedido.justificacao}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pedido.formulario && pedido.formulario.campos ? (
            pedido.formulario.campos.map((campo) => {
              const valor = pedido.respostas[campo._id] || 'Não preenchido';
              return (
                <div key={campo._id} style={{ padding: '15px', backgroundColor: 'var(--muted-bg)', borderRadius: '8px' }}>
                  <label style={{ fontWeight: '600', display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '5px' }}>
                    {campo.etiqueta.toUpperCase()}
                  </label>
                  <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    {campo.tipo === 'Data' && valor !== 'Não preenchido'
                      ? new Date(valor).toLocaleDateString('pt-PT')
                      : valor}
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
