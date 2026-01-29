// ============================================
// MAIN APPLICATION
// ============================================
console.log('🚀 Uygulama başlatılıyor...');
// Sayfadan yüklendikten sonra başlat
document.addEventListener('DOMContentLoaded', async function() {
console.log('📄 index loaded');
// 1. Mevcut kullanıcıyı kontrol et
await checkCurrentUser();
// 2. Ürünleri yükle
await loadProducts();
// 3. Sepeti güncelle
updateCart();
console.log('✅ Uygulama başarıyla yüklendi!');
});
// Sayfa kapatılmadan önce verileri kaydet
window.addEventListener('beforeunload', function() {
setLocalStorage('cart', window.APP.cart);
if (window.APP.currentUser) {
setLocalStorage('user', window.APP.currentUser);
}
});
console.log('✅ Main loaded successfully');
