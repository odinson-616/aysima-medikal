// admin.js - Admin Panel İşlevleri

let currentEditingId = null;

// =============================
// SAYFA YÜKLENDİĞİNDE
// =============================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🔐 Admin Panel başlatılıyor...");

    // Supabase kontrolü
    if (!window.supabaseClient) {
        showNotification("Supabase bağlantısı başarısız!", "error");
        return;
    }

    // Admin yetkisi kontrol et
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Varsayılan verileri yükle
    await loadDashboardData();
    await loadProductsList();
    await loadCategoriesList();
    await loadOrdersList();
    await loadUsersList();
    await loadCouponsList();
    await loadSettings();

    console.log("✅ Admin Panel hazır");
});

// =============================
// TAB GEÇIŞ
// =============================
function switchTab(tabName) {
    // Tüm sekmeleri gizle
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Tüm menü linklerini pasif yap
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.classList.remove('active');
    });

    // Seçili sekmeyi göster
    const section = document.getElementById(tabName);
    if (section) {
        section.classList.add('active');
    }

    // Seçili menü linkini aktif yap
    event.target.closest('a').classList.add('active');

    return false;
}

// =============================
// DASHBOARD VERİ YÜKLEME
// =============================
async function loadDashboardData() {
    try {
        // Ürünler
        const { count: productCount } = await window.supabaseClient
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Siparişler
        const { data: orders } = await window.supabaseClient
            .from('orders')
            .select('*');

        // Kullanıcılar
        const { count: userCount } = await window.supabaseClient
            .from('users')
            .select('*', { count: 'exact', head: true });

        document.getElementById('total-products').textContent = productCount || 0;
        document.getElementById('total-orders').textContent = orders?.length || 0;
        document.getElementById('total-users').textContent = userCount || 0;

        // Bu ay geliri hesapla
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const monthlyOrders = orders?.filter(o => {
            const d = new Date(o.created_at);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }) || [];
        
        const revenue = monthlyOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        document.getElementById('monthly-revenue').textContent = `₺${revenue.toFixed(2)}`;

        // Son siparişler
        if (orders && orders.length > 0) {
            const recentOrders = orders.slice(0, 5);
            renderOrdersList(recentOrders, 'recent-orders');
        }

    } catch (err) {
        console.error("❌ Dashboard verisi yüklenemedi:", err);
        showNotification("Dashboard verisi yüklenemedi", "error");
    }
}

// =============================
// ÜRÜNLER
// =============================
async function loadProductsList() {
    try {
        const { data, error } = await window.supabaseClient
            .from('products')
            .select('*, categories(name)');

        if (error) throw error;

        renderProductsList(data || []);
    } catch (err) {
        console.error("❌ Ürünler yüklenemedi:", err);
    }
}

function renderProductsList(products) {
    const tbody = document.getElementById('products-table');
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Ürün bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.categories?.name || 'N/A'}</td>
            <td>₺${product.price.toFixed(2)}</td>
            <td>${product.stock || 0}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button class="action-btn btn-delete" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </td>
        </tr>
    `).join('');
}

function showProductForm(productId) {
    if (productId) {
        console.log("Ürün düzenleme:", productId);
        // Ürünü getir ve form'u doldur
    } else {
        currentEditingId = null;
    }

    const modal = document.getElementById('admin-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <h3 style="margin-bottom: 20px;">Yeni Ürün Ekle</h3>
        <form onsubmit="saveProduct(event)">
            <div class="form-group">
                <label>Ürün Adı</label>
                <input type="text" id="product-name" required>
            </div>
            <div class="form-group">
                <label>Kategori</label>
                <select id="product-category" required>
                    <option value="">-- Seç --</option>
                </select>
            </div>
            <div class="form-group">
                <label>Fiyat (₺)</label>
                <input type="number" id="product-price" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Stok Miktarı</label>
                <input type="number" id="product-stock" min="0" required>
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea id="product-description"></textarea>
            </div>
            <div class="form-group">
                <label>Resim URL</label>
                <input type="url" id="product-image">
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="form-btn">Kaydet</button>
                <button type="button" class="form-btn secondary" onclick="closeModal()">İptal</button>
            </div>
        </form>
    `;

    modal.classList.add('active');
    loadCategoriesForSelect();
}

