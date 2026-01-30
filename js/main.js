// main.js - PROFESSIONAL VERSION

document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    await loadProducts();
    loadAnnouncement();
    setupUserMenu();
});

// =============================
// KATEGORİ YÜKLEME
// =============================
async function loadCategories() {
    try {
        const { data, error } = await window.supabaseClient
            .from("categories")
            .select("*")
            .order("name");

        if (error) throw error;

        renderCategories(data);

    } catch (err) {
        console.error("Kategori yükleme hatası:", err);
        document.getElementById("category-list").innerHTML =
            "<li>Kategoriler yüklenemedi</li>";
    }
}

function renderCategories(categories) {
    const list = document.getElementById("category-list");
    list.innerHTML = "";

    const allItem = document.createElement("li");
    allItem.innerText = "Tüm Ürünler";
    allItem.onclick = () => {
        activeCategoryId = null;
        document.getElementById("page-name").innerText = "Tüm Ürünler";
        applyFilters();
    };
    list.appendChild(allItem);

    categories.forEach(cat => {
        const li = document.createElement("li");
        li.innerText = cat.name;
        li.onclick = () => filterByCategory(cat.id, cat.name);
        list.appendChild(li);
    });
}

// =============================
// DUYURU BAR
// =============================
async function loadAnnouncement() {
    try {
        const { data, error } = await window.supabaseClient
            .from("site_settings")
            .select("announcement")
            .single();

        if (error) throw error;

        document.getElementById("announcement-text").innerText =
            data.announcement || "";

    } catch (err) {
        console.warn("Duyuru yüklenemedi");
    }
}

// =============================
// KULLANICI MENÜSÜ
// =============================
function setupUserMenu() {
    const userBtn = document.getElementById("user-display");

    window.supabaseClient.auth.getUser().then(({ data }) => {
        if (data.user) {
            userBtn.innerText = "👤 Hesabım";
        }
    });
}

function handleUserClick() {
    window.supabaseClient.auth.getUser().then(({ data }) => {
        if (!data.user) {
            openAuth();
        } else {
            const dropdown = document.getElementById("user-dropdown");
            dropdown.style.display =
                dropdown.style.display === "block" ? "none" : "block";
        }
    });
}

function handleLogout() {
    window.supabaseClient.auth.signOut().then(() => {
        location.reload();
    });
}

// =============================
// ESC KAPAMA
// =============================
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        toggleCart(false);
        closeOrderModal();
    }
});
