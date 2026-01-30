// ========================================
// UTILS.JS - Utility Functions
// ========================================

// Toast Notification System
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Loading Spinner
function showLoading(message = 'Yükleniyor...') {
    const existingSpinner = document.querySelector('.loading-spinner');
    if (existingSpinner) return;

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
        <div class="spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(spinner);
}

function hideLoading() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

// Format Price
function formatPrice(price) {
    if (!price && price !== 0) return '0.00 ₺';
    return parseFloat(price).toFixed(2) + ' ₺';
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Validate Email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate Phone
function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
}

// Debounce Function
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

// Generate Random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sanitize HTML
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Check if user is admin
async function isAdmin() {
    if (!window.supabaseClient) return false;

    try {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        
        if (error || !user) return false;

        // Check if user has admin role
        const { data: profile, error: profileError } = await window.supabaseClient
            .from('user_profiles')
            .select('is_admin')
            .eq('user_id', user.id)
            .single();

        if (profileError) {
            console.warn("Admin check failed:", profileError);
            return false;
        }

        return profile?.is_admin === true;
    } catch (err) {
        console.error("Admin check error:", err);
        return false;
    }
}

// Get Current User
async function getCurrentUser() {
    if (!window.supabaseClient) return null;

    try {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    } catch (err) {
        console.error("Get current user error:", err);
        return null;
    }
}

// Calculate Discount
function calculateDiscount(subtotal, coupon = null) {
    let discount = 0;
    let couponDiscount = 0;
    
    // Auto discount
    if (subtotal >= APP_CONFIG.autoDiscountThreshold) {
        discount = APP_CONFIG.autoDiscountAmount;
    }
    
    // Coupon discount
    if (coupon && coupon.is_active) {
        const now = new Date();
        const expiryDate = new Date(coupon.expiry_date);
        
        if (expiryDate >= now) {
            if (coupon.discount_type === 'percentage') {
                couponDiscount = (subtotal * coupon.discount_value) / 100;
            } else {
                couponDiscount = coupon.discount_value;
            }
        }
    }
    
    return {
        autoDiscount: discount,
        couponDiscount: couponDiscount,
        totalDiscount: discount + couponDiscount
    };
}

// Confirm Dialog
function confirm Modal(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Error Handler
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    let message = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    
    if (error.message) {
        message = error.message;
    }
    
    showToast(message, 'error');
}

// Local Storage Helpers
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error("Storage set error:", err);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (err) {
            console.error("Storage get error:", err);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error("Storage remove error:", err);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (err) {
            console.error("Storage clear error:", err);
            return false;
        }
    }
};

// Export utilities
window.utils = {
    showToast,
    showLoading,
    hideLoading,
    formatPrice,
    formatDate,
    validateEmail,
    validatePhone,
    debounce,
    generateId,
    sanitizeHTML,
    isAdmin,
    getCurrentUser,
    calculateDiscount,
    confirmModal,
    handleError,
    Storage
};
