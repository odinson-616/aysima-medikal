// products.js - Ürün Yönetimi (PRO / Safe Rendering + Discount)
// Özellikler:
// - Güvenli render (XSS koruma)
// - UUID uyumlu
// - Arama / kategori / fiyat filtre
// - Sepete ekle çalışır
// - İndirim sistemi destekli
// - Ürün kartına tıklayınca detay sayfasına gider

let allProducts = [];
let activeCategoryId = null;

// =============================
// ÜRÜNLERİ YÜKLE
// =============================
async function loadProducts() {
    try {
        const client = window.supabaseClient || window.supabase;
        if (!client) throw new Error("SupabaseClient bulunamadı");

        const { data, error } = await client
            .from("products")
            .select("*")
            .order("name");

        if (error) throw error;

        allProducts = data || [];
        applyFilters();

    } catch (err) {
        console.error("❌ Ürün yükleme hatası:", err);

        const grid = document.getElementById("product-grid");
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:40px; color:#e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size:48px; margin-bottom:15px;"></i>
                    <p style="font-size:18px; font-weight:700;">Şu anda ürünler yüklenemiyor</p>
                    <button onclick="loadProducts()" style="margin-top:18px; padding:10px 18px; background:var(--bordo); color:#fff; border:none; border-radius:10px; cursor:pointer; font-weight:800;">
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
    activeCategoryId = id || null;

    const pageNameEl = document.getElementById("page-name");
    if (pageNameEl) pageNameEl.innerText = name || "Tüm Ürünler";

    applyFilters();
}

// =============================
// ARAMA + FİLTRE
// =============================
function applyFilters() {
    const searchInput = document.getElementById("search-input");
    const query = searchInput ? searchInput.value : "";

    let filtered = [...(allProducts || [])];

    if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        filtered = filtered.filter(p =>
            String(p.name || "").toLowerCase().includes(q) ||
            String(p.description || "").toLowerCase().includes(q)
        );
    }

    if (activeCategoryId) {
        filtered = filtered.filter(p => String(p.category_id) === String(activeCategoryId));
    }

    const minPriceEl = document.getElementById("min-price");
    const maxPriceEl = document.getElementById("max-price");

    const minPrice = minPriceEl ? Number(minPriceEl.value) : NaN;
    const maxPrice = maxPriceEl ? Number(maxPriceEl.value) : NaN;

    if (!Number.isNaN(minPrice) && minPrice > 0)
        filtered = filtered.filter(p => Number(p.price || 0) >= minPrice);

    if (!Number.isNaN(maxPrice) && maxPrice > 0)
        filtered = filtered.filter(p => Number(p.price || 0) <= maxPrice);

    renderProducts(filtered);
}

function doSearch() {
    applyFilters();
}

function clearPriceFilter() {
    const minPriceEl = document.getElementById("min-price");
    const maxPriceEl = document.getElementById("max-price");
    if (minPriceEl) minPriceEl.value = "";
    if (maxPriceEl) maxPriceEl.value = "";
    applyFilters();
}

// =============================
// İNDİRİM HESAPLAMA
// =============================
function getDiscountedPrice(p) {
    const price = Number(p.price || 0);

    if (p.discount_active && p.discount_rate) {
        const rate = Number(p.discount_rate || 0);
        const discounted = price - (price * rate / 100);
        return {
            hasDiscount: true,
            oldPrice: price.toFixed(2),
            newPrice: discounted.toFixed(2),
            rate
        };
    }

    return {
        hasDiscount: false,
        price: price.toFixed(2)
    };
}

// =============================
// FİYAT HTML RENDER
// =============================
function renderPriceHTML(product) {
    const d = getDiscountedPrice(product);

    if (!d.hasDiscount) {
        return `<span class="price">${d.price} ₺</span>`;
    }

    return `
        <div class="price-box">
            <span class="old-price">${d.oldPrice} ₺</span>
            <span class="new-price">${d.newPrice} ₺</span>
            <span class="discount-badge">-%${d.rate}</span>
        </div>
    `;
}

// =============================
// ÜRÜN RENDER
// =============================
function renderProducts(products) {
    const grid = document.getElementById("product-grid");
    const countEl = document.getElementById("product-count");

    if (!grid) return;

    grid.innerHTML = "";

    if (countEl) countEl.innerText = `${(products || []).length} ürün`;

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#7f8c8d;">
                <i class="fas fa-search" style="font-size:64px; margin-bottom:20px; opacity:.25;"></i>
                <p style="font-size:18px; font-weight:800;">Ürün bulunamadı</p>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const idStr = String(product.id);
        const name = String(product.name || "Ürün");
        const imageUrl = product.image_url || "https://via.placeholder.com/400x400?text=Ürün";

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <a href="product-detail.html?id=${encodeURIComponent(idStr)}" class="product-link" style="text-decoration:none; color:inherit;">
                <div class="product-img-container">
                    <img src="${imageUrl}" alt="${escapeHtml(name)}"
                        onerror="this.src='https://via.placeholder.com/400x400?text=Resim+Yok'">
                </div>
                <div class="product-title">${escapeHtml(name)}</div>
            </a>

            <div class="product-footer">
                ${renderPriceHTML(product)}
                <button type="button" class="add-cart-btn">
                    <i class="fas fa-cart-plus"></i> Sepete Ekle
                </button>
            </div>
        `;

        const btn = card.querySelector(".add-cart-btn");
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (typeof addToCart !== "function") {
                alert("Sepet sistemi yüklenemedi!");
                return;
            }

            addToCart({
                id: idStr,
                name,
                price: Number(product.price || 0),
                image_url: imageUrl,
                qty: 1
            });
        });

        grid.appendChild(card);
    });
}

// =============================
// XSS KORUMA
// =============================
function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
