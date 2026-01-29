// ⚙️ URL API (Зміни порт, якщо треба)
const API_URL = ""; 

// Елементи DOM
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('error-msg');
const ordersContainer = document.getElementById('orders-container');

// 🚀 1. Перевірка авторизації при старті
window.addEventListener('load', () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        showDashboard();
    }
});

// 🔐 2. Логіка Входу (Login)
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    errorMsg.classList.add('d-none');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const res = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        if (!res.ok) throw new Error('Невірний логін або пароль');

        const data = await res.json();
        
        // Зберігаємо токен
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('username', username);
        
        showDashboard();

    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('d-none');
    }
};

// 🖥️ 3. Перемикання екранів + Завантаження даних
function showDashboard() {
    loginScreen.classList.add('d-none');
    dashboardScreen.classList.remove('d-none');
    document.getElementById('user-name').textContent = localStorage.getItem('username');
    
    // За замовчуванням вантажимо доступні замовлення
    loadOrders('available');
}

// 🚪 4. Вихід
window.logout = function() { // робимо глобальною функцією
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    location.reload();
}

// 📦 5. Завантаження замовлень (Available або My)
window.loadOrders = async function(type) {
    ordersContainer.innerHTML = '<div class="text-center w-100"><i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i></div>';
    
    // Активуємо кнопку в меню (візуал)
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const token = localStorage.getItem('access_token');
    let endpoint = type === 'available' ? '/master/orders/available' : '/master/orders/my'; // Підстав свої реальні роути

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) { logout(); return; } // Токен протух

        const orders = await res.json();
        renderOrders(orders, type);
        
        // Оновлюємо лічильник (просто для прикладу)
        if(type === 'available'){
            document.getElementById('stat-available').textContent = orders.length;
        } else{
            document.getElementById('stat-in-progress').textContent = orders.length;
        }

            

    } catch (e) {
        ordersContainer.innerHTML = `<div class="alert alert-danger w-100">Помилка завантаження: ${e.message}</div>`;
        // ДЛЯ ТЕСТУ (якщо бекенд вимкнений, розкоментуй це, щоб побачити дизайн):
        // renderMockOrders(); 
    }
}

// 🎨 6. Малювання карток
function renderOrders(orders, type) {
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<div class="text-center w-100 text-muted py-5"><h4>Пусто 🍃</h4><p>Немає замовлень у цій категорії</p></div>';
        return;
    }

    ordersContainer.innerHTML = '';
    
    orders.forEach(order => {
        // Визначаємо колір бейджика
        let badgeClass = 'bg-secondary';
        if (order.status === 'new') badgeClass = 'bg-success';
        if (order.status === 'in_progress') badgeClass = 'bg-warning text-dark';

        const card = `
        <div class="col-md-6 col-lg-4">
            <div class="order-card p-4 shadow-sm h-100 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <span class="badge ${badgeClass} badge-status text-uppercase">${order.status || 'Нове'}</span>
                    <small class="text-muted">#ID: ${order.id}</small>
                </div>
                
                <h5 class="fw-bold mb-1">${order.device.model || 'Невідомий пристрій'}</h5>
                <p class="text-muted small mb-3"><i class="fa-solid fa-user me-1"></i> ${order.device.client.first_name || 'Клієнт'}</p>
                
                <div class="bg-light p-3 rounded mb-3 flex-grow-1">
                    <small class="text-muted d-block mb-1">Опис проблеми:</small>
                    <span class="fw-medium">${order.description || 'Опис відсутній'}</span>
                </div>

                <div class="mt-auto">
                    ${type === 'available' 
                        ? `<button class="btn btn-primary w-100" onclick="takeOrder(${order.id})">🖐 Взяти в роботу</button>` 
                        : `<button class="btn btn-outline-success w-100">✅ Завершити</button>`
                    }
                </div>
            </div>
        </div>
        `;
        ordersContainer.innerHTML += card;
    });
}

// Функція-заглушка для взяття замовлення
window.takeOrder = async (id) => {
    // 1. Питаємо підтвердження (UX)
    if(!confirm('Взяти це замовлення в роботу?')) return;

    const token = localStorage.getItem('access_token');
    
    // Знаходимо кнопку, щоб зробити її "завантаженням" (візуальний ефект)
    // Це трішки складно без ID кнопки, тому просто покажемо лоадер через CSS курсор
    document.body.style.cursor = 'wait';

    try {
        // 2. Шлемо запит на сервер
        // Зверни увагу: метод PATCH
        const res = await fetch(`${API_URL}/master/orders/${id}/take`, { // Перевір URL!
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // 3. Обробка помилок
        if (res.status === 409) {
            alert("Йой! Хтось інший вже встиг перехопити це замовлення 🏎️");
            loadOrders('available'); // Оновлюємо список, щоб прибрати це замовлення
            return;
        }

        if (!res.ok) throw new Error('Помилка сервера');

        // 4. Успіх!
        // Перемикаємось на вкладку "Мої замовлення", щоб майстер побачив його там
        alert("Замовлення твоє! Успішного ремонту 🛠️");
        
        // Клік по кнопці "Мої замовлення", щоб переключити таб
        // (Або просто викликаємо loadOrders('my'))
        loadOrders('my');

    } catch (e) {
        alert(e.message);
    } finally {
        document.body.style.cursor = 'default';
    }
}

// Тестові дані (про всяк випадок)
function renderMockOrders() {
    renderOrders([
        {id: 101, device_model: "iPhone 11", client_name: "Олег", description: "Розбитий екран, не включається", status: "new"},
        {id: 102, device_model: "Samsung S21", client_name: "Марія", description: "Заміна батареї", status: "new"}
    ], 'available');
}