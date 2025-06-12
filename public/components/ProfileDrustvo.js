class ProfileDrustvo {
    constructor() {
        this.container = document.getElementById('main-content');
        this.drustvoId = new URLSearchParams(window.location.search).get('id');

        this.upcomingPage = 1;
        this.pastPage = 1;
        this.ratingsPage = 1; // Add this
        this.upcomingLoading = false;
        this.pastLoading = false;
        this.ratingsLoading = false; // Add this
        this.upcomingHasMore = true;
        this.pastHasMore = true;
        this.ratingsHasMore = true; // Add this
        this.itemsPerPage = 2;
        this.ratingsPerPage = 5; // Add this

        window.profileDrustvo = this;
        this.init();
    }

    async init() {
        const user = Auth.getUser();
        try {
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

            // Check membership status for non-owners
            let membershipStatus = null;
            if (user && user.type === 'pohodnik' && !isOwner) {
                try {
                    const statusResponse = await fetch(
                        `/api/drustvo/${drustvo.IDPohodniskoDrustvo}/membership-status`
                    );
                    if (statusResponse.ok) {
                        membershipStatus = await statusResponse.json();
                    }
                } catch (error) {
                    console.log('Could not check membership status');
                }
            }

            this.renderProfile(drustvo, isOwner, membershipStatus);

            if (isOwner) {
                this.loadMembershipRequests(drustvo.IDPohodniskoDrustvo);
            }

            // Store the drustvo ID for consistent use
            if (!this.currentDrustvoId) {
                this.currentDrustvoId = drustvo.IDPohodniskoDrustvo;
            }

            // Load both upcoming and past pohodi instead of the old method
            this.loadUpcomingPohodi(drustvo.IDPohodniskoDrustvo);
            this.loadPastPohodi(drustvo.IDPohodniskoDrustvo);
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Napaka pri nalaganju profila');
        }
    }

    renderProfile(drustvo, isOwner, membershipStatus) {
        const user = Auth.getUser();

        // Determine button content based on membership status
        let buttonContent = '';
        if (isOwner) {
            buttonContent = `
        <a href="./dodaj-pohod.html" class="btn btn-primary w-100 mb-3">
            <i class="fas fa-plus me-2"></i>Dodaj nov pohod
        </a>
    `;
        } else {
            // Only show membership buttons for pohodniki
            if (user && user.type === 'pohodnik') {
                if (membershipStatus?.isMember) {
                    buttonContent = `
                    <button onclick="profileDrustvo.leaveMembership(${drustvo.IDPohodniskoDrustvo})" 
                            class="btn btn-danger w-100">
                        <i class="fas fa-user-minus me-2"></i>Izpiši se iz društva
                    </button>
                `;
                } else if (membershipStatus?.hasPendingRequest) {
                    buttonContent = `
                    <button class="btn btn-secondary w-100" disabled>
                        <i class="fas fa-clock me-2"></i>Zahteva v obdelavi
                    </button>
                `;
                } else {
                    buttonContent = `
                    <button onclick="profileDrustvo.requestMembership(${drustvo.IDPohodniskoDrustvo})" 
                            class="btn btn-primary w-100">
                        <i class="fas fa-user-plus me-2"></i>Včlani se v društvo
                    </button>
                `;
                }
            } else if (user && user.type === 'drustvo') {
                // No button for other društva
                buttonContent = '';
            } else {
                // Not logged in - show login button
                buttonContent = `
            <a href="./prijava.html" class="btn btn-primary w-100">
                <i class="fas fa-sign-in-alt me-2"></i>Prijavi se
            </a>
        `;
            }
        }

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
                    <div class="card shadow-sm bg-light">
                        <div class="card-body">
                            <h4 class="card-title mb-4">O društvu</h4>
                            
                            <!-- Average Rating Display -->
                            <div class="text-center mb-4" id="averageRatingDisplay">
                                <!-- Average rating will be loaded here -->
                            </div>
                            
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
                            ${buttonContent}
                        </div>
                    </div>
                    
                    ${
                        isOwner
                            ? `
                        <div class="card shadow-sm mt-4 bg-light">
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
                    <!-- Upcoming Events Section -->
                    <div class="card shadow-sm bg-light mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-calendar-plus me-2 text-success"></i>Prihajajoči pohodi
                            </h5>
                            <div id="upcoming-pohodi-list">
                                <!-- Upcoming pohodi will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <!-- Past Events Section -->
                    <div class="card shadow-sm bg-light mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-history me-2 text-secondary"></i>Pretekli dogodki
                            </h5>
                            <div id="past-pohodi-list">
                                <!-- Past pohodi will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <!-- Rating Section (for members only) - MOVED HERE -->
                    ${
                        user && user.type === 'pohodnik' && !isOwner
                            ? `
                        <div class="card shadow-sm bg-light mb-4" id="ratingSection">
                            <!-- Rating form/display will be loaded here -->
                        </div>
                    `
                            : ''
                    }

                    <!-- Ratings Display - MOVED HERE -->
                    <div class="card shadow-sm bg-light mb-4">
                        <div class="card-body">
                            <h5 class="card-title mb-4">
                                <i class="fas fa-star me-2 text-warning"></i>Ocene članov
                            </h5>
                            <div id="ratings-list">
                                <!-- Ratings will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

        // Load average rating
        this.loadAverageRating(drustvo.IDPohodniskoDrustvo);

        // Load ratings
        this.loadRatings(drustvo.IDPohodniskoDrustvo);

        // Load rating form for eligible users
        if (user && user.type === 'pohodnik' && !isOwner) {
            this.loadRatingSection(drustvo.IDPohodniskoDrustvo);
        }
    }

    // Add these new methods:

    async loadAverageRating(drustvoId) {
        try {
            const response = await fetch(
                `/api/drustvo/${drustvoId}/average-rating`
            );
            const { average, total } = await response.json();

            const container = document.getElementById('averageRatingDisplay');

            if (total === 0) {
                container.innerHTML = `
                    <div class="text-muted">
                        <i class="fas fa-star-o fa-2x mb-2"></i>
                        <p class="mb-0">Še ni ocen</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="average-rating">
                    <div class="rating-display mb-2">
                        ${this.renderStars(parseFloat(average), true)}
                    </div>
                    <h4 class="mb-1">${average}/5</h4>
                    <small class="text-muted">${total} ${
                total === 1 ? 'ocena' : total < 5 ? 'oceni' : 'ocen'
            }</small>
                </div>
            `;
        } catch (error) {
            console.error('Error loading average rating:', error);
        }
    }

    async loadRatingSection(drustvoId) {
        try {
            // Check if user can rate
            const canRateResponse = await fetch(
                `/api/drustvo/${drustvoId}/can-rate`
            );
            const { canRate, reason } = await canRateResponse.json();

            // Get user's existing rating
            const userRatingResponse = await fetch(
                `/api/drustvo/${drustvoId}/my-rating`
            );
            const userRating = await userRatingResponse.json();

            const container = document.getElementById('ratingSection');

            if (!canRate) {
                container.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas fa-star me-2 text-warning"></i>Ocenite društvo
                        </h5>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            ${
                                reason === 'Must be a member to rate'
                                    ? 'Za ocenjevanje morate biti član društva.'
                                    : 'Ocenjevanje ni možno.'
                            }
                        </div>
                    </div>
                `;
                return;
            }

            const hasRating = userRating && userRating.Ocena;

            container.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-star me-2 text-warning"></i>
                        ${hasRating ? 'Vaša ocena' : 'Ocenite društvo'}
                    </h5>
                    
                    <form id="ratingForm" data-drustvo-id="${drustvoId}">
                        <div class="mb-3">
                            <label class="form-label">Ocena:</label>
                            <div class="rating-input" id="ratingStars">
                                ${[5, 4, 3, 2, 1]
                                    .map(
                                        (num) => `
                                    <input type="radio" id="star${num}" name="rating" value="${num}" 
                                           ${
                                               hasRating &&
                                               userRating.Ocena == num
                                                   ? 'checked'
                                                   : ''
                                           }>
                                    <label for="star${num}" class="star">
                                        <i class="fas fa-star"></i>
                                    </label>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="ratingComment" class="form-label">Komentar (neobvezno):</label>
                            <textarea class="form-control" id="ratingComment" name="comment" rows="3" 
                                      placeholder="Opišite svoje izkušnje z društvom...">${
                                          hasRating
                                              ? userRating.Komentar || ''
                                              : ''
                                      }</textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-warning">
                            <i class="fas fa-star me-2"></i>
                            ${hasRating ? 'Posodobi oceno' : 'Oddaj oceno'}
                        </button>
                    </form>
                </div>
            `;

            // Add event listener for form submission
            document
                .getElementById('ratingForm')
                .addEventListener('submit', this.handleRatingSubmit.bind(this));
        } catch (error) {
            console.error('Error loading rating section:', error);
        }
    }

    async handleRatingSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const rating = formData.get('rating');
        const comment = formData.get('comment');
        const drustvoId = e.target.dataset.drustvoId;

        if (!rating) {
            alert('Prosimo, izberite oceno.');
            return;
        }

        try {
            const response = await fetch(`/api/drustvo/${drustvoId}/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: parseInt(rating),
                    comment: comment.trim() || null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            alert('Ocena je bila uspešno oddana!');

            // Refresh the rating section and average rating
            await this.loadRatingSection(drustvoId);
            await this.loadAverageRating(drustvoId);
            await this.loadRatings(drustvoId);
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Napaka pri oddaji ocene: ' + error.message);
        }
    }

    async loadRatings(drustvoId, isLoadMore = false) {
        if (this.ratingsLoading) return;
        if (isLoadMore && !this.ratingsHasMore) return;

        try {
            this.ratingsLoading = true;

            const response = await fetch(
                `/api/drustvo/${drustvoId}/ratings?page=${this.ratingsPage}&limit=${this.ratingsPerPage}`
            );

            if (!response.ok) throw new Error('Failed to load ratings');

            const { ratings, total, hasMore } = await response.json();
            const container = document.getElementById('ratings-list');

            if (!ratings || !ratings.length) {
                if (!isLoadMore) {
                    container.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-star-o fa-3x text-muted mb-3"></i>
                            <p class="text-muted mb-0">Še ni ocen</p>
                        </div>
                    `;
                }
                this.ratingsHasMore = false;
                return;
            }

            const ratingsHtml = ratings
                .map(
                    (rating) => `
                <div class="rating-item border-bottom py-3">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <strong>${rating.Ime} ${rating.Priimek}</strong>
                            <small class="text-muted ms-2">@${
                                rating.UporabniskoIme
                            }</small>
                        </div>
                        <div class="text-end">
                            <div class="rating-display mb-1">
                                ${this.renderStars(rating.Ocena)}
                            </div>
                            <small class="text-muted">
                                ${new Date(
                                    rating.DatumOcene
                                ).toLocaleDateString('sl-SI')}
                            </small>
                        </div>
                    </div>
                    ${
                        rating.Komentar
                            ? `
                        <p class="mb-0 text-muted">${rating.Komentar}</p>
                    `
                            : ''
                    }
                </div>
            `
                )
                .join('');

            if (isLoadMore) {
                const existingContent =
                    container.querySelector('.ratings-content');
                if (existingContent) {
                    existingContent.insertAdjacentHTML(
                        'beforeend',
                        ratingsHtml
                    );
                }
            } else {
                container.innerHTML = `
                    <div class="ratings-content">
                        ${ratingsHtml}
                    </div>
                `;
            }

            this.ratingsHasMore = hasMore;
            this.updateLoadMoreButton(container, total, 'ratings');
        } catch (error) {
            console.error('Error loading ratings:', error);
            if (!isLoadMore) {
                const container = document.getElementById('ratings-list');
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Napaka pri nalaganju ocen</p>
                    </div>
                `;
            }
        } finally {
            this.ratingsLoading = false;
        }
    }

    renderStars(rating, large = false) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        const starSize = large ? 'fa-lg' : '';

        let starsHtml = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += `<i class="fas fa-star text-warning ${starSize}"></i>`;
        }

        // Half star
        if (hasHalfStar) {
            starsHtml += `<i class="fas fa-star-half-alt text-warning ${starSize}"></i>`;
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += `<i class="far fa-star text-warning ${starSize}"></i>`;
        }

        return starsHtml;
    }

    // Update the updateLoadMoreButton method to handle ratings:
    updateLoadMoreButton(container, total, type) {
        const existingBtn = container.querySelector('.load-more-container');
        if (existingBtn) {
            existingBtn.remove();
        }

        let hasMore;
        switch (type) {
            case 'upcoming':
                hasMore = this.upcomingHasMore;
                break;
            case 'past':
                hasMore = this.pastHasMore;
                break;
            case 'ratings':
                hasMore = this.ratingsHasMore;
                break;
            default:
                hasMore = false;
        }

        if (hasMore) {
            const loadMoreHtml = `
                <div class="text-center mt-4 load-more-container">
                    <button class="btn btn-outline-primary load-more" data-type="${type}">
                        <i class="fas fa-plus-circle me-2"></i>Prikaži več
                    </button>
                </div>`;

            container.insertAdjacentHTML('beforeend', loadMoreHtml);

            const loadMoreBtn = container.querySelector('.load-more');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    if (type === 'upcoming') {
                        this.upcomingPage++;
                        this.loadUpcomingPohodi(this.currentDrustvoId, true);
                    } else if (type === 'past') {
                        this.pastPage++;
                        this.loadPastPohodi(this.currentDrustvoId, true);
                    } else if (type === 'ratings') {
                        this.ratingsPage++;
                        this.loadRatings(this.currentDrustvoId, true);
                    }
                });
            }
        }
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
                        <button onclick="profileDrustvo.handleMembershipRequest(${
                            req.IDZahteva
                        }, 'accept')"
                                class="btn btn-sm btn-success">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="profileDrustvo.handleMembershipRequest(${
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

            // Get the current drustvo ID from the URL or stored value
            const currentDrustvoId =
                this.drustvoId ||
                new URLSearchParams(window.location.search).get('id');

            // Reload requests using the correct drustvo ID
            const user = Auth.getUser();
            const drustvo = await fetch(
                `/api/drustvo/${currentDrustvoId || user?.id}`
            ).then((r) => r.json());
            await this.loadMembershipRequests(drustvo.IDPohodniskoDrustvo);
        } catch (error) {
            console.error('Error handling membership request:', error);
        }
    }

    async leaveMembership(drustvoId) {
        const user = Auth.getUser();
        if (!user) {
            window.location.href = '/pages/prijava.html';
            return;
        }

        if (confirm('Ali se res želite izpisati iz društva?')) {
            try {
                const response = await fetch(
                    `/api/drustvo/${drustvoId}/leave-membership`,
                    {
                        method: 'POST',
                    }
                );

                if (!response.ok) throw new Error('Failed to leave membership');

                alert('Uspešno ste se izpisali iz društva');
                // Reload the page to update the button
                window.location.reload();
            } catch (error) {
                console.error('Error leaving membership:', error);
                alert('Napaka pri izpisu iz društva');
            }
        }
    }

    async requestMembership(drustvoId) {
        const user = Auth.getUser();
        if (!user) {
            window.location.href = '/pages/prijava.html';
            return;
        }

        if (user.type !== 'pohodnik') {
            alert('Samo pohodniki se lahko včlanijo v društvo');
            return;
        }

        try {
            // Check if already requested
            const checkResponse = await fetch(
                `/api/drustvo/${drustvoId}/membership-status`
            );
            const { isMember, hasPendingRequest } = await checkResponse.json();

            if (isMember) {
                alert('Že ste član tega društva');
                return;
            }

            if (hasPendingRequest) {
                alert('Vaša zahteva za včlanitev je že v obdelavi');
                return;
            }

            // Submit request
            const response = await fetch(
                `/api/drustvo/${drustvoId}/request-membership`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to submit request');

            alert('Zahteva za včlanitev je bila uspešno poslana');

            // Refresh the profile data instead of reloading the page
            await this.init();
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

    createPohodCard(pohod, isOwner) {
        const date = new Date(pohod.DatumPohoda).toLocaleDateString('sl-SI');
        const truncatedLocation =
            pohod.Lokacija?.length > 15
                ? pohod.Lokacija.substring(0, 12) + '...'
                : pohod.Lokacija || 'N/A';
        const truncatedZbirnoMesto =
            pohod.ZbirnoMesto?.length > 20
                ? pohod.ZbirnoMesto.substring(0, 17) + '...'
                : pohod.ZbirnoMesto || 'N/A';
        const duration = pohod.Trajanje ? pohod.Trajanje.split(':')[0] : '?';

        return `
    <div class="col-md-6 mb-4">
        <div class="card pohod-card hover-shadow h-100">
            <a href="pohod.html?id=${
                pohod.IDPohod
            }" class="text-decoration-none">
                <img src="../images/project-1.jpg" 
                     alt="${pohod.PohodIme}" 
                     class="card-img-top" 
                     style="height: 200px; object-fit: cover;"
                     onerror="this.src='../images/default-pohod.jpg'" />
            </a>
            <div class="card-body d-flex flex-column">
                <a href="pohod.html?id=${
                    pohod.IDPohod
                }" class="text-decoration-none text-dark flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">
                            <strong>${pohod.PohodIme}</strong>
                        </h5>
                        <span class="badge bg-primary" title="${
                            pohod.Lokacija
                        }">
                            <i class="fas fa-mountain me-1"></i>${truncatedLocation}
                        </span>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        <span class="badge bg-success me-1">
                            <i class="fas fa-hiking me-1"></i>${
                                pohod.Tezavnost
                            }/5
                        </span>
                        <span class="badge bg-info me-1">
                            <i class="fas fa-clock me-1"></i>${duration}h
                        </span>
                        <span class="badge bg-warning text-dark" title="${
                            pohod.ZbirnoMesto
                        }">
                            <i class="fas fa-map-marker-alt me-1"></i>${truncatedZbirnoMesto}
                        </span>
                    </div>    
                    <strong class="mb-2 d-block">
                        <i class="fas fa-calendar me-1"></i>${date}
                    </strong>
                    <div class="mt-auto">
                        <small class="text-muted">
                            <i class="fas fa-users me-1"></i>Prosta mesta: ${
                                pohod.ProstaMesta
                            }
                        </small>
                    </div>
                </a>
                ${
                    isOwner
                        ? `
                    <div class="d-flex gap-2 mb-3">
                        <a href="./dodaj-pohod.html?edit=${pohod.IDPohod}" 
                           class="btn btn-outline-primary btn-sm flex-fill">
                            <i class="fas fa-edit me-1"></i>
                        </a>
                        <button onclick="profileDrustvo.deletePohod(${pohod.IDPohod})" 
                                class="btn btn-outline-danger btn-sm flex-fill">
                            <i class="fas fa-trash me-1"></i>
                        </button>
                    </div>
                `
                        : ''
                }
            </div>
        </div>
    </div>
    `;
    }

    async loadPastPohodi(drustvoId, isLoadMore = false) {
        if (this.pastLoading) return;
        if (isLoadMore && !this.pastHasMore) return;

        try {
            this.pastLoading = true;

            const response = await fetch(
                `/api/drustvo/${drustvoId}/pohodi/past?page=${this.pastPage}&limit=${this.itemsPerPage}`
            );

            if (!response.ok) throw new Error('Failed to load past pohodi');

            const { pohodi, total } = await response.json();
            const container = document.getElementById('past-pohodi-list');

            if (!pohodi || !pohodi.length) {
                if (!isLoadMore) {
                    container.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-history fa-3x text-muted mb-3"></i>
                            <p class="text-muted mb-0">Še ni izvedenih pohodov</p>
                        </div>
                    `;
                }
                this.pastHasMore = false;
                return;
            }

            const pohodiCards = pohodi
                .map((pohod) => this.createPastPohodCard(pohod))
                .join('');

            if (isLoadMore) {
                const cardsContainer = container.querySelector('.row');
                if (cardsContainer) {
                    cardsContainer.insertAdjacentHTML('beforeend', pohodiCards);
                }
            } else {
                container.innerHTML = `
                    <div class="row g-4">
                        ${pohodiCards}
                    </div>
                `;
            }

            const loadedCount = this.pastPage * this.itemsPerPage;
            this.pastHasMore = loadedCount < total;

            this.updateLoadMoreButton(container, total, 'past');
        } catch (error) {
            console.error('Error loading past pohodi:', error);
            if (!isLoadMore) {
                const container = document.getElementById('past-pohodi-list');
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Napaka pri nalaganju preteklih pohodov</p>
                    </div>
                `;
            }
        } finally {
            this.pastLoading = false;
        }
    }

    async loadUpcomingPohodi(drustvoId, isLoadMore = false) {
        if (this.upcomingLoading) return;
        if (isLoadMore && !this.upcomingHasMore) return;

        if (!this.currentDrustvoId) {
            this.currentDrustvoId = drustvoId;
        }

        try {
            this.upcomingLoading = true;

            const response = await fetch(
                `/api/drustvo/${drustvoId}/pohodi/upcoming?page=${this.upcomingPage}&limit=${this.itemsPerPage}`
            );

            if (!response.ok) throw new Error('Failed to load upcoming pohodi');

            const { pohodi, total } = await response.json();
            const container = document.getElementById('upcoming-pohodi-list');

            if (!pohodi || !pohodi.length) {
                if (!isLoadMore) {
                    container.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
                            <p class="text-muted mb-0">Trenutno ni načrtovanih pohodov</p>
                        </div>
                    `;
                }
                this.upcomingHasMore = false;
                return;
            }

            const user = Auth.getUser();
            const profileId = this.drustvoId || user?.id;
            const isOwner = user?.id === profileId && user?.type === 'drustvo';

            const pohodiCards = pohodi
                .map((pohod) => this.createPohodCard(pohod, isOwner))
                .join('');

            if (isLoadMore) {
                const cardsContainer = container.querySelector('.row');
                if (cardsContainer) {
                    cardsContainer.insertAdjacentHTML('beforeend', pohodiCards);
                }
            } else {
                container.innerHTML = `
                    <div class="row g-4">
                        ${pohodiCards}
                    </div>
                `;
            }

            const loadedCount = this.upcomingPage * this.itemsPerPage;
            this.upcomingHasMore = loadedCount < total;

            this.updateLoadMoreButton(container, total, 'upcoming');
        } catch (error) {
            console.error('Error loading upcoming pohodi:', error);
            if (!isLoadMore) {
                const container = document.getElementById(
                    'upcoming-pohodi-list'
                );
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                        <p class="text-muted mb-0">Napaka pri nalaganju pohodov</p>
                    </div>
                `;
            }
        } finally {
            this.upcomingLoading = false;
        }
    }

    createPastPohodCard(pohod) {
        const date = new Date(pohod.DatumPohoda).toLocaleDateString('sl-SI');
        const truncatedLocation =
            pohod.Lokacija?.length > 15
                ? pohod.Lokacija.substring(0, 12) + '...'
                : pohod.Lokacija || 'N/A';
        const duration = pohod.Trajanje ? pohod.Trajanje.split(':')[0] : '?';

        return `
        <div class="col-md-6 mb-4">
            <div class="card pohod-card hover-shadow">
                <a href="pohod.html?id=${pohod.IDPohod}" class="text-decoration-none">
                    <img src="../images/project-1.jpg" 
                         alt="${pohod.PohodIme}" 
                         class="card-img-top" 
                         onerror="this.src='../images/default-pohod.jpg'" />
                    <div class="card-body text-dark">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">
                                <strong>${pohod.PohodIme}</strong>
                            </h5>
                            <span class="badge bg-secondary" title="${pohod.Lokacija}">
                                <i class="fas fa-mountain me-1"></i>${truncatedLocation}
                            </span>
                        </div>
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            <span class="badge bg-success me-1">
                                <i class="fas fa-hiking me-1"></i>${pohod.Tezavnost}/5
                            </span>
                            <span class="badge bg-info me-1">
                                <i class="fas fa-clock me-1"></i>${duration}h
                            </span>
                            <span class="badge bg-secondary text-white">
                                <i class="fas fa-check me-1"></i>Izveden
                            </span>
                        </div>    
                        <strong class="mb-2">
                            <i class="fas fa-calendar me-1"></i>${date}
                        </strong>
                    </div>
                </a>
            </div>
        </div>
        `;
    }

    updateLoadMoreButton(container, total, type) {
        const existingBtn = container.querySelector('.load-more-container');
        if (existingBtn) {
            existingBtn.remove();
        }

        let hasMore;
        switch (type) {
            case 'upcoming':
                hasMore = this.upcomingHasMore;
                break;
            case 'past':
                hasMore = this.pastHasMore;
                break;
            case 'ratings':
                hasMore = this.ratingsHasMore;
                break;
            default:
                hasMore = false;
        }

        if (hasMore) {
            const loadMoreHtml = `
                <div class="text-center mt-4 load-more-container">
                    <button class="btn btn-outline-primary load-more" data-type="${type}">
                        <i class="fas fa-plus-circle me-2"></i>Prikaži več
                    </button>
                </div>`;

            container.insertAdjacentHTML('beforeend', loadMoreHtml);

            const loadMoreBtn = container.querySelector('.load-more');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    if (type === 'upcoming') {
                        this.upcomingPage++;
                        this.loadUpcomingPohodi(this.currentDrustvoId, true);
                    } else if (type === 'past') {
                        this.pastPage++;
                        this.loadPastPohodi(this.currentDrustvoId, true);
                    } else if (type === 'ratings') {
                        this.ratingsPage++;
                        this.loadRatings(this.currentDrustvoId, true);
                    }
                });
            }
        }
    }

    async deletePohod(pohodId) {
        if (
            !confirm(
                'Ali ste prepričani, da želite izbrisati ta pohod? To dejanje ni mogoče razveljaviti.'
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/pohodi/${pohodId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete pohod');

            alert('Pohod je bil uspešno izbrisan');

            // Reset pagination and reload both sections
            this.upcomingPage = 1;
            this.pastPage = 1;
            this.upcomingHasMore = true;
            this.pastHasMore = true;

            const drustvoId = this.currentDrustvoId;
            await this.loadUpcomingPohodi(drustvoId);
            await this.loadPastPohodi(drustvoId);
        } catch (error) {
            console.error('Error deleting pohod:', error);
            alert('Napaka pri brisanju pohoda');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new ProfileDrustvo());
