// filepath: c:\Users\mrpat\Documents\Pohodnik\pohodnik\public\components\Profile.js
class Profile {
    constructor() {
        this.user = Auth.getUser();
        if (!this.user) {
            window.location.href = '/pages/prijava.html';
            return;
        }
        this.init();
    }

    async init() {
        try {
            await this.loadUserData();
            await this.loadUpcomingHikes();
        } catch (error) {
            console.error('Error initializing profile:', error);
        }
    }

    async loadUserData() {
        try {
            const response = await fetch(`/api/users/${this.user.id}`);
            const userData = await response.json();

            document.getElementById('userUsername').textContent =
                userData.username;
            document.getElementById('totalHikes').textContent =
                userData.totalHikes || 0;
            document.getElementById('totalAltitude').textContent =
                userData.totalAltitude || 0;
            document.getElementById('totalTime').textContent =
                userData.totalHours || 0;
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadUpcomingHikes() {
        try {
            const response = await fetch(
                `/api/users/${this.user.id}/upcoming-hikes`
            );
            const hikes = await response.json();

            const hikesContainer = document.getElementById('upcomingHikes');
            if (hikes.length === 0) {
                hikesContainer.innerHTML =
                    '<p class="text-center text-muted">Ni prihajajočih pohodov</p>';
                return;
            }

            hikesContainer.innerHTML = hikes
                .map(
                    (hike) => `
                <a href="pohod.html?id=${hike.IDPohod}" 
                   class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${hike.PohodIme}</h6>
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            ${new Date(hike.DatumPohoda).toLocaleDateString(
                                'sl-SI'
                            )}
                        </small>
                    </div>
                    <span class="badge bg-primary rounded-pill">
                        <i class="fas fa-mountain me-1"></i>${hike.Tezavnost}/5
                    </span>
                </a>
            `
                )
                .join('');
        } catch (error) {
            console.error('Error loading upcoming hikes:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new Profile());
