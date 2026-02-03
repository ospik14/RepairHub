const API_BASE_URL = ""; 

const originalFetch = window.fetch;

window.fetch = async function (url, options = {}) {
    // 1. Ініціалізація налаштувань
    options.headers = options.headers || {};

    // --- АВТОМАТИЗАЦІЯ JSON (Щоб працювало і старе, і нове) ---
    // Якщо ти передав об'єкт у body, а не рядок — ми самі зробимо JSON
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        // Якщо це не FormData (картинки), і не рядок — значить JSON
        if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }
        options.body = JSON.stringify(options.body);
    }

    // --- АВТО-АВТОРИЗАЦІЯ ---
    const token = localStorage.getItem('access_token');
    // Не пхаємо токен, якщо це логін або рефреш
    if (token && !url.includes('/auth/login') && !url.includes('/refresh')) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. Виконуємо запит
    let response = await originalFetch(url, options);

    // 3. ПЕРЕХОПЛЕННЯ 401 (Refresh Token)
    if (response.status === 401 && !url.includes('/refresh') && !url.includes('/login')) {
        console.log("🔄 Токен застарів. Пробую оновити...");

        try {
            // Робимо рефреш (куки летять самі)
            const refreshRes = await originalFetch(`${API_BASE_URL}/auth/refresh`, { method: 'POST' });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                localStorage.setItem('access_token', data.access_token);
                console.log("✅ Рефреш успішний!");

                // Оновлюємо токен в заголовках для повтору
                options.headers['Authorization'] = `Bearer ${data.access_token}`;

                // ПОВТОРЮЄМО оригінальний запит
                // Важливо: options.body зберігся, тому POST повториться коректно
                response = await originalFetch(url, options);
            } else {
                console.warn("💀 Рефреш не вдався.");
                logout();
            }
        } catch (e) {
            console.error("Помилка рефреша:", e);
            logout();
        }
    }

    return response;
};

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    window.location.href = '/';
}