// cart.js - SAFE MODE (Sepet her durumda çalışır)

let cart = [];
let appliedCoupon = null;

const CART_STORAGE_KEY = "cart";

// =============================
function getClient() {
    return window.supabaseClient || window.supabase || null;
}

// =============================
function initCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        cart = savedCart ? JSON.parse(savedCart) : [];
        updateCartUI();
    } catch {
        cart = [];
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// =============================
function updateCartCount() {
    const total = cart.reduce((sum, i) => sum + (i.qty || 0), 0);
    const el = document.getElementById("cart-count");
    if (el) el.innerText = total;
}

// =============================
function toggleCart(open) {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("overlay");
    if (!sidebar || !overlay) return;

    if (open) {
        sidebar.classList.add("open");
        overlay.classList.add("active");
    } else {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    }
}

// =============================
function addToCart(product) {
    try {
        const existing = cart.find(i => i.id === product.id);

        if (existing) existing.qty += product.qty || 1;
        else cart.push({ ...product, qty: product.qty || 1 });

        saveCart();
        updateCartUI();
        toggleCart(true);
    } catch (e) {
        console.error("Sepet ekleme hatası:", e);
    }
}

// =============================
function renderCart() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    if (!container) return;

    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const div = document.createElement("div");
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <p>${item.qty} x ${item.price.toFixed(2)} ₺</p>
            </div>
        `;
        container.appendChild(div);
    });

    if (totalEl) totalEl.innerText = total.toFixed(2);
}

// =============================
function updateCartUI() {
    updateCartCount();
    renderCart();
}

initCart();
