async function loadMyOrders() {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user) {
        location.href = 'index.html'; // Giriş yapmamışsa ana sayfaya at
        return;
    }

    const { data: orders, error } = await window.supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const listDiv = document.getElementById('orders-list');
    
    if (orders && orders.length > 0) {
        listDiv.innerHTML = orders.map(order => `
            <div style="background:white; border:1px solid #ddd; padding:15px; border-radius:8px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; font-weight:bold;">
                    <span>Sipariş No: #${order.id.slice(0,8)}</span>
                    <span style="color:#7b1e2b;">${order.total_price.toFixed(2)} ₺</span>
                </div>
                <div style="font-size:13px; color:#666; margin-top:5px;">
                    Tarih: ${new Date(order.created_at).toLocaleDateString('tr-TR')}
                </div>
                <div style="margin-top:10px; font-weight:bold;">
                    Durum: <span style="color:#27ae60;">${order.status || 'Onay Bekliyor'}</span>
                </div>
            </div>
        `).join('');
    } else {
        listDiv.innerHTML = '<p>Henüz bir siparişiniz bulunmuyor.</p>';
    }
}
