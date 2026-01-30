// profile.js - PROFESSIONAL VERSION

async function loadUserProfile() {
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();

        if (!user) {
            document.getElementById("profile-content").innerHTML =
                "<p>Lütfen giriş yapınız</p>";
            return;
        }

        document.getElementById("user-email").innerText = user.email;
        loadOrders(user.id);

    } catch (err) {
        console.error(err);
    }
}

async function loadOrders(userId) {
    try {
        const { data, error } = await window.supabaseClient
            .from("orders")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        renderOrders(data);

    } catch (err) {
        console.error("Sipariş yükleme hatası:", err);
    }
}

function renderOrders(orders) {
    const container = document.getElementById("orders-container");
    container.innerHTML = "";

    if (!orders.length) {
        container.innerHTML = "<p>Henüz sipariş yok</p>";
        return;
    }

    orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";

        card.innerHTML = `
            <h3>Sipariş #${order.id}</h3>
            <p>Tarih: ${new Date(order.created_at).toLocaleDateString()}</p>
            <p>Durum: ${order.status}</p>
            <p>Toplam: ${order.total_amount.toFixed(2)} ₺</p>
        `;

        container.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", loadUserProfile);
