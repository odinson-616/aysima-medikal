// js/main.js - Uygulamayı başlat
document.addEventListener('DOMContentLoaded', async function() {
console.log('🚀 Uygulama başlatılıyor...');
updateUserUI();
updateCartUI();
await loadCategories();
console.log('✅ Uygulama hazır!');
});
