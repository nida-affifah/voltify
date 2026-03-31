// Format Rupiah
function formatRupiah(angka) {
    // Konversi ke number dan pastikan valid
    let nilai = parseFloat(angka);
    if (isNaN(nilai)) nilai = 0;
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(nilai);
}

// Format tanggal
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Format waktu relatif (misal: 2 jam lalu)
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} hari lalu`;
    return formatDate(dateString);
}

// Format rating stars
function formatStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalf) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show loading
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('active');
}

// Hide loading
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('active');
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get URL parameter
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Update URL without reload
function updateUrlParam(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.history.pushState({}, '', url);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Berhasil disalin!', 'success');
    }).catch(() => {
        showToast('Gagal menyalin', 'error');
    });
}

// Countdown timer
function startCountdown(endTime, elementId) {
    const end = new Date(endTime).getTime();
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = end - now;
        
        if (distance < 0) {
            clearInterval(timer);
            const element = document.getElementById(elementId);
            if (element) element.innerHTML = 'Berakhir';
            return;
        }
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}