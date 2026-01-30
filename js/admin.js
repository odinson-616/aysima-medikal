// admin.js - STABLE VERSION (Supabase uyumlu)

let currentEditingId = null;

// =============================
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) return;

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    await loadDashboardData();
    await loadProductsList();
    await loadCategoriesList();
    await loadOrdersList();
    await loadUsersList();
    await loadCouponsList();
    await loadSettings();
});

// =============================
// TAB SWITCH
// =============================
function switchTab(tabName, el) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-menu a').forEach(l => l.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    if (el) el.classList.add('active');
}

// =============================
// DASHBOARD
// =============================
async function loadDashboardData() {
    const { count: productCount } = await supabaseClient
        .from('products')
        .select('*', { count: 'exact', head: true });

    const { data: orders } = await supabaseClient
        .from('orders')
        .select('*');

    const { count: userCount } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    document.getElementById('total-products').textContent = productCount || 0;
    document.getElementById('total-orders').textContent = orders?.length || 0;
    document.getElementById('total-users').textContent = userCount || 0;

    const revenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    document.getElementById('monthly-revenue').textContent = `₺${revenue.toFixed(2)}`;

    renderOrdersList(orders?.slice(0,5) || [], 'recent-orders');
}

// =============================
// PRODUCTS
// =============================
async function loadProductsList() {
    const { data } = await supabaseClient
        .from('products')
        .select('*, categories(name)');
    renderProductsList(data || []);
}

function renderProductsList(products) {
    const tbody = document.getElementById('products-table');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.categories?.name || ''}</td>
            <td>₺${p.price}</td>
            <td>${p.stock || 0}</td>
            <td>
                <button onclick="deleteProduct('${p.id}')">Sil</button>
            </td>
        </tr>
    `).join('');
}

async function deleteProduct(id) {
    await supabaseClient.from('products').delete().eq('id', id);
    loadProductsList();
}

// =============================
// CATEGORIES
// =============================
async function loadCategoriesList() {
    const { data } = await supabaseClient.from('categories').select('*');
    const tbody = document.getElementById('categories-table');

    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.description || ''}</td>
            <td><button onclick="deleteCategory('${c.id}')">Sil</button></td>
        </tr>
    `).join('');
}

async function deleteCategory(id) {
    await supabaseClient.from('categories').delete().eq('id', id);
    loadCategoriesList();
}

// =============================
// ORDERS
// =============================
async function loadOrdersList() {
    const { data } = await supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    renderOrdersList(data, 'orders-table');
}

function renderOrdersList(orders, tableId) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id?.substring(0,8)}</td>
            <td>${o.fullname}</td>
            <td>${o.phone}</td>
            <td>₺${o.total_amount}</td>
            <td>${o.status || 'Yeni'}</td>
        </tr>
    `).join('');
}

// =============================
// USERS
// =============================
async function loadUsersList() {
    const { data } = await supabaseClient.from('profiles').select('*');
    const tbody = document.getElementById('users-table');

    tbody.innerHTML = data.map(u => `
        <tr>
            <td>${u.email}</td>
            <td>${u.full_name || ''}</td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
            <td></td>
        </tr>
    `).join('');
}

// =============================
// COUPONS
// =============================
async function loadCouponsList() {
    const { data } = await supabaseClient.from('coupons').select('*');
    const tbody = document.getElementById('coupons-table');

    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.code}</td>
            <td>${c.discount_percent}%</td>
            <td>${c.valid_until}</td>
            <td><button onclick="deleteCoupon('${c.id}')">Sil</button></td>
        </tr>
    `).join('');
}

async function deleteCoupon(id) {
    await supabaseClient.from('coupons').delete().eq('id', id);
    loadCouponsList();
}

// =============================
// SETTINGS
// =============================
async function loadSettings() {
    const { data } = await supabaseClient
        .from('site_settings')
        .select('*')
        .single();

    if (!data) return;

    document.getElementById('announcement').value = data.announcement || '';
}

async function saveSettings(e) {
    e.preventDefault();

    await supabaseClient
        .from('site_settings')
        .upsert([{
            announcement: document.getElementById('announcement').value
        }]);

    alert("Kaydedildi");
}
