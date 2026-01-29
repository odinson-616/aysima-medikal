/** Ürünleri ve Kategorileri Supabase'den Çek */
async function loadProducts() {
    try {
        console.log('📦 Veriler çekiliyor...');
        
        // 1. Ürünleri Çek
        const { data: products, error: pError } = await window.supabase
            .from('products')
            .select('*') 
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (pError) throw pError;
        window.APP.products = products || [];

        // 2. Kategorileri Çek
        const { data: categories, error: cError } = await window.supabase
            .from('categories')
            .select('*')
            .order('name');

        if (cError) throw cError;

        // Ekrana bas
        renderCategories(categories || []);
        renderProducts(window.APP.products);

    } catch (err) {
        console.error('❌ Yükleme hatası:', err.message);
        const grid = document.getElementById('product-grid');
        if (grid) grid.innerHTML = `<p style="color:red; text-align:center;">Hata: ${err.message}</p>`;
    }
}

/** Kategorileri Sidebar'a Yaz */
function renderCategories(categories) {
    const catList = document.getElementById('category-list');
    if (!catList) return;

    catList.innerHTML = `
        <li class="cat-item all-products" onclick="filterByCategory(null, 'Tüm Ürünler')">
            Tüm Ürünler
        </li>
    ` + categories.map(cat => `
        <li class="cat-item" onclick="filterByCategory('${cat.id}', '${cat.name}')">
            ${cat.name} <span>▶</span>
        </li>
    `).join('');
}

/** Kategori Filtreleme */
function filterByCategory(catId, catName) {
    document.getElementById('page-name').textContent = catName;
    
    const filtered = catId 
        ? window.APP.products.filter(p => p.category_id === catId)
        : window.APP.products;
    
    renderProducts(filtered);
}

/** Ürünleri Grid İçine Bas */
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    const countDisplay = document.getElementById('product-count');
    if (!grid) return;

    if (countDisplay) countDisplay.textContent = `${products.length} ürün bulundu`;

    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999; grid-column: 1/-1;">Bu kategoride henüz ürün bulunmuyor.</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const productImage = product.image_url || product.image || 'https://via.placeholder.com/300?text=Gorsel+Yok';
        const productPrice = product.price || 0;

        return `
        <div class="product-card">
            <div class="product-img-container">
                <img src="${productImage}" alt="${product.name}">
            </div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-footer">
                <span class="price">${productPrice.toFixed(2)} ₺</span>
                <button class="add-cart-btn" onclick="addToCart('${product.id}')">SEPETE EKLE</button>
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
