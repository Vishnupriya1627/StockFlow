const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['low_stock', 'overstock', 'shipment_delayed', 'out_of_stock'],
        required: [true, 'Alert type is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    },
    message: {
        type: String,
        required: [true, 'Alert message is required'],
        trim: true
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'warning'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('alerts', alertSchema);