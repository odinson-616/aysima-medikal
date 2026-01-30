// cart.js - Sepet Yönetimi (PRO + Variant Ready + Discount Engine)
// - Tek dosya: Çift cart.js birleşme/çakışma yok
// - Variant (renk/beden) + qty destekli
// - Ürüne özel indirim + sepete özel indirim + kupon (stack kuralı ile)

let cart = [];
let appliedCoupon = null;

// =============================
// LOCAL STORAGE KEYS
// =============================
const CART_STORAGE_KEY = "cart";
const COUPON_STORAGE_KEY = "applied_coupon";

// =============================
// SUPABASE CLIENT (uyumlu)
// =============================
function getClient() {
    return window.supabaseClient || window.supabase || null;
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
// INIT
// =============================
function initCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        cart = savedCart ? JSON.parse(savedCart) : [];

        // normalize (eski kayıtlarla uyum)
        cart = (cart || []).map(i => {
            const productId = String(i.product_id || i.id || "");
            const variantId = i.variant_id ? String(i.variant_id) : null;

            return {
                key: i.key || buildCartKey(productId, variantId),
                product_id: productId,
                variant_id: variantId,
                sku: i.sku || null,
                name: i.name || "Ürün",
                variant_title: i.variant_title || null,
                // price: ürünün "liste fiyatı" (indirimsiz baz)
                price: Number(i.price || 0),
                image: i.image || i.image_url || "https://via.placeholder.com/80x80?text=Resim",
                qty: Math.max(1, Number(i.qty || 1))
            };
        });

        // coupon load
        const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
        appliedCoupon = savedCoupon ? String(savedCoupon) : null;

        saveCart();
        updateCartUI();
    } catch (error) {
        console.error("❌ Sepet yüklenirken hata:", error);
        cart = [];
        appliedCoupon = null;
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("❌ Sepet kaydedilirken hata:", error);
    }
}

