// Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

// Login
async function login(email, password) {
    try {
        showLoading();
        const response = await api.post(ENDPOINTS.LOGIN, { email, password });
        
        if (response.success) {
            api.setToken(response.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
            
            showToast('Login berhasil! Selamat datang kembali', 'success');
            
            // Update UI
            updateAuthUI();
            
            // Redirect to home or previous page
            const redirect = getUrlParam('redirect') || '/';
            window.location.href = redirect;
        }
        
        return response;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Register
async function register(userData) {
    try {
        showLoading();
        const response = await api.post(ENDPOINTS.REGISTER, userData);
        
        if (response.success) {
            api.setToken(response.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
            
            showToast('Registrasi berhasil! Selamat bergabung di Voltify', 'success');
            
            // Update UI
            updateAuthUI();
            
            // Redirect to home
            window.location.href = '/';
        }
        
        return response;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Logout
function logout() {
    api.setToken(null);
    localStorage.removeItem(USER_KEY);
    updateAuthUI();
    showToast('Anda telah logout', 'success');
    window.location.href = '/';
}

// Update UI based on auth state
function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const user = getCurrentUser();
    
    if (user) {
        if (authSection) authSection.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'flex';
            const avatar = document.getElementById('user-avatar');
            if (avatar && user.avatar) {
                avatar.src = user.avatar;
            }
        }
        // Update cart count
        updateCartCount();
    } else {
        if (authSection) authSection.style.display = 'flex';
        if (userSection) userSection.style.display = 'none';
    }
}

// Update cart count
async function updateCartCount() {
    if (!isLoggedIn()) return;
    
    try {
        const response = await api.get(ENDPOINTS.CART_COUNT);
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = response.count;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Get user profile
async function getUserProfile() {
    try {
        const response = await api.get(ENDPOINTS.ME);
        return response.user;
    } catch (error) {
        console.error('Error getting profile:', error);
        return null;
    }
}

// Update user profile
async function updateProfile(data) {
    try {
        showLoading();
        const response = await api.put(ENDPOINTS.PROFILE, data);
        
        if (response.success) {
            // Update local storage
            const user = getCurrentUser();
            const updatedUser = { ...user, ...response.user };
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            
            showToast('Profil berhasil diperbarui', 'success');
            return response;
        }
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Upload avatar
async function uploadAvatar(file) {
    try {
        showLoading();
        const response = await api.upload('/auth/avatar', file, 'avatar');
        
        if (response.success) {
            // Update local storage
            const user = getCurrentUser();
            user.avatar = response.avatar;
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            
            // Update UI
            const avatarImg = document.getElementById('user-avatar');
            if (avatarImg) avatarImg.src = response.avatar;
            
            showToast('Foto profil berhasil diupdate', 'success');
            return response;
        }
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// Event listeners for auth
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});