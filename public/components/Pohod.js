class Pohod {
    constructor() {
        this.container = document.getElementById('main-content');
        this.map = null; // Initialize map property
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

        const buttonHtml = user
            ? user.type === 'drustvo'
                ? user.id === pohod.DrustvoUserId // Check if drustvo owns this pohod
                    ? `<button class="btn btn-warning btn-lg" onclick="editPohod(${pohod.IDPohod})">
                <i class="fas fa-edit me-2"></i>Uredi pohod
               </button>`
                    : '' // No button if drustvo doesn't own this pohod
                : `<button class="btn btn-primary btn-lg" onclick="prijavaNaPohod(${pohod.IDPohod})">
            <i class="fas fa-user-plus me-2"></i>Prijavi se na pohod
           </button>`
            : `<a href="./prijava.html" class="btn btn-primary btn-lg">
        <i class="fas fa-sign-in-alt me-2"></i>Prijavi se
       </a>`;

        this.container.innerHTML = `
            <section class="pohod-detail mb-4">
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
                                                <i class="fas fa-calendar me-2"></i>Datum
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
                                        ${
                                            Number(pohod.StroskiPrevoza) > 0
                                                ? `
        <li class="mb-3 d-flex justify-content-between">
            <span class="text-muted">
                <i class="fas fa-euro-sign me-2"></i>Stroški prevoza
            </span>
            <strong>${Number(pohod.StroskiPrevoza).toFixed(2)} €</strong>
        </li>
    `
                                                : ''
                                        }
                                    </ul>

                                    <hr class="my-4">                      
<div class="mb-3">
    <h5 class="h6 mb-2">Organizator pohoda</h5>
    <a href="./profil-drustvo.html?id=${pohod.DrustvoUserId}" 
       class="text-decoration-none">
        <div class="d-flex align-items-center p-2 rounded bg-light hover-shadow">
            <i class="fas fa-users text-primary me-3 fa-2x"></i>
            <div>
                <h6 class="mb-0 text-primary">${pohod.DrustvoIme}</h6>
            </div>
            <i class="fas fa-chevron-right ms-auto text-muted"></i>
        </div>
    </a>
</div>


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
        <section class="additional-info py-5 bg-light">
                <div class="container">
                    <div class="row">
                        <!-- Map Column -->
                        <div class="col-lg-6 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h3 class="h4 mb-4">
                                        <i class="fas fa-map-location-dot me-2  text-primary"></i>Lokacija
                                    </h3>
                                    <div class="map-container" style="position: relative; overflow: hidden; border-radius: 8px;">
                                        <div id="map" style="height: 400px; width: 100%; z-index: 1;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Comments Column -->
                        <div class="col-lg-6 mb-4">
                            <div class="card shadow-sm h-100">
                                <div class="card-body">
                                    <h3 class="h4 mb-3">
                                        <i class="fas fa-comments me-2  text-primary mb-3"></i>Komentarji
                                    </h3>                 
                                    <div id="commentsList" class="mt-4">
                                        <!-- Comments will be loaded here -->
                                    </div>
                                    ${
                                        Auth.getUser()
                                            ? `
        <form id="commentForm" class="mb-4">
            <div class="mb-3 mt-5">
                <label class="form-label">Ocena</label>
                <div class="rating mb-2">
                    ${[5, 4, 3, 2, 1]
                        .map(
                            (num) => `
                        <input type="radio" name="rating" value="${num}" id="star${num}" ${
                                num === 5 ? 'checked' : ''
                            }>
                        <label for="star${num}"><i class="fas fa-star"></i></label>
                    `
                        )
                        .join('')}
                </div>
                <textarea class="form-control" 
                          name="content"
                          rows="3" 
                          placeholder="Napiši komentar..."
                          required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-paper-plane me-2"></i>Oddaj
            </button>
        </form>
    `
                                            : `
        <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            Za oddajo komentarja se morate <a href="prijava.html">prijaviti</a>.
        </div>
    `
                                    }              
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;

        // Initialize map after DOM is ready
        setTimeout(() => {
            this.initializeMap(pohod.Lokacija);
        }, 100);

        this.loadComments(pohod.IDPohod);
    }

    async initializeMap(location) {
        try {
            // Clean up existing map if it exists
            if (this.map) {
                this.map.remove();
                this.map = null;
            }

            // Wait for the map element to be available in DOM
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                console.error('Map element not found');
                return;
            }

            // Initialize the map
            this.map = L.map('map', {
                zoomControl: true,
                scrollWheelZoom: true,
                dragging: true,
                tap: true,
                touchZoom: true,
            }).setView([46.1512, 14.9955], 8);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors',
            }).addTo(this.map);

            // Force map to invalidate size after a short delay
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 200);

            // Geocode the location
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        location
                    )}, Slovenia&limit=1`
                );
                const data = await response.json();

                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    this.map.setView([lat, lon], 13);
                    L.marker([lat, lon])
                        .addTo(this.map)
                        .bindPopup(`<strong>${location}</strong>`)
                        .openPopup();

                    // Invalidate size again after setting view
                    setTimeout(() => {
                        if (this.map) {
                            this.map.invalidateSize();
                        }
                    }, 100);
                } else {
                    console.warn('Location not found:', location);
                }
            } catch (geocodeError) {
                console.error('Error geocoding location:', geocodeError);
            }
        } catch (error) {
            console.error('Error initializing map:', error);
            // Show fallback content
            const mapElement = document.getElementById('map');
            if (mapElement) {
                mapElement.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                        <div class="text-center">
                            <i class="fas fa-map fa-3x mb-3"></i>
                            <p>Zemljevid ni na voljo</p>
                            <small>${location}</small>
                        </div>
                    </div>
                `;
            }
        }
    }

    async loadComments(pohodId) {
        try {
            const response = await fetch(`/api/pohodi/${pohodId}/comments`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const comments = data.comments || []; // Extract comments array

            const commentsList = document.getElementById('commentsList');
            if (!commentsList) {
                console.error('Comments list element not found');
                return;
            }

            if (!comments.length) {
                commentsList.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-comments fa-2x mb-3 d-block"></i>
                    <p class="mb-0">Še ni komentarjev. Bodite prvi!</p>
                </div>`;
                return;
            }

            commentsList.innerHTML = comments
                .map(
                    (comment) => `
                <div class="comment mb-3 pb-3 border-bottom">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-user-circle fa-2x text-primary me-2"></i>
                            <div>
                                <h6 class="mb-0">${comment.username}</h6>
                            </div>
                        </div>
                        <div class="rating-display">
                            ${Array(5)
                                .fill(0)
                                .map(
                                    (_, i) =>
                                        `<i class="fas fa-star ${
                                            i < comment.rating
                                                ? 'text-warning'
                                                : 'text-muted'
                                        }"></i>`
                                )
                                .join('')}
                        </div>
                    </div>
                    <p class="mb-0">${comment.content}</p>
                </div>
            `
                )
                .join('');
        } catch (error) {
            console.error('Error loading comments:', error);
            const commentsList = document.getElementById('commentsList');
            if (commentsList) {
                commentsList.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Napaka pri nalaganju komentarjev
                </div>`;
            }
        }
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

    // Cleanup method to be called when leaving the page
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}

function editPohod(pohodId) {
    window.location.href = `./dodaj-pohod.html?edit=${pohodId}`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pohodInstance = new Pohod();
});

// Cleanup when leaving the page
window.addEventListener('beforeunload', () => {
    if (window.pohodInstance && window.pohodInstance.destroy) {
        window.pohodInstance.destroy();
    }
});
