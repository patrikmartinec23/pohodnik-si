class Profile {
    constructor() {
        this.user = Auth.getUser();
        if (!this.user) {
            window.location.href = '/pages/prijava.html';
            return;
        }
        this.currentPage = 1;
        this.loading = false;
        this.hasMore = true;
        this.itemsPerPage = 2;
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

    async loadUpcomingHikes(isLoadMore = false) {
        if (
            this.loading ||
            (!isLoadMore && !this.hasMore && this.currentPage > 1)
        ) {
            return;
        }

        try {
            this.loading = true;

            // Pass the current page and limit to the API
            const response = await fetch(
                `/api/users/${this.user.id}/upcoming-hikes?page=${this.currentPage}&limit=${this.itemsPerPage}`
            );
            const { hikes, total } = await response.json();
            const container = document.getElementById('upcomingHikes');

            if (!hikes || !hikes.length) {
                if (!isLoadMore) {
                    container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Trenutno nimate prihajajočih pohodov</p>
                    </div>`;
                }
                this.hasMore = false;
                return;
            }

            const hikeCards = hikes
                .map((pohod) => this.createPohodCard(pohod))
                .join('');

            if (isLoadMore) {
                // Append new cards to existing ones
                const cardsContainer = container.querySelector('.row');
                if (cardsContainer) {
                    cardsContainer.insertAdjacentHTML('beforeend', hikeCards);
                }
            } else {
                // Initial load - create the whole structure
                container.innerHTML = `
                <div class="upcoming-hikes">
                    <div class="row g-4">
                        ${hikeCards}
                    </div>
                </div>`;
            }

            // Calculate how many items we've loaded so far
            const loadedCount = this.currentPage * this.itemsPerPage;
            this.hasMore = loadedCount < total;

            // Add or update load more button
            this.updateLoadMoreButton(container, total);
        } catch (error) {
            console.error('Error loading upcoming hikes:', error);
            if (!isLoadMore) {
                const container = document.getElementById('upcomingHikes');
                container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Napaka pri nalaganju pohodov</p>
                </div>`;
            }
        } finally {
            this.loading = false;
        }
    }

    updateLoadMoreButton(container, total) {
        // Remove existing load more button
        const existingBtn = container.querySelector('.load-more-container');
        if (existingBtn) {
            existingBtn.remove();
        }

        // Add load more button if there are more items to load
        if (this.hasMore) {
            const loadMoreHtml = `
            <div class="text-center mt-4 load-more-container">
                <button class="btn btn-outline-primary load-more">
                    <i class="fas fa-plus-circle me-2"></i>Prikaži več
                </button>
            </div>`;

            container.insertAdjacentHTML('beforeend', loadMoreHtml);

            // Add event listener to the new button
            const loadMoreBtn = container.querySelector('.load-more');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    this.currentPage++;
                    this.loadUpcomingHikes(true);
                });
            }
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
        <div class="col-md-6 mb-4" 
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
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <span class="badge bg-success me-1">
                                <i class="fas fa-hiking me-1"></i>${
                                    pohod.Tezavnost
                                }/5
                            </span>
                            <span class="badge bg-info me-1">
                                <i class="fas fa-clock me-1"></i>${duration}h
                            </span>
                            <span class="badge bg-warning text-dark" title="${
                                pohod.ZbirnoMesto
                            }">
                                <i class="fas fa-map-marker-alt me-1"></i>${
                                    pohod.ZbirnoMesto
                                }
                            </span>
                        </div>    
                            <strong class="mb-2">
                                <i class="fas fa-calendar me-1"></i>${date}
                            </strong>  
                            <small class="text-primary">
                                <i class="fas fa-users me-1"></i>${
                                    pohod.DrustvoIme || ''
                                }
                            </small>                  
                    </div>
                </a>
            </div>
        </div>
    `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new Profile());
