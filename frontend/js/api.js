const API_BASE_URL = ""; 

const originalFetch = window.fetch;

window.fetch = async function (url, options = {}) {
    options.headers = options.headers || {};

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }
        options.body = JSON.stringify(options.body);
    }

    // --- АВТО-АВТОРИЗАЦІЯ ---
    const token = localStorage.getItem('access_token');
    if (token && !url.includes('/auth/login') && !url.includes('/refresh')) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await originalFetch(url, options);

    if (response.status === 401 && !url.includes('/refresh') && !url.includes('/login')) {
        console.log("🔄 Токен застарів. Пробую оновити...");

        try {
            const refreshRes = await originalFetch(`${API_BASE_URL}/auth/refresh`, { method: 'POST' });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                localStorage.setItem('access_token', data.access_token);
                console.log("✅ Рефреш успішний!");

                options.headers['Authorization'] = `Bearer ${data.access_token}`;

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