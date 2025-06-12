class Pohod {
    constructor() {
        this.container = document.getElementById('main-content');
        this.map = null;
        this.isUserRegistered = false;
        window.pohodInstance = this;
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

            // Check if user is registered for this hike BEFORE rendering
            const user = Auth.getUser();
            if (user && user.type === 'pohodnik') {
                await this.checkRegistrationStatus(pohod.IDPohod);
            }

            // Now render with the correct registration status
            this.renderPohod(pohod);
        } catch (error) {
            console.error('Error loading pohod:', error);
            this.showError('Pohod ni bil najden');
        }
    }

    async checkRegistrationStatus(pohodId) {
        try {
            const response = await fetch(
                `/api/pohodi/${pohodId}/registration-status`
            );
            if (response.ok) {
                const { isRegistered } = await response.json();
                this.isUserRegistered = isRegistered;
            }
        } catch (error) {
            console.error('Error checking registration status:', error);
            this.isUserRegistered = false;
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

        // Store pohod data for later use
        this.currentPohod = pohod;

        // Check if current user owns this pohod
        const isOwner =
            user && user.type === 'drustvo' && user.id === pohod.DrustvoUserId;

        // Fix the button HTML - check registration status FIRST, then spots
        let buttonHtml = '';
        if (user) {
            if (user.type === 'drustvo') {
                // If user is a drustvo and owns this pohod, show edit button
                if (user.id === pohod.DrustvoUserId) {
                    buttonHtml = `<button class="btn btn-warning btn-lg" onclick="editPohod(${pohod.IDPohod})">
                    <i class="fas fa-edit me-2"></i>Uredi pohod
                </button>`;
                }
            } else if (user.type === 'pohodnik') {
                // FIRST check if user is already registered
                if (this.isUserRegistered) {
                    // User is registered - always show unregister button regardless of spots
                    buttonHtml = `<button class="btn btn-danger btn-lg" id="izpisiSeButton" data-pohod-id="${pohod.IDPohod}">
                    <i class="fas fa-user-minus me-2"></i>Izpiši se
                </button>`;
                } else {
                    // User is NOT registered - check if there are spots available
                    if (pohod.ProstaMesta <= 0) {
                        // No spots available and user not registered
                        buttonHtml = `<button class="btn btn-secondary btn-lg" disabled>
                        <i class="fas fa-user-times me-2"></i>Ni prostih mest
                    </button>`;
                    } else {
                        // Spots available and user not registered
                        buttonHtml = `<button class="btn btn-primary btn-lg" id="prijaviSeButton" data-pohod-id="${pohod.IDPohod}">
                        <i class="fas fa-user-plus me-2"></i>Prijavi se na pohod
                    </button>`;
                    }
                }
            }
        } else {
            // If user is not logged in, show login button
            buttonHtml = `<a href="./prijava.html" class="btn btn-primary btn-lg">
            <i class="fas fa-sign-in-alt me-2"></i>Prijavi se
        </a>`;
        }

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

                            ${
                                pohod.ProstaMesta <= 0
                                    ? `
        <div class="alert alert-danger">
            <i class="fas fa-times-circle me-2"></i>
            <strong>Pohod je poln!</strong>
            <br>Ni več prostih mest za prijavo.
        </div>
    `
                                    : pohod.ProstaMesta < 5
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
                ${
                    isOwner
                        ? `
                <!-- Registered Pohodniki Column (only for pohod owner) -->
                <div class="col-lg-4 mb-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h3 class="h4 mb-4">
                                <i class="fas fa-users me-2 text-success"></i>Prijavljeni pohodniki
                            </h3>
                            <div id="registeredPohodniki">
                                <!-- Registered pohodniki will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
                `
                        : ''
                }
                
                <!-- Map Column -->
                <div class="col-lg-${isOwner ? '4' : '6'} mb-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h3 class="h4 mb-4">
                                <i class="fas fa-map-location-dot me-2 text-primary"></i>Lokacija
                            </h3>
                            <div class="map-container" style="position: relative; overflow: hidden; border-radius: 8px;">
                                <div id="map" style="height: 400px; width: 100%; z-index: 1;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Comments Column -->
                <div class="col-lg-${isOwner ? '4' : '6'} mb-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h3 class="h4 mb-3">
                                <i class="fas fa-comments me-2 text-primary mb-3"></i>Komentarji
                            </h3>                 
                            <div id="commentsList" class="mt-4">
                                <!-- Comments will be loaded here -->
                            </div>
                            ${
                                Auth.getUser()
                                    ? `
                                <form id="commentForm" class="mb-4">
                                    <div class="mb-3 mt-5">
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

        // Add event listeners only if buttons exist and are not disabled
        const prijaviSeButton = document.getElementById('prijaviSeButton');
        if (prijaviSeButton && !prijaviSeButton.disabled) {
            prijaviSeButton.addEventListener('click', (e) => {
                e.preventDefault();
                const pohodId = e.target.getAttribute('data-pohod-id');
                this.prijavaNaPohod(pohodId);
            });
        }

        const izpisiSeButton = document.getElementById('izpisiSeButton');
        if (izpisiSeButton && !izpisiSeButton.disabled) {
            izpisiSeButton.addEventListener('click', (e) => {
                e.preventDefault();
                const pohodId = e.target.getAttribute('data-pohod-id');
                this.izpisPohoda(pohodId);
            });
        }

        // Initialize map
        this.initializeMap(pohod.Lokacija);

        // Load comments
        this.loadComments(pohod.IDPohod);

        // Load registered pohodniki if user is owner
        if (isOwner) {
            this.loadRegisteredPohodniki(pohod.IDPohod);
        }
    }

    async loadRegisteredPohodniki(pohodId) {
        try {
            const response = await fetch(`/api/pohodi/${pohodId}/registered`);
            const container = document.getElementById('registeredPohodniki');

            if (!response.ok) {
                container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-2x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Napaka pri nalaganju seznama</p>
                </div>
            `;
                return; // Add return here
            }

            const data = await response.json();
            const registeredPohodniki = data.registeredPohodniki || [];

            if (!registeredPohodniki.length) {
                container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-user-slash fa-2x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Ni prijavljenih pohodnikov</p>
                </div>
            `;
                return;
            }

            container.innerHTML = `
            <div class="list-group list-group-flush">
                ${registeredPohodniki
                    .map(
                        (pohodnik, index) => `
                    <div class="list-group-item border-0 px-0 py-2">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0">
                                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                                     style="width: 32px; height: 32px; font-size: 0.8rem;">
                                    ${index + 1}
                                </div>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h6 class="mb-0">${pohodnik.Ime} ${
                            pohodnik.Priimek
                        }</h6>
                                <small class="text-muted">@${
                                    pohodnik.UporabniskoIme
                                }</small>
                            </div>
                            <div class="flex-shrink-0">
                                <small class="text-muted">
                                    ${new Date(
                                        pohodnik.DatumPrijave
                                    ).toLocaleDateString('sl-SI')}
                                </small>
                            </div>
                        </div>
                    </div>
                `
                    )
                    .join('')}
            </div>
            <div class="mt-3 pt-3 border-top">
                <small class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    Skupaj prijavljenih: ${registeredPohodniki.length}
                </small>
            </div>
        `;
        } catch (error) {
            console.error('Error loading registered pohodniki:', error);
            const container = document.getElementById('registeredPohodniki');
            container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle fa-2x text-muted mb-3"></i>
                <p class="text-muted mb-0">Napaka pri nalaganju</p>
            </div>
        `;
        }
    }

    async izpisPohoda(pohodId) {
        const user = Auth.getUser();
        if (!user) {
            window.location.href = './prijava.html';
            return;
        }

        if (user.type !== 'pohodnik') {
            alert('Samo pohodniki se lahko izpišejo s pohoda');
            return;
        }

        if (confirm('Ali se res želite izpisati s tega pohoda?')) {
            try {
                const response = await fetch(`/api/pohodi/${pohodId}/prijava`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(
                        error.error || 'Failed to unregister from hike'
                    );
                }

                alert('Uspešno ste se izpisali s pohoda!');
                // Reload the page to update the button and available spots
                window.location.reload();
            } catch (error) {
                console.error('Error unregistering from hike:', error);
                alert(error.message || 'Napaka pri izpisu s pohoda');
            }
        }
    }

    async prijavaNaPohod(pohodId) {
        const user = Auth.getUser();
        if (!user) {
            window.location.href = './prijava.html';
            return;
        }

        if (user.type !== 'pohodnik') {
            alert('Samo pohodniki se lahko prijavijo na pohod');
            return;
        }

        try {
            // Use the stored pohod data instead of making another API call
            const pohod = this.currentPohod;
            if (!pohod) {
                alert('Napaka pri pridobivanju podatkov o pohodu');
                return;
            }

            // Check if there are still available spots before making the request
            if (pohod.ProstaMesta <= 0) {
                alert('Žal ni več prostih mest za ta pohod.');
                // Reload the page to update the UI
                window.location.reload();
                return;
            }

            // Check membership status using the correct drustvo ID
            const membershipResponse = await fetch(
                `/api/drustvo/${pohod.TK_PohodniskoDrustvo}/membership-status`
            );

            if (!membershipResponse.ok) {
                throw new Error('Failed to check membership status');
            }

            const membershipStatus = await membershipResponse.json();

            if (!membershipStatus.isMember) {
                alert(
                    'Za prijavo na pohod morate biti član organizatorskega društva. Prosimo, vložite zahtevo za včlanitev na strani društva.'
                );
                // Redirect to the drustvo profile page for membership request
                window.location.href = `./profil-drustvo.html?id=${pohod.DrustvoUserId}`;
                return;
            }

            // User is a member, proceed with registration
            const registrationResponse = await fetch(
                `/api/pohodi/${pohodId}/prijava`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!registrationResponse.ok) {
                const error = await registrationResponse.json();

                // Handle specific error cases
                if (error.error === 'Ni več prostih mest') {
                    alert('Žal ni več prostih mest za ta pohod.');
                    // Reload the page to update the UI
                    window.location.reload();
                    return;
                }

                throw new Error(error.error || 'Failed to register for hike');
            }

            alert('Uspešno ste se prijavili na pohod!');
            // Reload the page to update the available spots and button
            window.location.reload();
        } catch (error) {
            console.error('Error registering for hike:', error);
            alert(error.message || 'Napaka pri prijavi na pohod');
        }
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

    setupCommentForm(pohodId) {
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const commentForm = document.getElementById('commentForm');
            if (commentForm) {
                // Remove any existing event listeners
                const newForm = commentForm.cloneNode(true);
                commentForm.parentNode.replaceChild(newForm, commentForm);

                // Add the event listener to the new form
                newForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const formData = new FormData(e.target);
                    const content = formData.get('content');

                    if (!content || !content.trim()) {
                        alert('Prosimo, vnesite komentar');
                        return;
                    }

                    try {
                        const user = Auth.getUser();
                        if (!user) {
                            alert(
                                'Morate biti prijavljeni za oddajo komentarja'
                            );
                            return;
                        }

                        const response = await fetch(
                            `/api/pohodi/${pohodId}/comments`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    userId: user.id,
                                    content: content.trim(),
                                }),
                            }
                        );

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(
                                errorData.error || 'Failed to add comment'
                            );
                        }

                        // Clear form and reload comments
                        e.target.reset();
                        await this.loadComments(pohodId);
                    } catch (error) {
                        console.error('Error adding comment:', error);
                        alert(
                            'Napaka pri dodajanju komentarja: ' + error.message
                        );
                    }
                });
            }
        }, 100);
    }

    async loadComments(pohodId) {
        try {
            const response = await fetch(`/api/pohodi/${pohodId}/comments`);
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            const data = await response.json();
            const comments = data.comments || [];
            const commentsList = document.getElementById('commentsList');

            if (!commentsList) {
                console.error('Comments list element not found');
                return;
            }

            if (!comments.length) {
                commentsList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-comment-slash fa-2x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Še ni komentarjev</p>
                </div>
            `;
                return;
            }

            commentsList.innerHTML = comments
                .map(
                    (comment) => `
            <div class="comment border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <strong>${comment.username}</strong>
                </div>
                <p class="mb-0">${comment.content}</p>
            </div>
        `
                )
                .join('');

            // Update comment form submission to remove rating
            const commentForm = document.getElementById('commentForm');
            if (commentForm) {
                commentForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const content = e.target.content.value.trim();

                    if (!content) {
                        alert('Prosimo, vnesite komentar');
                        return;
                    }

                    try {
                        const user = Auth.getUser();
                        const response = await fetch(
                            `/api/pohodi/${pohodId}/comments`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    userId: user.id,
                                    content: content,
                                    // Remove rating from comment submission
                                }),
                            }
                        );

                        if (!response.ok) {
                            throw new Error('Failed to add comment');
                        }

                        // Reload comments
                        await this.loadComments(pohodId);

                        // Clear form
                        e.target.content.value = '';
                    } catch (error) {
                        console.error('Error adding comment:', error);
                        alert('Napaka pri dodajanju komentarja');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            const commentsList = document.getElementById('commentsList');
            if (commentsList) {
                commentsList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-2x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Napaka pri nalaganju komentarjev</p>
                </div>
            `;
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

document.addEventListener('DOMContentLoaded', () => {
    const pohodInstance = new Pohod();
    window.pohodInstance = pohodInstance;
});

// Cleanup when leaving the page
window.addEventListener('beforeunload', () => {
    if (window.pohodInstance && window.pohodInstance.destroy) {
        window.pohodInstance.destroy();
    }
});
