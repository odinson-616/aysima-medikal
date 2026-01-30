// cart.js - Sepet Yönetimi (PRO / Variant Ready)
// Notlar:
// - Eski akışı bozmaz (variants opsiyonel)
// - Ürün detaydan qty/variant ile eklemeyi destekler

let cart = [];

// =============================
// LOCAL STORAGE KEY
// =============================
const CART_STORAGE_KEY = "cart";

// =============================
// BAŞLANGIÇTA SEPET YÜKLE
// =============================
function initCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        cart = savedCart ? JSON.parse(savedCart) : [];

        // Eski kayıtları normalize et
        cart = (cart || []).map(i => ({
            key: i.key || buildCartKey(i.product_id || i.id, i.variant_id || null),
            product_id: i.product_id || i.id,
            variant_id: i.variant_id || null,
            sku: i.sku || null,
            name: i.name || "Ürün",
            variant_title: i.variant_title || null,
            price: Number(i.price || 0),
            image: i.image || i.image_url || "https://via.placeholder.com/80x80?text=Resim",
            qty: Number(i.qty || 1)
        }));

        saveCart();
        updateCartUI();
    } catch (error) {
        console.error("❌ Sepet yüklenirken hata:", error);
        cart = [];
        saveCart();
        updateCartUI();
    }
}

// =============================
// SEPET KAYDET
// =============================
function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("❌ Sepet kaydedilirken hata:", error);
    }
}

// =============================
// CART KEY (product + variant)
// =============================
function buildCartKey(productId, variantId) {
    const p = String(productId || "");
    const v = variantId ? String(variantId) : "";
    return v ? `${p}::${v}` : p;
}

// =============================
// SEPET SAYISINI GÜNCELLE
// =============================
function updateCartCount() {
    const totalQty = (cart || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) cartCountEl.innerText = totalQty;
}

// =============================
// SEPET UI'INI GÜNCELLE
// =============================
function updateCartUI() {
    updateCartCount();
    renderCart();
}

// =============================
// SEPET AÇ/KAPAT
// =============================
function toggleCart(open) {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("overlay");

    if (!sidebar || !overlay) return;

    if (open) {
        sidebar.classList.add("open");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        renderCart();
    } else {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}

// =============================
// SEPETE ÜRÜN EKLE (variant + qty destekli)
// product örnek:
// { id, name, price, image_url, qty?, variant_id?, variant_title?, sku? }
function addToCart(product) {
    try {
        if (!product || !product.id) throw new Error("Geçersiz ürün");

        const qtyToAdd = Math.max(1, Number(product.qty || 1));
        const productId = String(product.id);
        const variantId = product.variant_id ? String(product.variant_id) : null;

        const key = buildCartKey(productId, variantId);

        const name = String(product.name || "Ürün");
        const price = Number(product.price || 0);
        const image = product.image_url || product.image || "https://via.placeholder.com/80x80?text=Resim";

        const existing = cart.find(item => item.key === key);

        if (existing) {
            existing.qty = Number(existing.qty || 0) + qtyToAdd;
        } else {
            cart.push({
                key,
                product_id: productId,
                variant_id: variantId,
                sku: product.sku || null,
                name,
                variant_title: product.variant_title || null,
                price,
                image,
                qty: qtyToAdd
            });
        }

        saveCart();
        updateCartUI();
        toggleCart(true);

        if (typeof showNotification === "function") {
            showNotification(`${name} sepete eklendi!`, "success");
        }
    } catch (e) {
        console.error("❌ Sepete ekleme hatası:", e);
        alert("Ürün sepete eklenemedi!");
    }
}

// =============================
// MİKTAR DEĞİŞTİR
// =============================
function changeQty(cartKeyOrProductId, delta) {
    const key = String(cartKeyOrProductId);

    let item = cart.find(i => i.key === key);

    if (!item) {
        // fallback: product_id ile bul
        item = cart.find(i => String(i.product_id) === key);
    }

    if (!item) return;

    item.qty = Number(item.qty || 0) + Number(delta || 0);

    if (item.qty <= 0) {
        cart = cart.filter(i => i.key !== item.key);
    }

    saveCart();
    updateCartUI();
}

// =============================
// SEPETTEN ÜRÜN SİL
// =============================
function removeFromCart(cartKeyOrProductId) {
    const key = String(cartKeyOrProductId);

    const before = cart.length;
    cart = cart.filter(i => i.key !== key);

    if (cart.length === before) {
        cart = cart.filter(i => String(i.product_id) !== key);
    }

    saveCart();
    updateCartUI();
}

// =============================
// SEPETİ RENDER ET
// =============================
function renderCart() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    if (!container) return;

    container.innerHTML = "";

    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#7f8c8d;">
                <i class="fas fa-shopping-cart" style="font-size:64px; opacity:.25; margin-bottom:12px;"></i>
                <div style="font-weight:700; font-size:16px;">Sepetiniz boş</div>
                <div style="font-size:13px; margin-top:8px;">Ürünleri inceleyip sepetinize ekleyin.</div>
            </div>
        `;
        if (totalEl) totalEl.innerText = "0.00";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const price = Number(item.price || 0);
        const qty = Number(item.qty || 0);
        const itemTotal = price * qty;
        total += itemTotal;

        const variantLine = item.variant_title
            ? `<div style="color:#7f8c8d; font-size:12px; margin-top:2px;">${escapeHtml(item.variant_title)}</div>`
            : "";

        const div = document.createElement("div");
        div.className = "cart-item";
        div.style.cssText = "display:flex; gap:10px; padding:12px 0; border-bottom:1px solid #f0f2f5;";

        div.innerHTML = `
            <img src="${item.image}" alt="${escapeHtml(item.name)}"
                 style="width:64px; height:64px; object-fit:contain; background:#fafafa; border-radius:10px; padding:6px;"
                 onerror="this.src='https://via.placeholder.com/80x80?text=Resim'">
            <div style="flex:1;">
                <div style="font-weight:800; color:#2c3e50; line-height:1.2;">${escapeHtml(item.name)}</div>
                ${variantLine}
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
                    <div style="font-weight:800; color:var(--bordo);">${price.toFixed(2)} ₺</div>

                    <div style="display:flex; align-items:center; gap:6px;">
                        <button onclick="changeQty('${item.key}', -1)" title="Azalt" style="${miniBtnStyle()}"><i class="fas fa-minus"></i></button>
                        <span style="min-width:26px; text-align:center; font-weight:800;">${qty}</span>
                        <button onclick="changeQty('${item.key}', 1)" title="Artır" style="${miniBtnStyle()}"><i class="fas fa-plus"></i></button>
                        <button onclick="removeFromCart('${item.key}')" title="Sil" style="${miniBtnStyle(true)}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(div);
    });

    if (totalEl) totalEl.innerText = total.toFixed(2);
}

