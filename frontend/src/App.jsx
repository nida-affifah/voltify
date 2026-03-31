import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Feed from './pages/Feed'
import Live from './pages/Live'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Register from './pages/Register'
import FlashSale from './pages/FlashSale'
import Seller from './pages/Seller'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="feed" element={<Feed />} />
        <Route path="live" element={<Live />} />
        <Route path="chat" element={<Chat />} />
        <Route path="flash-sale" element={<FlashSale />} />
        <Route path="seller" element={<Seller />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App