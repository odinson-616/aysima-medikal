// products.js - Ürün Yönetimi (FIXED)

let allProducts = [];
let activeCategoryId = null;

// =============================
// ÜRÜNLERİ YÜKLE
// =============================
async function loadProducts() {
    try {
        const client = window.supabaseClient || window.supabase;
        if (!client) throw new Error("Supabase client yok");

        const { data, error } = await client
            .from("products")
            .select("*")
            .order("name");

        if (error) throw error;

        allProducts = data || [];
        renderProducts(allProducts);

    } catch (err) {
        console.error("❌ Ürün yükleme hatası:", err);
        const grid = document.getElementById("product-grid");
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px;color:#e74c3c;">
                    <p style="font-size:18px;font-weight:700;">Ürünler yüklenemedi</p>
                    <p style="color:#7f8c8d;">${err.message || ""}</p>
                    <button onclick="loadProducts()" style="margin-top:15px;padding:10px 18px;background:#7b1e2b;color:#fff;border:none;border-radius:8px;cursor:pointer;">
                        Tekrar Dene
                    </button>
                </div>
            `;
        }
    }
}

// =============================
// KATEGORİ FİLTRE
// =============================
function filterByCategory(id, name) {
    activeCategoryId = id;
    const pageNameEl = document.getElementById("page-name");
    if (pageNameEl) pageNameEl.innerText = name;

    applyFilters();
}

// =============================
// ARAMA + FİLTRE
// =============================
function doSearch(query) {
    let filtered = [...allProducts];

    if (query && query.trim()) {
        const searchTerm = query.trim().toLowerCase();
        filtered = filtered.filter(p =>
            (p.name || "").toLowerCase().includes(searchTerm) ||
            ((p.description || "").toLowerCase().includes(searchTerm))
        );
    }

    // Kategori filtresi (UUID/string uyumlu)
    if (activeCategoryId) {
        filtered = filtered.filter(p => String(p.category_id) === String(activeCategoryId));
    }

    // Fiyat filtresi
    const minPrice = parseFloat(document.getElementById("min-price")?.value || "");
    const maxPrice = parseFloat(document.getElementById("max-price")?.value || "");

    if (!isNaN(minPrice)) filtered = filtered.filter(p => Number(p.price || 0) >= minPrice);
    if (!isNaN(maxPrice)) filtered = filtered.filter(p => Number(p.price || 0) <= maxPrice);

    renderProducts(filtered);
}

function applyFilters() {
    const query = document.getElementById("search-input")?.value || "";
    doSearch(query);
}

function clearPriceFilter() {
    const minEl = document.getElementById("min-price");
    const maxEl = document.getElementById("max-price");
    if (minEl) minEl.value = "";
    if (maxEl) maxEl.value = "";
    applyFilters();
}

// =============================
// ÜRÜN RENDER
// =============================
function renderProducts(products) {
    const grid = document.getElementById("product-grid");
    const countEl = document.getElementById("product-count");
    if (!grid) return;

    grid.innerHTML = "";
    if (countEl) countEl.innerText = `${products.length} ürün`;

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#7f8c8d;">
                <i class="fas fa-search" style="font-size:56px;opacity:0.25;margin-bottom:16px;"></i>
                <p style="font-size:18px;font-weight:700;margin:0;">Ürün bulunamadı</p>
                <p style="margin-top:10px;">Filtreleri değiştirip tekrar deneyin.</p>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        const price = Number(product.price || 0);
        const formattedPrice = price.toFixed(2);
        const imageUrl = product.image_url || product.image || "https://via.placeholder.com/300x300?text=Urun";
        const safeName = (product.name || "Ürün").replace(/'/g, "\\'");

        // ✅ id UUID ise stringtir => onclick'te tırnak şart
        const idStr = String(product.id);

        card.innerHTML = `
            <a href="product-detail.html?id=${encodeURIComponent(idStr)}" style="text-decoration:none;color:inherit;">
                <div class="product-img-container">
                    <img src="${imageUrl}" alt="${safeName}"
                        onerror="this.src='https://via.placeholder.com/300x300?text=Resim'">
                </div>
                <div class="product-title">${product.name || "Ürün"}</div>
            </a>

            <div class="product-footer">
                <span class="price">${formattedPrice} ₺</span>
                <button class="add-cart-btn" onclick="addToCart({
                    id: '${idStr}',
                    name: '${safeName}',
                    price: ${price},
                    image_url: '${imageUrl}'
                })">
                    <i class="fas fa-cart-plus"></i> Ekle
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

// global yap
window.loadProducts = loadProducts;
window.applyFilters = applyFilters;
window.doSearch = doSearch;
window.filterByCategory = filterByCategory;
window.clearPriceFilter = clearPriceFilter;
