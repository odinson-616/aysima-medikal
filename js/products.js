// products.js - Premium UI Version
// Güvenli render + indirim + animasyon + performans

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
                <div style="grid-column:1/-1; text-align:center; padding:50px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:60px;color:#e74c3c;"></i>
                    <p style="margin-top:15px;font-weight:700;">Ürünler yüklenemedi</p>
                    <button onclick="loadProducts()" style="margin-top:20px;padding:10px 20px;border-radius:8px;background:var(--bordo);color:white;border:none;">Tekrar Dene</button>
                </div>
            `;
        }
    }
}

// =============================
// FİLTRELER
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

    renderProducts(filtered);
}

// =============================
// İNDİRİM
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
// RENDER
// =============================
function renderProducts(products) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px;">
                <i class="fas fa-box-open" style="font-size:60px;color:#bdc3c7;"></i>
                <p style="margin-top:15px;font-weight:700;">Ürün bulunamadı</p>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const idStr = String(product.id);
        const name = String(product.name || "Ürün");
        const imageUrl = product.image_url || "https://via.placeholder.com/400x400";

        const priceInfo = getDiscountedPrice(product);

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <a href="product-detail.html?id=${idStr}">
                <div class="product-img-container">
                    <img src="${imageUrl}" alt="${escapeHtml(name)}">
                    ${priceInfo.hasDiscount ? `<span class="discount-badge">%${priceInfo.rate}</span>` : ""}
                </div>
                <div class="product-title">${escapeHtml(name)}</div>
            </a>

            <div class="product-footer">
                <div class="price-container">
                    ${
                        priceInfo.hasDiscount
                        ? `<span class="old-price">${priceInfo.oldPrice}₺</span>
                           <span class="price">${priceInfo.newPrice}₺</span>`
                        : `<span class="price">${priceInfo.price}₺</span>`
                    }
                </div>

                <button class="add-cart-btn">
                    <i class="fas fa-cart-plus"></i> Sepete Ekle
                </button>
            </div>
        `;

        const btn = card.querySelector(".add-cart-btn");
        btn.addEventListener("click", () => {
            if (typeof addToCart === "function") {
                addToCart(product);
                btn.innerHTML = `<i class="fas fa-check"></i> Eklendi`;
                setTimeout(() => {
                    btn.innerHTML = `<i class="fas fa-cart-plus"></i> Sepete Ekle`;
                }, 1200);
            }
        });

        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
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
