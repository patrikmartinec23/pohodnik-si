class ProfileDrustvo {
    constructor() {
        this.container = document.getElementById('main-content');
        this.drustvoId = new URLSearchParams(window.location.search).get('id');
        this.currentPage = 1;
        this.loading = false;
        this.hasMore = true;
        this.itemsPerPage = 2;
        window.profileDrustvo = this;
        this.init();
    }

    async init() {
        const user = Auth.getUser();
        try {
            const profileId = this.drustvoId || user?.id;
            if (!profileId) {
                window.location.href = '/pages/prijava.html';
                return;
            }

            const response = await fetch(`/api/drustvo/${profileId}`);
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            const drustvo = await response.json();
            const isOwner = user?.id === profileId && user?.type === 'drustvo';

            // Check membership status for non-owners
            let membershipStatus = null;
            if (user && user.type === 'pohodnik' && !isOwner) {
                try {
                    const statusResponse = await fetch(
                        `/api/drustvo/${drustvo.IDPohodniskoDrustvo}/membership-status`
                    );
                    if (statusResponse.ok) {
                        membershipStatus = await statusResponse.json();
                    }
                } catch (error) {
                    console.log('Could not check membership status');
                }
            }

            this.renderProfile(drustvo, isOwner, membershipStatus);

            if (isOwner) {
                this.loadMembershipRequests(drustvo.IDPohodniskoDrustvo);
            }

            // Load organizirani pohodi for all visitors
            this.loadOrganiziraniPohodi(drustvo.IDPohodniskoDrustvo);
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Napaka pri nalaganju profila');
        }
    }

    renderProfile(drustvo, isOwner, membershipStatus) {
        // Get current user to check type
        const user = Auth.getUser();

        // Determine button content based on membership status
        let buttonContent = '';
        if (isOwner) {
            buttonContent = `
        <a href="./dodaj-pohod.html" class="btn btn-primary w-100 mb-3">
            <i class="fas fa-plus me-2"></i>Dodaj nov pohod
        </a>
    `;
        } else {
            // Only show membership buttons for pohodniki
            if (user && user.type === 'pohodnik') {
                if (membershipStatus?.isMember) {
                    buttonContent = `
                    <button onclick="profileDrustvo.leaveMembership(${drustvo.IDPohodniskoDrustvo})" 
                            class="btn btn-danger w-100">
                        <i class="fas fa-user-minus me-2"></i>Izpiši se iz društva
                    </button>
                `;
                } else if (membershipStatus?.hasPendingRequest) {
                    buttonContent = `
                    <button class="btn btn-secondary w-100" disabled>
                        <i class="fas fa-clock me-2"></i>Zahteva v obdelavi
                    </button>
                `;
                } else {
                    buttonContent = `
                    <button onclick="profileDrustvo.requestMembership(${drustvo.IDPohodniskoDrustvo})" 
                            class="btn btn-primary w-100">
                        <i class="fas fa-user-plus me-2"></i>Včlani se v društvo
                    </button>
                `;
                }
            } else if (user && user.type === 'drustvo') {
                // No button for other društva
                buttonContent = '';
            } else {
                // Not logged in - show login button
                buttonContent = `
            <a href="./prijava.html" class="btn btn-primary w-100">
                <i class="fas fa-sign-in-alt me-2"></i>Prijavi se
            </a>
        `;
            }
        }

        this.container.innerHTML = `
        <div class="profile-banner" style="
            background-image: url('../images/colton-duke-QRU0i5AqEJA-unsplash.jpg');
            height: 300px;
            background-size: cover;
            background-position: center;
            position: relative;
        ">
            <div class="overlay" style="
                background: rgba(0,0,0,0.4);
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            ">
                <h1 class="text-white text-center py-4 mt-7">${
                    drustvo.DrustvoIme
                }</h1>
            </div>
        </div>
        
        <div class="container py-5">
            <div class="row">
                <!-- Left column -->
                <div class="col-lg-4 mb-4">
                    <div class="card shadow-sm bg-light">
                        <div class="card-body">
                            <h4 class="card-title mb-4">O društvu</h4>
                            <ul class="list-unstyled">
                                <li class="mb-3">
                                    <i class="fas fa-map-marker-alt text-primary me-2"></i>${
                                        drustvo.Naslov
                                    }
                                </li>
                                <li class="mb-3">
                                    <i class="fas fa-calendar text-primary me-2"></i>Ustanovljeno: ${
                                        drustvo.LetoUstanovitve
                                    }
                                </li>
                                <li class="mb-3">
                                    <i class="fas fa-user text-primary me-2"></i>Predsednik: ${
                                        drustvo.Predsednik
                                    }
                                </li>
                                <li class="mb-3">
                                    <i class="fas fa-hiking text-primary me-2"></i>Število pohodov: ${
                                        drustvo.pohodiCount
                                    }
                                </li>
                            </ul>
                            ${buttonContent}
                        </div>
                    </div>
                    
                    ${
                        isOwner
                            ? `
                        <div class="card shadow-sm mt-4">
                            <div class="card-body">
                                <h5 class="card-title">Zahteve za včlanitev</h5>
                                <div id="membership-requests">
                                    <!-- Requests will be loaded here -->
                                </div>
                            </div>
                        </div>
                    `
                            : ''
                    }
                </div>

                <!-- Right column -->
                <div class="col-lg-8">
                    <div class="card shadow-sm bg-light">
                        <div class="card-body">
                            <h5 class="card-title mb-4">Organizirani pohodi</h5>
                            <div id="pohodi-list">
                                <!-- Pohodi will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    async loadMembershipRequests(drustvoId) {
        try {
            const response = await fetch(
                `/api/drustvo/${drustvoId}/membership-requests`
            );
            if (!response.ok) throw new Error('Failed to load requests');

            const requests = await response.json();
            const container = document.getElementById('membership-requests');

            if (requests.length === 0) {
                container.innerHTML =
                    '<p class="text-muted">Ni novih zahtev za včlanitev</p>';
                return;
            }

            container.innerHTML = requests
                .map(
                    (req) => `
            <div class="request-item border-bottom py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${req.UporabniskoIme}</span>
                    <div class="btn-group">
                        <button onclick="profileDrustvo.handleMembershipRequest(${
                            req.IDZahteva
                        }, 'accept')"
                                class="btn btn-sm btn-success">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="profileDrustvo.handleMembershipRequest(${
                            req.IDZahteva
                        }, 'reject')"
                                class="btn btn-sm btn-danger">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <small class="text-muted">Zahteva poslana: ${new Date(
                    req.DatumZahteve
                ).toLocaleDateString()}</small>
            </div>
        `
                )
                .join('');
        } catch (error) {
            console.error('Error loading membership requests:', error);
        }
    }

    async handleMembershipRequest(requestId, action) {
        try {
            const response = await fetch(
                `/api/membership-requests/${requestId}/${action}`,
                {
                    method: 'POST',
                }
            );
            if (!response.ok) throw new Error('Failed to process request');

            // Get the current drustvo ID from the URL or stored value
            const currentDrustvoId =
                this.drustvoId ||
                new URLSearchParams(window.location.search).get('id');

            // Reload requests using the correct drustvo ID
            const user = Auth.getUser();
            const drustvo = await fetch(
                `/api/drustvo/${currentDrustvoId || user?.id}`
            ).then((r) => r.json());
            await this.loadMembershipRequests(drustvo.IDPohodniskoDrustvo);
        } catch (error) {
            console.error('Error handling membership request:', error);
        }
    }

    async leaveMembership(drustvoId) {
        const user = Auth.getUser();
        if (!user) {
            window.location.href = '/pages/prijava.html';
            return;
        }

        if (confirm('Ali se res želite izpisati iz društva?')) {
            try {
                const response = await fetch(
                    `/api/drustvo/${drustvoId}/leave-membership`,
                    {
                        method: 'POST',
                    }
                );

                if (!response.ok) throw new Error('Failed to leave membership');

                alert('Uspešno ste se izpisali iz društva');
                // Reload the page to update the button
                window.location.reload();
            } catch (error) {
                console.error('Error leaving membership:', error);
                alert('Napaka pri izpisu iz društva');
            }
        }
    }

    async requestMembership(drustvoId) {
        const user = Auth.getUser();
        if (!user) {
            window.location.href = '/pages/prijava.html';
            return;
        }

        if (user.type !== 'pohodnik') {
            alert('Samo pohodniki se lahko včlanijo v društvo');
            return;
        }

        try {
            // Check if already requested
            const checkResponse = await fetch(
                `/api/drustvo/${drustvoId}/membership-status`
            );
            const { isMember, hasPendingRequest } = await checkResponse.json();

            if (isMember) {
                alert('Že ste član tega društva');
                return;
            }

            if (hasPendingRequest) {
                alert('Vaša zahteva za včlanitev je že v obdelavi');
                return;
            }

            // Submit request
            const response = await fetch(
                `/api/drustvo/${drustvoId}/request-membership`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to submit request');

            alert('Zahteva za včlanitev je bila uspešno poslana');

            // Refresh the profile data instead of reloading the page
            await this.init();
        } catch (error) {
            console.error('Error requesting membership:', error);
            alert('Napaka pri pošiljanju zahteve');
        }
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="alert alert-danger m-4 mt-8" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>${message}
            </div>
        `;
    }

    async loadOrganiziraniPohodi(drustvoId, isLoadMore = false) {
        if (this.loading) {
            return;
        }

        if (!this.currentDrustvoId) {
            this.currentDrustvoId = drustvoId;
        }

        if (isLoadMore && !this.hasMore) {
            return;
        }

        try {
            this.loading = true;

            const response = await fetch(
                `/api/drustvo/${drustvoId}/pohodi?page=${this.currentPage}&limit=${this.itemsPerPage}`
            );

            if (!response.ok) throw new Error('Failed to load pohodi');

            const { pohodi, total } = await response.json();
            const container = document.getElementById('pohodi-list');

            if (!pohodi || !pohodi.length) {
                if (!isLoadMore) {
                    container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-hiking fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Še niste organizirali nobenega pohoda</p>
                    </div>
                `;
                }
                this.hasMore = false;
                return;
            }

            const user = Auth.getUser();
            const profileId = this.drustvoId || user?.id;
            const isOwner = user?.id === profileId && user?.type === 'drustvo';

            const pohodiCards = pohodi
                .map((pohod) => this.createPohodCard(pohod, isOwner))
                .join('');

            if (isLoadMore) {
                const cardsContainer = container.querySelector('.row');
                if (cardsContainer) {
                    cardsContainer.insertAdjacentHTML('beforeend', pohodiCards);
                }
            } else {
                container.innerHTML = `
                <div class="row g-4">
                    ${pohodiCards}
                </div>
            `;
            }

            const loadedCount = this.currentPage * this.itemsPerPage;
            this.hasMore = loadedCount < total;

            this.updateLoadMoreButton(container, total);
        } catch (error) {
            console.error('Error loading organizirani pohodi:', error);
            if (!isLoadMore) {
                const container = document.getElementById('pohodi-list');
                container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Napaka pri nalaganju pohodov</p>
                </div>
            `;
            }
        } finally {
            this.loading = false;
        }
    }

    updateLoadMoreButton(container, total) {
        const existingBtn = container.querySelector('.load-more-container');
        if (existingBtn) {
            existingBtn.remove();
        }

        if (this.hasMore) {
            const loadMoreHtml = `
            <div class="text-center mt-4 load-more-container">
                <button class="btn btn-outline-primary load-more">
                    <i class="fas fa-plus-circle me-2"></i>Prikaži več
                </button>
            </div>`;

            container.insertAdjacentHTML('beforeend', loadMoreHtml);

            const loadMoreBtn = container.querySelector('.load-more');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    this.currentPage++;
                    this.loadOrganiziraniPohodi(this.currentDrustvoId, true);
                });
            }
        }
    }

    createPohodCard(pohod, isOwner) {
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
        <div class="col-md-6 mb-4">
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
                        <div class="mt-2">
                            <small class="text-muted">
                                <i class="fas fa-users me-1"></i>Prosta mesta: ${
                                    pohod.ProstaMesta
                                }
                            </small>
                        </div>
                    </div>
                </a>
                ${
                    isOwner
                        ? `
                    <div class="card-footer bg-light border-0">
                        <div class="btn-group w-100">
                            <a href="./dodaj-pohod.html?edit=${pohod.IDPohod}" 
                               class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-edit me-1"></i>Uredi
                            </a>
                            <button onclick="profileDrustvo.deletePohod(${pohod.IDPohod})" 
                                    class="btn btn-outline-danger btn-sm">
                                <i class="fas fa-trash me-1"></i>Izbriši
                            </button>
                        </div>
                    </div>
                `
                        : ''
                }
            </div>
        </div>
    `;
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
                    // Use the same drustvoId that was used in the initial load
                    // Store it as a class property to ensure consistency
                    this.loadOrganiziraniPohodi(this.currentDrustvoId, true);
                });
            }
        }
    }

    async deletePohod(pohodId) {
        if (
            !confirm(
                'Ali ste prepričani, da želite izbrisati ta pohod? To dejanje ni mogoče razveljaviti.'
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/pohodi/${pohodId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete pohod');

            alert('Pohod je bil uspešno izbrisan');

            // Reset pagination and reload
            this.currentPage = 1;
            this.hasMore = true;

            const user = Auth.getUser();
            const drustvoId = this.drustvoId || user?.id;
            await this.loadOrganiziraniPohodi(drustvoId);
        } catch (error) {
            console.error('Error deleting pohod:', error);
            alert('Napaka pri brisanju pohoda');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new ProfileDrustvo());
