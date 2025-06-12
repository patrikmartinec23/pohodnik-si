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

            // Ensure user data is properly structured
            const userToStore = {
                id: data.user.id,
                username: data.user.username,
                type: data.user.type,
            };

            localStorage.setItem('user', JSON.stringify(userToStore));
            return {
                success: true,
                user: userToStore,
            };
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

            // Make sure the user object has the correct structure
            const userToStore = {
                id: data.user.id,
                username: data.user.username,
                type: userData.type || 'pohodnik', // Ensure type is set from registration data
            };

            localStorage.setItem('user', JSON.stringify(userToStore));
            return {
                success: true,
                user: userToStore,
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Prišlo je do napake pri povezavi s strežnikom',
            };
        }
    }

    static async refreshUserData() {
        try {
            const response = await fetch('/api/me'); // You'll need to create this endpoint
            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
        return this.getUser();
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
