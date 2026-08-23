const Product = require('../models/Productmodel'); 
const Order = require('../models/Ordermodel'); 
const StockMovement = require('../models/stockmovementmodel');
const Alert = require('../models/Alertmodel');    

const DAY_MS = 24 * 60 * 60 * 1000;

const pctChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
};

// Powers the 4 KPI stat cards
exports.getSummary = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * DAY_MS);
        const sevenDaysAgo = new Date(now - 7 * DAY_MS);
        const fourteenDaysAgo = new Date(now - 14 * DAY_MS);

        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [
            totalSKUs,
            skusThirtyDaysAgo,
            lowStockCount,
            newLowStockAlerts7d,
            pendingOrdersCount,
            ordersThisWeek,
            ordersPriorWeek,
            revenueThisMonthAgg,
            revenueLastMonthAgg,
            outOfStockCount,
            overstockCount,
            delayedOrdersCount,
            replenishedLast7Days
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ createdAt: { $lte: thirtyDaysAgo } }),
            Product.countDocuments({ status: 'low_stock' }),
            Alert.countDocuments({ type: 'low_stock', createdAt: { $gte: sevenDaysAgo } }),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            Order.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
            Order.aggregate([
                { $match: { status: { $in: ['confirmed', 'delivered'] }, createdAt: { $gte: startOfThisMonth } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { status: { $in: ['confirmed', 'delivered'] }, createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Product.countDocuments({ status: 'out_of_stock' }),
            Product.countDocuments({ status: 'overstock' }),
            Order.countDocuments({ status: 'delayed' }),
            StockMovement.countDocuments({ type: 'inbound', createdAt: { $gte: sevenDaysAgo } })
        ]);

        const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
        const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;

        res.status(200).json({
            message: 'Dashboard summary fetched',
            summary: {
                totalSKUs: {
                    value: totalSKUs,
                    changePct: pctChange(totalSKUs, skusThirtyDaysAgo) // real: vs count 30 days ago
                },
                lowStockItems: {
                    value: lowStockCount,
                    changeCount: newLowStockAlerts7d // real: new low-stock alerts in last 7 days
                },
                pendingOrders: {
                    value: pendingOrdersCount,
                    changePct: pctChange(ordersThisWeek, ordersPriorWeek) // proxy: order volume this week vs last week
                },
                revenueThisMonth: {
                    value: revenueThisMonth,
                    changePct: pctChange(revenueThisMonth, revenueLastMonth) // real: calendar month over month
                },
                outOfStock: outOfStockCount,
                overstockWarning: overstockCount,
                shipmentDelayed: delayedOrdersCount,
                stockReplenished: replenishedLast7Days
            }
        });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

// Reconstructs total stock-on-hand at the end of each of the last N days,
// by walking backward from the current total and undoing each day's net movement
exports.getStockTrend = async (req, res) => {
    try {
        const days = Number(req.query.days) || 7;
        const startDate = new Date(Date.now() - days * DAY_MS);

        const [currentTotalAgg, dailyMovements] = await Promise.all([
            Product.aggregate([
                { $group: { _id: null, total: { $sum: '$currentStock' } } }
            ]),
            StockMovement.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        netChange: { $sum: '$quantity' }
                    }
                }
            ])
        ]);

        const movementsByDate = {};
        dailyMovements.forEach(m => { movementsByDate[m._id] = m.netChange; });

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const trend = [];
        let runningTotal = currentTotalAgg[0]?.total || 0;

        // Walk from today backward to `days` ago, undoing each day's net movement as we go
        for (let i = 0; i < days; i++) {
            const date = new Date(Date.now() - i * DAY_MS);
            const dateKey = date.toISOString().split('T')[0];

            trend.unshift({
                day: dayLabels[date.getDay()],
                stock: runningTotal
            });

            runningTotal -= (movementsByDate[dateKey] || 0);
        }

        res.status(200).json({ message: 'Stock trend fetched', trend });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

// Total units on hand per category - powers the category breakdown chart
exports.getCategoryBreakdown = async (req, res) => {
    try {
        const breakdown = await Product.aggregate([
            { $group: { _id: '$category', value: { $sum: '$currentStock' } } },
            { $sort: { value: -1 } }
        ]);

        const formatted = breakdown.map(b => ({ category: b._id, value: b.value }));

        res.status(200).json({ message: 'Category breakdown fetched', breakdown: formatted });

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

// Unified feed merging alerts, restocks, and order events into one activity list
exports.getRecentActivity = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS);

        const [alerts, restocks, recentOrders] = await Promise.all([
            Alert.find({ createdAt: { $gte: sevenDaysAgo } })
                .populate('product', 'name sku')
                .populate('order', 'orderNumber')
                .sort({ createdAt: -1 })
                .limit(limit),

            StockMovement.find({ type: 'inbound', createdAt: { $gte: sevenDaysAgo } })
                .populate('product', 'name sku')
                .sort({ createdAt: -1 })
                .limit(limit),

            Order.find({ status: { $in: ['confirmed', 'shipped', 'delivered', 'delayed'] }, updatedAt: { $gte: sevenDaysAgo } })
                .sort({ updatedAt: -1 })
                .limit(limit)
        ]);

        const feed = [];

        alerts.forEach(a => {
            feed.push({
                id: a._id.toString(),
                type: a.type === 'shipment_delayed' ? 'order' : a.type.replace('_', '-'),
                message: a.message,
                time: timeAgo(a.createdAt),
                timestamp: a.createdAt,
                status: a.severity === 'critical' ? 'danger' : 'warning'
            });
        });

        restocks.forEach(m => {
            feed.push({
                id: m._id.toString(),
                type: 'restock',
                message: `${m.product?.sku || 'Unknown SKU'} (${m.product?.name || 'Unknown product'}) restocked — ${m.quantity} units added`,
                time: timeAgo(m.createdAt),
                timestamp: m.createdAt,
                status: 'success'
            });
        });

        recentOrders.forEach(o => {
            const statusMessage = {
                confirmed: `Order ${o.orderNumber} confirmed`,
                shipped: `Order ${o.orderNumber} shipped`,
                delivered: `Order ${o.orderNumber} delivered`,
                delayed: `Order ${o.orderNumber} delayed`
            };
            feed.push({
                id: o._id.toString(),
                type: 'order',
                message: statusMessage[o.status],
                time: timeAgo(o.updatedAt),
                timestamp: o.updatedAt,
                status: o.status === 'delayed' ? 'danger' : 'info'
            });
        });

        feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const trimmed = feed.slice(0, limit).map(({ timestamp, ...rest }) => rest);

        res.status(200).json({ message: 'Recent activity fetched', activity: trimmed });

    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};