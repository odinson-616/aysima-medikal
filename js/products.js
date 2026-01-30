let allProducts = [];
let activeCategoryId = null;

// =============================
// ÜRÜNLERİ YÜKLE
// =============================
async function loadProducts() {
    console.log("🔄 Ürünler yükleniyor...");

    try {
        const { data, error } = await window.supabaseClient
            .from("products")
            .select("*");

        if (error) throw error;

        console.log("✅ Ürünler alındı:", data);

        allProducts = data || [];
        renderProducts(allProducts);

    } catch (err) {
        console.error("❌ Ürün yükleme hatası:", err);
        document.getElementById("product-grid").innerHTML =
            "<p style='color:red;'>Ürünler yüklenemedi</p>";
    }
}

// =============================
// KATEGORİ FİLTRE
// =============================
function filterByCategory(id, name) {
    activeCategoryId = id;
    document.getElementById("page-name").innerText = name;
    applyFilters();
}

// =============================
// FİLTRELE
// =============================
function applyFilters() {
    let filtered = [...allProducts];

    const min = parseFloat(document.getElementById("min-price")?.value);
    const max = parseFloat(document.getElementById("max-price")?.value);

    if (activeCategoryId) {
        filtered = filtered.filter(p => p.category_id === activeCategoryId);
    }

    if (!isNaN(min)) {
        filtered = filtered.filter(p => p.price >= min);
    }

    if (!isNaN(max)) {
        filtered = filtered.filter(p => p.price <= max);
    }

    renderProducts(filtered);
}

// =============================
// RENDER
// =============================
function renderProducts(products) {
    console.log("🎨 Render edilen ürün sayısı:", products.length);

    const grid = document.getElementById("product-grid");
    const count = document.getElementById("product-count");

    if (!grid) {
        console.error("❌ product-grid bulunamadı!");
        return;
    }

    grid.innerHTML = "";

    if (!products.length) {
        grid.innerHTML = "<p>Ürün bulunamadı</p>";
        count.innerText = "0 ürün";
        return;
    }

    products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-img-container">
                <img src="${p.image_url || 'https://via.placeholder.com/200'}">
            </div>
            <div class="product-title">${p.name}</div>
            <div class="product-footer">
                <span class="price">${p.price} ₺</span>
                <button onclick="alert('Sepete eklendi')">Sepete Ekle</button>
            </div>
        `;

        grid.appendChild(card);
    });

    count.innerText = products.length + " ürün";
}
