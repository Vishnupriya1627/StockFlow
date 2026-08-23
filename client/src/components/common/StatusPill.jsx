import React from "react";

const statusConfig = {
  // Inventory statuses
  "in-stock": { label: "In Stock", classes: "bg-emerald-50 text-emerald-700" },
  "low-stock": { label: "Low Stock", classes: "bg-[#f9b223]/15 text-[#a06a00]" },
  "out-of-stock": { label: "Out of Stock", classes: "bg-red-50 text-red-600" },
  "overstock": { label: "Overstock", classes: "bg-sky-50 text-sky-700" },
  // Order statuses
  "pending": { label: "Pending", classes: "bg-gray-100 text-gray-600" },
  "shipped": { label: "Shipped", classes: "bg-sky-50 text-sky-700" },
  "delivered": { label: "Delivered", classes: "bg-emerald-50 text-emerald-700" },
  "delayed": { label: "Delayed", classes: "bg-red-50 text-red-600" },
  "cancelled": { label: "Cancelled", classes: "bg-gray-100 text-gray-400" },
  // User statuses
  "active": { label: "Active", classes: "bg-emerald-50 text-emerald-700" },
  "inactive": { label: "Inactive", classes: "bg-gray-100 text-gray-400" },
};

const StatusPill = ({ status }) => {
  const config = statusConfig[status] || statusConfig["in-stock"];
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default StatusPill;