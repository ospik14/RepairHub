const API_URL = ""; 
let foundDevices = []; 


window.switchTab = function(tabName) {
    document.getElementById('tab-create').classList.remove('active');
    document.getElementById('tab-pickup').classList.remove('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    document.getElementById('section-create').classList.add('d-none');
    document.getElementById('section-pickup').classList.add('d-none');
    document.getElementById(`section-${tabName}`).classList.remove('d-none');
}


async function searchClientByPhone() {
    const phoneInput = document.getElementById('client-phone');
    const phone = phoneInput.value.trim();
    const statusSpan = document.getElementById('client-status');

    if (phone.length < 10) {
        statusSpan.innerHTML = ''; 
        return; 
    }

    const token = localStorage.getItem('access_token');
    statusSpan.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Пошук...';

    if (!token) {
        window.location.href = '/'; 
        return;
    }

    try {
        const res = await fetch(`${API_URL}/manager/clients/search`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ phone: phone }) 
        });

        if (res.status === 401) { logout(); return; }
        const client = await res.json();

        if (!client) {
            document.getElementById('client-id').value = ''; 
            document.getElementById('client-first-name').value = ''; 
            document.getElementById('client-last-name').value = '';
            
            statusSpan.innerHTML = '<span class="text-primary fw-bold">🆕 Новий клієнт</span>';
            
            document.getElementById('deviceOptions').innerHTML = '';
        } else {
            document.getElementById('client-id').value = client.id;
            document.getElementById('client-first-name').value = client.first_name;
            document.getElementById('client-last-name').value = client.last_name;
            statusSpan.innerHTML = '<span class="text-success fw-bold">✅ Клієнт знайдений</span>';
            
            loadClientDevices(client.id);
        }
    } catch (e) {
        console.error(e);
        statusSpan.innerHTML = '<span class="text-danger">Помилка з\'єднання</span>';
    }
}

async function loadClientDevices(clientId) {
    const token = localStorage.getItem('access_token');
    const datalist = document.getElementById('deviceOptions');
    datalist.innerHTML = '';

    try {
        const res = await fetch(`${API_URL}/manager/devices/?client_id=${clientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) { logout(); return; }
        foundDevices = await res.json(); 

        foundDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.model; 
            option.label = `${device.model}`; 
            datalist.appendChild(option);
        });

    } catch (e) {
        console.error("Помилка завантаження девайсів", e);
    }
}

function checkDeviceSelect() {
    const inputVal = document.getElementById('device-model').value;
    const deviceIdField = document.getElementById('device-id');
    const snField = document.getElementById('device-sn');
    const typeField = document.getElementById('device-type');

    const existingDevice = foundDevices.find(d => d.model === inputVal);

    if (existingDevice) {
        deviceIdField.value = existingDevice.id;
        snField.value = existingDevice.serial_number;
        typeField.value = existingDevice.type;
    } else {
        deviceIdField.value = ''; 
        snField.value = ''; 
    }
}

async function createFullOrder() {
    const token = localStorage.getItem('access_token');
    
    let clientId = document.getElementById('client-id').value;
    let deviceId = document.getElementById('device-id').value;
    
    if (!clientId) {
        const newClient = {
            first_name: document.getElementById('client-first-name').value,
            last_name: document.getElementById('client-last-name').value,
            phone: document.getElementById('client-phone').value,
            notes: ""
        };
        
        const res = await fetch(`${API_URL}/manager/clients`, {
            method: 'POST',
            headers: {'Content-Type': 'json', 'Authorization': `Bearer ${token}`},
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(newClient)
        });

        if (res.status === 401) { logout(); return; }
        if(!res.ok) { alert('Помилка створення клієнта'); return; }
        const clientData = await res.json();
        clientId = clientData.id; 
    }

    if (!deviceId) {
        const newDevice = {
            client_id: parseInt(clientId), 
            model: document.getElementById('device-model').value,
            type: document.getElementById('device-type').value,
            serial_number: document.getElementById('device-sn').value
        };

        const res = await fetch(`${API_URL}/manager/devices`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(newDevice)
        });

        if (res.status === 401) { logout(); return; }
        if(!res.ok) { alert('Помилка створення девайса'); return; }
        const deviceData = await res.json();
        deviceId = deviceData.id; 
    }

    const newOrder = {
        device_id: parseInt(deviceId),
        description: document.getElementById('order-desc').value,
        total_price: 0 
    };

    const res = await fetch(`${API_URL}/manager/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(newOrder)
    });

    if (res.status === 401) { logout(); return; }
    if (res.ok) {
        alert("🎉 Замовлення успішно створено!");
        window.location.href = '/manager'; 
    } else {
        alert("Помилка створення замовлення");
    }
}


function setupFormListeners() {
    const phoneInput = document.getElementById('client-phone');
    
    
    phoneInput.addEventListener('input', () => {
        document.getElementById('client-id').value = ''; 
        
        document.getElementById('client-status').innerHTML = '';
        
        document.getElementById('deviceOptions').innerHTML = '';
        document.getElementById('device-id').value = '';
        document.getElementById('device-model').value = '';
        document.getElementById('device-sn').value = '';
    });

}

