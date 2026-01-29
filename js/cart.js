// js/cart.js - Sepet işlemleri
function toggleCart(show) {
document.getElementById('cart-sidebar').classList.toggle('open', show);
document.getElementById('overlay').classList.toggle('active', show);
}
function updateCard(btn, price, vid, vname, stock) {
const card = btn.closest('.card');
card.querySelectorAll('.v-btn').forEach(b => b.classList.remove('selected'));
btn.classList.add('selected');
card.querySelector('.price-display').textContent = price + ' ₺';
const buyBtn = card.querySelector('.buy-btn');
buyBtn.setAttribute('data-v-id', vid);
buyBtn.setAttribute('data-v-price', price);
buyBtn.setAttribute('data-v-name', vname);
if(stock <= 0) {
buyBtn.disabled = true;
buyBtn.textContent = 'TÜKENDİ';
} else {
buyBtn.disabled = false;
buyBtn.textContent = 'SEPETE EKLE';
}
}
function addToCart(pid, pname, btn) {
const vid = btn.getAttribute('data-v-id');
const vprice = parseFloat(btn.getAttribute('data-v-price'));
const vname = btn.getAttribute('data-v-name');
if (!vid || vid === 'null') {
alert('Lütfen bir varyant seçin.');
return;
}
const existing = APP.cart.find(i => i.vid === vid && i.pid === pid);
if (existing) {
existing.qty++;
} else {
APP.cart.push({ pid, pname, vid, vname, vprice, qty: 1 });
}
APP.saveCart();
updateCartUI();
toggleCart(true);
}
function updateCartUI() {
const itemsDiv = document.getElementById('cart-items');
let total = 0, count = 0;
if(APP.cart.length === 0) {
itemsDiv.innerHTML = '<div class="empty-cart">Sepetiniz boş</div>';
document.getElementById('checkout-btn').disabled = true;
document.getElementById('cart-count').textContent = '0';
return;
}
itemsDiv.innerHTML = '';
APP.cart.forEach((item, idx) => {
total += item.vprice * item.qty;
count += item.qty;
itemsDiv.innerHTML += `
<div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #f4f4f4; padding-bottom:10px;">
<div>
<b style="font-size:14px; display:block; margin-bottom:4px;">${escapeHtml(item.pname)}</b>
<small style="color:#999;">${escapeHtml(item.vname)} x ${item.qty}</small>
</div>
<div style="text-align:right;">
<div style="font-weight:bold; margin-bottom:5px; color:var(--bordo);">${(item.vprice * item.qty).toFixed(2)} ₺</div>
<button onclick="removeFromCart(${idx})" style="color:var(--danger); border:none; background:none; cursor:pointer; font-size:12px; text-decoration:underline;">Kaldır</button>
</div>
</div>
`;
});
document.getElementById('cart-total').textContent = total.toFixed(2);
document.getElementById('cart-count').textContent = count;
document.getElementById('checkout-btn').disabled = false;
}
function removeFromCart(idx) {
APP.cart.splice(idx, 1);
APP.saveCart();
updateCartUI();
}
function handleCheckout() {
if(!APP.currentUser) {
alert('Lütfen önce giriş yapın!');
openAuth();
return;
}
if(APP.cart.length === 0) {
alert('Sepetiniz boş!');
return;
}
alert('Ödeme sistemi kısa sürede aktif olacak!');
}
