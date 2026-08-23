export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

// Maps a backend Order into the row shape the Orders table already expects.
// `id` is the Mongo _id (used for routing); `orderNumber` is the display label (was `id` in the old mock)
export const mapOrderToRow = (order) => ({
  id: order._id,
  orderNumber: order.orderNumber,
  customer: order.customer?.name || "—",
  items: order.items.length,
  total: order.totalAmount,
  status: order.status,
  date: order.createdAt,
});

const STEP_KEYS = ["pending", "processing", "shipped", "delivered"];
const STEP_LABELS = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

// Builds a timeline using only the statuses your backend actually tracks.
// Only `createdAt` (placed) and `updatedAt` (most recent transition) are real timestamps -
// intermediate completed steps show "Completed" rather than a fabricated time, since that's not tracked.
export const buildTimeline = (order) => {
  if (order.status === "cancelled") {
    return [
      {
        id: "cancelled",
        label: "Order Cancelled",
        time: formatDateTime(order.updatedAt),
        done: true,
      },
    ];
  }

  if (order.status === "confirmed") {
    return [
      {
        id: "placed",
        label: "Order Placed",
        time: formatDateTime(order.createdAt),
        done: true,
      },
      {
        id: "confirmed",
        label: "Order Confirmed",
        time: formatDateTime(order.updatedAt),
        done: true,
      },
    ];
  }

  const isDelayed = order.status === "delayed";
  const currentIndex = isDelayed ? 2 : STEP_KEYS.indexOf(order.status); // delayed = stuck at the shipped stage

  return STEP_KEYS.map((key, idx) => {
    let done = idx < currentIndex || (idx === currentIndex && !isDelayed);
    let label = STEP_LABELS[key];
    let time = "Pending";

    if (idx === 0) time = formatDateTime(order.createdAt);
    else if (done)
      time =
        idx === currentIndex ? formatDateTime(order.updatedAt) : "Completed";

    if (isDelayed && idx === 2) {
      label = "Shipment Delayed";
      time = formatDateTime(order.updatedAt);
      done = false;
    }

    return { id: key, label, time, done };
  });
};
