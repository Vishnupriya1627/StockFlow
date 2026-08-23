import api from './axios';

export const getAllAlerts = async () => {
  const res = await api.get('/alerts');
  return res.data.alerts;
};

export const markAlertAsRead = async (id) => {
  const res = await api.patch(`/alerts/${id}/read`);
  return res.data.alert;
};