// js/auth.js
const API_URL = ""; 

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('error-msg');

// Перевірка: якщо ми вже залогінені, кидаємо на сторінку (спрощено)
window.addEventListener('load', () => {
    if (localStorage.getItem('access_token')) {
        // Тут можна додати запит на /users/me, щоб знати куди кинути, 
        // але поки лишимо користувача на логіні або перекинемо на master.html за замовчуванням
        // window.location.href = 'master.html'; 
    }
});

loginForm.onsubmit = async (e) => {
    e.preventDefault();
    errorMsg.classList.add('d-none');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        // 1. Отримуємо токен
        const res = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        if (!res.ok) throw new Error('Невірний логін або пароль');

        const data = await res.json();
        
        // 2. Зберігаємо дані
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('username', username);

        // 3. 🔥 ВАЖЛИВО: Дізнаємось роль, щоб знати, куди перенаправити
        const userRes = await fetch(`${API_URL}/auth/users/me`, {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        
        if (userRes.ok) {
            const user = await userRes.json();
            
            if (user.role === 'master') {
                window.location.href = '/master'; // 👈 Редірект на сторінку майстра
            } else if (user.role === 'manager') {
                window.location.href = '/manager'; // 👈 Редірект на менеджера
            } else if (user.role == 'admin'){
                window.location.href = '/admin';
            } else {
                throw new Error('У вас немає доступу');
            }
        } else {
            throw new Error('Не вдалося отримати дані користувача');
        }

    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('d-none');
    }
};