import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { profissionalService, atendimentoService } from '../services/api';

function AtendimentoList() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [filtroProfissional, setFiltroProfissional] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregarDados = useCallback(() => {
    atendimentoService.listar(filtroProfissional)
      .then(response => setAtendimentos(response.data))
      .catch(err => setErro('Erro ao carregar consultas.'));
  }, [filtroProfissional]);

  useEffect(() => {
    profissionalService.listar()
      .then(response => setProfissionais(response.data))
      .catch(err => setErro('Erro ao carregar profissionais.'));
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleDeletar = (id) => {
    if (window.confirm('Deseja realmente remover esta consulta?')) {
      atendimentoService.deletar(id)
        .then(() => {
          setMensagem('Consulta removida com sucesso!');
          carregarDados();
          setTimeout(() => setMensagem(''), 3000);
        })
        .catch(err => {
          setErro('Erro ao remover a consulta.');
          setTimeout(() => setErro(''), 3000);
        });
    }
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
  };

  return (
    <div className="list-container">
      <div className="header-row">
        <h2>Consultas e Atendimentos</h2>
        <Link to="/atendimentos/novo" className="btn btn-primary">📅 Novo Agendamento</Link>
      </div>

      {erro && <div className="error-alert">{erro}</div>}
      {mensagem && <div className="success-alert">{mensagem}</div>}

      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="filter-profissional">Filtrar por Profissional de Saúde</label>
          <select
            id="filter-profissional"
            value={filtroProfissional}
            onChange={(e) => setFiltroProfissional(e.target.value)}
          >
            <option value="">Todos os Profissionais</option>
            {profissionais.map(p => (
              <option key={p.id} value={p.id}>{p.nome} ({p.categoria})</option>
            ))}
          </select>
        </div>
      </div>

      {atendimentos.length === 0 ? (
        <p className="no-data">Nenhuma consulta agendada.</p>
      ) : (
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {atendimentos.map(a => (
            <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', border: '1px solid #eef0f6', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1f2333' }}>{a.profissional?.nome}</h3>
                    <span className={`badge category-${a.profissional?.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} style={{ fontSize: '0.75rem' }}>
                      {a.profissional?.categoria}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#6b7088', fontWeight: '600' }}>
                    <div>{formatarData(a.data)}</div>
                    <div>{a.horario ? a.horario.substring(0, 5) : '-'}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#6b7088', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Sintomas / Descrição
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a4f66', lineHeight: '1.5' }}>{a.problemaTexto}</p>
                </div>

                {a.receitaSaude && a.receitaSaude.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#6b7088', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Prescrições de Saúde
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#4a4f66', lineHeight: '1.5' }}>
                      {a.receitaSaude.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {a.exames && a.exames.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#6b7088', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      Exames Solicitados
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#4a4f66', lineHeight: '1.5' }}>
                      {a.exames.map((item, idx) => (
                        <li key={idx}>{item.descricao}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f0f1f9', paddingTop: '14px', display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <Link to={`/atendimentos/editar/${a.id}`} className="btn btn-edit btn-sm">✏️ Editar</Link>
                <button onClick={() => handleDeletar(a.id)} className="btn btn-delete btn-sm">🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AtendimentoList;
