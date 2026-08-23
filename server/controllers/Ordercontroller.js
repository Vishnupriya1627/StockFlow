const Order = require('../models/Ordermodel');     
const Product = require('../models/Productmodel'); 
const Alert = require('../models/Alertmodel'); 
const StockMovement = require('../models/stockmovementmodel');

// Generates a simple sequential-looking order number, e.g. ORD-000123
const generateOrderNumber = async () => {
    const count = await Order.countDocuments();
    return `ORD-${String(count + 1).padStart(6, '0')}`;
};

exports.createOrder = async (req, res) => {
    const { items, expectedShipDate, customer } = req.body; // items: [{ product, quantity }]

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate stock availability for every item before committing any changes
        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }

            const availableStock = product.currentStock - product.reservedStock;
            if (availableStock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
                });
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                unitPrice: product.unitPrice
            });

            totalAmount += product.unitPrice * item.quantity;
        }

        // All items validated - now reserve stock for each
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { reservedStock: item.quantity }
            });
        }

        const orderNumber = await generateOrderNumber();

        const order = new Order({
            orderNumber,
            items: orderItems,
            totalAmount,
            expectedShipDate,
            customer,
            createdBy: req.user ? req.user.userId : undefined
        });

        await order.save();

        res.status(201).json({ message: 'Order successfully created', order });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .populate('items.product', 'name sku');

        res.status(200).json({ message: 'Orders fetched', count: orders.length, orders });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product', 'name sku unitPrice');

        if (!order) {
            return res.status(404).json({ message: 'Order Not Found' });
        }

        res.status(200).json({ message: 'Order fetched', order });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

// Handles the full status lifecycle: pending -> processing -> shipped -> delivered
// Also supports delayed / cancelled as side branches
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'delayed', 'cancelled'];

    try {
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order Not Found' });
        }

        const previousStatus = order.status;
        order.status = status;

        if (status === 'shipped') {
            order.actualShipDate = new Date();
        }

        if (status === 'delivered' && previousStatus !== 'delivered') {
            // Convert reservation into an actual stock deduction
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { currentStock: -item.quantity, reservedStock: -item.quantity }
                });

                await StockMovement.create({
                    product: item.product,
                    order: order._id,
                    type: 'outbound',
                    quantity: -item.quantity,
                    reason: 'sale',
                    performedBy: req.user ? req.user.userId : undefined
                });

                // Re-fetch to check if this pushed the product into low_stock/out_of_stock
                const updatedProduct = await Product.findById(item.product);
                if (['low_stock', 'out_of_stock'].includes(updatedProduct.status)) {
                    await Alert.create({
                        type: updatedProduct.status,
                        product: updatedProduct._id,
                        order: order._id,
                        message: `${updatedProduct.name} is now ${updatedProduct.status.replace('_', ' ')} after order ${order.orderNumber}`,
                        severity: updatedProduct.status === 'out_of_stock' ? 'critical' : 'warning'
                    });
                }
            }
        }

        if (status === 'cancelled' && previousStatus !== 'cancelled') {
            // Release the reservation without touching currentStock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { reservedStock: -item.quantity }
                });
            }
        }

        if (status === 'delayed' && previousStatus !== 'delayed') {
            await Alert.create({
                type: 'shipment_delayed',
                order: order._id,
                message: `Order ${order.orderNumber} has been delayed`,
                severity: 'warning'
            });
        }

        await order.save();

        res.status(200).json({ message: 'Order status updated', order });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};