async function loadProducts() {
    try {
        console.log('📦 Ürünler yalın halde çekiliyor...');
        
        // Sadece products tablosunu çekiyoruz, ilişki (relationship) hatasını engelliyoruz
        const { data, error } = await window.supabase
            .from('products')
            .select('*') 
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('✅ Veri çekildi:', data);
        window.APP.products = data || [];
        renderProducts(window.APP.products);

    } catch (err) {
        console.error('❌ Ürün yükleme hatası:', err.message);
        const grid = document.getElementById('product-grid');
        if (grid) grid.innerHTML = `<p style="color:red;">Hata: ${err.message}</p>`;
    }
}