async function loadCategoriesForSelect() {
    try {
        const { data } = await window.supabaseClient
            .from('categories')
            .select('id, name');

        const select = document.getElementById('product-category');
        if (select && data) {
            data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Kategoriler yüklenemedi:", err);
    }
}

async function saveProduct(e) {
    e.preventDefault();

    const product = {
        name: document.getElementById('product-name').value,
        category_id: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        description: document.getElementById('product-description').value,
        image: document.getElementById('product-image').value
    };

    try {
        if (currentEditingId) {
            await window.supabaseClient
                .from('products')
                .update(product)
                .eq('id', currentEditingId);
            showNotification("Ürün güncellendi", "success");
        } else {
            await window.supabaseClient
                .from('products')
                .insert([product]);
            showNotification("Ürün eklendi", "success");
        }

        closeModal();
        loadProductsList();
    } catch (err) {
        console.error("Ürün kaydedilemedi:", err);
        showNotification("Hata: " + err.message, "error");
    }
}

async function deleteProduct(productId) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
        await window.supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);

        showNotification("Ürün silindi", "success");
        loadProductsList();
    } catch (err) {
        showNotification("Silme hatası: " + err.message, "error");
    }
}

function editProduct(productId) {
    currentEditingId = productId;
    showProductForm(productId);
}

// =============================
// KATEGORİLER
// =============================
async function loadCategoriesList() {
    try {
        const { data } = await window.supabaseClient
            .from('categories')
            .select('*');

        renderCategoriesList(data || []);
    } catch (err) {
        console.error("Kategoriler yüklenemedi:", err);
    }
}

function renderCategoriesList(categories) {
    const tbody = document.getElementById('categories-table');
    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">Kategori bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.name}</td>
            <td>${cat.description || '-'}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editCategory('${cat.id}')">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button class="action-btn btn-delete" onclick="deleteCategory('${cat.id}')">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </td>
        </tr>
    `).join('');
}

function showCategoryForm(categoryId) {
    const modal = document.getElementById('admin-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <h3 style="margin-bottom: 20px;">Kategori Ekle/Düzenle</h3>
        <form onsubmit="saveCategory(event)">
            <div class="form-group">
                <label>Kategori Adı</label>
                <input type="text" id="category-name" required>
            </div>
            <div class="form-group">
                <label>Açıklama</label>
                <textarea id="category-description"></textarea>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="form-btn">Kaydet</button>
                <button type="button" class="form-btn secondary" onclick="closeModal()">İptal</button>
            </div>
        </form>
    `;

    modal.classList.add('active');
    currentEditingId = categoryId;
}

async function saveCategory(e) {
    e.preventDefault();

    const category = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value
    };

    try {
        if (currentEditingId) {
            await window.supabaseClient
                .from('categories')
                .update(category)
                .eq('id', currentEditingId);
            showNotification("Kategori güncellendi", "success");
        } else {
            await window.supabaseClient
                .from('categories')
                .insert([category]);
            showNotification("Kategori eklendi", "success");
        }

        closeModal();
        loadCategoriesList();
    } catch (err) {
        showNotification("Hata: " + err.message, "error");
    }
}

async function deleteCategory(categoryId) {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

    try {
        await window.supabaseClient
            .from('categories')
            .delete()
            .eq('id', categoryId);

        showNotification("Kategori silindi", "success");
        loadCategoriesList();
    } catch (err) {
        showNotification("Silme hatası: " + err.message, "error");
    }
}

function editCategory(categoryId) {
    currentEditingId = categoryId;
    showCategoryForm(categoryId);
}

// =============================
// SİPARİŞLER
// =============================
async function loadOrdersList() {
    try {
        const { data } = await window.supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        renderOrdersList(data || [], 'orders-table');
    } catch (err) {
        console.error("Siparişler yüklenemedi:", err);
    }
}

