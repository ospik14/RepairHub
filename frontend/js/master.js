// ⚙️ URL API (Зміни порт, якщо треба)
const API_URL = ""; 

// Елементи DOM
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const ordersContainer = document.getElementById('orders-container');



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
    window.location.href = '/';
}

// 📦 5. Завантаження замовлень (Available або My)
window.loadOrders = async function(type) {
    ordersContainer.innerHTML = '<div class="text-center w-100"><i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i></div>';
    
    // 🔥 ВИПРАВЛЕННЯ: Безпечне перемикання кнопок
    // Знімаємо 'active' з усіх кнопок
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    
    // Додаємо 'active' потрібній кнопці, знаходячи її по ID
    if (type === 'available') {
        document.getElementById('btn-available')?.classList.add('active');
    } else {
        document.getElementById('btn-my')?.classList.add('active');
    }

    const token = localStorage.getItem('access_token');
    // Обережно з URL: перевір, чи у тебе '/orders/available' чи '/master/orders/available'
    let endpoint = type === 'available' ? '/master/orders/available' : '/master/orders/my';

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) { logout(); return; }

        const orders = await res.json();
        renderOrders(orders, type);
        let statElem

        if(type === 'available') {
            statElem = document.getElementById('stat-available');
            if(statElem) statElem.textContent = orders.length;
        } else {
            statElem = document.getElementById('stat-in-progress');
            if(statElem) {
                const activeOrders = orders.filter(o => o.status === 'in_progress').length;
                statElem.textContent = activeOrders;
            }
        }

        

    } catch (e) {
        ordersContainer.innerHTML = `<div class="alert alert-danger w-100">Помилка завантаження: ${e.message}</div>`;
        console.error(e);
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
    // 1. Визначаємо колір бейджика статусу
    let badgeClass = 'bg-secondary';
    if (order.status === 'new') badgeClass = 'bg-primary';
    if (order.status === 'in_progress') badgeClass = 'bg-warning text-dark';
    if (order.status === 'ready') badgeClass = 'bg-success'; // Зелений для готових

    // 2. 🔥 ЛОГІКА КНОПКИ (3 варіанти)
    let actionButton = '';

    if (type === 'available') {
        // Варіант 1: Замовлення нічиє -> "Взяти"
        actionButton = `<button class="btn btn-primary w-100" onclick="takeOrder(${order.id})">🖐 Взяти в роботу</button>`;
    } 
    else if (order.status === 'ready') {
        // Варіант 3: Замовлення вже готове -> "Виконано" (Неактивна сіра кнопка)
        actionButton = `
            <button class="btn btn-secondary w-100" disabled>
                <i class="fa-solid fa-check-double"></i> Виконано та закрито
            </button>
        `;
    } 
    else {
        // Варіант 2: Замовлення в роботі -> "Завершити" (Активна зелена)
        actionButton = `
            <button class="btn btn-success w-100 fw-bold shadow-sm" onclick="openFinishModal(${order.id})">
                ✅ Завершити ремонт
            </button>
        `;
    }

    // 3. Формуємо картку
    const card = `
    <div class="col-md-6 col-lg-4">
        <div class="order-card p-4 shadow-sm h-100 d-flex flex-column" style="${order.status === 'ready' ? 'opacity: 0.8; border-left-color: #198754;' : ''}">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge ${badgeClass} badge-status text-uppercase">${order.status}</span>
                <small class="text-muted">#ID: ${order.id}</small>
            </div>
            
            <h5 class="fw-bold mb-1">
                ${order.device ? `${order.device.model}` : 'Невідомий пристрій'}
            </h5>
            <p class="text-muted small mb-3"><i class="fa-solid fa-user me-1"></i> ${order.device.client.first_name || 'Клієнт'}</p>
            
            <div class="bg-light p-3 rounded mb-3 flex-grow-1">
                <small class="text-muted d-block mb-1">Опис проблеми:</small>
                <span class="fw-medium">${order.description || 'Опис відсутній'}</span>
            </div>

            <div class="mt-auto">
                ${actionButton}
            </div>
        </div>
    </div>
    `;
    ordersContainer.innerHTML += card;
});
}


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

// Змінна, щоб пам'ятати, яке замовлення ми зараз мучимо
let currentOrderId = null;
let finishModal = null; // Для керування вікном Bootstrap

