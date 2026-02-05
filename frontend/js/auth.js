const API_URL = ""; 

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('error-msg');

window.addEventListener('load', async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
        const userRes = await fetch(`${API_URL}/auth/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (userRes.ok) {
            const user = await userRes.json();
            
            if (user.role === 'master') {
                window.location.href = '/master'; 
            } else if (user.role === 'manager') {
                window.location.href = '/manager'; 
            } else if (user.role == 'admin'){
                window.location.href = '/admin';
            } else {
                throw new Error('У вас немає доступу');
            }
        } else {
            throw new Error('Не вдалося отримати дані користувача');
        }
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
        const res = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        if (!res.ok) throw new Error('Невірний логін або пароль');

        const data = await res.json();
        
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('username', username);

        
        const userRes = await fetch(`${API_URL}/auth/users/me`, {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        
        if (userRes.ok) {
            const user = await userRes.json();
            
            if (user.role === 'master') {
                window.location.href = '/master'; 
            } else if (user.role === 'manager') {
                window.location.href = '/manager';
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