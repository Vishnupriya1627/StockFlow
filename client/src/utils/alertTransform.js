const typeLabels = {
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  overstock: "Overstock",
  shipment_delayed: "Shipment Delayed",
};

export const formatAlertTime = (dateStr) =>
  new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export const mapAlertToItem = (alert) => ({
  id: alert._id,
  type: alert.type,
  title: typeLabels[alert.type] || "System Alert",
  message: alert.message,
  severity: alert.severity,
  resolved: alert.isRead,
  time: formatAlertTime(alert.createdAt),
  sku: alert.product?.sku,
  productId: alert.product?._id,
});