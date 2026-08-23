const Product = require('../models/Productmodel');  
const Alert = require('../models/Alertmodel');      
const StockMovement = require('../models/stockmovementmodel'); 

exports.createProduct = async (req, res) => {
    const { name, sku, category, description, unitPrice, currentStock, reorderThreshold, overstockThreshold, warehouseLocation, imageUrl, supplier } = req.body;

    try {
        let product = await Product.findOne({ sku });

        if (product) {
            return res.status(400).json({ message: 'Product with this SKU already exists' });
        }

        product = new Product({
            name,
            sku,
            category,
            description,
            unitPrice,
            currentStock,
            reorderThreshold,
            overstockThreshold,
            warehouseLocation,
            imageUrl,
            supplier
        });

        await product.save();

        res.status(201).json({ message: 'Product successfully created', product });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { status, category, search } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const products = await Product.find(filter).sort({ createdAt: -1 });

        res.status(200).json({ message: 'Products fetched', count: products.length, products });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('supplier');

        if (!product) {
            return res.status(404).json({ message: 'Product Not Found' });
        }

        res.status(200).json({ message: 'Product fetched', product });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product Not Found' });
        }

        const updatableFields = ['name', 'category', 'description', 'unitPrice', 'reorderThreshold', 'overstockThreshold', 'warehouseLocation', 'imageUrl', 'supplier', 'flashSale'];
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) product[field] = req.body[field];
        });

        await product.save();

        res.status(200).json({ message: 'Product updated', product });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product Not Found' });
        }

        res.status(200).json({ message: 'Product deleted' });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

// Adjusts stock, logs the movement, and raises an alert if a threshold is crossed
exports.adjustStock = async (req, res) => {
    const { quantity, type, reason } = req.body; // quantity: signed delta, type: 'inbound' | 'outbound' | 'adjustment'

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product Not Found' });
        }

        const previousStatus = product.status;
        product.currentStock += quantity;

        if (product.currentStock < 0) {
            return res.status(400).json({ message: 'Stock cannot go below zero' });
        }

        await product.save(); // triggers status pre-save hook

        await StockMovement.create({
            product: product._id,
            type,
            quantity,
            reason,
            performedBy: req.user ? req.user.userId : undefined
        });

        // Only raise an alert if status actually changed into a flagged state
        if (product.status !== previousStatus && ['low_stock', 'out_of_stock', 'overstock'].includes(product.status)) {
            await Alert.create({
                type: product.status,
                product: product._id,
                message: `${product.name} is now ${product.status.replace('_', ' ')} (${product.currentStock} units)`,
                severity: product.status === 'out_of_stock' ? 'critical' : 'warning'
            });
        }

        res.status(200).json({ message: 'Stock adjusted', product });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Reconstructs this product's stock level at the end of each of the last N days,
// same backward-walk technique as the dashboard-wide stock trend, scoped to one product
exports.getProductStockHistory = async (req, res) => {
    try {
        const days = Number(req.query.days) || 7;
        const startDate = new Date(Date.now() - days * DAY_MS);

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product Not Found' });
        }

        const dailyMovements = await StockMovement.aggregate([
            { $match: { product: product._id, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    netChange: { $sum: '$quantity' }
                }
            }
        ]);

        const movementsByDate = {};
        dailyMovements.forEach(m => { movementsByDate[m._id] = m.netChange; });

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const history = [];
        let runningTotal = product.currentStock;

        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - i * DAY_MS);
            const dateKey = date.toISOString().split('T')[0];

            history.unshift({ day: dayLabels[date.getDay()], stock: runningTotal });
            runningTotal -= (movementsByDate[dateKey] || 0);
        }

        res.status(200).json({ message: 'Stock history fetched', history });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

const timeAgo = (date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const daysAgo = Math.floor(hrs / 24);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
};

const reasonNote = {
    restock: 'Supplier delivery',
    damage: 'Damaged unit removed',
    correction: 'Manual stock correction',
    return: 'Customer return'
};

// Recent stock movements for this product, formatted for the activity feed on Product Detail
exports.getProductMovements = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;

        const movements = await StockMovement.find({ product: req.params.id })
            .populate('order', 'orderNumber')
            .sort({ createdAt: -1 })
            .limit(limit);

        const formatted = movements.map(m => ({
            id: m._id.toString(),
            type: m.reason === 'restock' ? 'restock' : m.reason === 'sale' ? 'sale' : 'adjustment',
            change: m.quantity,
            note: m.order ? `Order #${m.order.orderNumber}` : (reasonNote[m.reason] || 'Stock adjustment'),
            time: timeAgo(m.createdAt)
        }));

        res.status(200).json({ message: 'Movements fetched', movements: formatted });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};