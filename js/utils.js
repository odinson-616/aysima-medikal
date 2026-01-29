// js/utils.js - Yardımcı fonksiyonlar
function escapeHtml(text) {
const map = {
'&': '&amp;',
'<': '&lt;',
'>': '&gt;',
'"': '&quot;',
"'": '&#039;'
};
return String(text).replace(/[&<>"']/g, m => map[m]);
}
function formatMoney(amount) {
return new Intl.NumberFormat('tr-TR', {
style: 'currency',
currency: 'TRY'
}).format(amount);
}
function formatDate(date) {
return new Intl.DateTimeFormat('tr-TR').format(new Date(date));
}
function showNotification(message, type = 'info') {
const notification = document.createElement('div');
notification.style.cssText = `
background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
`;
notification.textContent = message;
document.body.appendChild(notification);
setTimeout(() => notification.remove(), 3000);
}
