// ============================================
// CART FUNCTIONS
// ============================================
/**
*/
function addToCart(productId) {
const product = window.APP.products.find(p => p.id === productId);
if (!product) {
showNotification('Ürün bulunamadı!', 'error');
return;
}
const existingItem = window.APP.cart.find(item => item.id === productId);
if (existingItem) {
existingItem.quantity += 1;
} else {
window.APP.cart.push({
id: product.id,
name: product.name,
price: product.price,
image: product.image,
quantity: 1
});
}
updateCart();
showNotification(`${product.name} sepete eklendi!`, 'success');
}
/**
*/
function removeFromCart(productId) {
window.APP.cart = window.APP.cart.filter(item => item.id !== productId);
updateCart();
showNotification('Ürün sepetten çıkarıldı!', 'success');
}
/**
*/
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
/**
*/
function updateCart() {
// Sepeti local storage'a kaydet
setLocalStorage('cart', window.APP.cart);
// Sepet sayısını güncelle
const cartCount = document.getElementById('cart-count');
cartCount.textContent = window.APP.cart.reduce((sum, item) => sum + item.quantity, 0);
// Sepet öğelerini göster
renderCartItems();
// Toplam fiyatı hesapla
calculateCartTotal();
}
/**
*/
function renderCartItems() {
const cartItemsDiv = document.getElementById('cart-items');
if (window.APP.cart.length === 0) {
cartItemsDiv.innerHTML = `
<div style="padding: 20px; text-align: center; color: #999;">
<p>Sepetiniz boş</p>
</div>
`;
return;
}
cartItemsDiv.innerHTML = window.APP.cart.map(item => `
<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
<div style="font-weight: bold; font-size: 14px;">${item.name}</div>
<div style="color: var(--bordo); font-weight: bold; font-size: 14px;">${formatPrice(item.price)}</div>
<button style="width: 25px; height: 25px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 3px;" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
<input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, parseInt(this.value))" style="width: 35px; text-align: center; border: 1px solid #ddd; padding: 5px; border-radius: 3px;">
<button style="width: 25px; height: 25px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 3px;" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
<button style="color: #f44336; cursor: pointer; background: none; border: none; font-size: 18px;" onclick="removeFromCart(${item.id})">×</button>
`).join('');
}
/**
*/
function calculateCartTotal() {
const total = window.APP.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
document.getElementById('cart-total').textContent = total.toFixed(2);
}
/**
*/
function toggleCart(show) {
const overlay = document.getElementById('overlay');
const sidebar = document.getElementById('cart-sidebar');
if (show) {
overlay.style.display = 'block';
sidebar.style.transform = 'translateX(0)';
document.body.style.overflow = 'hidden';
} else {
overlay.style.display = 'none';
sidebar.style.transform = 'translateX(100%)';
document.body.style.overflow = 'auto';
}
}
/**
*/
async function handleCheckout() {
if (!window.APP.currentUser) {
showNotification('Lütfen önce giriş yapın!', 'error');
openAuth();
return;
}
if (window.APP.cart.length === 0) {
showNotification('Sepetiniz boş!', 'error');
return;
}
try {
const checkoutBtn = document.getElementById('checkout-btn');
checkoutBtn.disabled = true;
checkoutBtn.textContent = 'İşleniyor...';
const total = window.APP.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
// Siparişi veritabanına kaydet
const { data, error } = await window.supabase.from('orders').insert({
user_id: window.APP.currentUser.id,
items: window.APP.cart,
total: total,
status: 'pending',
created_at: new Date().toISOString()
});
if (error) {
showNotification('Sipariş verilemedi: ' + error.message, 'error');
return;
}
// Sepeti temizle
window.APP.cart = [];
updateCart();
toggleCart(false);
showNotification('Siparişiniz başarıyla alındı! ✅', 'success');
} catch (err) {
showNotification('Hata: ' + err.message, 'error');
} finally {
const checkoutBtn = document.getElementById('checkout-btn');
checkoutBtn.disabled = false;
checkoutBtn.textContent = 'Siparişi Tamamla';
}
}
// Sayfa yüklendiğinde sepeti yükle
window.addEventListener('DOMContentLoaded', () => {
const savedCart = getLocalStorage('cart');
if (savedCart) {
window.APP.cart = savedCart;
updateCart();
}
});
console.log('✅ Cart loaded successfully');
