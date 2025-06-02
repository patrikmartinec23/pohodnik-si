class Pohod {
    constructor() {
        this.container = document.getElementById('main-content');
        this.init();
    }

    async init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');

            if (!id) {
                window.location.href = '/pages/pohodi.html';
                return;
            }

            await this.loadPohod(id);
        } catch (error) {
            console.error('Error initializing Pohod:', error);
        }
    }

    async loadPohod(id) {
        try {
            const response = await fetch(`/api/pohodi/${id}`);
            if (!response.ok) {
                throw new Error('Pohod not found');
            }
            const pohod = await response.json();
            this.renderPohod(pohod);
        } catch (error) {
            console.error('Error loading pohod:', error);
            this.showError('Pohod ni bil najden');
        }
    }

    renderPohod(pohod) {
        const date = new Date(pohod.DatumPohoda).toLocaleDateString('sl-SI', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
        const duration = pohod.Trajanje.split(':')[0];
        const user = Auth.getUser();

        // In the template, replace the button section with this:
        const buttonHtml = user
            ? `
            <button class="btn btn-primary btn-lg" onclick="prijavaNaPohod(${pohod.IDPohod})">
                <i class="fas fa-user-plus me-2"></i>Prijavi se na pohod
            </button>`
            : `
            <a href="./prijava.html" class="btn btn-primary btn-lg">
                <i class="fas fa-sign-in-alt me-2"></i>Prijavi se
            </a>`;

        this.container.innerHTML = `
            <section class="pohod-detail py-5">
                <div class="container">
                    <!-- Header Section -->
                    <div class="row mb-4">
                        <div class="col-12">
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                    <li class="breadcrumb-item"><a href="pohodi.html">Pohodi</a></li>
                                    <li class="breadcrumb-item active" aria-current="page">${
                                        pohod.PohodIme
                                    }</li>
                                </ol>
                            </nav>
                            <h1 class="display-4 mb-3">${pohod.PohodIme}</h1>
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <span class="badge bg-primary">
                                    <i class="fas fa-mountain me-1"></i>${
                                        pohod.Lokacija
                                    }
                                </span>
                                <span class="badge bg-success">
                                    <i class="fas fa-hiking me-1"></i>Težavnost: ${
                                        pohod.Tezavnost
                                    }/5
                                </span>
                                <span class="badge bg-info">
                                    <i class="fas fa-clock me-1"></i>${duration}h
                                </span>
                                <span class="badge bg-warning text-dark">
                                    <i class="fas fa-users me-1"></i>Prosta mesta: ${
                                        pohod.ProstaMesta
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Left Column -->
                        <div class="col-lg-8 mb-4">
                            <div class="card shadow-sm">
                                <img src="../images/project-1.jpg" 
                                     class="card-img-top" 
                                     alt="${pohod.Lokacija}"
                                     onerror="this.src='../images/default-pohod.jpg'">
                                <div class="card-body">
                                    <h3 class="h4 mb-3">Opis pohoda</h3>
                                    <p class="lead mb-4">${pohod.PohodOpis}</p>
                                    
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <div class="h5 mb-3">
                                                <i class="fas fa-list-check me-2 text-primary"></i>
                                                Obvezna oprema
                                            </div>
                                            <ul class="list-unstyled">
                                                ${pohod.ObveznaOprema.split(',')
                                                    .map(
                                                        (item) => `
                                                    <li class="mb-2">
                                                        <i class="fas fa-check text-success me-2"></i>
                                                        ${item.trim()}
                                                    </li>
                                                `
                                                    )
                                                    .join('')}
                                            </ul>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="h5 mb-3">
                                                <i class="fas fa-cloud me-2 text-primary"></i>
                                                Pričakovane razmere
                                            </div>
                                            <p>${pohod.PricakovaneRazmere}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div class="col-lg-4">
                            <div class="card shadow-sm mb-4">
                                <div class="card-body">
                                    <h3 class="h5 mb-4">Informacije o pohodu</h3>
                                    
                                    <ul class="list-unstyled">
                                        <li class="mb-3 d-flex justify-content-between">
                                            <span class="text-muted">
                                                <i class="fas fa-calendar me-2"></i>Datum in ura
                                            </span>
                                            <strong>${date}</strong>
                                        </li>
                                        <li class="mb-3 d-flex justify-content-between">
                                            <span class="text-muted">
                                                <i class="fas fa-map-marker-alt me-2"></i>Zbirno mesto
                                            </span>
                                            <strong>${
                                                pohod.ZbirnoMesto
                                            }</strong>
                                        </li>
                                        <li class="mb-3 d-flex justify-content-between">
                                            <span class="text-muted">
                                                <i class="fas fa-car me-2"></i>Prevoz
                                            </span>
                                            <strong>${pohod.Prevoz}</strong>
                                        </li>
                                        <li class="mb-3 d-flex justify-content-between">
                                            <span class="text-muted">
                                                <i class="fas fa-euro-sign me-2"></i>Stroški prevoza
                                            </span>
                                            <strong>${Number(
                                                pohod.StroskiPrevoza
                                            ).toFixed(2)} €</strong>
                                        </li>
                                    </ul>

                                    <hr class="my-4">

                                    <h4 class="h5 mb-3">Vodnik pohoda</h4>
                                    <div class="d-flex align-items-center mb-4">
                                        <div class="flex-shrink-0">
                                            <i class="fas fa-user-circle fa-2x text-primary"></i>
                                        </div>
                                        <div class="flex-grow-1 ms-3">
                                            <h6 class="mb-0">${pohod.Vodic}</h6>
                                            <small class="text-muted">
                                                <i class="fas fa-phone me-1"></i>${
                                                    pohod.VodicKontakt
                                                }
                                            </small>
                                        </div>
                                    </div>

                                    <div class="d-grid gap-2">
                                        ${buttonHtml}
                <a href="pohodi.html" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Nazaj na seznam
                </a>
                                    </div>
                                </div>
                            </div>

                            <!-- Warning Card if few spots left -->
                            ${
                                pohod.ProstaMesta < 5
                                    ? `
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Pohitite s prijavo!</strong>
                                    <br>Na voljo je še samo ${pohod.ProstaMesta} prostih mest.
                                </div>
                            `
                                    : ''
                            }
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>${message}
                </div>
                <a href="pohodi.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left me-2"></i>Nazaj na seznam
                </a>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new Pohod());
