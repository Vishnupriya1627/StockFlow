import api from './axios';

export const getAllProducts = async (params = {}) => {
  const res = await api.get('/products', { params });
  return res.data.products;
};

export const createProduct = async (payload) => {
  const res = await api.post('/products', payload);
  return res.data.product;
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data.product;
};

export const updateProduct = async (id, payload) => {
  const res = await api.put(`/products/${id}`, payload);
  return res.data.product;
};

export const getProductStockHistory = async (id, days = 7) => {
  const res = await api.get(`/products/${id}/stock-history?days=${days}`);
  return res.data.history;
};

export const getProductMovements = async (id, limit = 10) => {
  const res = await api.get(`/products/${id}/movements?limit=${limit}`);
  return res.data.movements;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};