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

            // Update username
            document.getElementById('userUsername').textContent =
                userData.username;

            // Update personal details
            document.getElementById(
                'userName'
            ).textContent = `${userData.ime} ${userData.priimek}`;
            document.getElementById('userBirthday').textContent = new Date(
                userData.datumRojstva
            ).toLocaleDateString('sl-SI');
            document.getElementById('userLocation').textContent =
                userData.prebivalisce;

            // Update statistics
            document.getElementById('totalHikes').textContent =
                userData.totalHikes || 0;
            document.getElementById('totalAltitude').textContent =
                userData.totalAltitude || 0;
            document.getElementById('totalTime').textContent =
                userData.totalHours || 0;
        } catch (error) {
            console.error('Error loading user data:', error);
            // Show error state for user details
            ['userName', 'userBirthday', 'userLocation'].forEach((id) => {
                document.getElementById(id).textContent =
                    'Napaka pri nalaganju';
            });
        }
    }

    async loadUpcomingHikes() {
        try {
            const response = await fetch(
                `/api/users/${this.user.id}/upcoming-hikes`
            );
            const hikes = await response.json();

            const container = document.getElementById('upcomingHikes');

            if (!hikes || !hikes.length) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Trenutno nimate prihajajočih pohodov</p>
                    </div>`;
                return;
            }

            container.innerHTML = `
                <div class="row g-4">
                    ${hikes
                        .map((pohod) => this.createPohodCard(pohod))
                        .join('')}
                </div>`;
        } catch (error) {
            console.error('Error loading upcoming hikes:', error);
            document.getElementById('upcomingHikes').innerHTML = `
                <div class="alert alert-danger mb-0">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Napaka pri nalaganju pohodov
                </div>`;
        }
    }

    createPohodCard(pohod) {
        const date = new Date(pohod.DatumPohoda).toLocaleDateString('sl-SI');
        const truncatedLocation =
            pohod.Lokacija?.length > 15
                ? pohod.Lokacija.substring(0, 12) + '...'
                : pohod.Lokacija || 'N/A';
        const truncatedZbirnoMesto =
            pohod.ZbirnoMesto?.length > 20
                ? pohod.ZbirnoMesto.substring(0, 17) + '...'
                : pohod.ZbirnoMesto || 'N/A';
        const duration = pohod.Trajanje ? pohod.Trajanje.split(':')[0] : '?';

        return `
        <div class="col-md-4 mb-4" 
             data-difficulty="${pohod.Tezavnost}"
             data-location="${pohod.Lokacija}"
             data-date="${date}">
            <div class="card pohod-card hover-shadow">
                <a href="pohod.html?id=${
                    pohod.IDPohod
                }" class="text-decoration-none">
                    <img src="../images/project-1.jpg" 
                         alt="${pohod.PohodIme}" 
                         class="card-img-top" 
                         onerror="this.src='../images/default-pohod.jpg'" />
                    <div class="card-body text-dark">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">
                                <strong>${pohod.PohodIme}</strong>
                            </h5>
                            <span class="badge bg-primary" title="${
                                pohod.Lokacija
                            }">
                                <i class="fas fa-mountain me-1"></i>${truncatedLocation}
                            </span>
                        </div>
                        <div class="d-flex gap-2 mb-3">
                            <span class="badge bg-success">
                                <i class="fas fa-hiking me-1"></i>${
                                    pohod.Tezavnost
                                }/5
                            </span>
                            <span class="badge bg-info">
                                <i class="fas fa-clock me-1"></i>${duration}h
                            </span>
                            <span class="badge bg-warning text-dark" title="${
                                pohod.ZbirnoMesto
                            }">
                                <i class="fas fa-map-marker-alt me-1"></i>${truncatedZbirnoMesto}
                            </span>
                        </div>
                        <p class="card-text small mb-2">${
                            pohod.PohodOpis || ''
                        }</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${date}
                            </small>
                            <small class="text-primary">
                                <i class="fas fa-users me-1"></i>${
                                    pohod.DrustvoIme || ''
                                }
                            </small>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new Profile());
