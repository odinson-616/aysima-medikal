// js/main.js
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Uygulama başlatılıyor...');
    
    // 1. Ürünleri yükle
    await loadProducts();
    
    // 2. Sepeti güncelle (Eğer cart.js içinde updateCartUI varsa)
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    } else if (typeof updateCart === 'function') {
        updateCart();
    }
    
    console.log('✅ Uygulama hazır.');
});

// Verileri localStorage'a yedekle
window.addEventListener('beforeunload', () => {
    localStorage.setItem('aysima_cart', JSON.stringify(window.APP.cart));
});
