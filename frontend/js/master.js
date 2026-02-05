const API_URL = ""; 


const ordersContainer = document.getElementById('orders-container');



document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        window.location.href = '/'; 
        return;
    }

    const userElem = document.getElementById('user-name');
    if (userElem) {
        userElem.textContent = localStorage.getItem('username') || 'Майстер';
    }

    const modalEl = document.getElementById('finishModal');
    if (modalEl) {
        finishModal = new bootstrap.Modal(modalEl);
    }

    loadOrders('available');

    try {
        const res = await fetch(`${API_URL}/master/orders/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const myOrders = await res.json();
            const activeCount = myOrders.filter(o => o.status === 'in_progress').length;
            const statElem = document.getElementById('stat-in-progress');
            if (statElem) statElem.textContent = activeCount;
        }
    } catch (e) {
        console.error("Не вдалося оновити фоновий лічильник", e);
    }
});

window.logout = function() { 
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    window.location.href = '/';
}

window.loadOrders = async function(type) {
    ordersContainer.innerHTML = '<div class="text-center w-100"><i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i></div>';
    
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    
    if (type === 'available') {
        document.getElementById('btn-available')?.classList.add('active');
    } else {
        document.getElementById('btn-my')?.classList.add('active');
    }

    const token = localStorage.getItem('access_token');
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


function renderOrders(orders, type) {
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<div class="text-center w-100 text-muted py-5"><h4>Пусто 🍃</h4><p>Немає замовлень у цій категорії</p></div>';
        return;
    }

    ordersContainer.innerHTML = '';
    
    orders.forEach(order => {
    let badgeClass = 'bg-secondary';
    if (order.status === 'new') badgeClass = 'bg-primary';
    if (order.status === 'in_progress') badgeClass = 'bg-warning text-dark';
    if (order.status === 'ready') badgeClass = 'bg-success'; 

    let actionButton = '';

    if (type === 'available') {
        actionButton = `<button class="btn btn-primary w-100" onclick="takeOrder(${order.id})">🖐 Взяти в роботу</button>`;
    } 
    else if (order.status === 'ready' || order.status === 'completed') {
        actionButton = `
            <button class="btn btn-secondary w-100" disabled>
                <i class="fa-solid fa-check-double"></i> Виконано та закрито
            </button>
        `;
    } 
    else {
        actionButton = `
            <button class="btn btn-success w-100 fw-bold shadow-sm" onclick="openFinishModal(${order.id})">
                ✅ Завершити ремонт
            </button>
        `;
    }

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
    if(!confirm('Взяти це замовлення в роботу?')) return;

    const token = localStorage.getItem('access_token');
    
    document.body.style.cursor = 'wait';

    try {
        const res = await fetch(`${API_URL}/master/orders/${id}/take`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.status === 409) {
            alert("Йой! Хтось інший вже встиг перехопити це замовлення 🏎️");
            loadOrders('available'); 
            return;
        }

        if (!res.ok) throw new Error('Помилка сервера');

        alert("Замовлення твоє! Успішного ремонту 🛠️");
        
        loadOrders('my');

    } catch (e) {
        alert(e.message);
    } finally {
        document.body.style.cursor = 'default';
    }
}


let currentOrderId = null;
let finishModal = null; 


window.openFinishModal = function(id) {
    currentOrderId = id;
    
    const searchInput = document.getElementById('part-search');
    const qtyInput = document.getElementById('part-qty');
    const workPriceInput = document.getElementById('work-price');
    const msg = document.getElementById('part-msg');

    if (searchInput) searchInput.value = '';
    if (qtyInput) qtyInput.value = '1';
    if (workPriceInput) workPriceInput.value = '';
    if (msg) msg.classList.add('d-none');

    const modalEl = document.getElementById('finishModal');
    if (modalEl) {
        finishModal = new bootstrap.Modal(modalEl);
        finishModal.show();
    }

    loadPartsList();
}


let allParts = [];

window.loadPartsList = async function() {
    const token = localStorage.getItem('access_token');
    const datalist = document.getElementById('datalistOptions');
    datalist.innerHTML = '';

    try {
        const res = await fetch(`${API_URL}/master/parts`, { 
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Не вдалося завантажити список деталей');

        allParts = await res.json();
         
        allParts.forEach(part => {
            const option = document.createElement('option');
            option.value = part.name;
            option.label = `${part.name} | Ціна: ${part.sell_price} грн | Залишок: ${part.quantity}`;
            datalist.appendChild(option);
        });

    } catch (e) {
        console.error(e);
        alert("Помилка завантаження складу запчастин");
    }
}

const originalOpenModal = window.openFinishModal;
window.openFinishModal = function(id) {
    originalOpenModal(id); 
    loadPartsList();       
}

window.addPart = async function() {
    const nameInput = document.getElementById('part-search').value;
    const qtyInput = document.getElementById('part-qty').value;

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
            body: JSON.stringify({ 
                part_id: selectedPart.id, 
                quantity: parseInt(qtyInput) 
            })
        });

        if (!res.ok) throw new Error('Помилка списання');

        document.getElementById('part-msg').classList.remove('d-none');
        setTimeout(() => document.getElementById('part-msg').classList.add('d-none'), 2000);
        
        document.getElementById('part-search').value = '';
        document.getElementById('part-qty').value = '1';

    } catch (e) {
        alert(e.message);
    }
}
// 3. Завершити ремонт
window.finishOrder = async function() {
    const workPriceInput = document.getElementById('work-price');
    const workPrice = workPriceInput.value;

    if (!workPrice || workPrice <= 0) {
        alert("⚠️ Ей, а за роботу хто платити буде? Вкажи ціну!");
        return;
    }

    const token = localStorage.getItem('access_token');

    try {
        const res = await fetch(`${API_URL}/master/orders/${currentOrderId}/finish?work_price=${workPrice}`, {
            method: 'PATCH', 
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Не вдалося завершити замовлення. Перевір статус.');

        alert("🎉 Замовлення успішно закрито! Гроші в касу.");
        
        if (finishModal) {
            finishModal.hide();
        }
        
        loadOrders('my'); 

    } catch (e) {
        alert(e.message);
        console.error(e);
    }
}