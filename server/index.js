const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require('cookie-parser');
const clientIdMiddleware = require('./middleware/clientIdMiddleware');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(clientIdMiddleware);

const userRoutes = require('./routes/userRoutes');
app.use('/users',userRoutes);

const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/products', productRoutes);
app.use('/dashboard', dashboardRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);


const flashSaleRoutes = require('./routes/flashSaleRoutes');
app.use('/flashsale', flashSaleRoutes);
const startFlashSaleScheduler = require('./scheduler/flashSaleScheduler');

const {
    startReservationExpiryWorker,
} = require('./scheduler/reservationExpiryWorker');

const alertRoutes = require('./routes/alertRoutes');
app.use('/alerts', alertRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    console.log("Database Name: ", mongoose.connection.name);
    startFlashSaleScheduler();
    startReservationExpiryWorker();
  })
  .catch((err) => {
    console.log("Err occured", err);
  });

const http = require('http');
const httpServer = http.createServer(app);

const initSocketServer = require('./socket/socketServer');
initSocketServer(httpServer);

const { emitQueuePromotion } = require('./socket/socketManager');
const { subscribeToPromotions } = require('./redis/queuePubSub');

subscribeToPromotions((productId, clientId) => {
    emitQueuePromotion(productId, clientId);
});

httpServer.listen(3000, () => {
  console.log("Server listening to port 3000");
});