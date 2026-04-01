// frontend/js/detail.js

// Load product detail page
async function loadProductDetail(productId) {
    const app = document.getElementById('app');
    if (!app) return;
    
    showLoading();
    
    try {
        const response = await api.get(`${ENDPOINTS.PRODUCTS}/${productId}`);
        const product = response.product;
        
        if (!product) {
            app.innerHTML = '<div class="container"><p class="error">Produk tidak ditemukan</p></div>';
            hideLoading();
            return;
        }
        
        const html = `
            <div class="container">
                <div class="product-detail">
                    <div class="product-detail-grid">
                        <!-- Product Gallery -->
                        <div class="product-gallery">
                            <div class="product-main-image">
                                <img id="main-image" src="${product.gambar_utama || 'assets/default-product.png'}" alt="${escapeHtml(product.nama_produk)}">
                            </div>
                            <div class="product-thumbnails">
                                ${product.gambar_lainnya ? product.gambar_lainnya.map(img => `
                                    <div class="thumbnail" onclick="document.getElementById('main-image').src='${img}'">
                                        <img src="${img}" alt="">
                                    </div>
                                `).join('') : ''}
                            </div>
                        </div>
                        
                        <!-- Product Info -->
                        <div class="product-info-detail">
                            <h1>${escapeHtml(product.nama_produk)}</h1>
                            
                            <div class="product-rating-detail">
                                <div class="rating-stars">
                                    ${formatStars(product.rating_avg || 0)}
                                </div>
                                <span class="rating-count">${product.rating_avg || 0} (${product.total_review || 0} ulasan)</span>
                                <span class="sold-count">Terjual ${product.total_terjual || 0}</span>
                            </div>
                            
                            <div class="product-price-detail">
                                <span class="current-price">${formatRupiah(product.harga_diskon || product.harga)}</span>
                                ${product.harga_diskon ? `
                                    <span class="old-price">${formatRupiah(product.harga)}</span>
                                    <span class="discount-badge">-${Math.round((1 - product.harga_diskon / product.harga) * 100)}%</span>
                                ` : ''}
                            </div>
                            
                            <!-- Toko Info -->
                            <div class="store-info">
                                <div class="store-header">
                                    <img src="${product.toko_logo || 'assets/default-store.png'}" alt="">
                                    <div class="store-details">
                                        <div class="store-name">${escapeHtml(product.nama_toko)}</div>
                                        <div class="store-rating">
                                            <i class="fas fa-star"></i> ${product.toko_rating || 0}
                                            <span class="store-followers">• ${product.toko_pengikut || 0} pengikut</span>
                                        </div>
                                    </div>
                                    <button class="btn-follow-store" data-store-id="${product.id_toko}">
                                        ${product.is_following ? 'Mengikuti' : 'Follow'}
                                    </button>
                                </div>
                                <div class="store-response">
                                    <i class="fas fa-reply"></i> Respon ${product.response_rate || 0}% dalam ${product.response_time || '1 jam'}
                                </div>
                            </div>
                            
                            <!-- Variant -->
                            ${product.varian && product.varian.length > 0 ? `
                                <div class="product-variant">
                                    <div class="variant-title">Varian</div>
                                    <div class="variant-options" id="variant-options">
                                        ${product.varian.map((v, idx) => `
                                            <button class="variant-btn ${idx === 0 ? 'active' : ''}" 
                                                    data-variant-id="${v.id_varian}"
                                                    data-variant-price="${v.harga_extra}"
                                                    data-variant-stock="${v.stok}">
                                                ${escapeHtml(v.nama_varian)}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Quantity -->
                            <div class="product-quantity">
                                <button class="quantity-btn" id="decrease-qty">-</button>
                                <input type="number" id="product-qty" class="quantity-input" value="1" min="1" max="${product.stok}">
                                <button class="quantity-btn" id="increase-qty">+</button>
                                <span class="product-stock">Stok: ${product.stok}</span>
                            </div>
                            
                            <!-- Actions -->
                            <div class="product-actions">
                                <button class="btn-add-cart" id="add-to-cart-btn">
                                    <i class="fas fa-shopping-cart"></i> Tambah ke Keranjang
                                </button>
                                <button class="btn-buy-now" id="buy-now-btn">
                                    Beli Sekarang
                                </button>
                                <button class="btn-wishlist" id="wishlist-btn">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Product Description -->
                    <div class="product-description">
                        <h3>Deskripsi Produk</h3>
                        <div class="description-content">
                            ${product.deskripsi || 'Tidak ada deskripsi untuk produk ini.'}
                        </div>
                    </div>
                    
                    <!-- Product Specifications -->
                    ${product.spesifikasi ? `
                        <div class="product-specs">
                            <h3>Spesifikasi</h3>
                            <table class="specs-table">
                                ${Object.entries(product.spesifikasi).map(([key, value]) => `
                                    <tr>
                                        <td>${key}</td>
                                        <td>${value}</td>
                                    </tr>
                                `).join('')}
                            </table>
                        </div>
                    ` : ''}
                    
                    <!-- Reviews Section -->
                    <div class="reviews-section">
                        <h3>Ulasan Pembeli</h3>
                        <div id="reviews-container">
                            <div class="reviews-loading">Memuat ulasan...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        app.innerHTML = html;
        
        // Attach events
        attachProductDetailEvents(product);
        
        // Load reviews
        loadReviews(productId);
        
        // Check wishlist status
        if (isLoggedIn()) {
            checkWishlistStatus(productId);
        }
        
    } catch (error) {
        console.error('Error loading product detail:', error);
        app.innerHTML = '<div class="container"><p class="error">Gagal memuat detail produk. Silakan refresh halaman.</p></div>';
    } finally {
        hideLoading();
    }
}

// Attach product detail events
function attachProductDetailEvents(product) {
    // Quantity buttons
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const qtyInput = document.getElementById('product-qty');
    const stock = product.stok;
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val < stock) {
                qtyInput.value = val + 1;
            }
        });
    }
    
    // Variant selection
    let selectedVariant = product.varian && product.varian.length > 0 ? product.varian[0] : null;
    
    document.querySelectorAll('.variant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const variantId = btn.dataset.variantId;
            selectedVariant = product.varian.find(v => v.id_varian == variantId);
            
            // Update stock display
            const stockSpan = document.querySelector('.product-stock');
            if (stockSpan && selectedVariant) {
                stockSpan.textContent = `Stok: ${selectedVariant.stok}`;
                qtyInput.max = selectedVariant.stok;
            }
        });
    });
    
    // Add to cart
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            if (!isLoggedIn()) {
                showToast('Silakan login terlebih dahulu', 'error');
                window.location.href = '/login?redirect=/product/' + product.id_produk;
                return;
            }
            
            const quantity = parseInt(qtyInput.value);
            const data = {
                id_produk: product.id_produk,
                jumlah: quantity
            };
            
            if (selectedVariant) {
                data.id_varian = selectedVariant.id_varian;
            }
            
            try {
                showLoading();
                await api.post(ENDPOINTS.CART, data);
                showToast('Produk ditambahkan ke keranjang', 'success');
                updateCartCount();
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                hideLoading();
            }
        });
    }
    
    // Buy now
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', async () => {
            if (!isLoggedIn()) {
                showToast('Silakan login terlebih dahulu', 'error');
                window.location.href = '/login?redirect=/product/' + product.id_produk;
                return;
            }
            
            const quantity = parseInt(qtyInput.value);
            const data = {
                id_produk: product.id_produk,
                jumlah: quantity
            };
            
            if (selectedVariant) {
                data.id_varian = selectedVariant.id_varian;
            }
            
            try {
                showLoading();
                await api.post(ENDPOINTS.CART, data);
                window.location.href = '/checkout';
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                hideLoading();
            }
        });
    }
    
    // Wishlist button
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (wishlistBtn && isLoggedIn()) {
        wishlistBtn.addEventListener('click', async () => {
            try {
                const isInWishlist = wishlistBtn.classList.contains('active');
                
                if (isInWishlist) {
                    // Remove from wishlist
                    await api.delete(`${ENDPOINTS.WISHLIST}/${product.id_produk}`);
                    wishlistBtn.classList.remove('active');
                    showToast('Dihapus dari wishlist', 'success');
                } else {
                    // Add to wishlist
                    await api.post(ENDPOINTS.WISHLIST, { id_produk: product.id_produk });
                    wishlistBtn.classList.add('active');
                    showToast('Ditambahkan ke wishlist', 'success');
                }
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    
    // Follow store
    const followStoreBtn = document.querySelector('.btn-follow-store');
    if (followStoreBtn && isLoggedIn()) {
        followStoreBtn.addEventListener('click', async () => {
            const storeId = followStoreBtn.dataset.storeId;
            const isFollowing = followStoreBtn.textContent === 'Mengikuti';
            
            try {
                if (isFollowing) {
                    await api.delete(`${ENDPOINTS.TOKO}/${storeId}/follow`);
                    followStoreBtn.textContent = 'Follow';
                    showToast('Berhenti mengikuti toko', 'success');
                } else {
                    await api.post(`${ENDPOINTS.TOKO}/${storeId}/follow`);
                    followStoreBtn.textContent = 'Mengikuti';
                    showToast('Mengikuti toko', 'success');
                }
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
}

// Load reviews
async function loadReviews(productId) {
    try {
        const response = await api.get(`${ENDPOINTS.REVIEWS}/product/${productId}`);
        const reviews = response.reviews || [];
        const stats = response.stats;
        
        const container = document.getElementById('reviews-container');
        if (container) {
            if (reviews.length === 0) {
                container.innerHTML = '<div class="no-reviews">Belum ada ulasan untuk produk ini.</div>';
                return;
            }
            
            container.innerHTML = `
                <div class="review-summary">
                    <div class="average-rating">
                        <div class="rating-number">${stats.avg_rating ? stats.avg_rating.toFixed(1) : '0'}</div>
                        <div class="rating-stars">${formatStars(stats.avg_rating || 0)}</div>
                        <div class="rating-count">${stats.total_reviews || 0} ulasan</div>
                    </div>
                    <div class="rating-distribution">
                        ${[5,4,3,2,1].map(rating => {
                            const count = stats[`rating_${rating}`] || 0;
                            const percentage = stats.total_reviews ? (count / stats.total_reviews * 100) : 0;
                            return `
                                <div class="rating-bar">
                                    <span class="rating-label">${rating} ★</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="rating-count">${count}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="reviews-list">
                    ${reviews.map(review => `
                        <div class="review-card">
                            <div class="review-header">
                                <img src="${review.avatar || 'assets/default-avatar.png'}" alt="">
                                <div class="review-user">
                                    <div class="user-name">${escapeHtml(review.name)}</div>
                                    <div class="review-rating">${formatStars(review.rating)}</div>
                                </div>
                                <div class="review-date">${formatDate(review.created_at)}</div>
                            </div>
                            <div class="review-comment">${escapeHtml(review.komentar)}</div>
                            ${review.gambar && review.gambar.length ? `
                                <div class="review-images">
                                    ${review.gambar.map(img => `<img src="${img}" alt="">`).join('')}
                                </div>
                            ` : ''}
                            ${review.balasan_toko ? `
                                <div class="seller-reply">
                                    <strong>Balasan Toko:</strong> ${escapeHtml(review.balasan_toko)}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        const container = document.getElementById('reviews-container');
        if (container) {
            container.innerHTML = '<div class="error">Gagal memuat ulasan</div>';
        }
    }
}

// Check wishlist status
async function checkWishlistStatus(productId) {
    try {
        const response = await api.get(`${ENDPOINTS.WISHLIST}/check/${productId}`);
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (wishlistBtn && response.is_in_wishlist) {
            wishlistBtn.classList.add('active');
        }
    } catch (error) {
        console.error('Error checking wishlist:', error);
    }
}