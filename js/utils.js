// utils.js - PROFESSIONAL VERSION

// =============================
// XSS GÜVENLİ METİN DÖNÜŞÜMÜ
// =============================
function escapeHTML(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

// =============================
// PARA FORMATLAMA
// =============================
function formatPrice(value) {
    return Number(value).toFixed(2) + " ₺";
}

// =============================
// DEBOUNCE (Arama optimizasyonu)
// =============================
function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// =============================
// LOADING GÖSTER / GİZLE
// =============================
function showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = "<p>Yükleniyor...</p>";
}

function hideLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = "";
}

// =============================
// TARİH FORMATLAMA
// =============================
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("tr-TR");
}

// =============================
// SCROLL LOCK
// =============================
function lockScroll() {
    document.body.style.overflow = "hidden";
}

function unlockScroll() {
    document.body.style.overflow = "auto";
}

// =============================
// LOCAL STORAGE YARDIMCILARI
// =============================
function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// =============================
// MODAL KAPAMA ESC
// =============================
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        const modal = document.querySelector(".modal");
        if (modal) modal.style.display = "none";
    }
});
