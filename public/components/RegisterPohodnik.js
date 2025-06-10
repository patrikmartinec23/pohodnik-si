class RegisterPohodnik {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.errorElement = document.getElementById('registerError');
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
            await this.handleRegistration();
        });
    }

    async handleRegistration() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword =
            document.getElementById('confirmPassword').value;

        if (!this.validateInputs(password, confirmPassword)) {
            return;
        }

        try {
            const result = await Auth.register({
                uporabniskoIme: username,
                geslo: password,
            });

            if (result.success) {
                window.location.href = '/pages/pohodi.html';
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('Prišlo je do napake pri registraciji.');
        }
    }

    validateInputs(password, confirmPassword) {
        if (password !== confirmPassword) {
            this.showError('Gesli se ne ujemata');
            return false;
        }
        return true;
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new RegisterPohodnik());