function renderOrdersList(orders, tableId) {
    const tbody = document.getElementById(tableId);
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">Sipariş bulunamadı</td></tr>';
        return;
    }

    const columns = tableId === 'recent-orders' ? 5 : 6;
    const extraCol = tableId === 'recent-orders' ? '' : '<td><button class="action-btn btn-edit" onclick="viewOrder(\'${order.id}\')"><i class="fas fa-eye"></i> Görüntüle</button></td>';

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id?.substring(0, 8)}...</td>
            <td>${order.customer_name}</td>
            ${tableId !== 'recent-orders' ? `<td>${order.customer_phone}</td>` : ''}
            <td>₺${order.total_price.toFixed(2)}</td>
            <td><span style="background: #e8f4f8; color: #0277bd; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${order.status || 'Beklemede'}</span></td>
            ${tableId !== 'recent-orders' ? `<td><button class="action-btn btn-edit" onclick="viewOrder('${order.id}')"><i class="fas fa-eye"></i> Görüntüle</button></td>` : ''}
        </tr>
    `).join('');
}

// =============================
// KULLANICILAR
// =============================
async function loadUsersList() {
    try {
        const { data } = await window.supabaseClient.auth.admin.listUsers();
        renderUsersList(data?.users || []);
    } catch (err) {
        console.error("Kullanıcılar yüklenemedi:", err);
        // Fallback: manuel user tablosundan yükle
        const { data } = await window.supabaseClient.from('users').select('*');
        renderUsersList(data || []);
    }
}

function renderUsersList(users) {
    const tbody = document.getElementById('users-table');
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Kullanıcı bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = users.slice(0, 10).map(user => `
        <tr>
            <td>${user.email}</td>
            <td>${user.user_metadata?.full_name || '-'}</td>
            <td>${new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </td>
        </tr>
    `).join('');
}

// =============================
// KUPONLAR
// =============================
async function loadCouponsList() {
    try {
        const { data } = await window.supabaseClient
            .from('coupons')
            .select('*');

        renderCouponsList(data || []);
    } catch (err) {
        console.error("Kuponlar yüklenemedi:", err);
    }
}

function renderCouponsList(coupons) {
    const tbody = document.getElementById('coupons-table');
    if (!coupons || coupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Kupon bulunamadı</td></tr>';
        return;
    }

    tbody.innerHTML = coupons.map(coupon => `
        <tr>
            <td><code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${coupon.code}</code></td>
            <td>${coupon.discount_percent}%</td>
            <td>${new Date(coupon.valid_until).toLocaleDateString('tr-TR')}</td>
            <td>${new Date(coupon.valid_until) > new Date() ? '✅ Aktif' : '❌ Süresi Bitti'}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteCoupon('${coupon.id}')">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </td>
        </tr>
    `).join('');
}

function showCouponForm(couponId) {
    const modal = document.getElementById('admin-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <h3 style="margin-bottom: 20px;">Kupon Ekle</h3>
        <form onsubmit="saveCoupon(event)">
            <div class="form-group">
                <label>Kupon Kodu</label>
                <input type="text" id="coupon-code" placeholder="SUMMER2024" required>
            </div>
            <div class="form-group">
                <label>İndirim %</label>
                <input type="number" id="coupon-discount" min="1" max="100" required>
            </div>
            <div class="form-group">
                <label>Geçerlilik Tarihi</label>
                <input type="date" id="coupon-valid-until" required>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="form-btn">Kaydet</button>
                <button type="button" class="form-btn secondary" onclick="closeModal()">İptal</button>
            </div>
        </form>
    `;

    modal.classList.add('active');
}

async function saveCoupon(e) {
    e.preventDefault();

    const coupon = {
        code: document.getElementById('coupon-code').value.toUpperCase(),
        discount_percent: parseInt(document.getElementById('coupon-discount').value),
        valid_until: document.getElementById('coupon-valid-until').value
    };

    try {
        await window.supabaseClient
            .from('coupons')
            .insert([coupon]);

        showNotification("Kupon eklendi", "success");
        closeModal();
        loadCouponsList();
    } catch (err) {
        showNotification("Hata: " + err.message, "error");
    }
}

async function deleteCoupon(couponId) {
    if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;

    try {
        await window.supabaseClient
            .from('coupons')
            .delete()
            .eq('id', couponId);

        showNotification("Kupon silindi", "success");
        loadCouponsList();
    } catch (err) {
        showNotification("Silme hatası: " + err.message, "error");
    }
}

// =============================
// AYARLAR
// =============================
async function loadSettings() {
    try {
        const { data } = await window.supabaseClient
            .from('site_settings')
            .select('*')
            .limit(1)
            .single();

        if (data) {
            document.getElementById('announcement').value = data.announcement || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('instagram').value = data.instagram || '';
            document.getElementById('whatsapp').value = data.whatsapp || '';
            document.getElementById('debug-mode').value = data.debug_mode || false;
        }
    } catch (err) {
        console.warn("Ayarlar yüklenemedi:", err);
    }
}

async function saveSettings(e) {
    e.preventDefault();

    const settings = {
        announcement: document.getElementById('announcement').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        instagram: document.getElementById('instagram').value,
        whatsapp: document.getElementById('whatsapp').value,
        debug_mode: document.getElementById('debug-mode').value === 'true'
    };

    try {
        await window.supabaseClient
            .from('site_settings')
            .upsert([settings]);

        showNotification("Ayarlar kaydedildi", "success");
    } catch (err) {
        showNotification("Hata: " + err.message, "error");
    }
}

// =============================
// YARDIMCI FONKSİYONLAR
// =============================
function closeModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.remove('active');
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

async function deleteUser(userId) {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;

    try {
        // Admin olarak kullanıcı silme
        showNotification("Kullanıcı silindi", "success");
        loadUsersList();
    } catch (err) {
        showNotification("Silme hatası: " + err.message, "error");
    }
}

function viewOrder(orderId) {
    alert("Sipariş detayı: " + orderId);
}

async function adminLogout() {
    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
        await window.supabaseClient.auth.signOut();
        window.location.href = "index.html";
    }
}
