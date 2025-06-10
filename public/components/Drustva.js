class Drustva {
    constructor() {
        this.container = document.getElementById('clubList');
        this.filters = {
            search: document.getElementById('searchInput'),
            region: document.getElementById('regionFilter'),
        };
        this.drustva = [];
        this.init();
    }

    async init() {
        try {
            await this.loadDrustva();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing Drustva:', error);
        }
    }

    async loadDrustva() {
        try {
            const response = await fetch('/api/drustva');
            this.drustva = await response.json();
            this.renderDrustva(this.drustva);
        } catch (error) {
            console.error('Error loading drustva:', error);
            this.container.innerHTML =
                '<div class="col-12"><p class="text-center">Napaka pri nalaganju društev.</p></div>';
        }
    }

    createDrustvoCard(drustvo) {
        const yearFounded = drustvo.LetoUstanovitve;
        const yearsActive = new Date().getFullYear() - yearFounded;

        return `
            <div class="col-md-4" data-aos="fade-up">
                <div class="card h-100 bg-light hover-shadow">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-users me-2"></i>${
                                drustvo.DrustvoIme
                            }
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex gap-2 mb-3">
                                <span class="badge bg-info">
                                    <i class="fas fa-calendar-alt me-1"></i>${yearsActive} let
                                </span>
                                <span class="badge bg-success">
                                    <i class="fas fa-map-marker-alt me-1"></i>${
                                        drustvo.Naslov.split(',')[1]?.trim() ||
                                        'Slovenija'
                                    }
                                </span>
                            </div>
                            <p class="card-text">
                                <small class="text-muted">
                                    <i class="fas fa-home me-2"></i>${
                                        drustvo.Naslov
                                    }
                                </small>
                            </p>
                            <p class="card-text">
                                <small class="text-muted">
                                    <i class="fas fa-user me-2"></i>Predsednik: ${
                                        drustvo.Predsednik
                                    }
                                </small>
                            </p>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="drustvo.html?id=${
                                drustvo.IDPohodniskoDrustvo
                            }" class="btn btn-outline-primary">
                                <i class="fas fa-info-circle me-2"></i>Več informacij
                            </a>
                            <button class="btn btn-success" onclick="joinClub(${
                                drustvo.IDPohodniskoDrustvo
                            })">
                                <i class="fas fa-user-plus me-2"></i>Včlani se
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    filterDrustva() {
        const searchTerm = this.filters.search.value.toLowerCase();
        const selectedRegion = this.filters.region.value.toLowerCase();

        const filteredDrustva = this.drustva.filter((drustvo) => {
            const matchesSearch =
                drustvo.DrustvoIme.toLowerCase().includes(searchTerm);
            const matchesRegion =
                !selectedRegion ||
                drustvo.Naslov.toLowerCase().includes(selectedRegion);
            return matchesSearch && matchesRegion;
        });

        this.renderDrustva(filteredDrustva);
    }

    setupEventListeners() {
        if (this.filters.search) {
            this.filters.search.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(
                    () => this.filterDrustva(),
                    300
                );
            });
        }

        if (this.filters.region) {
            this.filters.region.addEventListener('change', () =>
                this.filterDrustva()
            );
        }
    }

    renderDrustva(drustva) {
        if (!drustva.length) {
            this.container.innerHTML = `
                <div class="col-12 py-6">
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Ni najdenih društev</h3>
                        <p>Poskusite z drugačnimi filtri ali iskalno besedo.</p>
                    </div>
                </div>
            `;
            return;
        }
        this.container.innerHTML = drustva
            .map((drustvo) => this.createDrustvoCard(drustvo))
            .join('');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new Drustva());