// 1. Відкрити вікно (викликається з кнопки в картці)
// Оновлена функція відкриття вікна
window.openFinishModal = function(id) {
    currentOrderId = id;
    
    // 1. ЧИСТИМО ПОЛЯ (Використовуємо НОВІ ID)
    // Раніше тут було part-name/part-price, через це була помилка
    const searchInput = document.getElementById('part-search');
    const qtyInput = document.getElementById('part-qty');
    const workPriceInput = document.getElementById('work-price');
    const msg = document.getElementById('part-msg');

    // Перевіряємо, чи існують елементи перед тим як міняти, щоб не було помилок
    if (searchInput) searchInput.value = '';
    if (qtyInput) qtyInput.value = '1';
    if (workPriceInput) workPriceInput.value = '';
    if (msg) msg.classList.add('d-none');

    // 2. Ініціалізуємо модалку Bootstrap
    // Переконайся, що змінна finishModal оголошена десь зверху (let finishModal = null;)
    const modalEl = document.getElementById('finishModal');
    if (modalEl) {
        finishModal = new bootstrap.Modal(modalEl);
        finishModal.show();
    }

    // 3. Вантажимо список деталей (для <datalist>)
    loadPartsList();
}

// 2. Додати запчастину (POST /orders/{id}/parts)
// Глобальний масив, щоб зберігати завантажені запчастини (ID + Назва)
let allParts = [];

// 1. Ця функція завантажить деталі, коли ми відкриваємо модалку
window.loadPartsList = async function() {
    const token = localStorage.getItem('access_token');
    const datalist = document.getElementById('datalistOptions');
    datalist.innerHTML = ''; // Чистимо старе

    try {
        const res = await fetch(`${API_URL}/master/parts`, { // Твій новий роут
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Не вдалося завантажити список деталей');

        allParts = await res.json();
         // Зберігаємо в пам'ять

        // Малюємо <option> для кожного товару
        allParts.forEach(part => {
            const option = document.createElement('option');
            // У value пишемо назву, щоб юзер бачив текст
            option.value = part.name;
            // Додатково показуємо ціну і залишок як підказку
            option.label = `${part.name} | Ціна: ${part.sell_price} грн | Залишок: ${part.quantity}`;
            datalist.appendChild(option);
        });

    } catch (e) {
        console.error(e);
        alert("Помилка завантаження складу запчастин");
    }
}

// Оновлюємо openFinishModal, щоб вона викликала завантаження
const originalOpenModal = window.openFinishModal;
window.openFinishModal = function(id) {
    originalOpenModal(id); // Викликаємо стару логіку відкриття
    loadPartsList();       // 🔥 Довантажуємо список деталей
}

// 2. Оновлена функція додавання (шукає ID по назві)
window.addPart = async function() {
    const nameInput = document.getElementById('part-search').value;
    const qtyInput = document.getElementById('part-qty').value;

    // Шукаємо об'єкт запчастини в нашому масиві
    const selectedPart = allParts.find(p => p.name === nameInput);

    if (!selectedPart) {
        alert("❌ Така запчастина не знайдена в базі! Вибери зі списку.");
        return;
    }

    if (selectedPart.quantity < qtyInput) {
        alert(`⚠️ На складі лише ${selectedPart.quantity} шт. Ти хочеш списати більше!`);
        return;
    }

    const token = localStorage.getItem('access_token');

    try {
        const res = await fetch(`${API_URL}/master/orders/${currentOrderId}/parts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            // 🔥 ВІДПРАВЛЯЄМО ТЕ, ЩО ХОЧЕ Pydantic
            body: JSON.stringify({ 
                part_id: selectedPart.id, 
                quantity: parseInt(qtyInput) 
            })
        });

        if (!res.ok) throw new Error('Помилка списання');

        // Успіх
        document.getElementById('part-msg').classList.remove('d-none');
        setTimeout(() => document.getElementById('part-msg').classList.add('d-none'), 2000);
        
        // Чистимо поля
        document.getElementById('part-search').value = '';
        document.getElementById('part-qty').value = '1';

    } catch (e) {
        alert(e.message);
    }
}
// 3. Завершити ремонт (Логіка кнопки "Закрити замовлення")
window.finishOrder = async function() {
    // 1. Беремо ціну з поля
    const workPriceInput = document.getElementById('work-price');
    const workPrice = workPriceInput.value;

    // Валідація: якщо пусто, не пускаємо далі
    if (!workPrice || workPrice <= 0) {
        alert("⚠️ Ей, а за роботу хто платити буде? Вкажи ціну!");
        return;
    }

    const token = localStorage.getItem('access_token');

    try {
        // 2. Відправляємо запит на сервер
        // Зверни увагу: у твоєму Python коді це GET запит з параметром work_price
        const res = await fetch(`${API_URL}/master/orders/${currentOrderId}/finish?work_price=${workPrice}`, {
            method: 'GET', // Твій бекенд очікує GET
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Не вдалося завершити замовлення. Перевір статус.');

        // 3. Успіх!
        alert("🎉 Замовлення успішно закрито! Гроші в касу.");
        
        // Закриваємо модальне вікно
        // (змінна finishModal має бути глобальною, ми її створили в openFinishModal)
        if (finishModal) {
            finishModal.hide();
        }
        
        // Оновлюємо список, щоб замовлення зникло або змінило статус
        loadOrders('my'); 

    } catch (e) {
        alert(e.message);
        console.error(e);
    }
}