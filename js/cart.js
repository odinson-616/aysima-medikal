// cart.js - PROFESSIONAL VERSION

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById("cart-count").innerText = totalQty;
}

function toggleCart(open) {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("overlay");

    if (open) {
        sidebar.classList.add("open");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        renderCart();
    } else {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}

function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url,
            qty: 1
        });
    }

    saveCart();
    updateCartCount();
    renderCart();
    toggleCart(true);
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    saveCart();
    updateCartCount();
    renderCart();
}

function renderCart() {
    const container = document.getElementById("cart-items");
    container.innerHTML = "";

    if (!cart.length) {
        container.innerHTML = "<p>Sepetiniz boş</p>";
        document.getElementById("cart-total").innerText = "0.00";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.image}" alt="">
            <div>
                <strong>${item.name}</strong>
                <p>${item.price.toFixed(2)} ₺</p>
                <div>
                    <button onclick="changeQty('${item.id}', -1)">-</button>
                    ${item.qty}
                    <button onclick="changeQty('${item.id}', 1)">+</button>
                </div>
            </div>
        `;

        container.appendChild(div);
    });

    document.getElementById("cart-total").innerText = total.toFixed(2);
}

function handleCheckout() {
    if (!cart.length) {
        alert("Sepet boş");
        return;
    }

    document.getElementById("summary-total").innerText =
        document.getElementById("cart-total").innerText;

    document.getElementById("order-modal").style.display = "block";
    document.getElementById("order-overlay").style.display = "block";
}

function closeOrderModal() {
    document.getElementById("order-modal").style.display = "none";
    document.getElementById("order-overlay").style.display = "none";
}

async function submitOrder(event) {
    event.preventDefault();

    const fullname = document.getElementById("order-fullname").value.trim();
    const phone = document.getElementById("order-phone").value.trim();
    const address = document.getElementById("order-address").value.trim();

    if (!fullname || !phone || !address) {
        alert("Lütfen tüm alanları doldurun");
        return;
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    try {
        const { data: order, error } = await window.supabaseClient
            .from("orders")
            .insert([{
                fullname,
                phone,
                address,
                total_amount: total,
                status: "Yeni"
            }])
            .select()
            .single();

        if (error) throw error;

        const orderItems = cart.map(i => ({
            order_id: order.id,
            product_id: i.id,
            quantity: i.qty,
            unit_price: i.price
        }));

        await window.supabaseClient.from("order_items").insert(orderItems);

        alert("Sipariş alındı 🎉");

        cart = [];
        saveCart();
        updateCartCount();
        renderCart();
        closeOrderModal();
        toggleCart(false);

    } catch (err) {
        console.error(err);
        alert("Sipariş gönderilemedi");
    }
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") toggleCart(false);
});

updateCartCount();
