// ============================================
// CART FUNCTIONS
// ============================================

function addToCart(productId) {
    const product = window.APP.products.find(p => p.id === productId);
    if (!product) {
        showNotification('Ürün bulunamadı!', 'error');
        return;
    }
    const variant = product.product_variants ? product.product_variants[0] : null;
    const price = variant ? variant.price : (product.price || 0);
    const existingItem = window.APP.cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        window.APP.cart.push({
            id: product.id,
            name: product.name,
            price: price,
            image: product.image_url || 'https://via.placeholder.com/300?text=Gorsel+Yok',
            quantity: 1
        });
    }
    updateCart();
    showNotification(`${product.name} sepete eklendi!`, 'success');
}

function removeFromCart(productId) {
    window.APP.cart = window.APP.cart.filter(item => item.id !== productId);
    updateCart();
    showNotification('Ürün sepetten çıkarıldı!', 'error');
}

function updateQuantity(productId, quantity) {
    const item = window.APP.cart.find(item => item.id === productId);
    if (!item) return;
    if (quantity <= 0) {
        removeFromCart(productId);
    } else {
        item.quantity = quantity;
        updateCart();
    }
}

function updateCart() {
    if (typeof setLocalStorage === 'function') {
        setLocalStorage('aysima_cart', window.APP.cart);
    }
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = window.APP.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    renderCartItems();
    calculateCartTotal();
}

function renderCartItems() {
    const cartItemsDiv = document.getElementById('cart-items');
    if (!cartItemsDiv) return;
    if (window.APP.cart.length === 0) {
        cartItemsDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;"><p>Sepetiniz boş</p></div>';
        return;
    }
    cartItemsDiv.innerHTML = window.APP.cart.map(item => `
        <div class="cart-item" style="display:flex; align-items:center; gap:10px; margin-bottom:15px; border-bottom:1px solid #f4f4f4; padding-bottom:10px;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px;">
            <div style="flex:1;">
                <div style="font-weight: bold; font-size: 13px; color:#333;">${item.name}</div>
                <div style="color: var(--bordo); font-weight: bold; font-size: 14px;">${formatPrice(item.price)}</div>
                <div style="display:flex; align-items:center; gap:5px; margin-top:5px;">
                    <button style="width: 20px; height: 20px; border: 1px solid #ddd; background: white; cursor: pointer;" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span style="font-size:13px; min-width:20px; text-align:center;">${item.quantity}</span>
                    <button style="width: 20px; height: 20px; border: 1px solid #ddd; background: white; cursor: pointer;" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button style="color: #f44336; cursor: pointer; background: none; border: none; font-size: 18px;" onclick="removeFromCart('${item.id}')">×</button>
        </div>
    `).join('');
}

function calculateCartTotal() {
    const total = window.APP.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.getElementById('cart-total');
    if (totalElement) { totalElement.textContent = total.toFixed(2); }
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) { checkoutBtn.disabled = window.APP.cart.length === 0; }
}

function toggleCart(show) {
    const overlay = document.getElementById('overlay');
    const sidebar = document.getElementById('cart-sidebar');
    if (!overlay || !sidebar) return;
    if (show) {
        overlay.classList.add('active');
        sidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        overlay.classList.remove('active');
        sidebar.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
}

/** Sipariş Tamamlama - Form Açma */
function handleCheckout() {
    if (!window.APP.currentUser) {
        showNotification('Sipariş için lütfen giriş yapın!', 'error');
        if (typeof openAuth === 'function') openAuth();
        return;
    }
    if (window.APP.cart.length === 0) return;

    toggleCart(false);
    const total = window.APP.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('summary-total').textContent = total.toFixed(2);
    document.getElementById('order-overlay').style.display = 'block';
    document.getElementById('order-modal').style.display = 'block';
}

function closeOrderModal() {
    document.getElementById('order-overlay').style.display = 'none';
    document.getElementById('order-modal').style.display = 'none';
}

/** Veritabanına Çift Tablolu Kayıt */
async function submitOrder(event) {
    event.preventDefault();
    const btn = document.getElementById('final-submit-btn');
    btn.disabled = true;
    btn.textContent = 'İşleniyor...';

    try {
        const total = window.APP.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // 1. Orders Tablosuna Ekle
        const { data: order, error: orderErr } = await window.supabase
            .from('orders')
            .insert({
                user_id: window.APP.currentUser.id,
                full_name: document.getElementById('order-fullname').value,
                phone: document.getElementById('order-phone').value,
                address: document.getElementById('order-address').value,
                total_amount: total
            }).select().single();

        if (orderErr) throw orderErr;

        // 2. Order Items Tablosuna Ekle
        const items = window.APP.cart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price
        }));

        const { error: itemsErr } = await window.supabase.from('order_items').insert(items);
        if (itemsErr) throw itemsErr;

        showNotification('Siparişiniz alındı! ✅', 'success');
        window.APP.cart = [];
        updateCart();
        closeOrderModal();
    } catch (err) {
        showNotification('Hata: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'SİPARİŞİ ONAYLA';
    }
}

console.log('✅ Cart loaded successfully');
                                                                   