document.addEventListener('DOMContentLoaded', () => {
    setupFormListeners(); 
});

window.searchOrdersForPickup = async function() {
    const phone = document.getElementById('pickup-search-phone').value.trim();
    const container = document.getElementById('pickup-results');

    if (phone.length < 10) {
        alert("Введи коректний номер телефону!");
        return;
    }

    const token = localStorage.getItem('access_token');
    container.innerHTML = '<div class="text-center w-100"><i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i></div>';

    try {
        const res = await fetch(`${API_URL}/manager/orders/ready`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ phone: phone })
        });
        if (res.status === 401) { logout(); return; }
        if (!res.ok) {
            if (res.status === 404) {
                container.innerHTML = '<div class="alert alert-warning w-100">Замовлень не знайдено</div>';
                return;
            }
            throw new Error('Помилка пошуку');
        }

        const orders = await res.json();
        renderPickupOrders(orders);

    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger w-100">Помилка: ${e.message}</div>`;
    }
}


function renderPickupOrders(orders) {
    const container = document.getElementById('pickup-results');
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="alert alert-info w-100">У цього клієнта немає активних замовлень.</div>';
        return;
    }

    container.innerHTML = '';

    orders.forEach(order => {
        let statusBadge = '';
        let actionBlock = '';
        let borderClass = '';

        if (order.status === 'ready') {
            borderClass = 'border-success';
            statusBadge = '<span class="badge bg-success">ГОТОВО ДО ВИДАЧІ</span>';
            actionBlock = `
                <div class="mt-3 p-3 bg-light-success rounded border border-success">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted">До сплати:</span>
                        <h3 class="fw-bold text-success mb-0">${order.total_price} ₴</h3>
                    </div>
                    <button class="btn btn-success w-100 fw-bold shadow-sm" onclick="completeOrder(${order.id})">
                        <i class="fa-solid fa-hand-holding-dollar"></i> Отримати кошти і закрити
                    </button>
                </div>
            `;
        } else if (order.status === 'new' || order.status === 'in_progress') {
            borderClass = 'border-warning';
            statusBadge = `<span class="badge bg-warning text-dark">${order.status === 'new' ? 'НОВЕ' : 'В РОБОТІ'}</span>`;
            actionBlock = `
                <div class="mt-3">
                    <button class="btn btn-secondary w-100" disabled>
                        ⏳ Ще ремонтується
                    </button>
                </div>
            `;
        } else {
            borderClass = 'border-secondary opacity-75';
            statusBadge = '<span class="badge bg-secondary">ВЖЕ ВИДАНО</span>';
            actionBlock = `<div class="mt-3 text-center small text-muted">Замовлення закрите</div>`;
        }

        const card = `
        <div class="col-md-6">
            <div class="card shadow-sm h-100 ${borderClass}">
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <small class="text-muted">#ID: ${order.id}</small>
                        ${statusBadge}
                    </div>
                    <h5 class="card-title fw-bold">
                        ${order.device ? `${order.device.model}` : 'Пристрій'}
                    </h5>
                    <p class="card-text text-muted small mb-2">
                        SN: ${order.device ? order.device.serial_number : 'N/A'}
                    </p>
                    <div class="bg-light p-2 rounded small text-dark mb-2">
                        Problem: ${order.description}
                    </div>
                    
                    ${actionBlock}
                </div>
            </div>
        </div>
        `;
        container.innerHTML += card;
    });
}

let successModal;

document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('successModal');
    if (modalEl) successModal = new bootstrap.Modal(modalEl);
});

window.completeOrder = async function(orderId) {
    if (!confirm("Підтвердити отримання коштів?")) return;

    const token = localStorage.getItem('access_token');
    
    try {
        const res = await fetch(`${API_URL}/manager/orders/${orderId}/complete`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) { logout(); return; }
        if (res.ok) {
            const updatedOrder = await res.json(); 
            if (updatedOrder) {
                document.getElementById('r-id').textContent = updatedOrder.id;
                document.getElementById('r-device').textContent = updatedOrder.device.model;
                document.getElementById('r-client').textContent = `${updatedOrder.device.client.first_name} ${updatedOrder.device.client.last_name}`;
                document.getElementById('r-finish-date').textContent = new Date().toLocaleDateString();
                document.getElementById('r-date').textContent = updatedOrder.created_at.split('T')[0];
                document.getElementById('r-desc').textContent = updatedOrder.description;
                document.getElementById('r-price').textContent = updatedOrder.total_price;
            }

            successModal.show();
            
            searchOrdersForPickup();
        } else {
            alert("Помилка завершення");
        }
    } catch (e) {
        console.error(e);
        alert("Помилка");
    }
}

window.printReceipt = function() {
    window.print(); 
}

window.logout = function() { 
    localStorage.removeItem('access_token');
    window.location.href = '/';
}