function miniBtnStyle(isDanger) {
    if (isDanger) {
        return "border:none; background:#e74c3c; color:#fff; width:34px; height:34px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;";
    }
    return "border:1px solid #e1e4e8; background:#fff; color:#2c3e50; width:34px; height:34px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;";
}

function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =============================
// SİPARİŞ MODALINI AÇ/KAPAT
// =============================
function openOrderModal() {
    const modal = document.getElementById("order-modal");
    const overlay = document.getElementById("order-overlay");
    if (modal && overlay) {
        modal.style.display = "block";
        overlay.style.display = "block";
    }
}

function closeOrderModal() {
    const modal = document.getElementById("order-modal");
    const overlay = document.getElementById("order-overlay");
    if (modal) modal.style.display = "none";
    if (overlay) overlay.style.display = "none";
}

// =============================
// CHECKOUT
// =============================
function handleCheckout() {
    if (!cart || cart.length === 0) {
        alert("Sepetiniz boş! Lütfen önce ürün ekleyin.");
        return;
    }

    const totalEl = document.getElementById("cart-total");
    const summaryEl = document.getElementById("summary-total");
    if (totalEl && summaryEl) summaryEl.innerText = totalEl.innerText;

    openOrderModal();
}

// =============================
// SİPARİŞ GÖNDER
// =============================
async function submitOrder(event) {
    event.preventDefault();

    const fullnameEl = document.getElementById("order-fullname");
    const phoneEl = document.getElementById("order-phone");
    const addressEl = document.getElementById("order-address");

    const fullname = fullnameEl ? fullnameEl.value.trim() : "";
    const phone = phoneEl ? phoneEl.value.trim() : "";
    const address = addressEl ? addressEl.value.trim() : "";

    if (!fullname || !phone || !address) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    if (phone.replaceAll(" ", "").length < 10) {
        alert("Lütfen geçerli bir telefon numarası girin!");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);

    try {
        const { data: order, error: orderError } = await window.supabaseClient
            .from("orders")
            .insert([{
                fullname,
                phone,
                address,
                total_amount: total,
                status: "Yeni"
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        const orderItems = cart.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.qty,
            unit_price: item.price,
            sku: item.sku
        }));

        const { error: itemsError } = await window.supabaseClient
            .from("order_items")
            .insert(orderItems);

        if (itemsError) throw itemsError;

        alert("🎉 Siparişiniz başarıyla alındı!\n\nSipariş No: " + order.id);

        cart = [];
        saveCart();
        updateCartUI();

        closeOrderModal();
        toggleCart(false);

        if (fullnameEl) fullnameEl.value = "";
        if (phoneEl) phoneEl.value = "";
        if (addressEl) addressEl.value = "";

    } catch (err) {
        console.error("❌ Sipariş gönderilirken hata:", err);
        alert("Sipariş gönderilemedi. Lütfen tekrar deneyin.\n\nHata: " + (err?.message || err));
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        toggleCart(false);
        closeOrderModal();
    }
});

initCart();
