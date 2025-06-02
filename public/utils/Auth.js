class Auth {
    static async login(username, password, type) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uporabniskoIme: username,
                    geslo: password,
                    tip: type,
                }),
                credentials: 'include', // Important for cookies
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Napaka pri prijavi' };
        }
    }

    static async register(userData) {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Napaka pri registraciji' };
        }
    }

    static async logout() {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
            localStorage.removeItem('user');
            window.location.href = '/pages/prijava.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static isLoggedIn() {
        return !!this.getUser();
    }

    static redirectIfNotAuthenticated() {
        if (!this.isLoggedIn()) {
            window.location.href = '/pages/prijava.html';
        }
    }
}
