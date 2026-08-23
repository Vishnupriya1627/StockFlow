const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "delayed",
        "confirmed",
        "cancelled",
      ],
      default: "pending",
    },
    expectedShipDate: {
      type: Date,
    },
    actualShipDate: {
      type: Date,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    buyerClientId: {
      type: String,
      trim: true,
    },
    customer: {
     name: { type: String, required: true, trim: true },
     email: { type: String, required: true, trim: true },
     phone: { type: String, required: true, trim: true },
     address: { type: String, trim: true },
   },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1 });

module.exports = mongoose.models.orders || mongoose.model('orders', orderSchema);
