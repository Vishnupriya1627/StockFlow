import api from './axios';

export const getDashboardSummary = async () => {
  const res = await api.get('/dashboard/summary');
  return res.data.summary;
};

export const getStockTrend = async (days = 7) => {
  const res = await api.get(`/dashboard/stock-trend?days=${days}`);
  return res.data.trend;
};

export const getCategoryBreakdown = async () => {
  const res = await api.get('/dashboard/category-breakdown');
  return res.data.breakdown;
};

export const getRecentActivity = async (limit = 10) => {
  const res = await api.get(`/dashboard/activity?limit=${limit}`);
  return res.data.activity;
};