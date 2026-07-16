import React, { useState, useEffect, useMemo } from 'react';
import { agruparFormulariosPorCategoria, filtrarEOrdenarFormularios, obterCategorias, obterClassesPosicaoCampo } from '../utils/formUtils';
import { SALAS } from '../utils/salasData';
import { useRuntimeColorClass } from '../utils/runtimeStyles';
import './EcraProfessor.css';

// Componente de Upload de Ficheiro Interativo
function CampoFicheiro({
  campo,
  value,
  onChange,
  temErro,
  corTema
}) {
  const fileInputRef = React.useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const themeClass = useRuntimeColorClass('file-upload-theme', corTema, '--file-upload-theme-color');
  const handleDragOver = e => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => {
    setDragOver(false);
  };
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };
  const processFile = file => {
    const reader = new FileReader();
    reader.onload = uploadEvent => {
      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        content: uploadEvent.target.result // Base64 string
      });
    };
    reader.readAsDataURL(file);
  };
  const clearFile = e => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`file-upload-field ${themeClass} ${dragOver ? 'is-drag-over' : ''} ${temErro ? 'has-error' : ''}`} onClick={() => fileInputRef.current && fileInputRef.current.click()}>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="ecra-professor-extracted-1" />



      {value ? <div className="ecra-professor-extracted-2">
          <span className="ecra-professor-extracted-3">📄</span>
          <div className="ecra-professor-extracted-4">
            <strong className="ecra-professor-extracted-5">{value.name}</strong>
            <span className="ecra-professor-extracted-6">{(value.size / 1024).toFixed(1)} KB</span>
          </div>
          <button type="button" onClick={clearFile} className="ecra-professor-extracted-7">















            ×
          </button>
        </div> : <>
          <div className="ecra-professor-extracted-8">📁</div>
          <div className="ecra-professor-extracted-9">Arrastar e soltar ficheiro aqui</div>
          <div className="ecra-professor-extracted-10">ou</div>
          <button type="button" className="btn-primary file-upload-select-button">

            Selecionar Ficheiro
          </button>
        </>}
    </div>;
}
function EcraProfessor() {
  const [formularios, setFormularios] = useState([]);
  const [formSelecionado, setFormSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(true);
  const [ocupacaoReal, setOcupacaoReal] = useState([]);
  const [salaSelecionada, setSalaSelecionada] = useState(null);
  const [salas, setSalas] = useState(SALAS);
  const [filtros, setFiltros] = useState({
    pesquisa: '',
    categoria: 'Todas',
    ordenacao: 'recentes'
  });
  const carregarSalas = async () => {
    try {
      // Tentar semear a BD primeiro (caso esteja vazia)
      await fetch('http://localhost:3000/api/salas/seed', {
        method: 'POST'
      });
      const resposta = await fetch('http://localhost:3000/api/salas');
      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados && dados.length > 0) {
          setSalas(dados);
        }
      }
    } catch (erro) {
      console.warn('Backend não disponível para carregar salas, a usar dados locais.');
    }
  };
  const carregarOcupacao = async () => {
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch('http://localhost:3000/api/submissoes/ocupacao', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setOcupacaoReal(dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar ocupação:', erro);
    }
  };
  const carregarFormularios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch('http://localhost:3000/api/forms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setFormularios(dados.filter(f => f.estado === 'Publicado'));
      }
    } catch (erro) {
      console.error('Erro ao carregar:', erro);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    carregarFormularios();
    carregarOcupacao();
    carregarSalas();
  }, []);
  const categorias = useMemo(() => obterCategorias(formularios), [formularios]);
  const formulariosFiltrados = useMemo(() => filtrarEOrdenarFormularios(formularios, filtros), [formularios, filtros]);
  const formulariosAgrupados = useMemo(() => agruparFormulariosPorCategoria(formulariosFiltrados), [formulariosFiltrados]);
  const atualizarFiltro = (nome, valor) => {
    setFiltros(filtrosAtuais => ({
      ...filtrosAtuais,
      [nome]: valor
    }));
  };
  const limparFiltros = () => {
    setFiltros({
      pesquisa: '',
      categoria: 'Todas',
      ordenacao: 'recentes'
    });
  };

  // LÓGICA DE VALIDAÇÃO REFINADA (SMART)
  const validarCampos = novasRespostas => {
    const novosErros = {};
    if (!formSelecionado) return;
    const camposAtivos = formSelecionado.campos.filter(c => c.visivel !== false);

    // 1. Procurar campos de Sala, Data e Horário no formulário atual
    const campoSala = camposAtivos.find(c => c.etiqueta.toLowerCase().includes('sala') || c.etiqueta.toLowerCase().includes('room'));
    const campoData = camposAtivos.find(c => c.tipo === 'Data');
    const campoInicio = camposAtivos.find(c => c.etiqueta.toLowerCase().includes('início') || c.etiqueta.toLowerCase().includes('inicio') || c.etiqueta.toLowerCase().includes('entrada'));
    const campoFim = camposAtivos.find(c => c.etiqueta.toLowerCase().includes('fim') || c.etiqueta.toLowerCase().includes('saída') || c.etiqueta.toLowerCase().includes('saida'));

    // 2. Validar Ocupação de Sala (Real com Overlap de Horas)
    if (campoSala && campoData) {
      const salaId = campoSala._id || campoSala.id;
      const dataId = campoData._id || campoData.id;
      const inicioId = campoInicio?._id || campoInicio?.id;
      const fimId = campoFim?._id || campoFim?.id;
      const salaValue = novasRespostas[salaId];
      const dataValue = novasRespostas[dataId];
      const inicioValue = inicioId ? novasRespostas[inicioId] : null;
      const fimValue = fimId ? novasRespostas[fimId] : null;
      if (salaValue && dataValue) {
        const conflito = ocupacaoReal.find(o => {
          // Mesma sala e mesmo dia?
          if (o.sala.toLowerCase() === salaValue.toLowerCase() && o.data === dataValue) {
            // Se ambos tiverem horas definidas, verificamos overlap
            if (inicioValue && fimValue && o.inicio && o.fim) {
              return inicioValue < o.fim && fimValue > o.inicio;
            }
            // Se um deles não tiver horas (ex: reserva de dia inteiro), assumimos conflito
            return true;
          }
          return false;
        });
        if (conflito) {
          const infoHoras = conflito.inicio && conflito.fim ? ` das ${conflito.inicio} às ${conflito.fim}` : ' (dia inteiro)';
          novosErros[salaId] = `Sala já reservada neste dia${infoHoras}!`;
        }
      }
    }

    // 3. Validar Horários (Fim > Início)
    if (campoInicio && campoFim) {
      const inicioId = campoInicio._id || campoInicio.id;
      const fimId = campoFim._id || campoFim.id;
      const inicioValue = novasRespostas[inicioId];
      const fimValue = novasRespostas[fimId];
      if (inicioValue && fimValue && inicioValue >= fimValue) {
        novosErros[fimId] = 'A hora de fim deve ser posterior à de início.';
      }
    }

    // 4. Validar Datas Futuras (para todos os campos do tipo Data)
    camposAtivos.forEach(campo => {
      if (campo.tipo === 'Data') {
        const campoId = campo._id || campo.id;
        const valorData = novasRespostas[campoId];
        if (valorData) {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const dataInserida = new Date(valorData);
          if (dataInserida < hoje) {
            novosErros[campoId] = 'Data inválida (selecione uma data futura)';
          }
        }
      }
    });
    camposAtivos.forEach(campo => {
      const campoId = campo._id || campo.id;
      const valor = novasRespostas[campoId];
      if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
        // Validação de número mínimo e máximo
        if (campo.tipo === 'Número') {
          const numVal = Number(valor);
          if (campo.minNumero !== undefined && campo.minNumero !== '' && numVal < campo.minNumero) {
            novosErros[campoId] = `O valor deve ser no mínimo ${campo.minNumero}.`;
          }
          if (campo.maxNumero !== undefined && campo.maxNumero !== '' && numVal > campo.maxNumero) {
            novosErros[campoId] = `O valor deve ser no máximo ${campo.maxNumero}.`;
          }
        }
        // Validação de limite de caracteres para texto
        if (['Texto Curto', 'Texto Longo', 'Nome', 'Email'].includes(campo.tipo) && campo.maxCaracteres) {
          if (String(valor).length > campo.maxCaracteres) {
            novosErros[campoId] = `O texto excede o limite de ${campo.maxCaracteres} caracteres.`;
          }
        }
      }
    });
    setErros(novosErros);
  };
  const handleInputChange = (campoId, valor) => {
    const novasRespostas = {
      ...respostas,
      [campoId]: valor
    };
    setRespostas(novasRespostas);
    validarCampos(novasRespostas);
  };

  // Lógica Matemática: Verifica se o formulário está completo e sem erros
  const podeSubmeter = formSelecionado && formSelecionado.campos.filter(campo => campo.visivel !== false).every(campo => {
    const valor = respostas[campo._id || campo.id];
    const preenchido = valor !== undefined && valor !== null && String(valor).trim() !== '';
    const validacaoObrigatorio = campo.obrigatorio ? preenchido : true;
    const semErroNoCampo = !erros[campo._id || campo.id];
    return validacaoObrigatorio && semErroNoCampo;
  });
  const [submetidoComSucesso, setSubmetidoComSucesso] = useState(false);
  const handleSubmeter = async () => {
    try {
      const token = localStorage.getItem('token');
      const resposta = await fetch('http://localhost:3000/api/submissoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formularioId: formSelecionado._id,
          tituloFormulario: formSelecionado.titulo,
          respostas: respostas
        })
      });
      if (resposta.ok) {
        setSubmetidoComSucesso(true);
        setRespostas({});
        setSalaSelecionada(null);
        // Voltar à lista após 3 segundos
        setTimeout(() => {
          setFormSelecionado(null);
          setSubmetidoComSucesso(false);
        }, 3000);
      } else {
        const errorData = await resposta.json();
        alert('Erro ao submeter: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (erro) {
      console.error('Erro na submissão:', erro);
      alert('Erro de ligação ao servidor.');
    }
  };
  if (submetidoComSucesso) {
    return <div className="success-screen">
        <div className="card success-card">
          <div className="success-icon">✅</div>
          <h2 className="ecra-professor-extracted-11">Submissão Concluída!</h2>
          <p className="text-muted ecra-professor-extracted-12">
            O seu pedido foi registado com sucesso no sistema <strong>SmartForms</strong>.<br />
            Será redirecionado para a lista de formulários em instantes.
          </p>
          <button className="btn-primary ecra-professor-extracted-13" onClick={() => {
          setFormSelecionado(null);
          setSubmetidoComSucesso(false);
        }}>

            Voltar Agora
          </button>
        </div>
      </div>;
  }
  if (formSelecionado) {
    const corTema = formSelecionado.corPrincipal || '#28a745';
    const logoTema = formSelecionado.logo || localStorage.getItem('logo');
    const codigoDocumento = formSelecionado.codigoDocumento || 'PT.SIGQ.MOD ACA 30 60 - 3';
    return <div className="form-view-container">
        <button onClick={() => {
        setFormSelecionado(null);
        setErros({});
        setRespostas({});
        setSubmetidoComSucesso(false);
        setSalaSelecionada(null);
      }} className="btn-logout ecra-professor-extracted-14">


          ← Voltar aos Formulários
        </button>

        <div className="ipt-form-card">
          {/* PDF Header Layout */}
          {formSelecionado.showCabecalho !== false && <div className="ipt-pdf-header">
              {formSelecionado.showLogo !== false && <div className="ipt-pdf-header-logo-box">
                  {logoTema ? <img src={logoTema} alt="Logótipo IPT" className="ecra-professor-extracted-15" /> : <div className="ecra-professor-extracted-16">Sem Logo</div>}
                </div>}
              <div className="ipt-pdf-header-title-box">
                {formSelecionado.showTitulo !== false ? <h1 className="ipt-pdf-header-title-text">{formSelecionado.titulo || 'REQUERIMENTO / ASSUNTOS DIVERSOS'}</h1> : <h1 className="ipt-pdf-header-title-text ecra-professor-extracted-17">REQUERIMENTO</h1>}
              </div>
              <div className="ipt-pdf-header-meta-box">
                <div className="ipt-pdf-meta-top">{codigoDocumento}</div>
                <div className="ipt-pdf-meta-bottom">Página 1 de 1</div>
              </div>
            </div>}

          {/* Schools Checkboxes Bar */}
          {formSelecionado.showCabecalho !== false && <div className="ipt-pdf-schools-bar">
              <label><input type="checkbox" /> ESGT</label>
              <label><input type="checkbox" /> ESTA</label>
              <label><input type="checkbox" /> ESTT</label>
            </div>}

          {formSelecionado.descricao && <div className="ecra-professor-extracted-18">
              <p className="ecra-professor-extracted-19">{formSelecionado.descricao}</p>
            </div>}

          <div className="form-fields-container">
            {formSelecionado.campos.filter(campo => campo.visivel !== false).map(campo => {
            const campoId = campo._id || campo.id;
            const temErro = !!erros[campoId];
            const isSala = campo.etiqueta.toLowerCase().includes('sala') || campo.etiqueta.toLowerCase().includes('room');
            return <div key={campoId} className={`field-group positioned-field ${obterClassesPosicaoCampo(campo)}`}>

                  <label className="field-label-text">
                    {campo.etiqueta} {campo.obrigatorio && <span className="required-asterisk">*</span>}
                  </label>

                  {isSala ? <select className={`form-input ${temErro ? 'form-input-error' : ''}`} value={respostas[campoId] || ''} onChange={e => {
                const valor = e.target.value;
                const sala = salas.find(s => s.nome === valor) || null;
                setSalaSelecionada(sala);
                handleInputChange(campoId, valor);
              }}>

                      <option value="">--- Selecione uma Sala ---</option>
                      {salas.map(s => <option key={s._id || s.id} value={s.nome}>
                          {s.nome} (Lotação: {s.lotacao})
                        </option>)}
                    </select> : campo.tipo === 'Ficheiro' ? <CampoFicheiro campo={campo} value={respostas[campoId] || ''} onChange={valor => handleInputChange(campoId, valor)} temErro={temErro} corTema={corTema} /> : <input className={`form-input ${temErro ? 'form-input-error' : ''}`} type={campo.tipo === 'Data' ? 'date' : campo.tipo === 'Hora' ? 'time' : campo.tipo === 'Número' ? 'number' : 'text'} value={respostas[campoId] || ''} onChange={e => handleInputChange(campoId, e.target.value)} placeholder={campo.tipo === 'Data' || campo.tipo === 'Hora' ? '' : 'Introduza aqui...'}
              // Atributos de validação nativos adicionados para consistência
              maxLength={['Texto Curto', 'Texto Longo', 'Nome', 'Email'].includes(campo.tipo) ? campo.maxCaracteres : undefined} min={campo.tipo === 'Número' ? campo.minNumero : undefined} max={campo.tipo === 'Número' ? campo.maxNumero : undefined} />}

                  {isSala && salaSelecionada && <div className="room-info-card ecra-professor-extracted-20">







                      <div className="ecra-professor-extracted-21">
                        <div><strong>Tipo:</strong> {salaSelecionada.tipo}</div>
                        <div><strong>Lotação:</strong> {salaSelecionada.lotacao}</div>
                        <div><strong>Projetor:</strong> {salaSelecionada.equipamentos.projetor ? '✅' : '❌'}</div>
                        <div><strong>Tomadas:</strong> {salaSelecionada.equipamentos.tomadas ? '✅' : '❌'}</div>
                      </div>
                    </div>}

                  {temErro && <span className="error-message-small">
                      ⚠ {erros[campoId]}
                    </span>}
                </div>;
          })}

            <button disabled={!podeSubmeter} className="btn-ipt-submit" onClick={handleSubmeter}>

              Submeter Requisição
            </button>
          </div>
        </div>
      </div>;
  }
  return <div>
      <div className="ecra-professor-extracted-22">
        <h2>Formulários Disponíveis</h2>
        <p className="text-muted">Selecione um formulário para iniciar o preenchimento.</p>
      </div>

      <div className="card ecra-professor-extracted-23">








        <div className="ecra-professor-extracted-24">
          <label className="form-label">Pesquisar</label>
          <input type="search" className="form-input" placeholder="Título ou descrição..." value={filtros.pesquisa} onChange={event => atualizarFiltro('pesquisa', event.target.value)} />

        </div>

        <div className="ecra-professor-extracted-25">
          <label className="form-label">Categoria</label>
          <select className="form-input" value={filtros.categoria} onChange={event => atualizarFiltro('categoria', event.target.value)}>

            <option value="Todas">Todas as categorias</option>
            {categorias.map(categoria => <option key={categoria} value={categoria}>
                {categoria}
              </option>)}
          </select>
        </div>

        <div className="ecra-professor-extracted-26">
          <label className="form-label">Ordenar</label>
          <select className="form-input" value={filtros.ordenacao} onChange={event => atualizarFiltro('ordenacao', event.target.value)}>

            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="titulo-asc">Título A–Z</option>
            <option value="titulo-desc">Título Z–A</option>
          </select>
        </div>

        <button type="button" className="btn-secondary ecra-professor-extracted-27" onClick={limparFiltros}>


          Limpar filtros
        </button>

        <div className="ecra-professor-extracted-28">
          {formulariosFiltrados.length} de {formularios.length} formulário(s)
        </div>
      </div>

      {loading ? <div className="text-center ecra-professor-extracted-29">A carregar formulários...</div> : formularios.length === 0 ? <div className="card text-center text-muted">
          Não há formulários publicados de momento.
        </div> : formulariosFiltrados.length === 0 ? <div className="card text-center text-muted">
          Nenhum formulário corresponde aos filtros selecionados.
        </div> : <div>
          {Object.entries(formulariosAgrupados).map(([categoria, itens]) => <section key={categoria} className="category-section">
              <div className="category-header">
                <h3 className="category-title">{categoria}</h3>
                <span className="status-badge status-publicado">{itens.length} formulário(s)</span>
              </div>
              <div className="grid-container">
                {itens.map(form => <div key={form._id} className="card ecra-professor-extracted-30">
                    <div>
                      <h3 className="ecra-professor-extracted-31">{form.titulo}</h3>
                      <p className="text-muted ecra-professor-extracted-32">
                        {form.descricao || 'Sem descrição disponível.'}
                      </p>
                    </div>
                    <div className="card-footer">
                      <span className="status-badge status-publicado">Disponível</span>
                      <button className="btn-primary btn-fill" onClick={() => {
                setFormSelecionado(form);
                carregarOcupacao();
              }}>

                        Preencher
                      </button>
                    </div>
                  </div>)}
              </div>
            </section>)}
        </div>}
    </div>;
}
export default EcraProfessor;
