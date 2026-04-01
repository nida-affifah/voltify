// src/pages/Test.jsx
import React from 'react'

function Test() {
  return (
    <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
      <h1>TEST PAGE BERHASIL</h1>
      <p>Jika halaman ini muncul, React berjalan normal</p>
      <p>Waktu: {new Date().toLocaleString()}</p>
    </div>
  )
}

export default Test
