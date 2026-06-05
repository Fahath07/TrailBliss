const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API client with error handling and token management
class ApiClient {
  constructor() {
    this.token = localStorage.getItem('trailbliss_token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('trailbliss_token', token);
    } else {
      localStorage.removeItem('trailbliss_token');
    }
  }

  // Get auth headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle 401 (unauthorized) by clearing token
        if (response.status === 401) {
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('auth-expired'));
        }
        
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// Auth API
export const authAPI = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async logout() {
    apiClient.setToken(null);
    return { message: 'Logged out successfully' };
  },

  async getProfile() {
    return apiClient.get('/auth/profile');
  },

  async updateProfile(profileData) {
    return apiClient.put('/auth/profile', profileData);
  },

  async changePassword(passwordData) {
    return apiClient.put('/auth/change-password', passwordData);
  },

  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email });
  },

  isAuthenticated() {
    return !!apiClient.token;
  },

  getToken() {
    return apiClient.token;
  }
};

// Packages API
export const packagesAPI = {
  async getAll(params = {}) {
    const searchParams = new URLSearchParams(params);
    return apiClient.get(`/packages?${searchParams}`);
  },

  async getById(id) {
    return apiClient.get(`/packages/${id}`);
  },

  async getBySlug(slug) {
    return apiClient.get(`/packages/slug/${slug}`);
  },

  async getFeatured() {
    return apiClient.get('/packages/featured/list');
  },

  async getCategories() {
    return apiClient.get('/packages/categories/list');
  },

  async search(query) {
    return apiClient.get(`/packages/search?q=${encodeURIComponent(query)}`);
  },

  async addReview(packageId, reviewData) {
    return apiClient.post(`/packages/${packageId}/reviews`, reviewData);
  },

  // Admin methods
  async create(packageData) {
    return apiClient.post('/packages', packageData);
  },

  async update(id, packageData) {
    return apiClient.put(`/packages/${id}`, packageData);
  },

  async delete(id) {
    return apiClient.delete(`/packages/${id}`);
  }
};

// Bookings API
export const bookingsAPI = {
  async create(bookingData) {
    return apiClient.post('/bookings', bookingData);
  },

  async getMyBookings(params = {}) {
    const searchParams = new URLSearchParams(params);
    return apiClient.get(`/bookings/my-bookings?${searchParams}`);
  },

  async getById(id) {
    return apiClient.get(`/bookings/${id}`);
  },

  async cancel(id, reason) {
    return apiClient.put(`/bookings/${id}/cancel`, { reason });
  },

  async addPayment(id, paymentData) {
    return apiClient.post(`/bookings/${id}/payments`, paymentData);
  },

  async addReview(id, reviewData) {
    return apiClient.post(`/bookings/${id}/review`, reviewData);
  },

  // Admin methods
  async getAll(params = {}) {
    const searchParams = new URLSearchParams(params);
    return apiClient.get(`/bookings/admin/all?${searchParams}`);
  },

  async updateStatus(id, statusData) {
    return apiClient.put(`/bookings/${id}/status`, statusData);
  }
};

// Enquiries API
export const enquiriesAPI = {
  async create(enquiryData) {
    return apiClient.post('/enquiries', enquiryData);
  },

  async getMyEnquiries() {
    return apiClient.get('/enquiries/my-enquiries');
  },

  async getById(id) {
    return apiClient.get(`/enquiries/${id}`);
  },

  // Admin methods
  async getAll(params = {}) {
    const searchParams = new URLSearchParams(params);
    return apiClient.get(`/enquiries/admin/all?${searchParams}`);
  },

  async updateStatus(id, statusData) {
    return apiClient.put(`/enquiries/${id}/status`, statusData);
  },

  async addResponse(id, responseData) {
    return apiClient.post(`/enquiries/${id}/responses`, responseData);
  },

  async delete(id) {
    return apiClient.delete(`/enquiries/${id}`);
  },

  async getStats(period = 30) {
    return apiClient.get(`/enquiries/admin/stats?period=${period}`);
  }
};

// Admin API
export const adminAPI = {
  async getDashboardStats(period = 30) {
    return apiClient.get(`/admin/dashboard-stats?period=${period}`);
  },

  async getRecentActivities(limit = 20) {
    return apiClient.get(`/admin/recent-activities?limit=${limit}`);
  },

  async getAnalytics(params = {}) {
    const searchParams = new URLSearchParams(params);
    return apiClient.get(`/admin/analytics?${searchParams}`);
  },

  async getUsers(params = {}) {
    const searchParams = new URLSearchParams(params);
    return apiClient.get(`/auth/users?${searchParams}`);
  },

  async deleteUser(id) {
    return apiClient.delete(`/auth/users/${id}`);
  }
};

// Newsletter API (simple implementation)
export const newsletterAPI = {
  async subscribe(email) {
    // Simulate newsletter subscription
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Successfully subscribed to newsletter!' });
      }, 1000);
    });
  }
};

export default apiClient;