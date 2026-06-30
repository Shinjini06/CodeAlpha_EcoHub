const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let cart = [];
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        updateUI();
        loadProducts();
        showShop();
    } else {
        showAuthSection();
    }
});

function showAuthSection() {
    hideAllPages();
    document.getElementById('authPage').style.display = 'block';
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('cartBadge').style.display = 'none';
}

function showShop() {
    if (!currentUser) return showAuthSection();
    hideAllPages();
    document.getElementById('shopPage').style.display = 'block';
}

function showCart() {
    if (!currentUser) return showAuthSection();
    hideAllPages();
    document.getElementById('cartPage').style.display = 'block';
    renderCart();
}

function showOrders() {
    if (!currentUser) return showAuthSection();
    hideAllPages();
    document.getElementById('ordersPage').style.display = 'block';
    loadOrders();
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
}

function switchToSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const errorDiv = document.getElementById('signupError');
    errorDiv.textContent = '';

    if (!name || !email || !password || !confirm) {
        errorDiv.textContent = 'All fields required';
        return;
    }
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        return;
    }
    if (password !== confirm) {
        errorDiv.textContent = 'Passwords do not match';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword: confirm })
        });

        const data = await res.json();
        if (!res.ok) {
            errorDiv.textContent = data.error || 'Signup failed';
            return;
        }

        alert('✅ Account created! Please log in.');
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupConfirm').value = '';
        switchToLogin();
    } catch (err) {
        errorDiv.textContent = 'Error: ' + err.message;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';

    if (!email || !password) {
        errorDiv.textContent = 'Email and password required';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
            errorDiv.textContent = data.error || 'Login failed';
            return;
        }

        localStorage.setItem('token', data.token);
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));

        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';

        updateUI();
        loadProducts();
        showShop();
    } catch (err) {
        errorDiv.textContent = 'Error: ' + err.message;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    cart = [];
    showAuthSection();
    updateUI();
}

function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const cartBadge = document.getElementById('cartBadge');

    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        cartBadge.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        cartBadge.style.display = 'none';
    }
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        products = data.products || data || [];
        renderProducts();
    } catch (err) {
        console.error('Error loading products:', err);
    }
}

function renderProducts() {
    const list = document.getElementById('productsList');
    list.innerHTML = '';

    if (!products || products.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:2rem;">No products available</p>';
        return;
    }

    products.forEach(p => {
        const emoji = getEmoji(p.category);
        const inStock = p.stock > 0;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-emoji">${emoji}</div>
            <div class="product-category">${p.category}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-stock">${inStock ? p.stock + ' in stock' : 'Out of stock'}</div>
            <div class="product-price">$${parseFloat(p.price).toFixed(2)}</div>
            <button class="btn-add" onclick="addToCart(${p.id}, '${p.name}', ${p.price})" ${!inStock ? 'disabled' : ''}>
                ADD TO CART
            </button>
        `;
        list.appendChild(card);
    });
}

function getEmoji(cat) {
    const emojis = { 'personal care': '🧴', 'home': '🏠', 'clothing': '👕', 'food': '🥗', 'accessories': '🎒', 'furniture': '🪑', 'electronics': '📱' };
    return emojis[cat?.toLowerCase()] || '🌿';
}

function addToCart(id, name, price) {
    const item = cart.find(i => i.productId === id);
    if (item) item.quantity += 1;
    else cart.push({ productId: id, name, price, quantity: 1 });
    updateCartCount();
    alert(`✅ Added "${name}" to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.productId !== id);
    updateCartCount();
    renderCart();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.productId === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(id);
        else { updateCartCount(); renderCart(); }
    }
}

function updateCartCount() {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    document.getElementById('cartBadge').textContent = `CART (${count})`;
}

function renderCart() {
    const itemsList = document.getElementById('cartItemsList');
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const total = subtotal + 5;

    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('cartTotal').textContent = total.toFixed(2);

    if (cart.length === 0) {
        itemsList.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        document.getElementById('checkoutBtn').style.display = 'none';
        document.getElementById('checkoutForm').style.display = 'none';
        return;
    }

    itemsList.innerHTML = '';
    cart.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</p>
            </div>
            <div class="cart-controls">
                <button class="qty-btn" onclick="updateQty(${item.productId}, -1)">−</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQty(${item.productId}, 1)">+</button>
                <strong style="width:70px; text-align:right;">$${itemTotal}</strong>
                <button class="btn-remove" onclick="removeFromCart(${item.productId})">REMOVE</button>
            </div>
        `;
        itemsList.appendChild(el);
    });

    document.getElementById('checkoutBtn').style.display = 'block';
    document.getElementById('checkoutForm').style.display = 'none';
}

function showCheckoutForm() {
    document.getElementById('checkoutBtn').style.display = 'none';
    document.getElementById('checkoutForm').style.display = 'block';
}

async function handleCheckout() {
    const address = document.getElementById('shippingAddress').value.trim();
    const city = document.getElementById('shippingCity').value.trim();

    if (!address || !city) {
        alert('Please fill in shipping details');
        return;
    }
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    try {
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0) + 5;
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ items: cart, shippingAddress: address, shippingCity: city, total })
        });

        const data = await res.json();
        if (!res.ok) {
            alert('❌ Order failed: ' + (data.error || 'Unknown error'));
            return;
        }

        document.getElementById('modalMessage').textContent = `Order #${data.order?.id || 'Unknown'} placed!\nTotal: $${total.toFixed(2)}`;
        document.getElementById('successModal').style.display = 'flex';
        cart = [];
        updateCartCount();
        document.getElementById('shippingAddress').value = '';
        document.getElementById('shippingCity').value = '';
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    showShop();
}

async function loadOrders() {
    try {
        const res = await fetch(`${API_BASE}/orders`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        renderOrders(data.orders || data || []);
    } catch (err) {
        console.error('Error loading orders:', err);
    }
}

function renderOrders(orders) {
    const list = document.getElementById('ordersList');
    list.innerHTML = '';

    if (orders.length === 0) {
        list.innerHTML = '<div class="empty-orders">No orders yet</div>';
        return;
    }

    orders.forEach(order => {
        const date = new Date(order.created_at || order.createdAt).toLocaleDateString();
        const total = parseFloat(order.total || 0).toFixed(2);
        let itemsHTML = '';
        if (order.items?.length) {
            order.items.forEach(item => {
                itemsHTML += `<div class="order-item"><span>${item.name} x ${item.quantity}</span><span>$${(item.price * item.quantity).toFixed(2)}</span></div>`;
            });
        }
        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-date">${date}</div>
                </div>
                <div class="order-status">CONFIRMED</div>
            </div>
            ${itemsHTML ? '<div class="order-items">' + itemsHTML + '</div>' : ''}
            <div class="order-total">Total: $${total}</div>
        `;
        list.appendChild(card);
    });
}
