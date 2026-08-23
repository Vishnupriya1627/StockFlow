import api from './axios';

export const getDropStats = (productId) =>
    api.get(`/flashsale/${productId}/stats`).then((res) => res.data);

export const simulateLoad = (productId, count) =>
    api.post(`/flashsale/${productId}/simulate`, { count }).then((res) => res.data);