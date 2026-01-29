// js/products.js
async function loadProducts() {
    const grid = document.getElementById('product-grid');
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
    } catch (err) {
        console.error('❌ Ürün yükleme hatası:', err.message);
        if (grid) grid.innerHTML = `<p style="color:red; text-align:center;">Hata: ${err.message}</p>`;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Ürün bulunamadı.</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const variant = product.product_variants && product.product_variants[0];
        const price = variant ? variant.price : (product.price || 0);
        const image = product.image_url || 'https://via.placeholder.com/300?text=Gorsel+Yok';

        return `
        <div class="product-card" style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px; display:flex; flex-direction:column; gap:10px;">
            <div style="height:150px; overflow:hidden;">
                <img src="${image}" alt="${product.name}" style="width:100%; height:100%; object-fit:contain;">
            </div>
            <h3 style="font-size:15px; margin:0; height:40px; overflow:hidden; color:#333;">${product.name}</h3>
            <p style="color: #7b1e2b; font-weight:800; font-size:18px; margin:0;">${price} ₺</p>
            <button onclick="addToCart('${product.id}')" style="width:100%; background:#7b1e2b; color:white; border:none; padding:12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:13px;">SEPETE EKLE</button>
        </div>`;
    }).join('');
}

function doSearch(query) {
    const filtered = window.APP.products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
    );
    renderProducts(filtered);
}
