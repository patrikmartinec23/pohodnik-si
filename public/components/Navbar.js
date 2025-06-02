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
                { text: 'Domov', href: 'index.html#', active: true },
                { text: 'Pohodi', href: './pohodi.html', active: false },
                { text: 'Društva', href: './drustva.html', active: false },
            ],

            socialLinks: [
                {
                    platform: 'facebook',
                    url: 'https://facebook.com',
                    icon: 'fab fa-facebook-f',
                },
                {
                    platform: 'twitter',
                    url: 'https://twitter.com',
                    icon: 'fab fa-x-twitter',
                },
            ],
        };
    }

    render() {
        const { brand, links, socialLinks } = this.navData;
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
                            data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" 
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul class="navbar-nav ms-auto">
                            ${links
                                .map(
                                    (link) => `
                                <li class="nav-item">
                                    <a class="nav-link ${
                                        link.active ? 'active' : ''
                                    }" 
                                       ${
                                           link.active
                                               ? 'aria-current="page"'
                                               : ''
                                       }
                                       href="${link.href}">${link.text}</a>
                                </li>
                            `
                                )
                                .join('')}
                            
                            ${
                                user
                                    ? `
        <li class="nav-item">
            <a class="nav-link" href="./profil.html">
                <i class="fas fa-user me-1"></i>${user.username}
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link text-warning" href="#" onclick="Auth.logout()">
                <i class="fas fa-sign-out-alt me-1"></i>Odjava
            </a>
        </li>
    `
                                    : `
        <li class="nav-item">
            <a class="nav-link" href="./prijava.html">Prijavi Se</a>
        </li>
    `
                            }
                        </ul>
                        <span class="nav-item">
                            ${socialLinks
                                .map(
                                    (social) => `
                                <span class="fa-stack">
                                    <a href="${social.url}" target="_blank">
                                        <i class="fas fa-circle fa-stack-2x"></i>
                                        <i class="${social.icon} fa-stack-1x text-white"></i>
                                    </a>
                                </span>
                            `
                                )
                                .join('')}
                        </span>
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
