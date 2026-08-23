// mockInventory.js
// Swap this export for a real API call (GET /api/products) once backend is live.

export const inventoryItems = [
  {
    id: "SKU-2291",
    name: "Wireless Mouse",
    category: "Electronics",
    stock: 12,
    reorderPoint: 25,
    price: 799,
    status: "low-stock",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
    lastUpdated: "10 min ago",
  },
  {
    id: "SKU-1187",
    name: "USB-C Cable (2m)",
    category: "Electronics",
    stock: 540,
    reorderPoint: 100,
    price: 299,
    status: "in-stock",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400",
    lastUpdated: "45 min ago",
  },
  {
    id: "SKU-0456",
    name: "Notebook Set (Pack of 3)",
    category: "Home Goods",
    stock: 610,
    reorderPoint: 150,
    price: 449,
    status: "overstock",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400",
    lastUpdated: "2 hrs ago",
  },
  {
    id: "SKU-3321",
    name: "Bluetooth Headphones",
    category: "Electronics",
    stock: 0,
    reorderPoint: 40,
    price: 2499,
    status: "out-of-stock",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    lastUpdated: "5 hrs ago",
  },
  {
    id: "SKU-7743",
    name: "Cotton T-Shirt (M)",
    category: "Apparel",
    stock: 220,
    reorderPoint: 80,
    price: 599,
    status: "in-stock",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    lastUpdated: "1 hr ago",
  },
  {
    id: "SKU-5512",
    name: "Ceramic Coffee Mug",
    category: "Home Goods",
    stock: 34,
    reorderPoint: 50,
    price: 349,
    status: "low-stock",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400",
    lastUpdated: "20 min ago",
  },
  {
    id: "SKU-9081",
    name: "Yoga Mat",
    category: "Home Goods",
    stock: 150,
    reorderPoint: 60,
    price: 899,
    status: "in-stock",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
    lastUpdated: "3 hrs ago",
  },
  {
    id: "SKU-4420",
    name: "Kids Building Blocks",
    category: "Toys",
    stock: 95,
    reorderPoint: 40,
    price: 1199,
    status: "in-stock",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400",
    lastUpdated: "6 hrs ago",
  },
];

export const categories = ["All", "Electronics", "Apparel", "Home Goods", "Groceries", "Toys"];

export const statusFilters = ["All", "in-stock", "low-stock", "out-of-stock", "overstock"];

// Per-SKU stock history — keyed by product id
export const stockHistoryBySku = {
  "SKU-2291": [
    { day: "Mon", stock: 40 }, { day: "Tue", stock: 35 }, { day: "Wed", stock: 30 },
    { day: "Thu", stock: 22 }, { day: "Fri", stock: 18 }, { day: "Sat", stock: 15 }, { day: "Sun", stock: 12 },
  ],
  "SKU-1187": [
    { day: "Mon", stock: 300 }, { day: "Tue", stock: 320 }, { day: "Wed", stock: 310 },
    { day: "Thu", stock: 450 }, { day: "Fri", stock: 480 }, { day: "Sat", stock: 520 }, { day: "Sun", stock: 540 },
  ],
  // fallback pattern for any SKU not explicitly listed
  default: [
    { day: "Mon", stock: 100 }, { day: "Tue", stock: 95 }, { day: "Wed", stock: 110 },
    { day: "Thu", stock: 105 }, { day: "Fri", stock: 98 }, { day: "Sat", stock: 102 }, { day: "Sun", stock: 100 },
  ],
};

// Per-SKU recent movements
export const movementsBySku = {
  "SKU-2291": [
    { id: "m1", type: "sale", change: -5, note: "Order #ORD-8801", time: "2 hrs ago" },
    { id: "m2", type: "sale", change: -3, note: "Order #ORD-8795", time: "6 hrs ago" },
    { id: "m3", type: "adjustment", change: -2, note: "Damaged unit removed", time: "1 day ago" },
  ],
  default: [
    { id: "m1", type: "sale", change: -10, note: "Order #ORD-8700", time: "5 hrs ago" },
    { id: "m2", type: "restock", change: 50, note: "Supplier delivery", time: "2 days ago" },
  ],
};