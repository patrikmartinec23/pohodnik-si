class NavbarComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.navData = {
            brand: {
                href: '/',
                logo: '../images/logo.png',
                logoWidth: 100,
                text: 'pohodnik.si',
            },
            links: [
                {
                    text: 'Domov',
                    href: 'index.html',
                    active: true,
                    icon: 'fas fa-home',
                },
                {
                    text: 'Pohodi',
                    href: './pohodi.html',
                    active: false,
                    icon: 'fas fa-hiking',
                },
                {
                    text: 'Društva',
                    href: './drustva.html',
                    active: false,
                    icon: 'fas fa-users',
                },
            ],
        };

        this.setActiveLink();
    }

    setActiveLink() {
        const currentPath = window.location.pathname;
        this.navData.links = this.navData.links.map((link) => {
            // Remove the './' from href if it exists
            const cleanHref = link.href.replace('./', '');
            // Remove 'index.html#' special case
            const comparePath = currentPath.endsWith('/')
                ? 'index.html'
                : currentPath.split('/').pop();

            link.active =
                cleanHref === comparePath ||
                (comparePath === '' && cleanHref === 'index.html#');
            return link;
        });

        if (
            currentPath.includes('profil-drustvo.html') ||
            currentPath.includes('pages/profil.html')
        ) {
            this.navData.links = this.navData.links.map((link) => {
                link.active = false;
                return link;
            });
        }
    }

    render() {
        const { brand, links } = this.navData;
        const user = Auth.getUser();

        this.container.innerHTML = `
            <nav class="navbar navbar-expand-lg sticky-top navbar-dark bg-primary">
                <div class="container">
                    <a class="navbar-brand" href="${brand.href}">
                        <img src="${brand.logo}" alt="Logo" width="${
            brand.logoWidth
        }" />
                        ${brand.text}
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
                            data-bs-target="#navbarNavDropdown">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul class="navbar-nav ms-auto">
                            ${links
                                .map(
                                    (link) => `
                                <li class="nav-item text-center">
                                    <a class="nav-link d-flex flex-column align-items-center ${
                                        link.active ? 'active' : ''
                                    }" 
                                       ${
                                           link.active
                                               ? 'aria-current="page"'
                                               : ''
                                       }
                                       href="${link.href}">
                                        <i class="${link.icon} mb-1"></i>
                                        <small>${link.text}</small>
                                    </a>
                                </li>
                            `
                                )
                                .join('')}
                            
                            ${
                                user
                                    ? `
                                <li class="nav-item text-center">
                                    <a class="nav-link d-flex flex-column align-items-center" 
                                       href="./${
                                           user.type === 'drustvo'
                                               ? 'profil-drustvo.html'
                                               : 'profil.html'
                                       }">
                                        <i class="fas fa-user mb-1"></i>
                                        <small>${user.username}</small>
                                    </a>
                                </li>
                                <li class="nav-item text-center">
                                    <a class="nav-link d-flex flex-column align-items-center text-warning" 
                                       href="#" onclick="Auth.logout()">
                                        <i class="fas fa-sign-out-alt mb-1"></i>
                                        <small>Odjava</small>
                                    </a>
                                </li>
                            `
                                    : `
                                <li class="nav-item text-center">
                                    <a class="nav-link d-flex flex-column align-items-center" 
                                       href="./prijava.html">
                                        <i class="fas fa-sign-in-alt mb-1"></i>
                                        <small>Prijavi Se</small>
                                    </a>
                                </li>
                            `
                            }
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }
}

// Initialize the navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navbar = new NavbarComponent('navbar');
    navbar.render();
});
