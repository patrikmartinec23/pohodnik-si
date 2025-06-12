class DodajPohod {
    constructor() {
        this.container = document.getElementById('main-content');
        this.isEdit = false;
        this.pohodId = null;
        this.init();
    }

    async init() {
        const user = Auth.getUser();

        // Check if user is logged in and is društvo
        if (!user || user.type !== 'drustvo') {
            window.location.href = '/pages/prijava.html';
            return;
        }

        // Check if this is edit mode
        const urlParams = new URLSearchParams(window.location.search);
        this.pohodId = urlParams.get('edit');
        this.isEdit = !!this.pohodId;

        this.renderForm();

        if (this.isEdit) {
            await this.loadPohodData();
        }

        this.attachEventListeners();
    }

    async loadPohodData() {
        try {
            const response = await fetch(`/api/pohodi/${this.pohodId}`);
            if (!response.ok) throw new Error('Failed to load pohod');

            const pohod = await response.json();

            // Check if user owns this pohod
            const user = Auth.getUser();
            if (user.id !== pohod.DrustvoUserId) {
                alert('Nimate dovoljenja za urejanje tega pohoda');
                window.location.href = './profil-drustvo.html';
                return;
            }

            this.populateForm(pohod);
        } catch (error) {
            console.error('Error loading pohod:', error);
            alert('Napaka pri nalaganju podatkov pohoda');
            window.location.href = './profil-drustvo.html';
        }
    }

    populateForm(pohod) {
        // Format datetime for input
        const formattedDate = new Date(pohod.DatumPohoda)
            .toISOString()
            .slice(0, 16);

        document.getElementById('pohodIme').value = pohod.PohodIme || '';
        document.getElementById('lokacija').value = pohod.Lokacija || '';
        document.getElementById('datumPohoda').value = formattedDate || '';
        document.getElementById('zbirnoMesto').value = pohod.ZbirnoMesto || '';
        document.getElementById('pohodOpis').value = pohod.PohodOpis || '';
        document.getElementById('tezavnost').value = pohod.Tezavnost || '';
        document.getElementById('trajanje').value = pohod.Trajanje || '';
        document.getElementById('prostaMesta').value = pohod.ProstaMesta || '';
        document.getElementById('obveznaOprema').value =
            pohod.ObveznaOprema || '';
        document.getElementById('pricakovaneRazmere').value =
            pohod.PricakovaneRazmere || '';
        document.getElementById('prevoz').value = pohod.Prevoz || '';
        document.getElementById('stroskiPrevoza').value =
            pohod.StroskiPrevoza || 0;
        document.getElementById('vodic').value = pohod.Vodic || '';
        document.getElementById('vodicKontakt').value =
            pohod.VodicKontakt || '';
    }

    renderForm() {
        // Update the form title and button text based on edit mode
        const title = this.isEdit ? 'Uredi pohod' : 'Dodaj nov pohod';
        const buttonText = this.isEdit ? 'Posodobi pohod' : 'Shrani pohod';
        const buttonIcon = this.isEdit ? 'fas fa-save' : 'fas fa-save';

        this.container.innerHTML = `
            <div class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="card shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <h2 class="mb-0">
                                    <i class="fas fa-${
                                        this.isEdit ? 'edit' : 'plus'
                                    } me-2"></i>${title}
                                </h2>
                            </div>
                            <div class="card-body">
                                <form id="dodajPohodForm">
                                    <!-- Same form content as before -->
                                    <div class="row">
                                        <!-- Basic Info -->
                                        <div class="col-md-12 mb-4">
                                            <h5 class="text-primary mb-3">Osnovne informacije</h5>
                                        </div>

                                        <div class="col-md-12 mb-3">
    <label for="pohodSlika" class="form-label">Slika pohoda</label>
    <div class="input-group">
        <input type="file" class="form-control" id="pohodSlika" name="pohodSlika" accept="image/*">
        <button class="btn btn-outline-secondary" type="button" id="clearImageBtn">Odstrani</button>
    </div>
    <small class="text-muted">Priporočena velikost: 800×600px, format: JPG, PNG (max 2MB)</small>
    <div class="mt-2" id="imagePreviewContainer" style="display:none;">
        <img id="imagePreview" class="img-fluid img-thumbnail" style="max-height: 200px;" />
    </div>
</div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="pohodIme" class="form-label">Ime pohoda *</label>
                                            <input type="text" class="form-control" id="pohodIme" name="PohodIme" required>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="lokacija" class="form-label">Lokacija *</label>
                                            <input type="text" class="form-control" id="lokacija" name="Lokacija" required>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="datumPohoda" class="form-label">Datum pohoda *</label>
                                            <input type="datetime-local" class="form-control" id="datumPohoda" name="DatumPohoda" required>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="zbirnoMesto" class="form-label">Zbirno mesto *</label>
                                            <input type="text" class="form-control" id="zbirnoMesto" name="ZbirnoMesto" required>
                                        </div>
                                        
                                        <div class="col-md-12 mb-3">
                                            <label for="pohodOpis" class="form-label">Opis pohoda *</label>
                                            <textarea class="form-control" id="pohodOpis" name="PohodOpis" rows="4" required></textarea>
                                        </div>

                                        <!-- Difficulty & Duration -->
                                        <div class="col-md-12 mb-4">
                                            <h5 class="text-primary mb-3">Zahtevnost in trajanje</h5>
                                        </div>
                                        
                                        <div class="col-md-4 mb-3">
                                            <label for="tezavnost" class="form-label">Težavnost (1-5) *</label>
                                            <select class="form-select" id="tezavnost" name="Tezavnost" required>
                                                <option value="">Izberi...</option>
                                                <option value="1">1 - Zelo lahka</option>
                                                <option value="2">2 - Lahka</option>
                                                <option value="3">3 - Srednja</option>
                                                <option value="4">4 - Zahtevna</option>
                                                <option value="5">5 - Zelo zahtevna</option>
                                            </select>
                                        </div>
                                        
                                        <div class="col-md-4 mb-3">
                                            <label for="trajanje" class="form-label">Trajanje (ure) *</label>
                                            <input type="text" class="form-control" id="trajanje" name="Trajanje" placeholder="npr. 04:30" required>
                                        </div>
                                        
                                        <div class="col-md-4 mb-3">
                                            <label for="prostaMesta" class="form-label">Prosta mesta *</label>
                                            <input type="number" class="form-control" id="prostaMesta" name="ProstaMesta" min="1" required>
                                        </div>

                                        <!-- Equipment & Conditions -->
                                        <div class="col-md-12 mb-4">
                                            <h5 class="text-primary mb-3">Oprema in razmere</h5>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="obveznaOprema" class="form-label">Obvezna oprema *</label>
                                            <textarea class="form-control" id="obveznaOprema" name="ObveznaOprema" rows="3" 
                                                placeholder="Navedite potrebno opremo, ločeno z vejicami" required></textarea>
                                            <small class="text-muted">Primer: Planinski čevlji, nahrbtnik, voda, hrana</small>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="pricakovaneRazmere" class="form-label">Pričakovane razmere *</label>
                                            <textarea class="form-control" id="pricakovaneRazmere" name="PricakovaneRazmere" rows="3" required></textarea>
                                        </div>

                                        <!-- Transport & Cost -->
                                        <div class="col-md-12 mb-4">
                                            <h5 class="text-primary mb-3">Prevoz</h5>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="prevoz" class="form-label">Prevoz *</label>
                                            <select class="form-select" id="prevoz" name="Prevoz" required>
                                                <option value="">Izberi...</option>
                                                <option value="Lastni prevoz">Lastni prevoz</option>
                                                <option value="Organiziran avtobus">Organiziran avtobus</option>
                                                <option value="Kombiniran">Kombiniran</option>
                                            </select>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="stroskiPrevoza" class="form-label">Stroški prevoza (€)</label>
                                            <input type="number" step="0.01" class="form-control" id="stroskiPrevoza" name="StroskiPrevoza" value="0">
                                        </div>

                                        <!-- Guide Info -->
                                        <div class="col-md-12 mb-4">
                                            <h5 class="text-primary mb-3">Vodnik pohoda</h5>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="vodic" class="form-label">Ime vodnika *</label>
                                            <input type="text" class="form-control" id="vodic" name="Vodic" required>
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="vodicKontakt" class="form-label">Kontakt vodnika *</label>
                                            <input type="text" class="form-control" id="vodicKontakt" name="VodicKontakt" 
                                                placeholder="Telefon ali email" required>
                                        </div>
                                    </div>

                                    <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                        <a href="${
                                            this.isEdit
                                                ? `./pohod.html?id=${this.pohodId}`
                                                : './profil-drustvo.html'
                                        }" class="btn btn-outline-secondary me-md-2">
                                            <i class="fas fa-times me-2"></i>Prekliči
                                        </a>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="${buttonIcon} me-2"></i>${buttonText}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const form = document.getElementById('dodajPohodForm');
        form.addEventListener('submit', this.handleSubmit.bind(this));

        // Add image preview functionality
        const imageInput = document.getElementById('pohodSlika');
        const imagePreview = document.getElementById('imagePreview');
        const imagePreviewContainer = document.getElementById(
            'imagePreviewContainer'
        );
        const clearImageBtn = document.getElementById('clearImageBtn');

        imageInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = 'block';
                };

                reader.readAsDataURL(this.files[0]);
            }
        });

        clearImageBtn.addEventListener('click', function () {
            imageInput.value = '';
            imagePreviewContainer.style.display = 'none';
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const user = Auth.getUser();

        try {
            const drustvoResponse = await fetch(`/api/drustvo/${user.id}`);
            const drustvo = await drustvoResponse.json();

            if (!drustvo) {
                throw new Error('Društvo not found');
            }

            formData.append(
                'TK_PohodniskoDrustvo',
                drustvo.IDPohodniskoDrustvo
            );

            // API endpoint depends on whether we're editing or creating
            const url = this.isEdit
                ? `/api/pohodi/${this.pohodId}`
                : '/api/pohodi';

            const method = this.isEdit ? 'PUT' : 'POST';

            // For PUT requests, we need special handling for FormData with files
            const options = {
                method: method,
                body: formData,
                // No Content-Type header - browser will set it with boundary for FormData
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Something went wrong');
            }

            const result = await response.json();

            // Redirect to the new/edited pohod
            const pohodId = this.isEdit ? this.pohodId : result.id;
            window.location.href = `./pohod.html?id=${pohodId}`;
        } catch (error) {
            console.error('Error saving pohod:', error);
            alert(`Napaka pri shranjevanju pohoda: ${error.message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new DodajPohod());
