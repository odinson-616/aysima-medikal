// cart.js - Sepet Yönetimi (FIXED)

let cart = [];

// =============================
// BAŞLANGIÇTA SEPET YÜKLE
// =============================
function initCart() {
    try {
        const savedCart = localStorage.getItem("cart");
        cart = savedCart ? JSON.parse(savedCart) : [];
        // ✅ Eski kayıtlar qty'siz kalmışsa düzelt
        cart = (cart || []).map(i => ({
            ...i,
            qty: Number(i.qty || 1),
            price: Number(i.price || 0),
            id: String(i.id)
        }));
        updateCartUI();
    } catch (error) {
        console.error("❌ Sepet yüklenirken hata:", error);
        cart = [];
        updateCartUI();
    }
}

// =============================
// SEPET KAYDET
// =============================
function saveCart() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
        console.error("❌ Sepet kaydedilirken hata:", error);
    }
}

// =============================
// SEPET SAYISINI GÜNCELLE
// =============================
function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) cartCountEl.innerText = totalQty;
}

// =============================
// SEPET UI
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
// SEPETE EKLE
// product object bekler (id,name,price,image_url)
// ayrıca yanlışlıkla id string gelirse de kırılmaz
// =============================
function addToCart(productOrId) {
    // Eğer string gelirse: sadece uyar
    if (typeof productOrId === "string") {
        alert("Sepete ekleme hatası: ürün objesi yerine id gönderilmiş. (Düzeltildi ama eski çağrı kalmış olabilir)");
        return;
    }

    const product = productOrId;

    if (!product || !product.id) {
        console.error("❌ Geçersiz ürün:", product);
        alert("Ürün sepete eklenemedi!");
        return;
    }

    const id = String(product.id);
    const name = product.name || "Ürün";
    const price = Number(product.price || 0);
    const image = product.image_url || product.image || "https://via.placeholder.com/80";

    const existing = cart.find(item => String(item.id) === id);

    if (existing) {
        existing.qty = Number(existing.qty || 0) + 1;
    } else {
        cart.push({ id, name, price, image, qty: 1 });
    }

    saveCart();
    updateCartUI();
    toggleCart(true);

    if (typeof showNotification === "function") {
        showNotification(`${name} sepete eklendi!`, "success");
    }
}

// =============================
// MİKTAR DEĞİŞTİR
// =============================
function changeQty(productId, delta) {
    const id = String(productId);
    const item = cart.find(i => String(i.id) === id);
    if (!item) return;

    item.qty = Number(item.qty || 0) + delta;

    if (item.qty <= 0) {
        cart = cart.filter(i => String(i.id) !== id);
    }

    saveCart();
    updateCartUI();
}

// =============================
// SEPETTEN SİL
// =============================
function removeFromCart(productId) {
    const id = String(productId);
    cart = cart.filter(item => String(item.id) !== id);
    saveCart();
    updateCartUI();
}

// =============================
// SEPET RENDER
// =============================
function renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;

    container.innerHTML = "";

    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:#7f8c8d;">
                <i class="fas fa-shopping-cart" style="font-size:64px;opacity:0.25;margin-bottom:15px;"></i>
                <p style="font-size:16px;font-weight:700;margin:0;">Sepetiniz boş</p>
                <p style="font-size:14px;margin-top:10px;">Ürün ekleyerek alışverişe başlayın.</p>
            </div>
        `;
        const totalEl = document.getElementById("cart-total");
        if (totalEl) totalEl.innerText = "0.00";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const price = Number(item.price || 0);
        const qty = Number(item.qty || 0);
        total += price * qty;

        const div = document.createElement("div");
        div.className = "cart-item";

        const safeName = (item.name || "Ürün").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const image = item.image || "https://via.placeholder.com/80";
        const id = String(item.id);

        div.innerHTML = `
            <img src="${image}" alt="${safeName}"
                 onerror="this.src='https://via.placeholder.com/80x80?text=Resim'">
            <div>
                <strong>${safeName}</strong>
                <p>${price.toFixed(2)} ₺</p>
                <div>
                    <button onclick="changeQty('${id}', -1)" title="Azalt"><i class="fas fa-minus"></i></button>
                    <span style="display:inline-block;min-width:30px;text-align:center;font-weight:800;font-size:16px;">${qty}</span>
                    <button onclick="changeQty('${id}', 1)" title="Artır"><i class="fas fa-plus"></i></button>
                    <button onclick="removeFromCart('${id}')" title="Sil" style="background:#e74c3c;margin-left:10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(div);
    });

    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.innerText = total.toFixed(2);
}

// =============================
// ORDER MODAL
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

// (submitOrder fonksiyonunu aynen bırakabilirsin – sende çalışıyorsa dokunmuyorum)

// =============================
// ESC ile kapat
// =============================
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        toggleCart(false);
        closeOrderModal();
    }
});

// =============================
// GLOBAL EXPORT (çok kritik)
// =============================
window.initCart = initCart;
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.handleCheckout = handleCheckout;
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;

initCart();
