class Drustva {
    constructor() {
        this.container = document.getElementById('main-content');
        this.init();
    }

    async init() {
        try {
            this.renderLoadingState();
            await this.loadDrustva();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing Drustva:', error);
            this.renderErrorState();
        }
    }

    renderLoadingState() {
        this.container.innerHTML = `
            <div class="container py-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <h2 class="fw-bold">Pohodniška društva</h2>
                        <p class="text-muted mb-3">Pregled vseh pohodniških društev</p>
                        <hr class="hr-heading-primary w-25" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Nalaganje...</span>
                        </div>
                        <p class="mt-3 text-muted">Nalaganje seznama društev...</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderErrorState() {
        this.container.innerHTML = `
            <div class="container py-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <h2 class="fw-bold">Pohodniška društva</h2>
                        <p class="text-muted mb-3">Pregled vseh pohodniških društev</p>
                        <hr class="hr-heading-primary w-25" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h4 class="mb-3">Napaka pri nalaganju</h4>
                        <p class="text-muted">Prišlo je do napake pri nalaganju podatkov.</p>
                        <button class="btn btn-primary mt-3" id="retryButton">
                            <i class="fas fa-redo me-2"></i>Poskusi znova
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('retryButton').addEventListener('click', () => {
            this.init();
        });
    }

    async loadDrustva() {
        try {
            const response = await fetch('/api/drustva');
            const drustva = await response.json();
            this.renderDrustva(drustva);
        } catch (error) {
            console.error('Error loading drustva:', error);
            throw error;
        }
    }

    renderDrustva(drustva) {
        if (!drustva.length) {
            this.renderEmptyState();
            return;
        }

        this.container.innerHTML = `
            <div class="container py-5">
                <div class="row mb-4">
                    <div class="col-12 d-flex justify-content-between align-items-start">
                        <div>
                            <h2 class="fw-bold">Pohodniška društva</h2>
                            <p class="text-muted mb-3">Pregled vseh pohodniških društev</p>
                            <hr class="hr-heading-primary w-25" />
                        </div>
                        <div>
                            <div class="input-group">
                                <input type="text" class="form-control" id="searchDrustva" 
                                    placeholder="Išči društvo...">
                                <button class="btn btn-outline-primary" type="button" id="searchButton">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row" id="drustvaContainer">
                    ${drustva
                        .map((drustvo) => this.createDrustvoCard(drustvo))
                        .join('')}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <div class="container py-5">
                <div class="row mb-4">
                    <div class="col-12">
                        <h2 class="fw-bold">Pohodniška društva</h2>
                        <p class="text-muted mb-3">Pregled vseh pohodniških društev</p>
                        <hr class="hr-heading-primary w-25" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <h4 class="mb-2">Ni najdenih društev</h4>
                        <p class="text-muted">Trenutno ni registriranih pohodniških društev.</p>
                    </div>
                </div>
            </div>
        `;
    }

    createDrustvoCard(drustvo) {
        // Random background header from a set of mountain images (1-5)
        const randomBg = Math.floor(Math.random() * 5) + 1;
        const bgImageUrl = `../images/mountains-${randomBg}.jpg`;

        return `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100 shadow-sm border-0 hover-shadow">
                <div class="card-header p-0 position-relative">
                    <div class="bg-image" style="
                        background-image: url('${bgImageUrl}');
                        height: 140px;
                        background-size: cover;
                        background-position: center;
                    ">
                        <div class="overlay p-3" style="
                            background: rgba(0,0,0,0.5);
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                        ">
                            <h4 class="text-white mb-0 fw-bold">${
                                drustvo.DrustvoIme
                            }</h4>
                            <small class="text-white-50">
                                <i class="fas fa-calendar me-1"></i>Est. ${
                                    drustvo.LetoUstanovitve || 'N/A'
                                }
                            </small>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <div class="d-flex align-items-center mb-2">
                            <i class="fas fa-map-marker-alt text-primary me-2"></i>
                            <span>${drustvo.Naslov || 'Ni podatka'}</span>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <i class="fas fa-user text-primary me-2"></i>
                            <span>${drustvo.Predsednik || 'Ni podatka'}</span>
                        </div>
                    </div>
                    
                    <div class="text-center mt-4">
                        <a href="./profil-drustvo.html?id=${
                            drustvo.TK_Uporabnik
                        }" 
                            class="btn btn-primary btn-lg w-100">
                            <i class="fas fa-info-circle me-2"></i>Oglej si društvo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchDrustva');
        const searchButton = document.getElementById('searchButton');

        if (searchInput && searchButton) {
            // Implement search functionality
            searchInput.addEventListener('input', this.handleSearch.bind(this));
            searchButton.addEventListener('click', () =>
                this.handleSearch({ target: searchInput })
            );
        }
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const cards = document.querySelectorAll('#drustvaContainer .col-lg-4');

        cards.forEach((card) => {
            const drustvoName = card
                .querySelector('.card-header h4')
                .textContent.toLowerCase();
            const drustvo = card
                .querySelector('.card-body')
                .textContent.toLowerCase();

            if (
                drustvoName.includes(searchTerm) ||
                drustvo.includes(searchTerm)
            ) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new Drustva());
