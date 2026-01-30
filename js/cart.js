// cart.js - Sepet Yönetimi

let cart = [];

// =============================
// BAŞLANGIÇTA SEPET YÜKLE
// =============================
function initCart() {
    try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        updateCartCount();
    } catch (error) {
        console.error("❌ Sepet yüklenirken hata:", error);
        cart = [];
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
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartCountEl = document.getElementById("cart-count");
    
    if (cartCountEl) {
        cartCountEl.innerText = totalQty;
    }
}

// =============================
// SEPET UI'INI GÜNCELLE
// =============================
function updateCartUI() {
    updateCartCount();
    renderCart();
}

// =============================
// SEPET ARAMA/KAPATMA
// =============================
function toggleCart(open) {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("overlay");

    if (!sidebar || !overlay) {
        console.error("❌ Cart sidebar veya overlay bulunamadı!");
        return;
    }

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
// SEPETE ÜRÜN EKLE
// =============================
function addToCart(product) {
    if (!product || !product.id) {
        console.error("❌ Geçersiz ürün:", product);
        alert("Ürün sepete eklenemedi!");
        return;
    }

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            image: product.image_url || "https://via.placeholder.com/80",
            qty: 1
        });
    }

    saveCart();
    updateCartUI();  // Hem count hem render
    toggleCart(true);
    
    // Bildirim göster
    if (typeof showNotification === 'function') {
        showNotification(`${product.name} sepete eklendi!`, "success");
    }
}

// =============================
// MİKTAR DEĞİŞTİR
// =============================
function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    
    if (!item) {
        console.error("❌ Ürün sepette bulunamadı:", productId);
        return;
    }

    item.qty += delta;

    // Miktar 0 veya altına düştüyse sepetten çıkar
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }

    saveCart();
    updateCartUI();
}

// =============================
// SEPETTEN ÜRÜN SİL
// =============================
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// =============================
// SEPETİ RENDER ET
// =============================
function renderCart() {
    const container = document.getElementById("cart-items");
    
    if (!container) {
        console.error("❌ cart-items container bulunamadı!");
        return;
    }

    container.innerHTML = "";

    // Sepet boşsa
    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px 20px;
                color: #7f8c8d;
            ">
                <i class="fas fa-shopping-cart" style="font-size: 64px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; font-weight: 600;">Sepetiniz boş</p>
                <p style="font-size: 14px; margin-top: 10px;">Alışverişe başlamak için ürünleri keşfedin!</p>
            </div>
        `;
        
        const totalEl = document.getElementById("cart-total");
        if (totalEl) {
            totalEl.innerText = "0.00";
        }
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.image}" 
                 alt="${item.name}"
                 onerror="this.src='https://via.placeholder.com/80x80?text=Resim'">
            <div>
                <strong>${item.name}</strong>
                <p>${item.price.toFixed(2)} ₺</p>
                <div>
                    <button onclick="changeQty(${item.id}, -1)" title="Azalt">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span style="
                        display: inline-block;
                        min-width: 30px;
                        text-align: center;
                        font-weight: 700;
                        font-size: 16px;
                    ">${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)" title="Artır">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button 
                        onclick="removeFromCart(${item.id})" 
                        title="Sil"
                        style="
                            background: #e74c3c;
                            margin-left: 10px;
                        ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(div);
    });

    // Toplam tutarı güncelle
    const totalEl = document.getElementById("cart-total");
    if (totalEl) {
        totalEl.innerText = total.toFixed(2);
    }
}

// =============================
// SİPARİŞ MODALINI AÇ
// =============================
function openOrderModal() {
    const modal = document.getElementById("order-modal");
    const overlay = document.getElementById("order-overlay");
    
    if (modal && overlay) {
        modal.style.display = "block";
        overlay.style.display = "block";
    }
}

// =============================
// SİPARİŞ MODALINI KAPAT
// =============================
function closeOrderModal() {
    const modal = document.getElementById("order-modal");
    const overlay = document.getElementById("order-overlay");
    
    if (modal) modal.style.display = "none";
    if (overlay) overlay.style.display = "none";
}

// =============================
// ÖDEME SAYFASINA GEÇ
// =============================
function handleCheckout() {
    if (!cart || cart.length === 0) {
        alert("Sepetiniz boş! Lütfen önce ürün ekleyin.");
        return;
    }

    const totalEl = document.getElementById("cart-total");
    const summaryEl = document.getElementById("summary-total");
    
    if (totalEl && summaryEl) {
        summaryEl.innerText = totalEl.innerText;
    }

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

    // Form validasyonu
    if (!fullname || !phone || !address) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    if (phone.length < 10) {
        alert("Lütfen geçerli bir telefon numarası girin!");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    try {
        // Sipariş oluştur
        const { data: order, error: orderError } = await window.supabaseClient
            .from("orders")
            .insert([{
                fullname: fullname,
                phone: phone,
                address: address,
                total_amount: total,
                status: "Yeni"
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // Sipariş kalemlerini ekle
        const orderItems = cart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.qty,
            unit_price: item.price
        }));

        const { error: itemsError } = await window.supabaseClient
            .from("order_items")
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Başarılı sipariş
        alert("🎉 Siparişiniz başarıyla alındı!\n\nSipariş No: " + order.id);

        // Sepeti temizle
        cart = [];
        saveCart();
        updateCartUI();
        
        // Modalı kapat
        closeOrderModal();
        toggleCart(false);
        
        // Formu temizle
        if (fullnameEl) fullnameEl.value = "";
        if (phoneEl) phoneEl.value = "";
        if (addressEl) addressEl.value = "";

    } catch (err) {
        console.error("❌ Sipariş gönderilirken hata:", err);
        alert("Sipariş gönderilemedi. Lütfen tekrar deneyin.\n\nHata: " + err.message);
    }
}

// =============================
// ESC TUŞU İLE KAPAT
// =============================
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        toggleCart(false);
        closeOrderModal();
    }
});

// =============================
// SAYFA YÜKLENDIĞINDE SEPETİ BAŞLAT
// =============================
initCart();
