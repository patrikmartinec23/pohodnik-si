class EditDrustvo {
    constructor() {
        this.container = document.getElementById('main-content');
        this.user = Auth.getUser();
        this.init();
    }

    async init() {
        if (!this.user || this.user.type !== 'drustvo') {
            window.location.href = '/pages/prijava.html';
            return;
        }

        this.renderLoadingState();
        try {
            const response = await fetch(`/api/drustvo/${this.user.id}`);
            if (!response.ok) {
                throw new Error('Napaka pri pridobivanju podatkov društva');
            }

            const drustvo = await response.json();
            this.drustvo = drustvo; // Store the drustvo data for later use
            this.renderEditForm(drustvo);
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing edit form:', error);
            this.showError('Napaka pri nalaganju podatkov društva');
        }
    }

    renderLoadingState() {
        this.container.innerHTML = `
            <div class="container py-5">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Nalaganje...</span>
                    </div>
                    <p class="mt-3">Nalaganje podatkov društva...</p>
                </div>
            </div>
        `;
    }

    renderEditForm(drustvo) {
        // Update to make the image preview more reliable
        const timestamp = Date.now();
        const imageUrl = `../images/drustva/${drustvo.IDPohodniskoDrustvo}.jpg?t=${timestamp}`;

        this.container.innerHTML = `
        <div class="container py-5">
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h2 class="mb-4">Uredi profil društva</h2>
                            <hr class="hr-heading-primary w-25" />
                            
                            <form id="editDrustvoForm" class="mt-4">
                                <!-- Banner Image Upload -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Slika ozadja društva</label>
                                    <div id="bannerPreviewContainer" class="mb-3 position-relative">
                                        <img id="bannerPreview" src="${imageUrl}" 
                                            class="img-fluid rounded" style="max-height: 200px; width: 100%; object-fit: cover;" 
                                            onerror="this.parentNode.style.display='none';" />
                                        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" id="removeBannerBtn">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <div class="input-group">
                                        <input type="file" class="form-control" id="bannerImage" name="bannerImage" accept="image/*">
                                    </div>
                                    <small class="text-muted">Priporočena velikost: 1200×400px, format: JPG, PNG (max 5MB)</small>
                                </div>
                                    
                                <!-- Other form fields for editing drustvo data -->
                                <div class="mb-3">
                                    <label for="drustvoIme" class="form-label fw-bold">Ime društva</label>
                                    <input type="text" class="form-control" id="drustvoIme" name="DrustvoIme" 
                                        value="${
                                            drustvo.DrustvoIme || ''
                                        }" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="naslov" class="form-label fw-bold">Naslov</label>
                                    <input type="text" class="form-control" id="naslov" name="Naslov" 
                                        value="${
                                            drustvo.Naslov || ''
                                        }" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="predsednik" class="form-label fw-bold">Predsednik</label>
                                    <input type="text" class="form-control" id="predsednik" name="Predsednik" 
                                        value="${
                                            drustvo.Predsednik || ''
                                        }" required>
                                </div>
                                
                                <div class="mb-4">
                                    <label for="opis" class="form-label fw-bold">Opis društva</label>
                                    <textarea class="form-control" id="opis" name="Opis" rows="5" 
                                        placeholder="Opišite vaše društvo, dejavnosti, cilje...">${
                                            drustvo.Opis || ''
                                        }</textarea>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-2"></i>Shrani spremembe
                                    </button>
                                    <a href="/pages/profil-drustvo.html?id=${
                                        this.user.id
                                    }" class="btn btn-outline-secondary">
                                        <i class="fas fa-times me-2"></i>Prekliči
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    setupEventListeners() {
        const form = document.getElementById('editDrustvoForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        const bannerInput = document.getElementById('bannerImage');
        const preview = document.getElementById('bannerPreview');
        const previewContainer = document.getElementById(
            'bannerPreviewContainer'
        );

        // Preview image when selected
        bannerInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(this.files[0]);
            }
        });

        // Remove banner
        const removeBtn = document.getElementById('removeBannerBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                bannerInput.value = '';
                previewContainer.style.display = 'none';
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Create a FormData object - THIS IS THE KEY DIFFERENCE!
        const formData = new FormData(e.target);

        // Add the drustvo ID to the form data
        formData.append(
            'IDPohodniskoDrustvo',
            this.drustvo.IDPohodniskoDrustvo
        );

        try {
            const response = await fetch(
                `/api/drustvo/${this.user.id}/update`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error || 'Napaka pri posodabljanju podatkov'
                );
            }

            alert('Podatki društva so bili uspešno posodobljeni.');
            window.location.href = '/pages/profil-drustvo.html';
        } catch (error) {
            console.error('Error updating drustvo:', error);
            alert(`Napaka pri shranjevanju: ${error.message}`);
        }
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="container py-5">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>${message}
                </div>
                <div class="text-center mt-4">
                    <a href="/pages/profil-drustvo.html?id=${this.user.id}" class="btn btn-primary">
                        <i class="fas fa-arrow-left me-2"></i>Nazaj na profil
                    </a>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => new EditDrustvo());
