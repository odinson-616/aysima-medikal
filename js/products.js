// js/products.js - Ürün gösterimi
async function loadProducts(cid = null, cname = 'Tüm Ürünler') {
try {
document.getElementById('page-name').textContent = cname;
const grid = document.getElementById('product-grid');
grid.innerHTML = 'Ürünler hazırlanıyor...';
let q = supabase.from('products').select('*, product_variants(*)').eq('is_active', true);
if(cid) q = q.eq('category_id', cid);
const { data, error } = await q;
if(error) throw error;
APP.masterData = data || [];
renderProducts(APP.masterData);
} catch(e) {
console.error('Ürün yükleme hatası:', e);
document.getElementById('product-grid').innerHTML = 'Ürünler yüklenemedi.';
}
}
function renderProducts(list) {
const container = document.getElementById('product-grid');
if(list.length === 0) {
container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#999;">Ürün bulunamadı.</div>';
return;
}
container.innerHTML = '';
list.forEach(p => {
const vars = p.product_variants.filter(v => v.is_active);
const def = vars[0] || { price: 0, variant_value: '-', id: 'null', stock: 0 };
const card = document.createElement('div');
card.className = 'card';
card.innerHTML = `
<div class="product-image">Görsel</div>
<div class="product-name">${escapeHtml(p.name)}</div>
<div class="variants-container">
${vars.map(v => `
<button class="v-btn ${v.id === def.id ? 'selected' : ''}"
onclick="updateCard(this, '${v.price}', '${v.id}', '${escapeHtml(v.variant_value)}', ${v.stock})"
title="${escapeHtml(v.variant_value)}">
${escapeHtml(v.variant_value)}
`).join('')}
</div>
<div style="margin-top:auto;">
<div class="price-display">${def.price} ₺</div>
<button class="buy-btn" ${def.stock <= 0 ? 'disabled' : ''}
onclick="addToCart('${escapeHtml(p.id)}', '${escapeHtml(p.name)}', this)"
data-v-id="${def.id}"
data-v-price="${def.price}"
data-v-name="${escapeHtml(def.variant_value)}">
${def.stock <= 0 ? 'TÜKENDİ' : 'SEPETE EKLE'}
</button>
</div>
`;
container.appendChild(card);
});
}
function doSearch(t) {
if(t.trim() === '') {
renderProducts(APP.masterData);
} else {
renderProducts(APP.masterData.filter(p => p.name.toLowerCase().includes(t.toLowerCase())));
}
}
async function loadCategories() {
try {
const { data: cats, error } = await supabase.from('categories').select('*');
if(error) {
console.error('Kategori yükleme hatası:', error);
return;
}
const navbar = document.getElementById('navbar');
cats?.forEach(c => {
const a = document.createElement('a');
a.className = 'nav-link';
a.textContent = c.name.toUpperCase();
a.onclick = () => loadProducts(c.id, c.name);
navbar.appendChild(a);
});
loadProducts();
} catch(e) {
console.error('Kategori hatası:', e);
}
}
