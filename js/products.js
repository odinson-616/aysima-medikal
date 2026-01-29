async function loadProducts() {
    try {
        if (typeof showLoading === 'function') showLoading(true);
        console.log('📦 Ürünler yükleniyor...');

        // Varyantları da çekmek için select güncellendi
        const { data, error } = await window.supabase
            .from('products')
            .select('*, product_variants(*)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Ürün yükleme hatası:', error);
            if (typeof showNotification === 'function') showNotification('Ürünler yüklenemedi: ' + error.message, 'error');
            return;
        }

        console.log('✅ Ürünler yüklendi:', data);
        window.APP.products = data || [];
        renderProducts(window.APP.products);

    } catch (err) {
        console.error('❌ Hata:', err);
    } finally {
        if (typeof showLoading === 'function') showLoading(false);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999; grid-column: 1/-1;">Ürün bulunamadı</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        // Varsayılan varyanttan fiyat al (Varyant yoksa product.price kullan)
        const activeV = product.product_variants ? product.product_variants[0] : null;
        const price = activeV ? activeV.price : (product.price || 0);
        const image = product.image_url || 'https://via.placeholder.com/300?text=Gorsel+Yok';

        return `
        <div class="product-card" style="background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; position: relative;">
            <div style="height: 180px; overflow: hidden; margin-bottom: 10px;">
                <img src="${image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            
            ${product.discount > 0 ? `<span style="position: absolute; top: 10px; right: 10px; background: #7b1e2b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">-${product.discount}%</span>` : ''}
            
            <h3 style="margin: 5px 0; font-size: 15px; color: #333; height: 40px; overflow: hidden;">${product.name}</h3>
            
            <div style="margin: 10px 0;">
                <span style="font-size: 18px; font-weight: 800; color: #7b1e2b;">${price} TL</span>
            </div>

            <div style="display: flex; gap: 8px; margin-top: auto;">
                <button onclick="addToCart('${product.id}')" style="flex: 3; background: #7b1e2b; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">SEPETE EKLE</button>
                <button onclick="toggleFavorite('${product.id}')" style="flex: 1; background: #f4f4f4; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">❤️</button>
            </div>
        </div>
        `;
    }).join('');
}
