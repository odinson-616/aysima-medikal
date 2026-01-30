// js/main.js
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Uygulama başlatılıyor...');
    
    // Duyuru bandını yükle
    await loadAnnouncement();
    
    // 1. Ürünleri yükle
    await loadProducts();
    
    // 2. Sepeti güncelle
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    } else if (typeof updateCart === 'function') {
        updateCart();
    }
    
    console.log('✅ Uygulama hazır.');
});

/** Duyuru Metnini Supabase'den Çek */
async function loadAnnouncement() {
    try {
        const { data, error } = await window.supabase
            .from('site_settings')
            .select('announcement_text')
            .eq('id', 1)
            .single();

        const barText = document.getElementById('announcement-text');
        if (error) throw error;

        if (barText && data) {
            // Metni yan yana 3 kez ekliyoruz ki kayarken boşluk kalmasın
            const text = data.announcement_text;
            barText.textContent = `${text} • ${text} • ${text} • ${text}`;
        }
    } catch (err) {
        console.error("Duyuru hatası:", err);
        // Hata durumunda varsayılan bir metin göster veya bandı gizle
        document.getElementById('announcement-text').textContent = "Aysima Medikal - Sağlık Marketiniz";
    }
}

// Verileri localStorage'a yedekle
window.addEventListener('beforeunload', () => {
    localStorage.setItem('aysima_cart', JSON.stringify(window.APP.cart));
});
