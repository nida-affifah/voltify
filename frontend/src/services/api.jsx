class API {
    constructor() {
        this.baseURL = API_URL;
        this.token = localStorage.getItem(TOKEN_KEY);
    }
    
    // Set token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }
    
    // Get headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    // Request method
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    this.setToken(null);
                    localStorage.removeItem(USER_KEY);
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
                throw new Error(data.message || 'Terjadi kesalahan');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // GET request
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    // POST request
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    // PUT request
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // Upload file
    async upload(endpoint, file, fieldName = 'file') {
        const formData = new FormData();
        formData.append(fieldName, file);
        
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload gagal');
        }
        
        return data;
    }
}

const api = new API();