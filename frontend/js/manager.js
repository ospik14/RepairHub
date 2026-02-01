const API_URL = ""; 
// Зберігаємо знайдені девайси, щоб дістати з них ID
let foundDevices = []; 

// 1. 🔍 ПОШУК КЛІЄНТА ПО ТЕЛЕФОНУ
// js/manager.js

async function searchClientByPhone() {
    const phoneInput = document.getElementById('client-phone');
    const phone = phoneInput.value.trim();
    const statusSpan = document.getElementById('client-status');

    // 1. ФІКС: Якщо стерли номер або він короткий — прибираємо спінер
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
            // ❌ НЕ ЗНАЙШЛИ (404) — Це нормально, це новий клієнт
            document.getElementById('client-id').value = ''; 
            document.getElementById('client-first-name').value = ''; // Можна не стирати, якщо менеджер вже почав писати
            document.getElementById('client-last-name').value = '';
            
            // ФІКС: Явно пишемо, що це новий клієнт, замість спінера
            statusSpan.innerHTML = '<span class="text-primary fw-bold">🆕 Новий клієнт</span>';
            
            document.getElementById('deviceOptions').innerHTML = '';
        } else {
            // ✅ ЗНАЙШЛИ
            document.getElementById('client-id').value = client.id;
            document.getElementById('client-first-name').value = client.first_name;
            document.getElementById('client-last-name').value = client.last_name;
            statusSpan.innerHTML = '<span class="text-success fw-bold">✅ Клієнт знайдений</span>';
            
            loadClientDevices(client.id);
        }
    } catch (e) {
        console.error(e);
        // ФІКС: Якщо впав інтернет або сервер
        statusSpan.innerHTML = '<span class="text-danger">Помилка з\'єднання</span>';
    }
}

// 2. 📱 ЗАВАНТАЖЕННЯ ДЕВАЙСІВ
async function loadClientDevices(clientId) {
    const token = localStorage.getItem('access_token');
    const datalist = document.getElementById('deviceOptions');
    datalist.innerHTML = '';

    try {
        const res = await fetch(`${API_URL}/manager/devices/?client_id=${clientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) { logout(); return; }
        foundDevices = await res.json(); // Зберігаємо в глобальну змінну

        foundDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.model; // Те, що бачить менеджер
            option.label = `${device.model}`; // Підказка
            datalist.appendChild(option);
        });

    } catch (e) {
        console.error("Помилка завантаження девайсів", e);
    }
}

// 3. ⚙️ ПЕРЕВІРКА: ЧИ ВИБРАВ МЕНЕДЖЕР ІСНУЮЧИЙ ДЕВАЙС?
function checkDeviceSelect() {
    const inputVal = document.getElementById('device-model').value;
    const deviceIdField = document.getElementById('device-id');
    const snField = document.getElementById('device-sn');
    const typeField = document.getElementById('device-type');

    // Шукаємо в нашому списку
    const existingDevice = foundDevices.find(d => d.model === inputVal);

    if (existingDevice) {
        // Якщо вибрав зі списку -> підтягуємо ID та інфо
        deviceIdField.value = existingDevice.id;
        snField.value = existingDevice.serial_number;
        typeField.value = existingDevice.type;
        // Можна заблокувати редагування
    } else {
        // Якщо ввів щось нове -> це буде новий девайс
        deviceIdField.value = ''; 
        snField.value = ''; // Хай вводить вручну
    }
}

// 4. 🚀 ГОЛОВНА ФУНКЦІЯ: СТВОРЕННЯ ЗАМОВЛЕННЯ (CASCADE)
async function createFullOrder() {
    const token = localStorage.getItem('access_token');
    
    // Збираємо дані з форми
    let clientId = document.getElementById('client-id').value;
    let deviceId = document.getElementById('device-id').value;
    
    // --- ЕТАП 1: КЛІЄНТ ---
    if (!clientId) {
        // Клієнта немає в базі, створюємо
        const newClient = {
            first_name: document.getElementById('client-first-name').value,
            last_name: document.getElementById('client-last-name').value,
            phone: document.getElementById('client-phone').value,
            notes: ""
        };
        
        const res = await fetch(`${API_URL}/manager/clients`, {
            method: 'POST',
            headers: {'Content-Type': 'json', 'Authorization': `Bearer ${token}`}, // Помилка: Content-Type має бути application/json
            // ВИПРАВЛЕННЯ:
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(newClient)
        });

        if (res.status === 401) { logout(); return; }
        if(!res.ok) { alert('Помилка створення клієнта'); return; }
        const clientData = await res.json();
        clientId = clientData.id; // Отримали ID нового клієнта
    }

    // --- ЕТАП 2: ДЕВАЙС ---
    if (!deviceId) {
        // Девайса немає (або це новий девайс старого клієнта), створюємо
        const newDevice = {
            client_id: parseInt(clientId), // Прив'язуємо до клієнта
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
        deviceId = deviceData.id; // Отримали ID нового девайса
    }

    // --- ЕТАП 3: ОРДЕР ---
    // Тепер у нас точно є deviceId (старий або новий)
    const newOrder = {
        device_id: parseInt(deviceId),
        description: document.getElementById('order-desc').value,
        total_price: 0 // Поки 0, майстер/менеджер потім змінить
    };

    const res = await fetch(`${API_URL}/manager/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(newOrder)
    });

    if (res.status === 401) { logout(); return; }
    if (res.ok) {
        alert("🎉 Замовлення успішно створено!");
        window.location.href = '/manager'; // Очистити форму
    } else {
        alert("Помилка створення замовлення");
    }
}

// ✅ Додай це десь в кінці файлу або після loadOrders
function setupFormListeners() {
    const phoneInput = document.getElementById('client-phone');
    
    
    // 1. Якщо змінюємо ТЕЛЕФОН -> Це точно новий (або інший) клієнт
    phoneInput.addEventListener('input', () => {
        // Очищаємо ID, бо цей номер вже може не належати знайденому раніше ID
        document.getElementById('client-id').value = ''; 
        
        // Змінюємо статус на "Пошук..." або пусто
        document.getElementById('client-status').innerHTML = '';
        
        // Очищаємо список девайсів, бо вони належать старому клієнту
        document.getElementById('deviceOptions').innerHTML = '';
        document.getElementById('device-id').value = '';
        document.getElementById('device-model').value = '';
        document.getElementById('device-sn').value = '';
    });

    // 2. Якщо змінюємо ІМ'Я/ПРІЗВИЩЕ -> Тут складніше
    // Якщо ID вже є, а ми міняємо ім'я -> ми або хочемо оновити клієнта, або створити нового
    // Найбезпечніший варіант для менеджера: якщо він почав правити ім'я, 
    // ми НЕ скидаємо ID (раптом це виправлення помилки), 
    // АЛЕ при створенні замовлення бекенд має це врахувати (про це нижче)
}

// 🔥 ВАЖЛИВО: Виклич цю функцію, коли сторінка завантажилась!
document.addEventListener('DOMContentLoaded', () => {
    // ... твій існуючий код ...
    setupFormListeners(); // <--- ДОДАЙ ЦЕ
});
// Вихід
window.logout = function() {
    localStorage.removeItem('access_token');
    window.location.href = '/';
}