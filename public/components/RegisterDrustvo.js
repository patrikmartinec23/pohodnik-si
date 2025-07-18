class RegisterDrustvo {
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
        const formData = {
            uporabniskoIme: document.getElementById('username').value,
            geslo: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            ime: document.getElementById('ime').value,
            naslov: document.getElementById('naslov').value,
            datumUstanovitve: document.getElementById('datumUstanovitve').value,
            predsednik: document.getElementById('predsednik').value,
            type: 'drustvo',
        };

        if (!this.validateInputs(formData)) {
            return;
        }

        try {
            const result = await Auth.register(formData);

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

    validateInputs(data) {
        if (data.geslo !== data.confirmPassword) {
            this.showError('Gesli se ne ujemata');
            return false;
        }

        const year = parseInt(data.datumUstanovitve);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1800 || year > currentYear) {
            this.showError('Vnesite veljavno leto ustanovitve');
            return false;
        }

        const requiredFields = ['ime', 'naslov', 'predsednik'];
        for (const field of requiredFields) {
            if (!data[field]?.trim()) {
                this.showError('Izpolnite vsa polja');
                return false;
            }
        }

        return true;
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.classList.remove('d-none');
    }
}

document.addEventListener('DOMContentLoaded', () => new RegisterDrustvo());
