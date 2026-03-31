const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// CORS configuration - DIPERBAIKI
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io untuk chat real-time
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`📡 Socket ${socket.id} joined room ${roomId}`);
    });
    
    socket.on('send-message', (data) => {
        io.to(data.roomId).emit('new-message', data);
    });
    
    socket.on('join-live', (liveId) => {
        socket.join(`live-${liveId}`);
        console.log(`📺 Socket ${socket.id} joined live ${liveId}`);
    });
    
    socket.on('live-message', (data) => {
        io.to(`live-${data.liveId}`).emit('live-message', data);
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// Set io ke chatController
const chatController = require('./controllers/chatController');
chatController.setIo(io);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const postinganRoutes = require('./routes/postinganRoutes');
const liveRoutes = require('./routes/liveRoutes');
const chatRoutes = require('./routes/chatRoutes');
const affiliateRoutes = require('./routes/affiliateRoutes');
const tokoRoutes = require('./routes/tokoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/postingan', postinganRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/toko', tokoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', async (req, res) => {
    const pool = require('./config/database');
    try {
        const result = await pool.query('SELECT NOW() as server_time, current_database() as database');
        res.json({
            status: 'OK',
            timestamp: new Date(),
            database: result.rows[0].database,
            server_time: result.rows[0].server_time
        });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Voltify API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            orders: '/api/orders',
            categories: '/api/categories',
            users: '/api/users',
            vouchers: '/api/vouchers',
            reviews: '/api/reviews',
            wishlist: '/api/wishlist',
            postingan: '/api/postingan',
            live: '/api/live',
            chat: '/api/chat',
            affiliate: '/api/affiliate',
            toko: '/api/toko',
            dashboard: '/api/dashboard'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5555;
server.listen(PORT, () => {
    console.log(`\n🚀 Voltify Server is running!`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
    console.log(`💬 Socket.io ready for real-time chat`);
    console.log(`🗄️  Connected to PostgreSQL database\n`);
});

module.exports = { app };