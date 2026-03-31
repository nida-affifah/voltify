// Konfigurasi API
const API_URL = 'http://localhost:5555/api';
const SOCKET_URL = 'http://localhost:5555';

// Storage keys
const TOKEN_KEY = 'voltify_token';
const USER_KEY = 'voltify_user';

// Endpoints
const ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    
    // Products
    PRODUCTS: '/products',
    FEATURED: '/products/featured',
    FLASH_SALE: '/products/flash-sale',
    SEARCH: '/products/search',
    RECOMMENDATIONS: '/products/recommendations',
    
    // Cart
    CART: '/cart',
    CART_COUNT: '/cart/count',
    
    // Orders
    ORDERS: '/orders',
    
    // Categories
    CATEGORIES: '/categories',
    
    // Users
    USERS: '/users',
    PROFILE: '/users/profile',
    
    // Vouchers
    VOUCHERS: '/vouchers',
    
    // Reviews
    REVIEWS: '/reviews',
    
    // Wishlist
    WISHLIST: '/wishlist',
    
    // Postingan
    POSTINGAN: '/postingan',
    
    // Live
    LIVE: '/live',
    
    // Chat
    CHAT: '/chat',
    
    // Affiliate
    AFFILIATE: '/affiliate',
    
    // Toko
    TOKO: '/toko',
    
    // Dashboard
    DASHBOARD: '/dashboard'
};