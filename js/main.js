// main.js - Ana Uygulama Mantığı

// =============================
// SAYFA YÜKLENDİĞİNDE
// =============================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Uygulama başlatılıyor...");

    // Supabase kontrolü
    if (!window.supabaseClient) {
        console.error("❌ Supabase client bulunamadı!");
        showError("Bağlantı hatası! Lütfen sayfayı yenileyin.");
        return;
    }

    // Verileri yükle
    await loadCategories();
    await loadProducts();
    await loadAnnouncement();
    setupUserMenu();

    console.log("✅ Uygulama başarıyla yüklendi");
});

// =============================
// KATEGORİ YÜKLEME
// =============================
async function loadCategories() {
    console.log("📂 Kategoriler yükleniyor...");

    try {
        const { data, error } = await window.supabaseClient
            .from("categories")
            .select("*")
            .order("name");

        if (error) throw error;

        console.log("✅ Kategoriler alındı:", data);
        renderCategories(data || []);

    } catch (err) {
        console.error("❌ Kategori yükleme hatası:", err);
        const categoryList = document.getElementById("category-list");
        if (categoryList) {
            categoryList.innerHTML = `
                <li style="color: #e74c3c; padding: 15px; text-align: center;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Kategoriler yüklenemedi
                </li>
            `;
        }
    }
}

// =============================
// KATEGORİLERİ RENDER ET
// =============================
function renderCategories(categories) {
    const list = document.getElementById("category-list");
    
    if (!list) {
        console.error("❌ category-list bulunamadı!");
        return;
    }

    list.innerHTML = "";

    // "Tüm Ürünler" kategorisi
    const allItem = document.createElement("li");
    allItem.innerHTML = '<i class="fas fa-th"></i> Tüm Ürünler';
    allItem.classList.add("active");
    allItem.onclick = () => {
        // Tüm kategori öğelerinden active sınıfını kaldır
        document.querySelectorAll("#category-list li").forEach(li => {
            li.classList.remove("active");
        });
        allItem.classList.add("active");
        
        activeCategoryId = null;
        const pageNameEl = document.getElementById("page-name");
        if (pageNameEl) {
            pageNameEl.innerText = "Tüm Ürünler";
        }
        applyFilters();
    };
    list.appendChild(allItem);

    // Kategorileri ekle
    if (categories && categories.length > 0) {
        categories.forEach(cat => {
            const li = document.createElement("li");
            li.innerHTML = `<i class="fas fa-folder"></i> ${cat.name}`;
            li.onclick = () => {
                // Tüm kategori öğelerinden active sınıfını kaldır
                document.querySelectorAll("#category-list li").forEach(item => {
                    item.classList.remove("active");
                });
                li.classList.add("active");
                
                filterByCategory(cat.id, cat.name);
            };
            list.appendChild(li);
        });
    }
}

// =============================
// DUYURU YÜKLEME
// =============================
async function loadAnnouncement() {
    console.log("📢 Duyuru yükleniyor...");

    try {
        const { data, error } = await window.supabaseClient
            .from("site_settings")
            .select("announcement")
            .limit(1)
            .single();

        if (error) {
            // Eğer tablo yoksa veya veri yoksa, varsayılan duyuru göster
            if (error.code === 'PGRST116' || error.code === '42P01') {
                console.warn("⚠️ site_settings tablosu bulunamadı");
                setDefaultAnnouncement();
                return;
            }
            throw error;
        }

        const announcementEl = document.getElementById("announcement-text");
        if (announcementEl) {
            announcementEl.innerText = data?.announcement || "Hoş geldiniz!";
        }

    } catch (err) {
        console.warn("⚠️ Duyuru yüklenemedi:", err.message);
        setDefaultAnnouncement();
    }
}

function setDefaultAnnouncement() {
    const announcementEl = document.getElementById("announcement-text");
    if (announcementEl) {
        announcementEl.innerText = "🎉 AYSİMA MEDİKAL'e Hoş Geldiniz! Sağlıklı günler dileriz.";
    }
}

