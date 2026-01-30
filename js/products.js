// products.js - PROFESSIONAL VERSION

let allProducts = [];
let activeCategoryId = null;

async function loadProducts() {
    try {
        showSkeletons();

        const { data, error } = await window.supabaseClient
            .from("products")
            .select("*")
            .eq("is_active", true);

        if (error) throw error;

        allProducts = data || [];
        renderProducts(allProducts);
        updateProductCount(allProducts.length);

    } catch (err) {
        console.error("Ürün yükleme hatası:", err);
        document.getElementById("product-grid").innerHTML =
            `<p style="color:red;">Ürünler yüklenemedi</p>`;
    }
}

function showSkeletons() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        grid.innerHTML += `<div class="skeleton-card"></div>`;
    }
}

function renderProducts(products) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    if (!products.length) {
        grid.innerHTML = `<p>Ürün bulunamadı</p>`;
        return;
    }

    products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${p.image_url}" alt="">
            <h3>${escapeHTML(p.name)}</h3>
            <p>${p.price.toFixed(2)} ₺</p>
            <button class="add-btn">Sepete Ekle</button>
        `;

        card.querySelector(".add-btn")
            .addEventListener("click", () => addToCart(p));

        grid.appendChild(card);
    });
}

function filterByCategory(id, name) {
    activeCategoryId = id;
    document.getElementById("page-name").innerText = name;
    applyFilters();
}

function applyFilters() {
    let filtered = [...allProducts];

    if (activeCategoryId) {
        filtered = filtered.filter(p => p.category_id === activeCategoryId);
    }

    const min = Number(document.getElementById("min-price").value) || 0;
    const max = Number(document.getElementById("max-price").value) || Infinity;

    filtered = filtered.filter(p => p.price >= min && p.price <= max);

    const sort = document.getElementById("sort-select").value;
    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);

    renderProducts(filtered);
    updateProductCount(filtered.length);
}

function updateProductCount(count) {
    document.getElementById("product-count").innerText = `${count} ürün`;
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}