function saveCoupon(codeOrNull) {
    appliedCoupon = codeOrNull ? String(codeOrNull) : null;
    try {
        if (appliedCoupon) localStorage.setItem(COUPON_STORAGE_KEY, appliedCoupon);
        else localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (_) {}
}

// =============================
// COUNT
// =============================
function updateCartCount() {
    const totalQty = (cart || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) cartCountEl.innerText = totalQty;
}

// =============================
// SIDEBAR OPEN/CLOSE (index.html ile uyumlu)
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
// ADD TO CART (variant + qty)
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
// QTY / REMOVE
// =============================
function changeQty(cartKeyOrProductId, delta) {
    const key = String(cartKeyOrProductId);

    let item = cart.find(i => i.key === key);
    if (!item) item = cart.find(i => String(i.product_id) === key);
    if (!item) return;

    item.qty = Number(item.qty || 0) + Number(delta || 0);

    if (item.qty <= 0) {
        cart = cart.filter(i => i.key !== item.key);
    }

    saveCart();
    updateCartUI();
}

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
// DISCOUNT ENGINE
// =============================

// ---- helpers
function money(v) {
    return Number(v || 0).toFixed(2);
}
function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ---- ÜRÜNE ÖZEL İNDİRİMLERİ GETİR
// Tablo varsayımı: product_discounts
// Kolonlar:
// - product_id (uuid)
// - discount_type ('percentage'|'fixed')
// - discount_value (numeric)
// - active (bool)
async function fetchProductDiscounts(productIds) {
    const client = getClient();
    if (!client) return new Map();

    try {
        if (!productIds || !productIds.length) return new Map();

        const { data, error } = await client
            .from("product_discounts")
            .select("product_id, discount_type, discount_value, active")
            .in("product_id", productIds)
            .eq("active", true);

        if (error) throw error;

        const map = new Map();
        (data || []).forEach(d => {
            map.set(String(d.product_id), {
                type: d.discount_type,
                value: Number(d.discount_value || 0)
            });
        });

        return map;
    } catch (e) {
        // tablo yoksa / RLS vs => sessiz geç
        return new Map();
    }
}

// ---- SEPETE ÖZEL OTOMATİK İNDİRİMLERİ GETİR
// Tablo varsayımı: cart_discounts
// Kolonlar:
// - min_total (numeric)
// - discount_type ('percentage'|'fixed')
// - discount_value (numeric)
// - active (bool)
async function fetchCartDiscountRules() {
    const client = getClient();
    if (!client) return [];

    try {
        const { data, error } = await client
            .from("cart_discounts")
            .select("*")
            .eq("active", true);

        if (error) throw error;

        return data || [];
    } catch (_) {
        return [];
    }
}

// ---- KUPON GETİR
// Tablo varsayımı: coupons
// Kolonlar:
// - code (text)
// - active (bool)
// - min_cart_total (numeric)
// - discount_type ('percentage'|'fixed')
// - discount_value (numeric)
// - allow_stack (bool)  -> TRUE ise "özel kupon", otomatik indirimle birlikte çalışır
async function fetchCoupon(code) {
    const client = getClient();
    if (!client) return null;

    try {
        const clean = String(code || "").trim();
        if (!clean) return null;

        const { data, error } = await client
            .from("coupons")
            .select("*")
            .eq("code", clean)
            .eq("active", true)
            .single();

        if (error) return null;
        return data || null;
    } catch (_) {
        return null;
    }
}

// ---- Sepet otomatik indirimi hesapla
function computeCartAutoDiscount(subtotalAfterProductDiscounts, rules) {
    let totalDiscount = 0;

    (rules || []).forEach(rule => {
        const minTotal = Number(rule.min_total || 0);
        if (subtotalAfterProductDiscounts >= minTotal) {
            if (rule.discount_type === "percentage") {
                totalDiscount += subtotalAfterProductDiscounts * (Number(rule.discount_value || 0) / 100);
            } else {
                totalDiscount += Number(rule.discount_value || 0);
            }
        }
    });

    return Math.max(0, totalDiscount);
}

// ---- Kupon indirimi hesapla
function computeCouponDiscount(subtotalAfterProductDiscounts, couponRow) {
    if (!couponRow) return 0;

    const minCart = Number(couponRow.min_cart_total || 0);
    if (subtotalAfterProductDiscounts < minCart) return 0;

    if (couponRow.discount_type === "percentage") {
        return subtotalAfterProductDiscounts * (Number(couponRow.discount_value || 0) / 100);
    }
    return Number(couponRow.discount_value || 0);
}

// =============================
// COUPON UI (index.html'i bozmadan otomatik ekler)
// =============================
function ensureCouponUI() {
    const footer = document.querySelector("#cart-sidebar .cart-footer");
    if (!footer) return;

    // varsa tekrar ekleme
    if (document.getElementById("coupon-box")) return;

    const wrap = document.createElement("div");
    wrap.id = "coupon-box";
    wrap.style.cssText = "margin-top:12px; padding-top:12px; border-top:1px dashed #eef2f7;";

    wrap.innerHTML = `
        <div style="font-weight:900; color:#2c3e50; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-ticket-alt" style="color:var(--bordo);"></i> Kupon Kodu
        </div>

        <div style="display:flex; gap:8px;">
            <input id="coupon-input" type="text" placeholder="Kupon kodu girin"
                   style="flex:1; padding:10px 12px; border:1px solid #e1e4e8; border-radius:10px; outline:none; font-weight:800;">
            <button id="coupon-apply-btn" type="button"
                    style="padding:10px 12px; border:none; border-radius:10px; background:var(--bordo); color:#fff; font-weight:900; cursor:pointer;">
                Uygula
            </button>
        </div>

        <div id="coupon-info" style="margin-top:8px; font-size:12.5px; color:#7f8c8d;"></div>
    `;

    footer.appendChild(wrap);

    const btn = document.getElementById("coupon-apply-btn");
    btn.addEventListener("click", async () => {
        const input = document.getElementById("coupon-input");
        const code = String(input?.value || "").trim();
        if (!code) {
            saveCoupon(null);
            updateCartUI();
            return;
        }

        // doğrula
        const couponRow = await fetchCoupon(code);
        const info = document.getElementById("coupon-info");

        if (!couponRow) {
            saveCoupon(null);
            if (info) info.innerHTML = `<span style="color:#e74c3c; font-weight:900;">Kupon geçersiz veya pasif.</span>`;
            updateCartUI();
            return;
        }

        saveCoupon(code);
        if (info) info.innerHTML = `<span style="color:#27ae60; font-weight:900;">Kupon uygulandı:</span> <b>${escapeHtml(code)}</b>`;
        updateCartUI();
    });
}

// =============================
// RENDER CART (UI + discounts)
// =============================
async function renderCart() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    if (!container) return;

    ensureCouponUI();

    container.innerHTML = "";

    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#7f8c8d;">
                <i class="fas fa-shopping-cart" style="font-size:64px; opacity:.25; margin-bottom:12px;"></i>
                <div style="font-weight:800; font-size:16px;">Sepetiniz boş</div>
                <div style="font-size:13px; margin-top:8px;">Ürünleri inceleyip sepetinize ekleyin.</div>
            </div>
        `;
        if (totalEl) totalEl.innerText = "0.00";
        const info = document.getElementById("coupon-info");
        if (info) info.innerHTML = appliedCoupon ? `Kupon beklemede: <b>${escapeHtml(appliedCoupon)}</b>` : "";
        return;
    }

    // 1) Subtotal (liste fiyatı üzerinden)
    let subtotal = 0;
    cart.forEach(item => {
        const price = Number(item.price || 0);
        const qty = Number(item.qty || 0);
        subtotal += price * qty;
    });

    // 2) Ürüne özel indirimler (product_discounts)
    const productIds = [...new Set(cart.map(i => String(i.product_id)))];
    const pdMap = await fetchProductDiscounts(productIds);

    // Ürün bazlı indirim toplamı
    let productDiscountTotal = 0;

    // 3) Cart UI (satır satır)
    cart.forEach(item => {
        const listUnit = Number(item.price || 0);
        const qty = Number(item.qty || 0);

        // ürün indirimi var mı?
        const pd = pdMap.get(String(item.product_id)) || null;
        let finalUnit = listUnit;

        if (pd) {
            if (pd.type === "percentage") {
                const d = listUnit * (pd.value / 100);
                finalUnit = Math.max(0, listUnit - d);
                productDiscountTotal += d * qty;
            } else {
                const d = pd.value;
                finalUnit = Math.max(0, listUnit - d);
                productDiscountTotal += d * qty;
            }
        }

        const itemTotal = finalUnit * qty;

        const variantLine = item.variant_title
            ? `<div style="color:#7f8c8d; font-size:12px; margin-top:2px;">${escapeHtml(item.variant_title)}</div>`
            : "";

        const priceLine = pd
            ? `
              <div style="display:flex; align-items:baseline; gap:8px; margin-top:6px;">
                <div style="font-weight:1000; color:var(--bordo);">${money(finalUnit)} ₺</div>
                <div style="font-size:12px; color:#7f8c8d; text-decoration:line-through;">${money(listUnit)} ₺</div>
                <div style="font-size:12px; color:#27ae60; font-weight:900;">
                    ${pd.type === "percentage" ? `%${money(pd.value)}` : `${money(pd.value)}₺`} indirim
                </div>
              </div>
            `
            : `<div style="font-weight:1000; color:var(--bordo); margin-top:6px;">${money(listUnit)} ₺</div>`;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.style.cssText = "display:flex; gap:10px; padding:12px 0; border-bottom:1px solid #f0f2f5;";

        div.innerHTML = `
            <img src="${item.image}" alt="${escapeHtml(item.name)}"
                 style="width:64px; height:64px; object-fit:contain; background:#fafafa; border-radius:10px; padding:6px;"
                 onerror="this.src='https://via.placeholder.com/80x80?text=Resim'">
            <div style="flex:1;">
                <div style="font-weight:900; color:#2c3e50; line-height:1.2;">${escapeHtml(item.name)}</div>
                ${variantLine}
                ${priceLine}

                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
                    <div style="font-weight:900; color:#2c3e50; font-size:13px;">
                        Ara Toplam: <span style="color:#111;">${money(itemTotal)} ₺</span>
                    </div>

                    <div style="display:flex; align-items:center; gap:6px;">
                        <button onclick="changeQty('${item.key}', -1)" title="Azalt" style="${miniBtnStyle()}"><i class="fas fa-minus"></i></button>
                        <span style="min-width:26px; text-align:center; font-weight:900;">${qty}</span>
                        <button onclick="changeQty('${item.key}', 1)" title="Artır" style="${miniBtnStyle()}"><i class="fas fa-plus"></i></button>
                        <button onclick="removeFromCart('${item.key}')" title="Sil" style="${miniBtnStyle(true)}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(div);
    });

    // 4) Ürün indirimlerinden sonra sepet ara toplamı
    const subtotalAfterProductDiscounts = Math.max(0, subtotal - productDiscountTotal);

    // 5) Sepete özel otomatik indirimler
    const cartRules = await fetchCartDiscountRules();
    const autoCartDiscount = computeCartAutoDiscount(subtotalAfterProductDiscounts, cartRules);

    // 6) Kupon indirimi
    let couponRow = null;
    let couponDiscount = 0;

    if (appliedCoupon) {
        couponRow = await fetchCoupon(appliedCoupon);
        if (!couponRow) {
            // kupon artık geçersiz
            saveCoupon(null);
        } else {
            couponDiscount = computeCouponDiscount(subtotalAfterProductDiscounts, couponRow);
        }
    }

    // 7) Stack kuralı
    // allow_stack = true => ikisi birden
    // allow_stack = false => büyük olan (auto vs coupon)
    let finalCartDiscount = 0;
    let usedAuto = 0;
    let usedCoupon = 0;

    if (couponRow && couponDiscount > 0) {
        const allowStack = !!couponRow.allow_stack;

        if (allowStack) {
            usedAuto = autoCartDiscount;
            usedCoupon = couponDiscount;
        } else {
            if (couponDiscount >= autoCartDiscount) {
                usedAuto = 0;
                usedCoupon = couponDiscount;
            } else {
                usedAuto = autoCartDiscount;
                usedCoupon = 0;
            }
        }
    } else {
        usedAuto = autoCartDiscount;
        usedCoupon = 0;
    }

    finalCartDiscount = Math.max(0, usedAuto + usedCoupon);

    const finalTotal = Math.max(0, subtotalAfterProductDiscounts - finalCartDiscount);

    // 8) Footer breakdown (cart-total sadece final total)
    if (totalEl) totalEl.innerText = money(finalTotal);

    // Kupon UI info
    const info = document.getElementById("coupon-info");
    if (info) {
        if (appliedCoupon && couponRow) {
            const tag = couponRow.allow_stack ? "Özel Kupon (Stack)" : "Kupon";
            info.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
                    <div>
                        <span style="font-weight:900; color:#2c3e50;">${tag}:</span>
                        <b>${escapeHtml(appliedCoupon)}</b>
                    </div>
                    <button type="button" onclick="removeCoupon()" style="border:none; background:#e74c3c; color:#fff; font-weight:900; padding:6px 10px; border-radius:10px; cursor:pointer;">
                        Kaldır
                    </button>
                </div>
            `;
        } else if (appliedCoupon && !couponRow) {
            info.innerHTML = `<span style="color:#e74c3c; font-weight:900;">Kupon geçersiz veya pasif.</span>`;
        } else {
            info.innerHTML = "";
        }
    }

    // 9) Discount breakdown satırlarını footer'a yaz (HTML'e
