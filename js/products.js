// ============================================
// PRODUCTS FUNCTIONS
// ============================================
/**
*/
async function loadProducts() {
try {
showLoading(true);
const { data, error } = await window.supabase
.from('products')
.select('*')
.order('created_at', { ascending: false });
if (error) {
showNotification('Ürünler yüklenemedi: ' + error.message, 'error');
return;
}
window.APP.products = data || [];
renderProducts(window.APP.products);
} catch (err) {
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
grid.innerHTML = products.map(product => `
<img src="${product.image}" alt="${product.name}">
${product.discount ? `<span class="discount">%${product.discount}</span>` : ''}
<h3>${product.name}</h3>
<p class="product-description">${product.description || 'Açıklama yok'}</p>
${product.original_price ? `<span class="original-price">${formatPrice(product.original_price)}</span>` : ''}
<span class="price">${formatPrice(product.price)}</span>
${'⭐'.repeat(Math.floor(product.rating || 4))} (${product.reviews || 0} yorum)
<button class="add-cart-btn" onclick="addToCart(${product.id})">
<button class="favorite-btn" onclick="toggleFavorite(${product.id})">
`).join('');
}
/**
*/
function doSearch(query) {
if (!query.trim()) {
renderProducts(window.APP.products);
return;
}
const filtered = window.APP.products.filter(product =>
product.name.toLowerCase().includes(query.toLowerCase()) ||
product.description.toLowerCase().includes(query.toLowerCase()) ||
product.category.toLowerCase().includes(query.toLowerCase())
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
const filtered = window.APP.products.filter(p => p.category === category);
renderProducts(filtered);
}
console.log('✅ Products loaded successfully');
