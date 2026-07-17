import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterClassesPosicaoCampo } from '../utils/formUtils';
import './DetalhesPedido.css';
function DetalhesPedido() {
  const {
    id
  } = useParams();
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
  const getStatusClass = status => {
    return `request-status request-status-${status.toLowerCase()}`;
  };
  const handleBack = () => {
    if (isAdminOrCoordenador) {
      navigate('/gerir-pedidos');
    } else {
      navigate('/meus-pedidos');
    }
  };
  if (loading) {
    return <div className="request-details__loading">A carregar detalhes do pedido...</div>;
  }
  if (erro) {
    return <div className="card request-details__error-card">
        <p className="request-details__error">{erro}</p>
        <button className="btn-secondary" onClick={handleBack}>
          Voltar
        </button>
      </div>;
  }
  if (!pedido) return null;
  const logoTema = pedido.formulario?.logo || localStorage.getItem('logo');
  const codigoDocumento = pedido.formulario?.codigoDocumento || 'PT.SIGQ.MOD ACA 30 60 - 3';
  return <div className="request-details">
      <button onClick={handleBack} className="btn-logout request-details__back-button">


        ← Voltar
      </button>

      <div className="card">
        {/* PDF Header Layout in Details */}
        {pedido.formulario && pedido.formulario.showCabecalho !== false && <>
            <div className="ipt-pdf-header">
              {pedido.formulario.showLogo !== false && <div className="ipt-pdf-header-logo-box">
                  {logoTema ? <img src={logoTema} alt="Logótipo IPT" className="request-details__logo" /> : <div className="request-details__logo-placeholder">Sem Logo</div>}
                </div>}
              <div className="ipt-pdf-header-title-box">
                {pedido.formulario.showTitulo !== false ? <h1 className="ipt-pdf-header-title-text">{pedido.tituloFormulario}</h1> : <h1 className="ipt-pdf-header-title-text request-details__hidden-title">REQUERIMENTO</h1>}
              </div>
              <div className="ipt-pdf-header-meta-box">
                <div className="ipt-pdf-meta-top">{codigoDocumento}</div>
                <div className="ipt-pdf-meta-bottom">Página 1 de 1</div>
              </div>
            </div>

            {/* Schools Checkboxes Bar */}
            <div className="ipt-pdf-schools-bar request-details__schools">
              <label><input type="checkbox" defaultChecked disabled /> ESGT</label>
              <label><input type="checkbox" disabled /> ESTA</label>
              <label><input type="checkbox" disabled /> ESTT</label>
            </div>
          </>}

        <div className="request-details__content">







          <div>
            {(!pedido.formulario || pedido.formulario.showCabecalho === false || pedido.formulario.showTitulo === false) && <h2 className="request-details__fallback-title">{pedido.tituloFormulario}</h2>}
            <p className="request-details__metadata">
              Submetido por: <strong>{pedido.professor?.email || 'N/A'}</strong> em {new Date(pedido.dataSubmissao).toLocaleString('pt-PT')}
            </p>
          </div>
          <div className="request-details__status-row">
            <span className={getStatusClass(pedido.estado)}>
              {pedido.estado}
            </span>

            {isAdminOrCoordenador && pedido.estado === 'Pendente' && <div className="request-details__actions">
                <button className="btn-primary request-details__approve-button" onClick={() => handleUpdateStatus('Aprovado')} disabled={processando || mostrarJustificacao}>


                  Aprovar
                </button>
                {!mostrarJustificacao ? <button className="btn-logout request-details__reject-button" onClick={() => setMostrarJustificacao(true)} disabled={processando}>


                    Rejeitar
                  </button> : <button className="btn-secondary request-details__cancel-button" onClick={() => {
              setMostrarJustificacao(false);
              setJustificacao('');
            }} disabled={processando}>


                    Cancelar
                  </button>}
              </div>}
          </div>
        </div>

        {/* Painel para envio da justificação */}
        {mostrarJustificacao && <div className="rejection-form">









            <label className="rejection-form__label">
              Justificação da Rejeição <span className="rejection-form__required">*</span>
            </label>
            <textarea rows="3" placeholder="Indique o motivo da rejeição (campo obrigatório)..." value={justificacao} onChange={e => setJustificacao(e.target.value)} className="rejection-form__textarea" />











            <div className="rejection-form__actions">
              <button className="btn-secondary rejection-form__cancel-button" onClick={() => {
            setMostrarJustificacao(false);
            setJustificacao('');
          }}>


                Cancelar
              </button>
              <button className={`btn-primary reject-confirm-button ${!justificacao.trim() ? 'is-disabled' : ''}`} onClick={() => handleUpdateStatus('Rejeitado', justificacao)}
          // SEGURANÇA: Botão desativado se o campo estiver vazio ou apenas com espaços
          disabled={!justificacao.trim() || processando}>

                Confirmar Rejeição
              </button>
            </div>
          </div>}

        {/* Exibição da justificativa ao ler um pedido que já foi rejeitado */}
        {pedido.estado === 'Rejeitado' && pedido.justificacao && <div className="rejection-reason">






            <strong className="rejection-reason__label">Motivo da
              Rejeição:</strong>
            <span className="rejection-reason__text">{pedido.justificacao}</span>
          </div>}

        <div className="request-answers">








          {pedido.formulario && pedido.formulario.campos ? pedido.formulario.campos.filter(campo => campo.visivel !== false).map(campo => {
          const valor = pedido.respostas[campo._id] || 'Não preenchido';
          return <div key={campo._id} className={`request-answer ${obterClassesPosicaoCampo(campo)}`}>

                  <label className="request-answer__label">
                    {campo.etiqueta.toUpperCase()}
                  </label>
                  <div className="request-answer__value">
                    {campo.tipo === 'Data' && valor !== 'Não preenchido' ? new Date(valor).toLocaleDateString('pt-PT') : campo.tipo === 'Ficheiro' && valor && typeof valor === 'object' && valor.content ? <div className="request-file">
                        <div className="request-file__details">
                          <span className="request-file__icon">📁</span>
                          <div className="request-file__metadata">
                            <strong className="request-file__name">{valor.name}</strong>
                            <span className="request-file__size">{(valor.size / 1024).toFixed(1)} KB</span>
                          </div>
                          <a href={valor.content} download={valor.name} className="btn-primary request-file__download">











                            Download
                          </a>
                        </div>
                        {valor.type && valor.type.startsWith('image/') && <div className="request-file__preview">
                            <p className="request-file__preview-label">Pré-visualização da imagem:</p>
                            <img src={valor.content} alt={valor.name} className="request-file__preview-image" />
                          </div>}
                      </div> : typeof valor === 'object' && valor.name ? valor.name : valor}
                  </div>
                </div>;
        }) : <div className="request-details__unavailable">
              <p className="request-details__unavailable-text">Os detalhes do formulário original já não estão disponíveis.</p>
            </div>}
        </div>
      </div>
    </div>;
}
export default DetalhesPedido;
