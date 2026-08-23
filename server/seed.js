// One-off script to populate realistic sample data for local development.
// Run with: node seed.js
// Safe to re-run - skips seeding if seed products already exist.

const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/productModel');
const StockMovement = require('./models/stockMovementModel');
const Order = require('./models/orderModel');
const Alert = require('./models/alertModel');

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY_MS);

// Backdates createdAt/updatedAt directly via the native driver,
// bypassing Mongoose's timestamps plugin which would otherwise overwrite them
const backdate = async (collectionName, id, date) => {
    await mongoose.connection.collection(collectionName).updateOne(
        { _id: id },
        { $set: { createdAt: date, updatedAt: date } }
    );
};

const computeStatus = (stock, reorderThreshold, overstockThreshold) => {
    if (stock <= 0) return 'out_of_stock';
    if (stock <= reorderThreshold) return 'low_stock';
    if (stock >= overstockThreshold) return 'overstock';
    return 'in_stock';
};

const productSeeds = [
    { name: 'Wireless Mouse', sku: 'SEED-ELEC-001', category: 'Electronics', unitPrice: 25.99, currentStock: 240, reorderThreshold: 30, overstockThreshold: 400, createdDaysAgo: 45 },
    { name: 'USB-C Cable 6ft', sku: 'SEED-ELEC-002', category: 'Electronics', unitPrice: 8.5, currentStock: 610, reorderThreshold: 50, overstockThreshold: 500, createdDaysAgo: 60 },
    { name: 'Bluetooth Speaker', sku: 'SEED-ELEC-003', category: 'Electronics', unitPrice: 42.0, currentStock: 12, reorderThreshold: 20, overstockThreshold: 300, createdDaysAgo: 20 },
    { name: 'Mechanical Keyboard', sku: 'SEED-ELEC-004', category: 'Electronics', unitPrice: 65.0, currentStock: 5, reorderThreshold: 15, overstockThreshold: 200, createdDaysAgo: 15 },
    { name: 'Cotton T-Shirt', sku: 'SEED-APRL-001', category: 'Apparel', unitPrice: 12.0, currentStock: 320, reorderThreshold: 40, overstockThreshold: 350, createdDaysAgo: 50 },
    { name: 'Denim Jacket', sku: 'SEED-APRL-002', category: 'Apparel', unitPrice: 55.0, currentStock: 8, reorderThreshold: 15, overstockThreshold: 150, createdDaysAgo: 25 },
    { name: 'Running Shoes', sku: 'SEED-APRL-003', category: 'Apparel', unitPrice: 78.0, currentStock: 0, reorderThreshold: 10, overstockThreshold: 100, createdDaysAgo: 10 },
    { name: 'Ceramic Mug Set', sku: 'SEED-HOME-001', category: 'Home Goods', unitPrice: 18.0, currentStock: 150, reorderThreshold: 25, overstockThreshold: 250, createdDaysAgo: 40 },
    { name: 'LED Desk Lamp', sku: 'SEED-HOME-002', category: 'Home Goods', unitPrice: 32.0, currentStock: 5, reorderThreshold: 10, overstockThreshold: 5, createdDaysAgo: 18 },
    { name: 'Organic Coffee Beans 1kg', sku: 'SEED-GROC-001', category: 'Groceries', unitPrice: 14.5, currentStock: 200, reorderThreshold: 30, overstockThreshold: 300, createdDaysAgo: 35 },
    { name: 'Protein Bars (Box of 12)', sku: 'SEED-GROC-002', category: 'Groceries', unitPrice: 22.0, currentStock: 18, reorderThreshold: 25, overstockThreshold: 200, createdDaysAgo: 12 },
    { name: 'Building Blocks Set', sku: 'SEED-TOYS-001', category: 'Toys', unitPrice: 29.99, currentStock: 95, reorderThreshold: 20, overstockThreshold: 250, createdDaysAgo: 28 }
];

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    const alreadySeeded = await Product.findOne({ sku: 'SEED-ELEC-001' });
    if (alreadySeeded) {
        console.log('Seed data already exists - skipping. Delete SKUs starting with "SEED-" to re-seed.');
        await mongoose.disconnect();
        return;
    }

    // 1. Create products with correct status + backdated createdAt
    const createdProducts = [];
    for (const p of productSeeds) {
        const status = computeStatus(p.currentStock, p.reorderThreshold, p.overstockThreshold);
        const product = await Product.create({
            name: p.name,
            sku: p.sku,
            category: p.category,
            unitPrice: p.unitPrice,
            currentStock: p.currentStock,
            reorderThreshold: p.reorderThreshold,
            overstockThreshold: p.overstockThreshold,
            status
        });
        await backdate('products', product._id, daysAgo(p.createdDaysAgo));
        createdProducts.push({ ...p, _id: product._id, status });
    }
    console.log(`Created ${createdProducts.length} products`);

    // 2. Create stock movements (restocks) over the last 10 days for a subset of products
    let movementCount = 0;
    for (const p of createdProducts.slice(0, 6)) {
        const movement = await StockMovement.create({
            product: p._id,
            type: 'inbound',
            quantity: Math.floor(Math.random() * 100) + 20,
            reason: 'restock'
        });
        await backdate('stockmovements', movement._id, daysAgo(Math.floor(Math.random() * 7) + 1));
        movementCount++;
    }
    console.log(`Created ${movementCount} stock movements`);

    // 3. Create alerts for anything flagged low_stock / out_of_stock / overstock
    let alertCount = 0;
    for (const p of createdProducts) {
        if (['low_stock', 'out_of_stock', 'overstock'].includes(p.status)) {
            const alert = await Alert.create({
                type: p.status,
                product: p._id,
                message: `${p.name} is ${p.status.replace('_', ' ')} (${p.currentStock} units)`,
                severity: p.status === 'out_of_stock' ? 'critical' : 'warning'
            });
            await backdate('alerts', alert._id, daysAgo(Math.floor(Math.random() * 6) + 1));
            alertCount++;
        }
    }
    console.log(`Created ${alertCount} alerts`);

    const sampleCustomers = [
        { name: 'Ravi Teja', email: 'ravi.teja@example.com', phone: '+91 98765 43210', address: 'Banjara Hills, Hyderabad, TG 500034' },
        { name: 'Ananya Rao', email: 'ananya.rao@example.com', phone: '+91 91234 56780', address: 'Koramangala, Bengaluru, KA 560034' },
        { name: 'Lola Jenson', email: 'lola.jenson@example.com', phone: '+91 90000 11223', address: 'Bandra West, Mumbai, MH 400050' },
        { name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 99887 76655', address: 'Sector 18, Noida, UP 201301' }
    ];

    // 4. Create orders - mix of statuses and date ranges (some this month, some last month for revenue comparison)
    const orderSeeds = [
        { status: 'delivered', daysAgoCreated: 3, product: createdProducts[0], customer: sampleCustomers[0] },
        { status: 'delivered', daysAgoCreated: 8, product: createdProducts[1], customer: sampleCustomers[1] },
        { status: 'delivered', daysAgoCreated: 12, product: createdProducts[4], customer: sampleCustomers[2] },
        { status: 'delivered', daysAgoCreated: 35, product: createdProducts[0], customer: sampleCustomers[3] },
        { status: 'delivered', daysAgoCreated: 40, product: createdProducts[9], customer: sampleCustomers[0] },
        { status: 'pending', daysAgoCreated: 1, product: createdProducts[2], customer: sampleCustomers[1] },
        { status: 'processing', daysAgoCreated: 2, product: createdProducts[7], customer: sampleCustomers[2] },
        { status: 'shipped', daysAgoCreated: 4, product: createdProducts[10], customer: sampleCustomers[3] },
        { status: 'delayed', daysAgoCreated: 6, product: createdProducts[5], customer: sampleCustomers[0] }
    ];

    let orderCount = 0;
    for (const o of orderSeeds) {
        const quantity = Math.floor(Math.random() * 10) + 1;
        const totalAmount = Number((o.product.unitPrice * quantity).toFixed(2));

        const order = await Order.create({
            orderNumber: `SEED-${String(orderCount + 1).padStart(4, '0')}`,
            items: [{ product: o.product._id, quantity, unitPrice: o.product.unitPrice }],
            status: o.status,
            totalAmount,
            customer: o.customer
        });
        await backdate('orders', order._id, daysAgo(o.daysAgoCreated));
        orderCount++;
    }
    console.log(`Created ${orderCount} orders`);

    console.log('Seeding complete');
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});