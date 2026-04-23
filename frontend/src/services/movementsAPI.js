import api from './authAPI';

export const movementsAPI = {
  // GET /api/movements  (optional filters: product_id, type)
  getAll: (params = {}) => api.get('/movements', { params }),

  // POST /api/movements
  create: (data) => api.post('/movements', data),

  // PUT /api/movements/:id (admin — note/location only)
  update: (id, data) => api.put(`/movements/${id}`, data),

  // DELETE /api/movements/:id (admin only)
  remove: (id) => api.delete(`/movements/${id}`),
};

export default movementsAPI;
