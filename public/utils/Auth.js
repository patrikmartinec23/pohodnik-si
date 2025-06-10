class Auth {
    static async login(username, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uporabniskoIme: username,
                    geslo: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Napaka pri prijavi',
                };
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Prišlo je do napake pri povezavi s strežnikom',
            };
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
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Napaka pri registraciji',
                };
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Prišlo je do napake pri povezavi s strežnikom',
            };
        }
    }

    static logout() {
        localStorage.removeItem('user');
        fetch('/api/logout', { method: 'POST' })
            .then(() => (window.location.href = '/pages/prijava.html'))
            .catch(console.error);
    }

    static isLoggedIn() {
        return !!localStorage.getItem('user');
    }

    static getUser() {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    }
}
