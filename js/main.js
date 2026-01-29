// js/main.js
console.log('🚀 Uygulama başlatılıyor...');

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 Sayfa yüklendi, veriler çekiliyor...');
    try {
        // 1. Ürünleri yükle (Kritik: Önce veriler gelmeli)
        await loadProducts();
        
        // 2. Sepeti güncelle (cart.js içinde updateCart fonksiyonun olmalı)
        if (typeof updateCart === 'function') {
            updateCart();
        }

        console.log('✅ Uygulama başarıyla yüklendi!');
    } catch (err) {
        console.error('❌ Uygulama yükleme hatası:', err);
    }
});

// Verileri kaydetme (Kapanışta)
window.addEventListener('beforeunload', function() {
    localStorage.setItem('aysima_cart', JSON.stringify(window.APP.cart));
});
