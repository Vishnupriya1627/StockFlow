import api from './axios';

export const getAllOrders = async (params = {}) => {
  const res = await api.get('/orders', { params });
  return res.data.orders;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data.order;
};

export const updateOrderStatus = async (id, status) => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data.order;
};