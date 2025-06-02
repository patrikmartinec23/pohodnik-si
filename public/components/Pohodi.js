class Pohodi {
    constructor() {
        this.container = document.querySelector('.row[data-aos="fade-up"]');
        this.filters = {
            search: document.getElementById('searchInput'),
            difficulty: document.getElementById('tezavnostFilter'),
            location: document.getElementById('lokacijaFilter'),
            date: document.getElementById('datumFilter'),
        };
        this.pohodi = []; // Store pohodi data
        this.init();
    }

    async init() {
        try {
            await this.loadPohodi();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing Pohodi:', error);
        }
    }

    async loadPohodi() {
        try {
            const response = await fetch('/api/pohodi');
            this.pohodi = await response.json();
            this.renderPohodi(this.pohodi);
        } catch (error) {
            console.error('Error loading pohodi:', error);
            this.container.innerHTML =
                '<div class="col-12"><p class="text-center">Napaka pri nalaganju pohodov.</p></div>';
        }
    }

    createPohodCard(pohod) {
        const date = new Date(pohod.DatumPohoda).toLocaleDateString('sl-SI', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
        const duration = pohod.Trajanje.split(':')[0];

        return `
            <div class="col-md-4 mb-4" 
                 data-difficulty="${pohod.Tezavnost}"
                 data-location="${pohod.Lokacija}"
                 data-date="${date}">
                <div class="card bg-light hover-shadow">
                    <a href="pohod.html?id=${pohod.IDPohod}">
                        <img src="../images/project-1.jpg" alt="${pohod.PohodIme}" class="card-img-top" />
                        <div class="card-body text-dark">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title mb-0">
                                    <strong>${pohod.PohodIme}</strong>
                                </h5>
                                <span class="badge bg-primary">
                                    <i class="fas fa-mountain me-1"></i>${pohod.Lokacija}
                                </span>
                            </div>
                            <div class="d-flex gap-2 mb-3">
                                <span class="badge bg-success">
                                    <i class="fas fa-hiking me-1"></i>${pohod.Tezavnost}/5
                                </span>
                                <span class="badge bg-info">
                                    <i class="fas fa-clock me-1"></i>${duration}h
                                </span>
                                <span class="badge bg-warning text-dark">
                                    <i class="fas fa-map-marker-alt me-1"></i>${pohod.ZbirnoMesto}
                                </span>
                            </div>
                            <p class="card-text small mb-2">${pohod.PohodOpis}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>${date}
                                </small>
                                <small class="text-primary">
                                    <i class="fas fa-users me-1"></i>${pohod.Vodic}
                                </small>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }

    filterPohodi() {
        const searchTerm = this.filters.search.value.toLowerCase();
        const selectedDifficulty = this.filters.difficulty.value;
        const selectedLocation = this.filters.location.value;
        const selectedDate = this.filters.date.value;

        const filteredPohodi = this.pohodi.filter((pohod) => {
            const matchesSearch =
                pohod.PohodIme.toLowerCase().includes(searchTerm);
            const matchesDifficulty =
                !selectedDifficulty ||
                pohod.Tezavnost.toString() === selectedDifficulty;
            const matchesLocation =
                !selectedLocation ||
                pohod.Lokacija.toLowerCase() === selectedLocation.toLowerCase();
            const matchesDate =
                !selectedDate || pohod.DatumPohoda.includes(selectedDate);

            return (
                matchesSearch &&
                matchesDifficulty &&
                matchesLocation &&
                matchesDate
            );
        });

        this.renderPohodi(filteredPohodi);
    }

    setupEventListeners() {
        // Set up search filter with debounce
        if (this.filters.search) {
            this.filters.search.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.filterPohodi(), 300);
            });
        }

        // Set up other filters
        ['difficulty', 'location', 'date'].forEach((filterType) => {
            if (this.filters[filterType]) {
                this.filters[filterType].addEventListener('change', () =>
                    this.filterPohodi()
                );
            }
        });
    }

    renderPohodi(pohodi) {
        if (!pohodi.length) {
            this.container.innerHTML =
                '<div class="col-12"><p class="text-center">Ni najdenih pohodov.</p></div>';
            return;
        }
        this.container.innerHTML = pohodi
            .map((pohod) => this.createPohodCard(pohod))
            .join('');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new Pohodi());
