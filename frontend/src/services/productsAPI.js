import api from './authAPI';

export const productsAPI = {
  // GET /api/products
  getAll: (params = {}) => api.get('/products', { params }),

  // GET /api/products/:id
  getById: (id) => api.get(`/products/${id}`),

  // POST /api/products (admin only)
  create: (data) => api.post('/products', data),

  // PUT /api/products/:id (admin only)
  update: (id, data) => api.put(`/products/${id}`, data),

  // DELETE /api/products/:id (admin only — soft delete)
  remove: (id) => api.delete(`/products/${id}`),
};

export default productsAPI;
