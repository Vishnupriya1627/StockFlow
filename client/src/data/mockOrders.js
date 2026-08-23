

export const orders = [
  {
    id: "ORD-8821",
    customer: "Ravi Teja",
    items: 3,
    total: 4599,
    status: "shipped",
    date: "2026-07-15",
  },
  {
    id: "ORD-8819",
    customer: "Ananya Rao",
    items: 1,
    total: 1199,
    status: "delayed",
    date: "2026-07-14",
  },
  {
    id: "ORD-8801",
    customer: "Lola Jenson",
    items: 5,
    total: 8990,
    status: "delivered",
    date: "2026-07-12",
  },
  {
    id: "ORD-8795",
    customer: "Sneha Iyer",
    items: 2,
    total: 2398,
    status: "delivered",
    date: "2026-07-11",
  },
  {
    id: "ORD-8790",
    customer: "Vikram Singh",
    items: 4,
    total: 6799,
    status: "pending",
    date: "2026-07-16",
  },
  {
    id: "ORD-8788",
    customer: "Priya Menon",
    items: 1,
    total: 799,
    status: "cancelled",
    date: "2026-07-10",
  },
  {
    id: "ORD-8780",
    customer: "Arjun Nair",
    items: 6,
    total: 12499,
    status: "shipped",
    date: "2026-07-13",
  },
  {
    id: "ORD-8775",
    customer: "Divya Prakash",
    items: 2,
    total: 1598,
    status: "pending",
    date: "2026-07-16",
  },
];

export const orderStatusFilters = ["All", "pending", "shipped", "delivered", "delayed", "cancelled"];

// Per-order line items — keyed by order id
export const orderItemsByOrder = {
  "ORD-8821": [
    { id: "SKU-2291", name: "Wireless Mouse", qty: 2, price: 799 },
    { id: "SKU-1187", name: "USB-C Cable (2m)", qty: 1, price: 299 },
  ],
  "ORD-8819": [
    { id: "SKU-4420", name: "Kids Building Blocks", qty: 1, price: 1199 },
  ],
  default: [
    { id: "SKU-9081", name: "Yoga Mat", qty: 1, price: 899 },
  ],
};

// Status timeline — keyed by order id
export const timelineByOrder = {
  "ORD-8821": [
    { id: "t1", label: "Order placed", time: "Jul 12, 10:20 AM", done: true },
    { id: "t2", label: "Payment confirmed", time: "Jul 12, 10:22 AM", done: true },
    { id: "t3", label: "Shipped from warehouse", time: "Jul 15, 2:10 PM", done: true },
    { id: "t4", label: "Out for delivery", time: "Pending", done: false },
    { id: "t5", label: "Delivered", time: "Pending", done: false },
  ],
  "ORD-8819": [
    { id: "t1", label: "Order placed", time: "Jul 14, 9:00 AM", done: true },
    { id: "t2", label: "Payment confirmed", time: "Jul 14, 9:05 AM", done: true },
    { id: "t3", label: "Shipped from warehouse", time: "Delayed — carrier issue", done: false },
    { id: "t4", label: "Out for delivery", time: "Pending", done: false },
    { id: "t5", label: "Delivered", time: "Pending", done: false },
  ],
  default: [
    { id: "t1", label: "Order placed", time: "Jul 11, 11:00 AM", done: true },
    { id: "t2", label: "Payment confirmed", time: "Jul 11, 11:05 AM", done: true },
    { id: "t3", label: "Shipped from warehouse", time: "Jul 12, 3:00 PM", done: true },
    { id: "t4", label: "Out for delivery", time: "Jul 13, 8:00 AM", done: true },
    { id: "t5", label: "Delivered", time: "Jul 13, 4:30 PM", done: true },
  ],
};

// Customer info — keyed by order id (mock; would come from a real customer record)
export const customerByOrder = {
  "ORD-8821": { name: "Ravi Teja", email: "ravi.teja@example.com", phone: "+91 98765 43210", address: "Banjara Hills, Hyderabad, TG 500034" },
  "ORD-8819": { name: "Ananya Rao", email: "ananya.rao@example.com", phone: "+91 91234 56780", address: "Koramangala, Bengaluru, KA 560034" },
  default: { name: "Customer", email: "customer@example.com", phone: "+91 90000 00000", address: "Address on file" },
};