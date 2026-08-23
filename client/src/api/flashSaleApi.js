// src/api/flashSaleApi.js

import api from './axios';

export const getActiveDrops = () =>
    api.get('/flashsale/active/list').then((res) => res.data.drops);

export const getLiveStock = (productId) =>
    api.get(`/flashsale/${productId}/stock`).then((res) => res.data);

export const buyDropItem = (productId) =>
    api.post(`/flashsale/${productId}/buy`).then((res) => res.data);

export const checkoutDropOrder = (productId, customer) =>
    api.post(`/flashsale/${productId}/checkout`, { customer }).then((res) => res.data);