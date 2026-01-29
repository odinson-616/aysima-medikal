// ============================================
// PRODUCTS FUNCTIONS
// ============================================
/**
*/
async function loadProducts() {
try {
showLoading(true);
console.log('📦 Ürünler yükleniyor...');
const { data, error } = await window.supabase
.from('products')
.select('*')
.order('created_at', { ascending: false });
if (error) {
console.error('❌ Ürün yükleme hatası:', error);
showNotification('Ürünler yüklenemedi: ' + error.message, 'error');
return;
}
console.log('✅ Ürünler yüklendi:', data);
if (!data || data.length === 0) {
console.warn('⚠️ Hiç ürün bulunamadı!');
}
window.APP.products = data || [];
renderProducts(window.APP.products);
} catch (err) {
console.error('❌ Hata:', err);
showNotification('Hata: ' + err.message, 'error');
} finally {
showLoading(false);
}
}
/**
*/
function renderProducts(products) {
const grid = document.getElementById('product-grid');
if (!products || products.length === 0) {
grid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Ürün bulunamadı</p>';
return;
}
console.log('🎨 Rendering ürünler:', products.length);
grid.innerHTML = products.map(product => {
const productId = product.id;
const productName = product.name || 'İsimsiz Ürün';
const productPrice = product.price || 0;
const productImage = product.image || 'https://via.placeholder.com/300?text=NoImage';
const productDesc = product.description || 'Açıklama yok';
const discount = product.discount || 0;
const rating = product.rating || 4;
const reviews = product.reviews || 0;
return `
<img src="${productImage}" alt="${productName}" style="width: 100%; height: 200px; object-fit: cover;">
${discount ? `<span class="discount">%${discount}</span>` : ''}
<h3>${productName}</h3>
<p class="product-description">${productDesc}</p>
<span class="price">${formatPrice(productPrice)}</span>
${'⭐'.repeat(rating)} (${reviews} yorum)
<button class="add-cart-btn" onclick="addToCart('${productId}')">
<button class="favorite-btn" onclick="toggleFavorite('${productId}')">
`;
}).join('');
}
/**
*/
function doSearch(query) {
if (!query.trim()) {
renderProducts(window.APP.products);
return;
}
const filtered = window.APP.products.filter(product =>
(product.name && product.name.toLowerCase().includes(query.toLowerCase())) ||
(product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
(product.category && product.category.toLowerCase().includes(query.toLowerCase()))
);
renderProducts(filtered);
}
/**
*/
function toggleFavorite(productId) {
if (!window.APP.currentUser) {
showNotification('Lütfen önce giriş yapın!', 'error');
openAuth();
return;
}
showNotification('Favorilere eklendi! ❤️', 'success');
}
/**
*/
function filterByCategory(category) {
if (!category) {
renderProducts(window.APP.products);
return;
}
const filtered = window.APP.products.filter(p =>
p.category && p.category === category
);
renderProducts(filtered);
}
console.log('✅ Products loaded successfully');