// =============================
// KULLANICI MENÜSÜ
// =============================
function setupUserMenu() {
    if (!window.supabaseClient) return;

    const userBtn = document.getElementById("user-display");
    
    if (!userBtn) {
        console.warn("⚠️ user-display butonu bulunamadı");
        return;
    }

    // Kullanıcı durumunu kontrol et
    window.supabaseClient.auth.getUser().then(({ data }) => {
        if (data?.user) {
            userBtn.innerHTML = '<i class="fas fa-user-circle"></i> Hesabım';
        } else {
            userBtn.innerHTML = '<i class="fas fa-user"></i> Giriş Yap';
        }
    }).catch(err => {
        console.error("❌ Kullanıcı durumu kontrol edilemedi:", err);
    });

    // Auth değişikliklerini dinle
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            userBtn.innerHTML = '<i class="fas fa-user-circle"></i> Hesabım';
        } else if (event === 'SIGNED_OUT') {
            userBtn.innerHTML = '<i class="fas fa-user"></i> Giriş Yap';
        }
    });
}

// =============================
// KULLANICI TIKLAMA
// =============================
function handleUserClick() {
    if (!window.supabaseClient) {
        alert("Bağlantı hatası! Lütfen sayfayı yenileyin.");
        return;
    }

    window.supabaseClient.auth.getUser().then(({ data }) => {
        if (!data?.user) {
            // Kullanıcı giriş yapmamışsa auth modalını aç
            if (typeof openAuth === 'function') {
                openAuth();
            } else {
                alert("Giriş özelliği şu anda kullanılamıyor.");
            }
        } else {
            // Kullanıcı giriş yapmışsa dropdown menüyü göster
            const dropdown = document.getElementById("user-dropdown");
            if (dropdown) {
                const isVisible = dropdown.style.display === "block";
                dropdown.style.display = isVisible ? "none" : "block";
            }
        }
    }).catch(err => {
        console.error("❌ Kullanıcı kontrolü hatası:", err);
    });
}

// Dropdown'u dışarı tıklayınca kapat
document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("user-dropdown");
    const userBtn = document.getElementById("user-display");
    
    if (dropdown && userBtn) {
        if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = "none";
        }
    }
});

// =============================
// ÇIKIŞ YAP
// =============================
function handleLogout() {
    if (!window.supabaseClient) return;

    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
        window.supabaseClient.auth.signOut().then(() => {
            console.log("✅ Kullanıcı çıkış yaptı");
            location.reload();
        }).catch(err => {
            console.error("❌ Çıkış hatası:", err);
            alert("Çıkış yapılırken bir hata oluştu.");
        });
    }
}

// =============================
// ESC TUŞU İLE KAPAT
// =============================
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        toggleCart(false);
        closeOrderModal();
        
        const authModal = document.getElementById("auth-modal");
        const authOverlay = document.getElementById("auth-overlay");
        if (authModal) authModal.style.display = "none";
        if (authOverlay) authOverlay.style.display = "none";
        
        const dropdown = document.getElementById("user-dropdown");
        if (dropdown) dropdown.style.display = "none";
    }
});

// =============================
// HATA MESAJI GÖSTER
// =============================
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #e74c3c;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        text-align: center;
        font-size: 16px;
        font-weight: 600;
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 10px;"></i>
        <p>${message}</p>
    `;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// =============================
// CSS EKLEMELERİ
// =============================
if (!document.getElementById("category-active-style")) {
    const style = document.createElement("style");
    style.id = "category-active-style";
    style.textContent = `
        #category-list li.active {
            background: #fff4f4;
            color: var(--bordo);
            font-weight: 700;
            border-left: 4px solid var(--bordo);
        }
        
        #category-list li i {
            margin-right: 8px;
            opacity: 0.7;
        }
        
        #category-list li.active i {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}
