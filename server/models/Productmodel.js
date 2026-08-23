const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name must not exceed 100 characters']
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price cannot be negative']
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    reorderThreshold: {
        type: Number,
        required: true,
        default: 10
    },
    overstockThreshold: {
        type: Number,
        required: true,
        default: 500
    },
    reservedStock: {
        type: Number,
        default: 0
    },
    warehouseLocation: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'suppliers'
    },
    status: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock', 'overstock'],
        default: 'in_stock'
    },

    // ---- Flash Sale fields ----
    flashSale: {
        isEnabled: {
            type: Boolean,
            default: false
        },
        startTime: {
            type: Date
        },
        endTime: {
            type: Date
        },
        allocatedStock: {
            type: Number,
            min: [0, 'Allocated stock cannot be negative']
            // NOTE: this is the qty carved out for the sale, loaded into Redis
            // at saleStartTime. It can be <= currentStock, never more.
        },
        soldCount: {
            type: Number,
            default: 0
            // Written back from Redis via BullMQ job after sale ends / periodically.
            // This is NOT decremented live — Redis owns live truth during the sale.
        },
        status: {
            type: String,
            enum: ['scheduled', 'live', 'ended', 'sold_out'],
            default: 'scheduled'
            // Set by a scheduler/worker crossing startTime/endTime boundaries —
            // NOT computed on every read. This is what your "Active Drops" page
            // queries against, so it's a cheap indexed lookup instead of comparing
            // timestamps on every request.
        }
    }
}, { timestamps: true });

// Auto-calculate inventory status whenever stock levels change
productSchema.pre('save', function () {
    if (this.currentStock <= 0) {
        this.status = 'out_of_stock';
    } else if (this.currentStock <= this.reorderThreshold) {
        this.status = 'low_stock';
    } else if (this.currentStock >= this.overstockThreshold) {
        this.status = 'overstock';
    } else {
        this.status = 'in_stock';
    }
});

// Validate flash sale config integrity
productSchema.pre('save', function () {
    if (this.flashSale?.isEnabled) {
        const { startTime, endTime, allocatedStock } = this.flashSale;

        if (!startTime || !endTime) {
            return next(new Error('Flash sale requires both startTime and endTime'));
        }
        if (endTime <= startTime) {
            return next(new Error('Flash sale endTime must be after startTime'));
        }
        if (allocatedStock == null || allocatedStock <= 0) {
            return next(new Error('Flash sale requires a positive allocatedStock'));
        }
        if (allocatedStock > this.currentStock) {
            return next(new Error('allocatedStock cannot exceed currentStock'));
        }
    }
});

// Fast lookup for "Active Drops" page and the scheduler worker
productSchema.index({ 'flashSale.isEnabled': 1, 'flashSale.status': 1, 'flashSale.startTime': 1 });

module.exports = mongoose.models.products || mongoose.model('products', productSchema);