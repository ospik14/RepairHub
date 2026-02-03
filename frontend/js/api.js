const API_BASE_URL = ""; // Якщо бек і фронт на одному домені, лишай пустим

/**
 * Універсальна функція для запитів з авто-рефрешем токена
 * @param {string} endpoint - наприклад '/orders'
 * @param {object} options - налаштування { method: 'POST', body: { ... } }
 */
async function authorizedFetch(endpoint, options = {}) {
    // 1. Ініціалізація заголовків
    options.headers = options.headers || {};
    
    // 2. АВТОМАТИЧНА ОБРОБКА JSON
    // Якщо ми передали body як звичайний об'єкт (не FormData),
    // то самі перетворюємо його в JSON рядок і ставимо заголовок.
    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    // 3. Додаємо Access Token
    const token = localStorage.getItem('access_token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Робимо запит
    let response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // 5. Логіка Refresh Token (якщо 401)
    if (response.status === 401) {
        console.log("🔄 Токен застарів, оновлюємо...");

        try {
            // Важливо: переконайся, що шлях до рефреша правильний (/refresh або /auth/refresh)
            const refreshRes = await fetch(`${API_BASE_URL}/refresh`, { 
                method: 'POST' 
                // Тут не треба заголовків, бо Refresh Token лежить в HttpOnly Cookie
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                localStorage.setItem('access_token', data.access_token);
                
                // Оновлюємо токен в заголовках старого запиту
                options.headers['Authorization'] = `Bearer ${data.access_token}`;
                
                // Повторюємо запит
                response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            } else {
                logout(); // Рефреш здох — на вихід
            }
        } catch (e) {
            logout();
        }
    }

    return response;
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    window.location.href = '/';
}