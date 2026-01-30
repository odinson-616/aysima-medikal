// products.js - Ürün Yönetimi

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
            .select("*")
            .order("name");

        if (error) throw error;

        console.log("✅ Ürünler alındı:", data);

        allProducts = data || [];
        renderProducts(allProducts);

    } catch (err) {
        console.error("❌ Ürün yükleme hatası:", err);
        const grid = document.getElementById("product-grid");
        if (grid) {
            grid.innerHTML = `
                <div style="
                    grid-column: 1/-1;
                    text-align: center;
                    padding: 40px;
                    color: #e74c3c;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p style="font-size: 18px; font-weight: 600;">Şu anda ürünler yüklenemiyor</p>
                    <p style="color: #7f8c8d; margin-top: 10px;">Lütfen sayfayı yenileyin veya birkaç dakika sonra tekrar deneyin.</p>
                    <button onclick="loadProducts()" style="
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: var(--bordo);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Tekrar Dene</button>
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
    if (pageNameEl) {
        pageNameEl.innerText = name;
    }
    
    // Kategori listesindeki aktif öğeyi vurgula
    document.querySelectorAll("#category-list li").forEach(li => {
        li.classList.remove("active");
    });
    
    applyFilters();
}

// =============================
// ARAMA FONKSİYONU
// =============================
function doSearch(query) {
    let filtered = [...allProducts];
    
    // Arama terimi varsa filtrele
    if (query && query.trim()) {
        const searchTerm = query.trim().toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Kategori filtresi varsa uygula
    if (activeCategoryId) {
        filtered = filtered.filter(p => p.category_id === activeCategoryId);
    }
    
    // Fiyat filtresi varsa uygula
    const minPriceEl = document.getElementById("min-price");
    const maxPriceEl = document.getElementById("max-price");
    
    const minPrice = minPriceEl ? parseFloat(minPriceEl.value) : NaN;
    const maxPrice = maxPriceEl ? parseFloat(maxPriceEl.value) : NaN;

    if (!isNaN(minPrice) && minPrice > 0) {
        filtered = filtered.filter(p => p.price >= minPrice);
    }

    if (!isNaN(maxPrice) && maxPrice > 0) {
        filtered = filtered.filter(p => p.price <= maxPrice);
    }
    
    renderProducts(filtered);
}

// =============================
// ARAMA VE FİLTRELEME
// =============================
function applyFilters() {
    const searchInput = document.getElementById("search-input");
    const query = searchInput ? searchInput.value : "";
    doSearch(query);
}

// =============================
// FİYAT FİLTRESİNİ TEMİZLE
// =============================
function clearPriceFilter() {
    const minPriceEl = document.getElementById("min-price");
    const maxPriceEl = document.getElementById("max-price");
    
    if (minPriceEl) minPriceEl.value = "";
    if (maxPriceEl) maxPriceEl.value = "";
    
    applyFilters();
}

// =============================
// ÜRÜN RENDER
// =============================
function renderProducts(products) {
    console.log("🎨 Render edilen ürün sayısı:", products.length);

    const grid = document.getElementById("product-grid");
    const countEl = document.getElementById("product-count");

    if (!grid) {
        console.error("❌ product-grid bulunamadı!");
        return;
    }

    grid.innerHTML = "";

    // Ürün sayısını güncelle - Element varsa
    if (countEl) {
        countEl.innerText = `${products.length} ürün`;
    } else {
        console.warn("⚠️ product-count elementi bulunamadı (opsiyonel)");
    }

    // Ürün yoksa
    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div style="
                grid-column: 1/-1;
                text-align: center;
                padding: 60px 20px;
                color: #7f8c8d;
            ">
                <i class="fas fa-search" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p style="font-size: 18px; font-weight: 600;">Ürün bulunamadı</p>
                <p style="margin-top: 10px;">Farklı bir kategori veya arama terimi deneyin.</p>
            </div>
        `;
        return;
    }

    // Ürünleri render et
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        
        // Fiyatı formatlama
        const formattedPrice = product.price ? product.price.toFixed(2) : "0.00";
        
        // Resim URL'si kontrolü - Placeholder ekle
        const imageUrl = product.image_url || "https://via.placeholder.com/200x200?text=Ürün+Resmi";

        card.innerHTML = `
            <div class="product-img-container">
                <img src="${imageUrl}" 
                     alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/200x200?text=Resim+Yüklenemedi'">
            </div>
            <div class="product-title">${product.name}</div>
            <div class="product-footer">
                <span class="price">${formattedPrice} ₺</span>
                <button onclick="addToCart({id:${product.id}, name:'${product.name.replace(/'/g, "\\'")}', price:${product.price}, image_url:'${imageUrl}'})" title="Sepete Ekle">
                    <i class="fas fa-cart-plus"></i> Ekle
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

// =============================
// BİLDİRİM GÖSTER
// =============================
function showNotification(message, type = "info") {
    // Varsa önceki bildirimi kaldır
    const existingNotif = document.querySelector(".notification");
    if (existingNotif) {
        existingNotif.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        min-width: 250px;
        font-weight: 600;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animasyonlar için CSS ekle
if (!document.getElementById("notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
