// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = 'https://eqpioawtdwkaeuxpfspt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcGlvYXd0ZHdrYWV1eHBmc3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMTk3OTksImV4cCI6MjA1Mjg5NTc5OX0.CvcbovBdNk9gLKZ4W-WeyQkPUIf6W55D6M7QIcTzIxs';

// Initialize Supabase - Window objesi üzerinden güvenli erişim
if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('❌ Supabase kütüphanesi yüklenemedi! Lütfen index.html içindeki CDN bağlantısını kontrol edin.');
}

// ============================================
// APP STATE (GLOBAL) - Tüm uygulama verileri burada tutulur
// ============================================
window.APP = {
    currentUser: null,
    cart: JSON.parse(localStorage.getItem('aysima_cart')) || [],
    products: [],
    categories: [],
    filters: {
        category: null,
        search: ''
    }
};

// Loglama (Hata ayıklama için)
console.log('✅ Config loaded successfully');
console.log('Uygulama Durumu:', window.APP);
