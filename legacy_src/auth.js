const API_URL = '/api/auth';

const auth = {
    async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async register(username, password) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    // Renders the Auth UI (Account Icon or Login/Register) into #auth-container
    renderAuthUI() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;

        authContainer.innerHTML = ''; // Clear existing content

        if (this.isLoggedIn()) {
            // --- Logged In State: Account Dropdown ---

            // Container for relative positioning of dropdown
            const relativeContainer = document.createElement('div');
            relativeContainer.className = 'relative';

            // User Icon Button
            const userBtn = document.createElement('button');
            userBtn.className = 'flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50';
            userBtn.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            `;

            // Dropdown Menu
            const dropdown = document.createElement('div');
            dropdown.className = 'absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 hidden z-50';
            dropdown.innerHTML = `
                <div class="px-4 py-2 border-b border-border">
                    <p class="text-sm font-medium text-foreground truncate">${localStorage.getItem('username') || 'User'}</p>
                </div>
                <a href="dashboard.html" class="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground">Dashboard</a>
                <a href="settings.html" class="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground">Settings</a>
                <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-accent hover:text-red-600">Logout</button>
            `;

            // Toggle Logic
            userBtn.onclick = (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            };

            // Close when clicking outside
            document.addEventListener('click', () => {
                if (!dropdown.classList.contains('hidden')) {
                    dropdown.classList.add('hidden');
                }
            });

            // Prevent closing when clicking inside dropdown
            dropdown.onclick = (e) => e.stopPropagation();

            relativeContainer.appendChild(userBtn);
            relativeContainer.appendChild(dropdown);
            authContainer.appendChild(relativeContainer);

            // Bind Logout
            setTimeout(() => {
                document.getElementById('logout-btn').onclick = () => this.logout();
            }, 0);

        } else {
            // --- Logged Out State: Login / Register Buttons ---
            const container = document.createElement('div');
            container.className = 'flex items-center gap-4';

            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.textContent = 'Login';
            loginLink.className = 'text-sm font-medium hover:text-primary transition-colors';

            const registerLink = document.createElement('a');
            registerLink.href = 'register.html';
            registerLink.textContent = 'Register';
            registerLink.className = 'px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity';

            container.appendChild(loginLink);
            container.appendChild(registerLink);
            authContainer.appendChild(container);
        }
    },

    // Redirect if not logged in
    checkAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },

    async updatePassword(currentPassword, newPassword) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async deleteAccount(password) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // If successful, logout
            this.logout();
            return data;
        } catch (error) {
            throw error;
        }
    }
};

// Run renderAuthUI on load
document.addEventListener('DOMContentLoaded', () => {
    auth.renderAuthUI();
});
