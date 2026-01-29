async function loadProducts() {
    try {
        const { data: products, error: pError } = await window.supabase
            .from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
        
        const { data: categories, error: cError } = await window.supabase
            .from('categories').select('*').order('name');

        if (pError || cError) throw (pError || cError);

        window.APP.products = products || [];
        renderCategories(categories || []);
        renderProducts(window.APP.products);
    } catch (err) {
        console.error("Hata:", err.message);
    }
}

function renderCategories(categories) {
    const list = document.getElementById('category-list');
    if (!list) return;
    list.innerHTML = `<li onclick="renderProducts(window.APP.products)" style="padding:12px 15px; border-bottom:1px solid #f9f9f9; cursor:pointer; font-weight:bold; color:#7b1e2b;">Tümünü Gör</li>`;
    list.innerHTML += categories.map(cat => `
        <li onclick="filterByCategory('${cat.id}', '${cat.name}')" class="cat-item" style="padding:12px 15px; border-bottom:1px solid #f9f9f9; cursor:pointer; font-size:14px; transition:0.2s;">
            ${cat.name}
        </li>
    `).join('');
}

function filterByCategory(id, name) {
    document.getElementById('page-name').textContent = name;
    const filtered = window.APP.products.filter(p => p.category_id === id);
    renderProducts(filtered);
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    document.getElementById('product-count').textContent = `${products.length} ürün bulundu`;
    
    grid.innerHTML = products.map(p => `
        <div class="product-card" style="background:white; border:1px solid #eee; border-radius:8px; padding:15px; transition:0.3s; display:flex; flex-direction:column;">
            <img src="${p.image || p.image_url}" style="width:100%; height:160px; object-fit:contain; margin-bottom:10px;">
            <h3 style="font-size:14px; margin:0 0 10px 0; height:38px; overflow:hidden;">${p.name}</h3>
            <div style="font-size:18px; font-weight:800; color:#7b1e2b; margin-top:auto;">${p.price.toFixed(2)} ₺</div>
            <button onclick="addToCart('${p.id}')" style="margin-top:10px; background:#7b1e2b; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold;">SEPETE EKLE</button>
        </div>
    `).join('');
}

function doSearch(q) {
    const f = window.APP.products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    renderProducts(f);
}
