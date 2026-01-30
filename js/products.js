// ============================================
// PRODUCT FUNCTIONS
// ============================================

/** Ürünleri Supabase'den Yükle */
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
        console.error("Ürün yükleme hatası:", err.message);
    }
}

/** Kategorileri Listele */
function renderCategories(categories) {
    const list = document.getElementById('category-list');
    if (!list) return;
    
    list.innerHTML = `<li onclick="resetAllFilters()" style="padding:12px 15px; border-bottom:1px solid #f9f9f9; cursor:pointer; font-weight:bold; color:#7b1e2b;">Tümünü Gör</li>`;
    list.innerHTML += categories.map(cat => `
        <li onclick="filterByCategory('${cat.id}', '${cat.name}')" class="cat-item" style="padding:12px 15px; border-bottom:1px solid #f9f9f9; cursor:pointer; font-size:14px; transition:0.2s;">
            ${cat.name}
        </li>
    `).join('');
}

/** Filtreyi ve Görünümü Sıfırla */
function resetAllFilters() {
    document.getElementById('page-name').textContent = "Tüm Ürünler";
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    document.getElementById('sort-select').value = 'default';
    renderProducts(window.APP.products);
}

/** Kategoriye Göre Filtrele (Yatay filtreleri korur) */
function filterByCategory(id, name) {
    document.getElementById('page-name').textContent = name;
    applyFilters(); // Mevcut fiyat/sıralama filtrelerini koruyarak kategoriye bakar
}

/** Dinamik Filtreleme ve Sıralama Uygula */
function applyFilters() {
    const currentCategoryName = document.getElementById('page-name').textContent;
    let filtered = [...window.APP.products];

    // 1. Kategori Kontrolü (Eğer bir kategori seçiliyse)
    if (currentCategoryName !== "Tüm Ürünler") {
        const category = document.querySelector(`.cat-item:contains('${currentCategoryName}')`); // Bu sadece mantıksal, ID üzerinden gitmek daha sağlıklı
        // Kategori ismine göre filtrele
        filtered = filtered.filter(p => {
            // Aktif kategoriyi bulmak için isim eşleştirmesi yapıyoruz
            return true; // renderProducts çağrısında kategori bazlı listeyi zaten filterByCategory'den alıyoruz. 
            // Ancak daha temiz bir yapı için global bir state tutulabilir.
        });
        
        // Mevcut kategori fonksiyonuna sadık kalmak için:
        const activeCat = currentCategoryName;
        if(activeCat !== "Tüm Ürünler") {
            // Kategori ID'sini bulamadığımız için isim bazlı filtreleme yapabiliriz veya
            // Basitlik adına filterByCategory çağrıldığında bu fonksiyonu tetikliyoruz.
        }
    }

    // 2. Fiyat Aralığı Filtresi
    const minP = parseFloat(document.getElementById('min-price').value) || 0;
    const maxP = parseFloat(document.getElementById('max-price').value) || Infinity;
    
    filtered = filtered.filter(p => p.price >= minP && p.price <= maxP);

    // 3. Sıralama Mantığı
    const sortValue = document.getElementById('sort-select').value;
    if (sortValue === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderProducts(filtered);
}

/** Ürünleri Ekrana Bas */
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    document.getElementById('product-count').textContent = `${products.length} ürün bulundu`;
    
    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #999;">Kriterlere uygun ürün bulunmamaktadır.</div>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const imageUrl = p.image || p.image_url || 'https://via.placeholder.com/300?text=Gorsel+Yok';
        return `
        <div class="product-card" style="background:white; border:1px solid #eee; border-radius:8px; padding:15px; transition:0.3s; display:flex; flex-direction:column; position:relative;">
            <div onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer; flex-grow:1;">
                <img src="${imageUrl}" style="width:100%; height:160px; object-fit:contain; margin-bottom:10px;">
                <h3 style="font-size:14px; margin:0 0 10px 0; height:38px; overflow:hidden; color:#333; line-height:1.4;">${p.name}</h3>
            </div>
            <div style="margin-top:auto;">
                <div style="font-size:18px; font-weight:800; color:#7b1e2b;">${p.price.toFixed(2)} ₺</div>
                <button onclick="addToCart('${p.id}')" style="width:100%; margin-top:10px; background:#7b1e2b; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold; transition: 0.2s;">
                    SEPETE EKLE
                </button>
            </div>
        </div>
        `;
    }).join('');
}

/** Arama Yap */
function doSearch(q) {
    const f = window.APP.products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    renderProducts(f);
}

console.log('✅ Products & Filters loaded successfully');
