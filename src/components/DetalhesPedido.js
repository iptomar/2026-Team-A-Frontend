import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DetalhesPedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado': return 'var(--success-text)';
      case 'Rejeitado': return 'var(--error-text)';
      case 'Pendente': return 'var(--text-muted)';
      default: return 'inherit';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>A carregar detalhes do pedido...</div>;
  }

  if (erro) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--error-text)', fontWeight: 'bold' }}>{erro}</p>
        <button className="btn-secondary" onClick={() => navigate('/meus-pedidos')}>
          Voltar para Meus Pedidos
        </button>
      </div>
    );
  }

  if (!pedido) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/meus-pedidos')} 
        className="btn-logout"
        style={{ marginBottom: '20px' }}
      >
        ← Voltar aos Meus Pedidos
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
              Submetido em: {new Date(pedido.dataSubmissao).toLocaleString('pt-PT')}
            </p>
          </div>
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
        </div>

        {pedido.estado === 'Rejeitado' && pedido.justificacaoRejeicao && (
          <div style={{ 
            backgroundColor: '#fff5f5', 
            border: '1px solid #feb2b2', 
            borderRadius: '8px', 
            padding: '1.5rem', 
            marginBottom: '2rem' 
          }}>
            <h4 style={{ color: '#c53030', marginTop: 0, marginBottom: '0.5rem' }}>Justificação da Rejeição:</h4>
            <p style={{ margin: 0, color: '#742a2a', lineHeight: '1.5' }}>{pedido.justificacaoRejeicao}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pedido.formulario && pedido.formulario.campos ? (
            pedido.formulario.campos.map((campo) => {
              const valor = pedido.respostas[campo._id] || 'Não preenchido';
              return (
                <div key={campo._id} style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
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
