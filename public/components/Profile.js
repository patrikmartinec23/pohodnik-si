class Profile {
    constructor() {
        this.user = Auth.getUser();
        if (!this.user) {
            window.location.href = '/pages/prijava.html';
            return;
        }
        this.currentPage = 1;
        this.pastPage = 1;
        this.loading = false;
        this.pastLoading = false;
        this.hasMore = true;
        this.pastHasMore = true;
        this.itemsPerPage = 2;
        this.init();
    }

    async init() {
        try {
            await this.loadUserData();
            await this.loadUpcomingHikes();
            await this.loadUserMemberships();
            await this.loadPastHikes();
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

            // Update personal details in both locations
            const fullName = `${userData.ime} ${userData.priimek}`;
            const formattedBirthday = new Date(
                userData.datumRojstva
            ).toLocaleDateString('sl-SI');

            document.getElementById('userName').textContent = fullName;
            document.getElementById('userBirthday').textContent =
                formattedBirthday;
            document.getElementById('userLocation').textContent =
                userData.prebivalisce;

            // Update details in the second card
            document.getElementById('userNameDetails').textContent = fullName;
            document.getElementById('userBirthdayDetails').textContent =
                formattedBirthday;
            document.getElementById('userLocationDetails').textContent =
                userData.prebivalisce;

            // Update statistics and badge
            document.getElementById('totalHikes').textContent =
                userData.totalHikes || 0;

            // Set badge with appropriate styling
            const badgeElement = document.getElementById('userBadge');
            const badge = userData.badge || 'Turist';
            badgeElement.textContent = badge;

            // Set badge color based on level
            badgeElement.className =
                'badge fs-6 py-2 px-3 ' + this.getBadgeClass(badge);
        } catch (error) {
            console.error('Error loading user data:', error);
            // Show error state for user details
            [
                'userName',
                'userBirthday',
                'userLocation',
                'userNameDetails',
                'userBirthdayDetails',
                'userLocationDetails',
            ].forEach((id) => {
                document.getElementById(id).textContent =
                    'Napaka pri nalaganju';
            });
        }
    }

    // Add this new method:
    getBadgeClass(badge) {
        switch (badge) {
            case 'Gorski gams':
                return 'bg-warning text-dark';
            case 'Resni planinec':
                return 'bg-danger';
            case 'Pohodnik':
                return 'bg-success';
            case 'Turist':
            default:
                return 'bg-secondary';
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
            this.updateLoadMoreButton(container, total, 'upcoming');
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

    // Add this new method:
    async loadUserMemberships() {
        try {
            const response = await fetch(
                `/api/users/${this.user.id}/memberships`
            );
            const memberships = await response.json();

            const container = document.getElementById('userMemberships');

            if (!memberships.length) {
                container.innerHTML = `
                    <div class="text-center py-3">
                        <i class="fas fa-users fa-2x text-muted mb-2"></i>
                        <p class="text-muted mb-0 small">Niste član nobenega društva</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = memberships
                .map(
                    (drustvo) => `
                <a href="./profil-drustvo.html?id=${drustvo.DrustvoUserId}" 
                   class="text-decoration-none mb-2 d-block">
                    <div class="d-flex align-items-center p-2 rounded bg-light hover-shadow">
                        <i class="fas fa-users text-primary me-2"></i>
                        <div class="flex-grow-1">
                            <h6 class="mb-0 text-primary">${drustvo.DrustvoIme}</h6>
                            <small class="text-muted">${drustvo.Naslov}</small>
                        </div>
                        <i class="fas fa-chevron-right text-muted"></i>
                    </div>
                </a>
            `
                )
                .join('');
        } catch (error) {
            console.error('Error loading user memberships:', error);
            const container = document.getElementById('userMemberships');
            container.innerHTML = `
                <div class="text-center py-3">
                    <i class="fas fa-exclamation-triangle fa-2x text-muted mb-2"></i>
                    <p class="text-muted mb-0 small">Napaka pri nalaganju</p>
                </div>
            `;
        }
    }

    // Add this new method:
    async loadPastHikes(isLoadMore = false) {
        if (this.pastLoading || (isLoadMore && !this.pastHasMore)) {
            return;
        }

        try {
            this.pastLoading = true;

            const response = await fetch(
                `/api/users/${this.user.id}/past-hikes?page=${this.pastPage}&limit=${this.itemsPerPage}`
            );
            const { hikes, total } = await response.json();
            const container = document.getElementById('pastHikes');

            if (!hikes || !hikes.length) {
                if (!isLoadMore) {
                    container.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-history fa-3x text-muted mb-3"></i>
                            <p class="text-muted mb-0">Še nimate izvedenih pohodov</p>
                        </div>
                    `;
                }
                this.pastHasMore = false;
                return;
            }

            const hikeCards = hikes
                .map((pohod) => this.createPastPohodCard(pohod))
                .join('');

            if (isLoadMore) {
                const cardsContainer = container.querySelector('.row');
                if (cardsContainer) {
                    cardsContainer.insertAdjacentHTML('beforeend', hikeCards);
                }
            } else {
                container.innerHTML = `
                    <div class="past-hikes">
                        <div class="row g-4">
                            ${hikeCards}
                        </div>
                    </div>
                `;
            }

            const loadedCount = this.pastPage * this.itemsPerPage;
            this.pastHasMore = loadedCount < total;

            this.updateLoadMoreButton(container, total, 'past');
        } catch (error) {
            console.error('Error loading past hikes:', error);
            if (!isLoadMore) {
                const container = document.getElementById('pastHikes');
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Napaka pri nalaganju</p>
                    </div>
                `;
            }
        } finally {
            this.pastLoading = false;
        }
    }

    // Add this new method:
    createPastPohodCard(pohod) {
        const date = new Date(pohod.DatumPohoda).toLocaleDateString('sl-SI');
        const truncatedLocation =
            pohod.Lokacija?.length > 15
                ? pohod.Lokacija.substring(0, 12) + '...'
                : pohod.Lokacija || 'N/A';
        const duration = pohod.Trajanje ? pohod.Trajanje.split(':')[0] : '?';

        // Use the correct image path: images/pohodi/IDPohoda.jpg
        const imageUrl = pohod.SlikanaslovnicaFilename
            ? `../images/pohodi/${pohod.SlikanaslovnicaFilename}`
            : '../images/default-pohod.jpg';

        return `
        <div class="col-md-6 mb-4">
            <div class="card pohod-card hover-shadow">
                <a href="pohod.html?id=${
                    pohod.IDPohod
                }" class="text-decoration-none">
                    <img src="${imageUrl}" 
                         alt="${pohod.PohodIme}" 
                         class="card-img-top" 
                         style="height: 180px; object-fit: cover;"
                         onerror="this.src='../images/default-pohod.jpg'" />
                    <div class="card-body text-dark">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">
                                <strong>${pohod.PohodIme}</strong>
                            </h5>
                            <span class="badge bg-secondary" title="${
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
                            <span class="badge bg-secondary text-white">
                                <i class="fas fa-check me-1"></i>Izveden
                            </span>
                        </div>    
                        <strong class="mb-2 d-block">
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

    updateLoadMoreButton(container, total, type) {
        const existingBtn = container.querySelector('.load-more-container');
        if (existingBtn) {
            existingBtn.remove();
        }

        let hasMore;
        switch (type) {
            case 'upcoming':
                hasMore = this.hasMore;
                break;
            case 'past':
                hasMore = this.pastHasMore;
                break;
            default:
                hasMore = false;
        }

        if (hasMore) {
            const loadMoreHtml = `
                <div class="text-center mt-4 load-more-container">
                    <button class="btn btn-outline-primary load-more" data-type="${type}">
                        <i class="fas fa-plus-circle me-2"></i>Prikaži več
                    </button>
                </div>
            `;

            container.insertAdjacentHTML('beforeend', loadMoreHtml);

            const loadMoreBtn = container.querySelector('.load-more');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    if (type === 'upcoming') {
                        this.currentPage++;
                        this.loadUpcomingHikes(true);
                    } else if (type === 'past') {
                        this.pastPage++;
                        this.loadPastHikes(true);
                    }
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

        // Use the correct image path: images/pohodi/IDPohoda.jpg
        const imageUrl = pohod.SlikanaslovnicaFilename
            ? `../images/pohodi/${pohod.SlikanaslovnicaFilename}`
            : '../images/default-pohod.jpg';

        return `
        <div class="col-md-6 mb-4 bg-light" 
             data-difficulty="${pohod.Tezavnost}"
             data-location="${pohod.Lokacija}"
             data-date="${date}">
            <div class="card pohod-card hover-shadow">
                <a href="pohod.html?id=${
                    pohod.IDPohod
                }" class="text-decoration-none">
                    <img src="${imageUrl}" 
                         alt="${pohod.PohodIme}" 
                         class="card-img-top" 
                         style="height: 200px; object-fit: cover;"
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
