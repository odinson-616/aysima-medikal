// ============================================
// PRODUCTS FUNCTIONS
// ============================================

/** Supabase'den ürünleri çeken fonksiyon */
async function loadProducts() {
    try {
        console.log('📦 Ürünler çekiliyor...');
        
        // İlişki hatasını önlemek için sadece products tablosundan çekiyoruz
        const { data, error } = await window.supabase
            .from('products')
            .select('*') 
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('✅ Veri çekildi:', data);
        window.APP.products = data || [];
        
        // Ekrana basma fonksiyonunu tetikle
        renderProducts(window.APP.products);

    } catch (err) {
        console.error('❌ Ürün yükleme hatası:', err.message);
        const grid = document.getElementById('product-grid');
        if (grid) grid.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Hata: ${err.message}</p>`;
    }
}

/** Ürünleri HTML içine basan fonksiyon (Eksik olan kısım buydu) */
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999; grid-column: 1/-1;">Henüz ürün bulunmuyor.</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        // Veritabanındaki sütun isimlerine göre (image veya image_url) kontrol et
        const productImage = product.image_url || product.image || 'https://via.placeholder.com/300?text=Gorsel+Yok';
        const productPrice = product.price || 0;

        return `
        <div class="product-card" style="background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
            <div style="height: 180px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img src="${productImage}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            
            <h3 style="margin: 5px 0; font-size: 16px; color: #333; height: 40px; overflow: hidden; line-height: 1.3;">
                ${product.name}
            </h3>
            
            <div style="margin-top: auto;">
                <span style="font-size: 18px; font-weight: 800; color: #7b1e2b; display: block; margin-bottom: 10px;">
                    ${productPrice.toFixed(2)} ₺
                </span>
                
                <button class="add-cart-btn" onclick="addToCart('${product.id}')" 
                    style="width: 100%; background: #7b1e2b; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.3s;">
                    SEPETE EKLE
                </button>
            </div>
        </div>
        `;
    }).join('');
}

/** Arama Fonksiyonu */
function doSearch(query) {
    if (!window.APP.products) return;
    
    const filtered = window.APP.products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    );
    renderProducts(filtered);
}

console.log('✅ Products script yüklendi');
