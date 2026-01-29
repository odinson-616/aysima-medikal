// js/products.js
async function loadProducts() {
    try {
        console.log('📦 Ürünler çekiliyor...');
        const { data, error } = await window.supabase
            .from('products')
            .select('*, product_variants(*)')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        window.APP.products = data || [];
        renderProducts(window.APP.products);
        console.log('✅ Ürünler başarıyla render edildi');
    } catch (err) {
        console.error('❌ Ürün yükleme hatası:', err.message);
        const grid = document.getElementById('product-grid');
        if (grid) grid.innerHTML = '<p>Ürünler şu an yüklenemedi: ' + err.message + '</p>';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Ürün bulunamadı</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const variant = product.product_variants && product.product_variants[0];
        const price = variant ? variant.price : (product.price || 0);
        const image = product.image_url || 'https://via.placeholder.com/300?text=Gorsel+Yok';

        return `
        <div class="product-card" style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px; display:flex; flex-direction:column;">
            <div style="height:150px; overflow:hidden; margin-bottom:10px;">
                <img src="${image}" alt="${product.name}" style="width:100%; height:100%; object-fit:contain;">
            </div>
            <h3 style="font-size:15px; margin:5px 0; height:40px; overflow:hidden;">${product.name}</h3>
            <div style="margin-top:auto;">
                <p style="color: #7b1e2b; font-weight:800; font-size:18px; margin:10px 0;">${price} ₺</p>
                <button onclick="addToCart('${product.id}')" style="width:100%; background:#7b1e2b; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold;">SEPETE EKLE</button>
            </div>
        </div>`;
    }).join('');
}

// Arama Fonksiyonu
function doSearch(query) {
    const filtered = window.APP.products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    );
    renderProducts(filtered);
}
