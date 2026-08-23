export const kpiStats = [
  {
    id: "total-skus",
    label: "Total SKUs",
    value: 1284,
    change: "+4.2%",
    trend: "up",
  },
  {
    id: "low-stock",
    label: "Low Stock Items",
    value: 37,
    change: "+12",
    trend: "down", // down = bad direction for this metric
  },
  {
    id: "pending-orders",
    label: "Pending Orders",
    value: 58,
    change: "-6.1%",
    trend: "up",
  },
  {
    id: "revenue",
    label: "Revenue (This Month)",
    value: 482900,
    change: "+9.8%",
    trend: "up",
    isCurrency: true,
  },
];

// Stock level trend — last 7 days
export const stockTrend = [
  { day: "Mon", stock: 4200 },
  { day: "Tue", stock: 4050 },
  { day: "Wed", stock: 4300 },
  { day: "Thu", stock: 3900 },
  { day: "Fri", stock: 4150 },
  { day: "Sat", stock: 4400 },
  { day: "Sun", stock: 4600 },
];

// Category breakdown — for bar/donut chart
export const categoryBreakdown = [
  { category: "Electronics", value: 420 },
  { category: "Apparel", value: 310 },
  { category: "Home Goods", value: 260 },
  { category: "Groceries", value: 180 },
  { category: "Toys", value: 114 },
];

// Recent activity feed
export const recentActivity = [
  {
    id: "act-1",
    type: "low-stock",
    message: "SKU-2291 (Wireless Mouse) fell below reorder threshold",
    time: "10 min ago",
    status: "warning",
  },
  {
    id: "act-2",
    type: "restock",
    message: "SKU-1187 (USB-C Cable) restocked — 500 units added",
    time: "45 min ago",
    status: "success",
  },
  {
    id: "act-3",
    type: "order",
    message: "Order #ORD-8821 shipped to warehouse B",
    time: "1 hr ago",
    status: "info",
  },
  {
    id: "act-4",
    type: "overstock",
    message: "SKU-0456 (Notebook Set) flagged as overstocked",
    time: "2 hrs ago",
    status: "warning",
  },
  {
    id: "act-5",
    type: "order",
    message: "Order #ORD-8819 delayed due to carrier issue",
    time: "3 hrs ago",
    status: "danger",
  },
];