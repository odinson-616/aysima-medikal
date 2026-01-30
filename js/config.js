// ========================================
// CONFIG.JS - Supabase Configuration
// ========================================

// ⚠️ IMPORTANT: These are your Supabase credentials
// For production, use environment variables or a secure backend
const SUPABASE_URL = "https://eqpioawtdwkaeuxpfspt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcGlvYXd0ZHdrYWV1eHBmc3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjk2ODUsImV4cCI6MjA4NTIwNTY4NX0.TIOQvOaSTlcd8xs6lbLKJYPkJgzGGTHY1MPb9BahAWs";

// Initialize Supabase Client
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase client initialized successfully");
} else {
    console.error("❌ Supabase library not loaded!");
    alert("Bağlantı hatası! Lütfen sayfayı yenileyin.");
}

// Debug Mode (set to false in production)
const DEBUG_MODE = false;

// App Configuration
const APP_CONFIG = {
    siteName: "AYSİMA MEDİKAL",
    currency: "₺",
    autoDiscountThreshold: 5000, // Minimum cart value for auto discount
    autoDiscountAmount: 250,      // Auto discount amount in TL
    itemsPerPage: 12,
    maxCartQuantity: 99,
    defaultAnnouncement: "🎉 AYSİMA MEDİKAL'e Hoş Geldiniz! Sağlıklı günler dileriz."
};

// Export for use in other modules
window.APP_CONFIG = APP_CONFIG;
