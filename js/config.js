// config.js - Supabase Configuration

// ⚠️ PRODUCTION UYARISI: 
// Bu anahtarlar geliştirme amaçlıdır. Production'da environment variables kullanın!
// Örnek: process.env.SUPABASE_URL veya bir backend üzerinden yönetin.

const SUPABASE_URL = "https://eqpioawtdwkaeuxpfspt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcGlvYXd0ZHdrYWV1eHBmc3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjk2ODUsImV4cCI6MjA4NTIwNTY4NX0.TIOQvOaSTlcd8xs6lbLKJYPkJgzGGTHY1MPb9BahAWs";

// Supabase client oluştur
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase client başarıyla oluşturuldu");
} else {
    console.error("❌ Supabase kütüphanesi yüklenemedi!");
}

// Debug modu (production'da false yapın!)
const DEBUG_MODE = false;  // ⚠️ Production'da mutlaka false olmalı!

if (DEBUG_MODE) {
    // Debug panel göster
    setTimeout(async () => {
        const debugBox = document.createElement('div');
        debugBox.id = 'debug-box';
        debugBox.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: black;
            color: #00ff00;
            padding: 10px;
            font-size: 12px;
            z-index: 9999;
            border-radius: 5px;
            font-family: monospace;
            max-width: 300px;
        `;
        debugBox.innerHTML = "🔄 Kontrol ediliyor...";
        document.body.appendChild(debugBox);

        if (!window.supabaseClient) {
            debugBox.innerHTML = "❌ SupabaseClient YOK";
            return;
        }

        debugBox.innerHTML = "✅ SupabaseClient var<br>";

        try {
            // Kategorileri kontrol et
            const catRes = await window.supabaseClient.from("categories").select("*");
            debugBox.innerHTML += `📂 Kategoriler: ${catRes.data ? catRes.data.length : "null"}<br>`;
            if (catRes.error) {
                debugBox.innerHTML += `⚠️ Cat Error: ${catRes.error.message}<br>`;
            }

            // Ürünleri kontrol et
            const prodRes = await window.supabaseClient.from("products").select("*");
            debugBox.innerHTML += `🛒 Ürünler: ${prodRes.data ? prodRes.data.length : "null"}<br>`;
            if (prodRes.error) {
                debugBox.innerHTML += `⚠️ Prod Error: ${prodRes.error.message}`;
            }

        } catch (e) {
            debugBox.innerHTML += `❌ HATA: ${e.message}`;
        }
    }, 1500);
}
