const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: [true, 'Product reference is required']
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    },
    type: {
        type: String,
        enum: ['inbound', 'outbound', 'adjustment'],
        required: [true, 'Movement type is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required']
    },
    reason: {
        type: String,
        enum: ['restock', 'sale', 'damage', 'correction', 'return'],
        default: 'correction'
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, { timestamps: true });

stockMovementSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.models.stockmovements || mongoose.model('stockmovements', stockMovementSchema);