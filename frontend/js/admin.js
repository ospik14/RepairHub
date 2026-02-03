const API_URL = ""; 

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // 1. Вантажимо "фейкову" статистику (поки бекенд не готовий)
    loadMockStats();

    // 2. Вантажимо реальні дані
    loadUsers();
    loadParts();
});

function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/';
}

// ==========================================
// 📊 СТАТИСТИКА 
// ==========================================
async function loadMockStats() {
    const token = localStorage.getItem('access_token');
    try {
        const res = await fetch(`${API_URL}/admin/orders/stat`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        order_stat = await res.json()
        if (res.status === 401) { logout(); return; }
        if (res.ok) {
            document.getElementById('stat-money').textContent = `${order_stat.earnings} ₴`;
            document.getElementById('stat-orders').textContent = order_stat.complete_orders;
        } else {
            alert("помилка завантаження");
        }
    } catch (e) { console.error(e); }
}

// ==========================================
// 👥 КОРИСТУВАЧІ (USERS)
// ==========================================

async function loadUsers() {
    const token = localStorage.getItem('access_token');
    const tbody = document.getElementById('users-table-body');

    try {
        const res = await fetch(`${API_URL}/admin/users/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();
        if (res.status === 401) { logout(); return; }

        tbody.innerHTML = '';
        users.forEach(user => {
            // Переклад ролей для краси
            let roleName = user.role;
            let badgeClass = 'bg-secondary';
            if(user.role === 'admin') { roleName = 'Адмін'; badgeClass = 'bg-danger'; }
            if(user.role === 'manager') { roleName = 'Менеджер'; badgeClass = 'bg-primary'; }
            if(user.role === 'master') { roleName = 'Майстер'; badgeClass = 'bg-warning text-dark'; }

            const row = `
            <tr>
                <td>${user.id}</td>
                <td class="fw-bold">${user.username}</td>
                <td><span class="badge ${badgeClass}">${roleName}</span></td>
                <td class="text-muted small">${new Date(user.created_at).toLocaleDateString()}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-dark me-1" onclick="openPassModal(${user.id})" title="Змінити пароль">
                        <i class="fa-solid fa-key"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})" title="Видалити">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
            `;
            tbody.innerHTML += row;
        });

        // Оновимо лічильник персоналу в статистиці (бо чому б і ні?)
        document.getElementById('stat-users').textContent = users.length;

    } catch (e) {
        console.error(e);
    }
}

async function createUser() {
    const username = document.getElementById('new-username').value;
    const role = document.getElementById('new-role').value;
    const password = document.getElementById('new-password').value; // ТРЕБА, навіть якщо в схемі явно не видно

    const token = localStorage.getItem('access_token');
    
    try {
        // Увага: Твоя схема CreateUser в prompt не мала password, 
        // але створити юзера без пароля неможливо для логіну.
        // Я відправляю його. Якщо бекенд ігнорує - перевір schemas.py.
        const res = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, role, password })
        });
        
        if (res.ok) {
            alert("Працівника створено!");
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
            loadUsers();
        } else {
            alert("Помилка створення");
        }
    } catch (e) { console.error(e); }
}

async function deleteUser(userId) {
    if (!confirm("Видалити цього користувача? Це незворотно.")) return;
    
    const token = localStorage.getItem('access_token');
    await fetch(`${API_URL}/admin/users/${userId}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadUsers();
}

// Зміна паролю
function openPassModal(userId) {
    document.getElementById('pass-user-id').value = userId;
    document.getElementById('update-password').value = '';
    new bootstrap.Modal(document.getElementById('changePassModal')).show();
}

async function submitPassChange() {
    const userId = document.getElementById('pass-user-id').value;
    const newPass = document.getElementById('update-password').value;
    const token = localStorage.getItem('access_token');

    const res = await fetch(`${API_URL}/admin/user/${userId}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPass })
    });
    if (res.status === 401) { logout(); return; }
    if(res.ok) {
        alert("Пароль змінено!");
        bootstrap.Modal.getInstance(document.getElementById('changePassModal')).hide();
    } else {
        alert("Помилка (пароль має бути від 8 до 22 символів)");
    }
}

// ==========================================
// 📦 ЗАПЧАСТИНИ (PARTS)
// ==========================================

async function loadParts() {
    const token = localStorage.getItem('access_token');
    const tbody = document.getElementById('parts-table-body');

    try {
        const res = await fetch(`${API_URL}/admin/parts/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const parts = await res.json();

        tbody.innerHTML = '';
        let lowStock = 0;

        parts.forEach(part => {
            if (part.quantity < 3) lowStock++;

            const row = `
            <tr>
                <td class="fw-bold">${part.name}</td>
                <td>
                    <span class="badge ${part.quantity > 0 ? 'bg-success' : 'bg-danger'}">
                        ${part.quantity} шт.
                    </span>
                </td>
                <td>${part.buy_price} $</td>
                <td>${part.sell_price} ₴</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditPart(${part.id}, ${part.quantity}, ${part.buy_price}, ${part.sell_price})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </td>
            </tr>
            `;
            tbody.innerHTML += row;
        });
        
        // Оновлюємо "фейкову" статистику реальними даними про дефіцит
        document.getElementById('stat-low-parts').textContent = lowStock;

    } catch (e) { console.error(e); }
}

async function createPart() {
    const data = {
        name: document.getElementById('part-name').value,
        quantity: parseInt(document.getElementById('part-qty').value),
        buy_price: parseFloat(document.getElementById('part-buy').value),
        sell_price: parseFloat(document.getElementById('part-sell').value)
    };
    
    const token = localStorage.getItem('access_token');
    
    const res = await fetch(`${API_URL}/admin/parts`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(data)
    });
    if (res.status === 401) { logout(); return; }
    if(res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('addPartModal')).hide();
        loadParts();
    } else {
        alert("Помилка додавання");
    }
}

// Редагування
function openEditPart(id, qty, buy, sell) {
    document.getElementById('edit-part-id').value = id;
    document.getElementById('edit-part-qty').value = qty;
    document.getElementById('edit-part-buy').value = buy;
    document.getElementById('edit-part-sell').value = sell;
    
    new bootstrap.Modal(document.getElementById('editPartModal')).show();
}

async function submitPartEdit() {
    const id = document.getElementById('edit-part-id').value;
    const data = {
        quantity: parseInt(document.getElementById('edit-part-qty').value),
        buy_price: parseFloat(document.getElementById('edit-part-buy').value),
        sell_price: parseFloat(document.getElementById('edit-part-sell').value)
    };

    const token = localStorage.getItem('access_token');
    // Зверни увагу на слеш перед parts: /parts/...
    const res = await fetch(`${API_URL}/admin/parts/${id}/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(data)
    });

    if(res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('editPartModal')).hide();
        loadParts();
    } else {
        alert("Помилка оновлення");
    }
}