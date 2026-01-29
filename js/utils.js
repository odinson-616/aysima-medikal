// ============================================
// UTILITY FUNCTIONS
// ============================================
/**
*/
function formatPrice(price) {
return new Intl.NumberFormat('tr-TR', {
style: 'currency',
currency: 'TRY'
}).format(price);
}
/**
*/
function getUrlParam(param) {
const params = new URLSearchParams(window.location.search);
return params.get(param);
}
/**
*/
function setLocalStorage(key, value) {
localStorage.setItem(key, JSON.stringify(value));
}
/**
*/
function getLocalStorage(key) {
const data = localStorage.getItem(key);
return data ? JSON.parse(data) : null;
}
/**
*/
function removeLocalStorage(key) {
localStorage.removeItem(key);
}
/**
*/
function formatDate(date) {
return new Date(date).toLocaleDateString('tr-TR', {
year: 'numeric',
month: 'long',
day: 'numeric'
});
}
/**
*/
function formatTime(date) {
return new Date(date).toLocaleTimeString('tr-TR', {
hour: '2-digit',
minute: '2-digit'
});
}
/**
*/
function generateId() {
return '_' + Math.random().toString(36).substr(2, 9);
}
/**
*/
function isValidEmail(email) {
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(email);
}
/**
*/
function isValidPhone(phone) {
const regex = /^(\+90|0)?[1-9]\d{9}$/;
return regex.test(phone.replace(/\s/g, ''));
}
/**
*/
function showNotification(message, type = 'info') {
const notification = document.createElement('div');
notification.className = `notification notification-${type}`;
notification.textContent = message;
notification.style.cssText = `
background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
`;
document.body.appendChild(notification);
setTimeout(() => notification.remove(), 3000);
}
/**
*/
function showLoading(show = true) {
let loader = document.getElementById('loader');
if (!loader) {
loader = document.createElement('div');
loader.id = 'loader';
loader.style.cssText = `
`;
document.body.appendChild(loader);
}
loader.style.display = show ? 'block' : 'none';
loader.innerHTML = show ? '<p style="text-align:center;">Yükleniyor...</p>' : '';
}
console.log('✅ Utils loaded successfully');
