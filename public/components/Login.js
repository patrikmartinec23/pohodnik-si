class Login {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.errorElement = document.getElementById('loginError');
        this.init();
    }

    init() {
        if (Auth.isLoggedIn()) {
            window.location.href = '/pages/pohodi.html';
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        this.hideError();

        try {
            const result = await Auth.login(username, password);

            if (result.success) {
                window.location.href = '/pages/pohodi.html';
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Prišlo je do napake pri prijavi.');
        }
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
    }

    hideError() {
        this.errorElement.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new Login());
