// utils.js - Yardımcı Fonksiyonlar

// =============================
// FİYAT FORMATLAMA
// =============================
function formatPrice(price) {
    if (typeof price !== 'number') {
        price = parseFloat(price) || 0;
    }
    return price.toFixed(2) + " ₺";
}

// =============================
// TARİH FORMATLAMA
// =============================
function formatDate(dateString) {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('tr-TR', options);
}

// =============================
// TELEFON FORMATLAMA
// =============================
function formatPhone(phone) {
    if (!phone) return "";
    
    // Sadece rakamları al
    const cleaned = phone.replace(/\D/g, '');
    
    // 0555 123 45 67 formatına dönüştür
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    
    return phone;
}

// =============================
// TELEFON DOĞRULAMA
// =============================
function validatePhone(phone) {
    if (!phone) return false;
    
    const cleaned = phone.replace(/\D/g, '');
    
    // Türkiye telefon numarası: 05XX XXX XX XX
    return cleaned.length === 11 && cleaned.startsWith('0');
}

// =============================
// EMAIL DOĞRULAMA
// =============================
function validateEmail(email) {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// =============================
// METİN KISALTMA
// =============================
function truncateText(text, maxLength = 100) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + "...";
}

// =============================
// DEBOUNCE (Arama için kullanışlı)
// =============================
function debounce(func, wait = 300) {
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

// =============================
// TOAST BİLDİRİM
// =============================
function showToast(message, type = 'info', duration = 3000) {
    // Varsa önceki toast'ı kaldır
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 99999;
        animation: slideInRight 0.3s ease;
        min-width: 250px;
        max-width: 400px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}" style="font-size: 20px;"></i>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.7;
            padding: 0;
            width: 24px;
            height: 24px;
        ">×</button>
    `;

    document.body.appendChild(toast);

    // Belirtilen süre sonra kaldır
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Toast animasyonları için CSS ekle
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// =============================
// ONAY DİYALOĞU
// =============================
function confirmDialog(message, onConfirm, onCancel) {
    if (confirm(message)) {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    } else {
        if (typeof onCancel === 'function') {
            onCancel();
        }
    }
}

// =============================
// LOADING SPINNER
// =============================
function showLoading(message = 'Yükleniyor...') {
    // Varsa önceki loading'i kaldır
    const existingLoader = document.getElementById('loading-overlay');
    if (existingLoader) {
        existingLoader.remove();
    }

    const loader = document.createElement('div');
    loader.id = 'loading-overlay';
    loader.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        backdrop-filter: blur(3px);
    `;

    loader.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            border: 5px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        <p style="
            color: white;
            margin-top: 20px;
            font-size: 16px;
            font-weight: 600;
        ">${message}</p>
    `;

    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.remove();
    }
}

// Spinner animasyonu için CSS ekle
if (!document.getElementById('spinner-animation')) {
    const style = document.createElement('style');
    style.id = 'spinner-animation';
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// =============================
// COPY TO CLIPBOARD
// =============================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Panoya kopyalandı!', 'success', 2000);
        return true;
    } catch (err) {
        console.error('Kopyalama hatası:', err);
        showToast('Kopyalama başarısız!', 'error', 2000);
        return false;
    }
}

// =============================
// SCROLL TO TOP
// =============================
function scrollToTop(smooth = true) {
    window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
    });
}

// =============================
// LOCAL STORAGE HELPERS
// =============================
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (err) {
        console.error('localStorage kayıt hatası:', err);
        return false;
    }
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
        console.error('localStorage okuma hatası:', err);
        return defaultValue;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (err) {
        console.error('localStorage silme hatası:', err);
        return false;
    }
}

// =============================
// RANDOM ID OLUŞTURMA
// =============================
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =============================
// URL PARAMETRELER
// =============================
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

// =============================
// SAYFA GÖRÜNÜRLÜĞÜ
// =============================
function isElementInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// =============================
// RAKAM FORMATLAMA (1000 -> 1.000)
// =============================
function formatNumber(number) {
    if (typeof number !== 'number') {
        number = parseFloat(number) || 0;
    }
    return number.toLocaleString('tr-TR');
}

// =============================
// CONSOLE LOG HELPER (Development)
// =============================
function log(message, type = 'info') {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    if (!isDevelopment) return; // Production'da log gösterme
    
    const styles = {
        info: 'color: #3498db; font-weight: bold;',
        success: 'color: #27ae60; font-weight: bold;',
        error: 'color: #e74c3c; font-weight: bold;',
        warning: 'color: #f39c12; font-weight: bold;'
    };
    
    console.log(`%c[${type.toUpperCase()}] ${message}`, styles[type] || styles.info);
}

// =============================
// PERFORMANCE TIMER
// =============================
class Timer {
    constructor(name) {
        this.name = name;
        this.start = performance.now();
    }
    
    end() {
        const duration = performance.now() - this.start;
        log(`${this.name} tamamlandı: ${duration.toFixed(2)}ms`, 'info');
        return duration;
    }
}

// Kullanım: 
// const timer = new Timer('Veri yükleme');
// // ... işlemler
// timer.end();
