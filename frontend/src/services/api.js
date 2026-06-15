import axios from 'axios';

const API_URL = 'https://agenda-backend-joao.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ========== PROFISSIONAIS DE SAÚDE (João) ==========
export const profissionalService = {
  listar: (nome, categoria) => api.get('/profissionais', { params: { nome, categoria } }),
  buscar: (id) => api.get(`/profissionais/${id}`),
  criar: (profissional) => api.post('/profissionais', profissional),
  atualizar: (id, profissional) => api.put(`/profissionais/${id}`, profissional),
  deletar: (id) => api.delete(`/profissionais/${id}`)
};

// ========== ATENDIMENTOS (Colleague) ==========
export const atendimentoService = {
  listar: (profissionalId) => api.get('/atendimentos', { params: { profissionalId } }),
  buscar: (id) => api.get(`/atendimentos/${id}`),
  criar: (atendimento) => api.post('/atendimentos', atendimento),
  atualizar: (id, atendimento) => api.put(`/atendimentos/${id}`, atendimento),
  deletar: (id) => api.delete(`/atendimentos/${id}`)
};

export default api;


