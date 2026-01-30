// cart.js - SAFE MODE + DISCOUNT ENGINE

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
// ÜRÜN İNDİRİMİ
// =============================
async function getProductDiscount(productId, price) {
    const client = getClient();
    if (!client) return 0;

    try {
        const { data } = await client
            .from("product_discounts")
            .select("*")
            .eq("product_id", productId)
            .eq("active", true)
            .single();

        if (!data) return 0;

        if (data.discount_type === "percentage")
            return price * data.discount_value / 100;
        else
            return data.discount_value;
    } catch {
        return 0;
    }
}

// =============================
// SEPET İNDİRİMİ
// =============================
async function getCartDiscount(total) {
    const client = getClient();
    if (!client) return 0;

    try {
        let discount = 0;

        const { data } = await client
            .from("cart_discounts")
            .select("*")
            .eq("active", true);

        data?.forEach(rule => {
            if (total >= rule.min_total) {
                if (rule.discount_type === "percentage")
                    discount += total * rule.discount_value / 100;
                else
                    discount += rule.discount_value;
            }
        });

        return discount;
    } catch {
        return 0;
    }
}

// =============================
// KUPON İNDİRİMİ
// =============================
async function getCouponDiscount(code, total) {
    const client = getClient();
    if (!client || !code) return 0;

    try {
        const { data } = await client
            .from("coupons")
            .select("*")
            .eq("code", code)
            .eq("active", true)
            .single();

        if (!data) return 0;
        if (total < data.min_cart_total) return 0;

        if (data.discount_type === "percentage")
            return total * data.discount_value / 100;
        else
            return data.discount_value;
    } catch {
        return 0;
    }
}

// =============================
// SEPET RENDER
// =============================
async function renderCart() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    if (!container) return;

    container.innerHTML = "";

    if (!cart.length) {
        container.innerHTML = `<p>Sepetiniz boş</p>`;
        if (totalEl) totalEl.innerText = "0.00";
        return;
    }

    let total = 0;
    let productDiscountTotal = 0;

    for (const item of cart) {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const discount = await getProductDiscount(item.id, item.price);
        productDiscountTotal += discount * item.qty;

        const div = document.createElement("div");
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <p>${item.qty} x ${item.price.toFixed(2)} ₺</p>
            </div>
        `;
        container.appendChild(div);
    }

    const cartDiscount = await getCartDiscount(total - productDiscountTotal);
    const couponDiscount = await getCouponDiscount(appliedCoupon, total);

    const finalTotal = total - productDiscountTotal - cartDiscount - couponDiscount;

    if (totalEl) totalEl.innerText = finalTotal.toFixed(2);
}

// =============================
function updateCartUI() {
    updateCartCount();
    renderCart();
}

initCart();
