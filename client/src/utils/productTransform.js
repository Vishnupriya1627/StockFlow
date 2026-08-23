export const timeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

// Placeholder images keyed by category, since Product doesn't store an image yet
const categoryImages = {
  Electronics: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  Apparel: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  'Home Goods': 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400',
  Groceries: 'https://images.unsplash.com/photo-1543168256-418811576931?w=400',
  Toys: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400',
};
const fallbackImage = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400';

// Maps a backend Product document into the shape InventoryCard already expects
export const mapProductToItem = (product) => ({
  id: product._id,
  sku: product.sku,
  name: product.name,
  category: product.category,
  stock: product.currentStock,
  reorderPoint: product.reorderThreshold,
  price: product.unitPrice,
  status: product.status.replace(/_/g, '-'), // low_stock -> low-stock
  image: product.imageUrl || categoryImages[product.category] || fallbackImage,
  lastUpdated: timeAgo(product.updatedAt),
});