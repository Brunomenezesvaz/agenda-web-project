import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { profissionalService, atendimentoService } from '../services/api';

function AtendimentoForm() {
  const [profissionais, setProfissionais] = useState([]);
  const [atendimento, setAtendimento] = useState({
    data: '',
    horario: '',
    problemaTexto: '',
    profissional: null,
    receitaSaude: [''],
    exames: []
  });
  const [selectedProfissionalId, setSelectedProfissionalId] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    profissionalService.listar()
      .then(response => {
        setProfissionais(response.data);
        if (response.data.length > 0 && !id) {
          setSelectedProfissionalId(response.data[0].id.toString());
        }
      })
      .catch(err => setErro('Erro ao carregar profissionais de saúde.'));
  }, [id]);

  useEffect(() => {
    if (id) {
      atendimentoService.buscar(id)
        .then(response => {
          const data = response.data;
          setAtendimento({
            data: data.data || '',
            horario: data.horario || '',
            problemaTexto: data.problemaTexto || '',
            profissional: data.profissional || null,
            receitaSaude: data.receitaSaude && data.receitaSaude.length > 0 ? data.receitaSaude : [''],
            exames: data.exames || []
          });
          if (data.profissional) {
            setSelectedProfissionalId(data.profissional.id.toString());
          }
        })
        .catch(err => setErro('Erro ao carregar atendimento.'));
    }
  }, [id]);

  // Update selected professional object
  useEffect(() => {
    if (selectedProfissionalId && profissionais.length > 0) {
      const prof = profissionais.find(p => p.id.toString() === selectedProfissionalId);
      if (prof) {
        setAtendimento(prev => ({
          ...prev,
          profissional: prof
        }));
      }
    }
  }, [selectedProfissionalId, profissionais]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAtendimento(prev => ({ ...prev, [name]: value }));
  };

  // Receitas Handlers
  const handleReceitaChange = (index, value) => {
    const newReceitas = [...atendimento.receitaSaude];
    newReceitas[index] = value;
    setAtendimento(prev => ({ ...prev, receitaSaude: newReceitas }));
  };

  const addReceitaField = (suggestion = '') => {
    setAtendimento(prev => ({
      ...prev,
      receitaSaude: [...prev.receitaSaude, suggestion]
    }));
  };

  const removeReceitaField = (index) => {
    const newReceitas = atendimento.receitaSaude.filter((_, i) => i !== index);
    setAtendimento(prev => ({ ...prev, receitaSaude: newReceitas.length > 0 ? newReceitas : [''] }));
  };

  const handleSuggestPrescription = () => {
    const category = atendimento.profissional?.categoria;
    if (category === 'Médico') {
      addReceitaField('Remédio: ');
    } else if (category === 'Fisioterapeuta') {
      addReceitaField('Atividade física: ');
    } else if (category === 'Psicólogo') {
      addReceitaField('Atividades mentais: ');
    }
  };

  // Exames Handlers
  const handleExameChange = (index, value) => {
    const newExames = [...atendimento.exames];
    newExames[index].descricao = value;
    setAtendimento(prev => ({ ...prev, exames: newExames }));
  };

  const addExameField = () => {
    setAtendimento(prev => ({
      ...prev,
      exames: [...prev.exames, { descricao: '' }]
    }));
  };

  const removeExameField = (index) => {
    const newExames = atendimento.exames.filter((_, i) => i !== index);
    setAtendimento(prev => ({ ...prev, exames: newExames }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProfissionalId) {
      setErro('Por favor, selecione um profissional de saúde.');
      return;
    }

    // Filter out empty recipes and exams
    const cleanedReceitas = atendimento.receitaSaude.filter(r => r.trim() !== '');
    const cleanedExames = atendimento.exames.filter(ex => ex.descricao.trim() !== '');

    const payload = {
      ...atendimento,
      receitaSaude: cleanedReceitas,
      exames: cleanedExames
    };

    const saveAction = id
      ? atendimentoService.atualizar(id, payload)
      : atendimentoService.criar(payload);

    saveAction
      .then(() => navigate('/atendimentos'))
      .catch(err => {
        const msg = err.response?.data?.message || 'Erro ao salvar o atendimento.';
        setErro(msg);
      });
  };

  return (
    <div className="form-container">
      <h2>{id ? 'Editar Atendimento' : 'Novo Atendimento'}</h2>
      {erro && <div className="error-alert">{erro}</div>}
      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label htmlFor="selectedProfissionalId">Profissional de Saúde *</label>
          <select
            id="selectedProfissionalId"
            value={selectedProfissionalId}
            onChange={(e) => setSelectedProfissionalId(e.target.value)}
            required
          >
            <option value="">Selecione um profissional...</option>
            {profissionais.map(p => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.categoria})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="data">Data *</label>
            <input
              type="date"
              id="data"
              name="data"
              value={atendimento.data}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="horario">Horário</label>
            <input
              type="time"
              id="horario"
              name="horario"
              value={atendimento.horario}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="problemaTexto">Descrição do Problema *</label>
          <textarea
            id="problemaTexto"
            name="problemaTexto"
            rows="3"
            value={atendimento.problemaTexto}
            onChange={handleChange}
            placeholder="Descreva os sintomas ou motivo da consulta..."
            required
          ></textarea>
        </div>

        <div className="section-divider" style={{ margin: '24px 0', borderTop: '1px solid #eef0f6' }}></div>

        {/* RECEITA SAÚDE */}
        <div className="dynamic-section">
          <div className="dynamic-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontWeight: '700', fontSize: '0.95rem', color: '#4a4f66' }}>Receita / Prescrição de Saúde</label>
            <div>
              <button type="button" onClick={handleSuggestPrescription} className="btn btn-sm btn-secondary" style={{ marginRight: '8px' }}>
                💡 Sugerir para {atendimento.profissional?.categoria || 'Profissional'}
              </button>
              <button type="button" onClick={() => addReceitaField('')} className="btn btn-sm btn-primary">
                ➕ Add Item
              </button>
            </div>
          </div>
          
          {atendimento.receitaSaude.map((receita, index) => (
            <div key={index} className="dynamic-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={receita}
                onChange={(e) => handleReceitaChange(index, e.target.value)}
                placeholder={
                  atendimento.profissional?.categoria === 'Médico' ? 'Remédio...' :
                  atendimento.profissional?.categoria === 'Fisioterapeuta' ? 'Atividade física...' :
                  atendimento.profissional?.categoria === 'Psicólogo' ? 'Atividades mentais...' : 'Prescrição...'
                }
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => removeReceitaField(index)} className="btn btn-delete btn-sm" style={{ padding: '8px 12px' }}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="section-divider" style={{ margin: '24px 0', borderTop: '1px solid #eef0f6' }}></div>

        {/* EXAMES LAB */}
        <div className="dynamic-section">
          <div className="dynamic-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontWeight: '700', fontSize: '0.95rem', color: '#4a4f66' }}>Exames Laboratoriais</label>
            <button type="button" onClick={addExameField} className="btn btn-sm btn-primary">
              ➕ Solicitar Exame
            </button>
          </div>
          
          {atendimento.exames.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic', margin: '0 0 12px 0' }}>Nenhum exame solicitado para esta consulta.</p>
          ) : (
            atendimento.exames.map((exame, index) => (
              <div key={index} className="dynamic-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={exame.descricao}
                  onChange={(e) => handleExameChange(index, e.target.value)}
                  placeholder="Descrição do exame (ex: Hemograma Completo, Raio-X Tórax)..."
                  style={{ flex: 1 }}
                  required
                />
                <button type="button" onClick={() => removeExameField(index)} className="btn btn-delete btn-sm" style={{ padding: '8px 12px' }}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="form-actions" style={{ marginTop: '28px' }}>
          <button type="submit" className="btn btn-primary">Agendar</button>
          <Link to="/atendimentos" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

export default AtendimentoForm;
