import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Feed from './pages/Feed';
import Live from './pages/Live';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import FlashSale from './pages/FlashSale';
import Seller from './pages/Seller';
import ManageProducts from './pages/ManageProducts';
import MyOrders from './pages/MyOrders';

// Import seller routes
import TokoDashboard from './pages/seller/TokoDashboard';
import TokoOrders from './pages/seller/TokoOrders';
import TokoReports from './pages/seller/TokoReports';
import TokoProducts from './pages/seller/TokoProducts';

// Import admin routes
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminReports from './pages/admin/AdminReports';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';
import AdminTransactions from './pages/admin/AdminTransactions';

// Import affiliate routes
import AffiliateDashboard from './pages/affiliate/AffiliateDashboard';
import AffiliateLinks from './pages/affiliate/AffiliateLinks';
import AffiliateCommission from './pages/affiliate/AffiliateCommission';

// Import kurir routes
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryToday from './pages/delivery/DeliveryToday';
import DeliveryHistory from './pages/delivery/DeliveryHistory';

function App() {
  return (
    <Routes>
      {/* Public Routes with Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="order/:id" element={<OrderDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="feed" element={<Feed />} />
        <Route path="live" element={<Live />} />
        <Route path="chat" element={<Chat />} />
        <Route path="flash-sale" element={<FlashSale />} />
        <Route path="seller" element={<Seller />} />
        <Route path="manage-products" element={<ManageProducts />} />
        
        {/* Seller Routes */}
        <Route path="toko/dashboard" element={<TokoDashboard />} />
        <Route path="toko/orders" element={<TokoOrders />} />
        <Route path="toko/reports" element={<TokoReports />} />
        <Route path="toko/products" element={<TokoProducts />} />
        
        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/products" element={<AdminProducts />} />
        <Route path="admin/products/add" element={<AdminAddProduct />} />
        <Route path="admin/products/edit/:id" element={<AdminAddProduct />} />
        <Route path="admin/orders" element={<AdminOrders />} />
        <Route path="admin/reports" element={<AdminReports />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/stores" element={<AdminStores />} />
        <Route path="admin/transactions" element={<AdminTransactions />} />
        
        {/* Affiliate Routes */}
        <Route path="affiliate/dashboard" element={<AffiliateDashboard />} />
        <Route path="affiliate/links" element={<AffiliateLinks />} />
        <Route path="affiliate/commission" element={<AffiliateCommission />} />
        
        {/* Kurir Routes */}
        <Route path="delivery/dashboard" element={<DeliveryDashboard />} />
        <Route path="delivery/today" element={<DeliveryToday />} />
        <Route path="delivery/history" element={<DeliveryHistory />} />
      </Route>
      
      {/* Auth Routes tanpa Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;