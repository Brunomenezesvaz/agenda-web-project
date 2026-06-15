import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { profissionalService } from '../services/api';

function ProfissionalList() {
  const [profissionais, setProfissionais] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregarProfissionais = useCallback(() => {
    profissionalService.listar(filtroNome, filtroCategoria)
      .then(response => {
        setProfissionais(response.data);
      })
      .catch(err => {
        setErro('Erro ao carregar profissionais.');
      });
  }, [filtroNome, filtroCategoria]);

  useEffect(() => {
    carregarProfissionais();
  }, [carregarProfissionais]);

  const handleDeletar = (id) => {
    if (window.confirm('Deseja realmente remover este profissional de saúde?')) {
      profissionalService.deletar(id)
        .then(() => {
          setMensagem('Profissional removido com sucesso!');
          carregarProfissionais();
          setTimeout(() => setMensagem(''), 3000);
        })
        .catch(err => {
          setErro('Erro ao remover the profissional.');
          setTimeout(() => setErro(''), 3000);
        });
    }
  };

  // 🛡️ LINHA DE DEFESA CRÍTICA:
  // Evita o crash caso o Spring Boot devolva uma paginação (objeto com .content) ou erro.
  const listaProfissionais = Array.isArray(profissionais) 
    ? profissionais 
    : (profissionais?.content || []);

  return (
    <div className="list-container">
      <div className="header-row">
        <h2>Profissionais de Saúde</h2>
        <Link to="/profissionais/novo" className="btn btn-primary">➕ Novo Profissional</Link>
      </div>

      {erro && <div className="error-alert">{erro}</div>}
      {mensagem && <div className="success-alert">{mensagem}</div>}

      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="search-nome">Buscar por Nome</label>
          <input
            type="text"
            id="search-nome"
            placeholder="Digite um nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-categoria">Categoria</label>
          <select
            id="filter-categoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="Médico">Médico</option>
            <option value="Fisioterapeuta">Fisioterapeuta</option>
            <option value="Psicólogo">Psicólogo</option>
          </select>
        </div>
      </div>

      {/* 🛠️ Mudou de profissionais.length para listaProfissionais.length */}
      {listaProfissionais.length === 0 ? (
        <p className="no-data">Nenhum profissional de saúde cadastrado ou encontrado.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* 🛠️ Mudou de profissionais.map para listaProfissionais.map */}
            {listaProfissionais.map(p => (
              <tr key={p.id}>
                <td><strong>{p.nome}</strong></td>
                <td>
                  <span className={`badge category-${p.categoria ? p.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : ''}`}>
                    {p.categoria}
                  </span>
                </td>
                <td>{p.telefone || '-'}</td>
                <td>{p.endereco || '-'}</td>
                <td>
                  <Link to={`/profissionais/editar/${p.id}`} className="btn btn-edit">✏️ Editar</Link>
                  <button onClick={() => handleDeletar(p.id)} className="btn btn-delete">🗑️ Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProfissionalList;
