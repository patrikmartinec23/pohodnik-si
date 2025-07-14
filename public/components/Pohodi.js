class Pohodi {
    constructor() {
        this.container = document.querySelector('.row[data-aos="fade-up"]');
        this.filters = {
            search: document.getElementById('searchInput'),
            difficulty: document.getElementById('tezavnostFilter'),
            location: document.getElementById('lokacijaFilter'),
            dateFrom: document.getElementById('datumOdFilter'),
            dateTo: document.getElementById('datumDoFilter'),
            availableOnly: document.getElementById('availableOnlyFilter'),
        };
        this.resetButton = document.getElementById('resetFilters');
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
            const params = new URLSearchParams();

            if (this.filters.search.value) {
                params.append('search', this.filters.search.value);
            }
            if (this.filters.difficulty.value) {
                params.append('difficulty', this.filters.difficulty.value);
            }
            if (this.filters.location.value) {
                params.append('location', this.filters.location.value);
            }
            if (this.filters.dateFrom.value) {
                params.append('dateFrom', this.filters.dateFrom.value);
            }
            if (this.filters.dateTo.value) {
                params.append('dateTo', this.filters.dateTo.value);
            }
            if (this.filters.availableOnly.checked) {
                params.append('availableOnly', 'true');
            }

            const response = await fetch(
                `/api/pohodi/filter?${params.toString()}`
            );
            const pohodi = await response.json();
            this.renderPohodi(pohodi);
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

        // Truncate location if longer than 15 characters
        const truncatedLocation =
            pohod.Lokacija.length > 15
                ? pohod.Lokacija.substring(0, 12) + '...'
                : pohod.Lokacija;

        // Truncate zborno mesto if longer than 20 characters
        const truncatedZbirnoMesto =
            pohod.ZbirnoMesto.length > 20
                ? pohod.ZbirnoMesto.substring(0, 17) + '...'
                : pohod.ZbirnoMesto;

        // Generate image URL based on pohod ID
        let imageUrl = '../images/default-pohod.jpg';
        if (pohod.SlikanaslovnicaFilename) {
            imageUrl = `../images/pohodi/${pohod.SlikanaslovnicaFilename}`;
        }

        return `
        <div class="col-12 col-md-6 col-lg-4 mb-4" 
             data-difficulty="${pohod.Tezavnost}"
             data-location="${pohod.Lokacija}"
             data-date="${date}">
            <div class="card pohod-card bg-light hover-shadow">
                <a href="pohod.html?id=${pohod.IDPohod}" class="text-decoration-none">
                    <img src="${imageUrl}" 
                         alt="${pohod.PohodIme}" 
                         class="card-img-top" 
                         onerror="this.src='../images/default-pohod.jpg'" />
                    <div class="card-body text-dark">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">
                                <strong>${pohod.PohodIme}</strong>
                            </h5>
                            <span class="badge bg-primary" title="${pohod.Lokacija}">
                                <i class="fas fa-mountain me-1"></i>${truncatedLocation}
                            </span>
                        </div>
                        <div class="d-flex gap-2 mb-3">
                            <span class="badge bg-success">
                                <i class="fas fa-hiking me-1"></i>${pohod.Tezavnost}/5
                            </span>
                            <span class="badge bg-info">
                                <i class="fas fa-clock me-1"></i>${duration}h
                            </span>
                            <span class="badge bg-warning text-dark" title="${pohod.ZbirnoMesto}">
                                <i class="fas fa-map-marker-alt me-1"></i>${truncatedZbirnoMesto}
                            </span>
                        </div>
                        <p class="card-text small mb-2">${pohod.PohodOpis}</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${date}
                            </small>
                            <small class="text-primary">
                                <i class="fas fa-users me-1"></i>${pohod.DrustvoIme}
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
        this.filters.search.addEventListener(
            'input',
            debounce(() => this.loadPohodi(), 300)
        );

        this.filters.difficulty.addEventListener('change', () =>
            this.loadPohodi()
        );
        this.filters.location.addEventListener('change', () =>
            this.loadPohodi()
        );
        this.filters.dateFrom.addEventListener('change', () =>
            this.loadPohodi()
        );
        this.filters.dateTo.addEventListener('change', () => this.loadPohodi());
        this.filters.availableOnly.addEventListener('change', () =>
            this.loadPohodi()
        );
        this.resetButton.addEventListener('click', () => this.resetFilters());
    }

    resetFilters() {
        this.filters.search.value = '';
        this.filters.difficulty.value = '';
        this.filters.location.value = '';
        this.filters.dateFrom.value = '';
        this.filters.dateTo.value = '';
        this.filters.availableOnly.checked = false;

        this.loadPohodi();
    }

    renderPohodi(pohodi) {
        if (!pohodi.length) {
            this.container.innerHTML = `
            <div class="col-12 py-6">
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Ni najdenih pohodov</h3>
                    <p>Poskusite z drugačnimi filtri ali iskalno besedo.</p>
                </div>
            </div>
        `;
            return;
        }
        this.container.innerHTML = pohodi
            .map((pohod) => this.createPohodCard(pohod))
            .join('');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', () => new Pohodi());
