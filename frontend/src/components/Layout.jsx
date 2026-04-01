// src/components/Layout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import LuxuryDarkBackground from './Background/LuxuryDarkBackground'
import AdminNav from './AdminNav'

const Layout = () => {
  // Cek apakah user adalah admin
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin_toko' || user.role === 'super_admin';
  const isSeller = user.role === 'seller';

  return (
    <>
      <LuxuryDarkBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header />
        {/* Tampilkan AdminNav hanya untuk admin atau seller */}
        {(isAdmin || isSeller) && <AdminNav />}
        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Layout