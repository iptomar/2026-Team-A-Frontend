import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obterClassesPosicaoCampo } from '../utils/formUtils';
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
    return <div className="detalhes-pedido-extracted-1">A carregar detalhes do pedido...</div>;
  }
  if (erro) {
    return <div className="card detalhes-pedido-extracted-2">
        <p className="detalhes-pedido-extracted-3">{erro}</p>
        <button className="btn-secondary" onClick={handleBack}>
          Voltar
        </button>
      </div>;
  }
  if (!pedido) return null;
  const logoTema = pedido.formulario?.logo || localStorage.getItem('logo');
  const codigoDocumento = pedido.formulario?.codigoDocumento || 'PT.SIGQ.MOD ACA 30 60 - 3';
  return <div className="detalhes-pedido-extracted-4">
      <button onClick={handleBack} className="btn-logout detalhes-pedido-extracted-5">


        ← Voltar
      </button>

      <div className="card">
        {/* PDF Header Layout in Details */}
        {pedido.formulario && pedido.formulario.showCabecalho !== false && <>
            <div className="ipt-pdf-header">
              {pedido.formulario.showLogo !== false && <div className="ipt-pdf-header-logo-box">
                  {logoTema ? <img src={logoTema} alt="Logótipo IPT" className="detalhes-pedido-extracted-6" /> : <div className="detalhes-pedido-extracted-7">Sem Logo</div>}
                </div>}
              <div className="ipt-pdf-header-title-box">
                {pedido.formulario.showTitulo !== false ? <h1 className="ipt-pdf-header-title-text">{pedido.tituloFormulario}</h1> : <h1 className="ipt-pdf-header-title-text detalhes-pedido-extracted-8">REQUERIMENTO</h1>}
              </div>
              <div className="ipt-pdf-header-meta-box">
                <div className="ipt-pdf-meta-top">{codigoDocumento}</div>
                <div className="ipt-pdf-meta-bottom">Página 1 de 1</div>
              </div>
            </div>

            {/* Schools Checkboxes Bar */}
            <div className="ipt-pdf-schools-bar detalhes-pedido-extracted-9">
              <label><input type="checkbox" defaultChecked disabled /> ESGT</label>
              <label><input type="checkbox" disabled /> ESTA</label>
              <label><input type="checkbox" disabled /> ESTT</label>
            </div>
          </>}

        <div className="detalhes-pedido-extracted-10">







          <div>
            {(!pedido.formulario || pedido.formulario.showCabecalho === false || pedido.formulario.showTitulo === false) && <h2 className="detalhes-pedido-extracted-11">{pedido.tituloFormulario}</h2>}
            <p className="detalhes-pedido-extracted-12">
              Submetido por: <strong>{pedido.professor?.email || 'N/A'}</strong> em {new Date(pedido.dataSubmissao).toLocaleString('pt-PT')}
            </p>
          </div>
          <div className="detalhes-pedido-extracted-13">
            <span className={getStatusClass(pedido.estado)}>
              {pedido.estado}
            </span>

            {isAdminOrCoordenador && pedido.estado === 'Pendente' && <div className="detalhes-pedido-extracted-14">
                <button className="btn-primary detalhes-pedido-extracted-15" onClick={() => handleUpdateStatus('Aprovado')} disabled={processando || mostrarJustificacao}>


                  Aprovar
                </button>
                {!mostrarJustificacao ? <button className="btn-logout detalhes-pedido-extracted-16" onClick={() => setMostrarJustificacao(true)} disabled={processando}>


                    Rejeitar
                  </button> : <button className="btn-secondary detalhes-pedido-extracted-17" onClick={() => {
              setMostrarJustificacao(false);
              setJustificacao('');
            }} disabled={processando}>


                    Cancelar
                  </button>}
              </div>}
          </div>
        </div>

        {/* Painel para envio da justificação */}
        {mostrarJustificacao && <div className="detalhes-pedido-extracted-18">









            <label className="detalhes-pedido-extracted-19">
              Justificação da Rejeição <span className="detalhes-pedido-extracted-20">*</span>
            </label>
            <textarea rows="3" placeholder="Indique o motivo da rejeição (campo obrigatório)..." value={justificacao} onChange={e => setJustificacao(e.target.value)} className="detalhes-pedido-extracted-21" />











            <div className="detalhes-pedido-extracted-22">
              <button className="btn-secondary detalhes-pedido-extracted-23" onClick={() => {
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
        {pedido.estado === 'Rejeitado' && pedido.justificacao && <div className="detalhes-pedido-extracted-24">






            <strong className="detalhes-pedido-extracted-25">Motivo da
              Rejeição:</strong>
            <span className="detalhes-pedido-extracted-26">{pedido.justificacao}</span>
          </div>}

        <div className="detalhes-pedido-extracted-27">








          {pedido.formulario && pedido.formulario.campos ? pedido.formulario.campos.filter(campo => campo.visivel !== false).map(campo => {
          const valor = pedido.respostas[campo._id] || 'Não preenchido';
          return <div key={campo._id} className={`request-answer ${obterClassesPosicaoCampo(campo)}`}>

                  <label className="detalhes-pedido-extracted-28">
                    {campo.etiqueta.toUpperCase()}
                  </label>
                  <div className="detalhes-pedido-extracted-29">
                    {campo.tipo === 'Data' && valor !== 'Não preenchido' ? new Date(valor).toLocaleDateString('pt-PT') : campo.tipo === 'Ficheiro' && valor && typeof valor === 'object' && valor.content ? <div className="detalhes-pedido-extracted-30">
                        <div className="detalhes-pedido-extracted-31">
                          <span className="detalhes-pedido-extracted-32">📁</span>
                          <div className="detalhes-pedido-extracted-33">
                            <strong className="detalhes-pedido-extracted-34">{valor.name}</strong>
                            <span className="detalhes-pedido-extracted-35">{(valor.size / 1024).toFixed(1)} KB</span>
                          </div>
                          <a href={valor.content} download={valor.name} className="btn-primary detalhes-pedido-extracted-36">











                            Download
                          </a>
                        </div>
                        {valor.type && valor.type.startsWith('image/') && <div className="detalhes-pedido-extracted-37">
                            <p className="detalhes-pedido-extracted-38">Pré-visualização da imagem:</p>
                            <img src={valor.content} alt={valor.name} className="detalhes-pedido-extracted-39" />
                          </div>}
                      </div> : typeof valor === 'object' && valor.name ? valor.name : valor}
                  </div>
                </div>;
        }) : <div className="detalhes-pedido-extracted-40">
              <p className="detalhes-pedido-extracted-41">Os detalhes do formulário original já não estão disponíveis.</p>
            </div>}
        </div>
      </div>
    </div>;
}
export default DetalhesPedido;
