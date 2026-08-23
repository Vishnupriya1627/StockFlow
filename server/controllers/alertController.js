const Alert = require('../models/Alertmodel');

exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .populate('product', 'name sku')
      .populate('order', 'orderNumber');

    res.status(200).json({ message: 'Alerts fetched', count: alerts.length, alerts });
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.markAlertAsRead = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    )
      .populate('product', 'name sku')
      .populate('order', 'orderNumber');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.status(200).json({ message: 'Alert marked as read', alert });
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};