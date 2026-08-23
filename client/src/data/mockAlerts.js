// mockAlerts.js
// Swap for a real API call (GET /api/alerts) once backend is live.

export const alerts = [
  {
    id: "ALT-001",
    type: "low-stock",
    severity: "warning",
    title: "Wireless Mouse running low",
    message: "SKU-2291 has 12 units left, below reorder point of 25.",
    sku: "SKU-2291",
    time: "10 min ago",
    resolved: false,
  },
  {
    id: "ALT-002",
    type: "out-of-stock",
    severity: "critical",
    title: "Bluetooth Headphones out of stock",
    message: "SKU-3321 has 0 units remaining. 6 pending orders affected.",
    sku: "SKU-3321",
    time: "1 hr ago",
    resolved: false,
  },
  {
    id: "ALT-003",
    type: "order-delay",
    severity: "critical",
    title: "Order #ORD-8819 delayed",
    message: "Carrier reported a delay. Customer has not been notified yet.",
    sku: null,
    time: "3 hrs ago",
    resolved: false,
  },
  {
    id: "ALT-004",
    type: "overstock",
    severity: "info",
    title: "Notebook Set overstocked",
    message: "SKU-0456 has 610 units, well above the 150 reorder threshold.",
    sku: "SKU-0456",
    time: "2 hrs ago",
    resolved: false,
  },
  {
    id: "ALT-005",
    type: "low-stock",
    severity: "warning",
    title: "Ceramic Coffee Mug running low",
    message: "SKU-5512 has 34 units left, below reorder point of 50.",
    sku: "SKU-5512",
    time: "20 min ago",
    resolved: false,
  },
  {
    id: "ALT-006",
    type: "restock",
    severity: "resolved",
    title: "USB-C Cable restocked",
    message: "SKU-1187 replenished with 500 units. Alert auto-resolved.",
    sku: "SKU-1187",
    time: "45 min ago",
    resolved: true,
  },
];

export const alertTypeFilters = ["All", "low-stock", "out-of-stock", "overstock", "order-delay", "restock"];
export const alertSeverityFilters = ["All", "critical", "warning", "info", "resolved"];