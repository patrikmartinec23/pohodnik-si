class ProfileDrustvo {
    constructor() {
        this.container = document.getElementById('main-content');
        this.drustvoId = new URLSearchParams(window.location.search).get('id');
        this.init();
    }

    async init() {
        const user = Auth.getUser();
        try {
            // If no ID in URL, load logged in društvo's profile
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

            this.renderProfile(drustvo, isOwner);

            if (isOwner) {
                this.loadMembershipRequests(drustvo.IDPohodniskoDrustvo);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Napaka pri nalaganju profila');
        }
    }

    renderProfile(drustvo, isOwner) {
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
                        <div class="card shadow-sm">
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
                                ${
                                    !isOwner
                                        ? `
                                    <button onclick="this.requestMembership(${drustvo.IDPohodniskoDrustvo})" 
                                            class="btn btn-primary w-100">
                                        <i class="fas fa-user-plus me-2"></i>Včlani se v društvo
                                    </button>
                                `
                                        : `
                                    <a href="./dodaj-pohod.html" class="btn btn-primary w-100 mb-3">
                                        <i class="fas fa-plus me-2"></i>Dodaj nov pohod
                                    </a>
                                `
                                }
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
                        <div class="card shadow-sm">
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
                            <button onclick="this.handleMembershipRequest(${
                                req.IDZahteva
                            }, 'accept')"
                                    class="btn btn-sm btn-success">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="this.handleMembershipRequest(${
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

            // Reload requests
            await this.loadMembershipRequests(this.drustvoId);
        } catch (error) {
            console.error('Error handling membership request:', error);
        }
    }

    async requestMembership(drustvoId) {
        const user = Auth.getUser();
        if (!user) {
            window.location.href = '/pages/prijava.html';
            return;
        }

        try {
            const response = await fetch(
                `/api/drustvo/${drustvoId}/request-membership`,
                {
                    method: 'POST',
                }
            );

            if (!response.ok) throw new Error('Failed to submit request');

            alert('Zahteva za včlanitev je bila uspešno poslana');
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
}

document.addEventListener('DOMContentLoaded', () => new ProfileDrustvo());
