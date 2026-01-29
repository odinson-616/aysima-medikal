// ============================================
// UTILITY FUNCTIONS
// ============================================

/** Fiyat Biçimlendirme */
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

/** Sepet Sidebar Kontrolü (YENİ EKLENDİ - KRİTİK) */
function toggleCart(show) {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    if (!sidebar || !overlay) return;

    if (show) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    } else {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
}

/** LocalStorage İşlemleri */
function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function removeLocalStorage(key) {
    localStorage.removeItem(key);
}

/** Bildirim Sistemi (Güzelleştirildi) */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Sabit stil ekledik ki ekranda düzgün görünsün
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px; 
        border-radius: 5px; color: white; z-index: 9999; font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

/** Yükleme Ekranı */
function showLoading(show = true) {
    let loader = document.getElementById('loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        document.body.appendChild(loader);
    }
    loader.style.cssText = show ? `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255,255,255,0.8); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
    ` : 'display: none;';
    loader.innerHTML = show ? '<div style="color:var(--bordo); font-weight:bold;">Yükleniyor...</div>' : '';
}

/** Diğer Yardımcılar */
function getUrlParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

console.log('✅ Utils loaded successfully');
