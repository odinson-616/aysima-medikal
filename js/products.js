let allProducts = [];
let activeCategoryId = null;

// =============================
// ÜRÜNLERİ YÜKLE
// =============================
async function loadProducts() {
    try {
        const { data, error } = await window.supabaseClient
            .from("products")
            .select("*")
            .eq("is_active", true);

        if (error) throw error;

        allProducts = data || [];
        renderProducts(allProducts);

    } catch (err) {
        console.error("Ürün yükleme hatası:", err);
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

    const min = parseFloat(document.getElementById("min-price").value);
    const max = parseFloat(document.getElementById("max-price").value);

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
    const grid = document.getElementById("product-grid");
    const count = document.getElementById("product-count");

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
                <button onclick="addToCart('${p.id}')">Sepete Ekle</button>
            </div>
        `;

        grid.appendChild(card);
    });

    count.innerText = products.length + " ürün";
}
