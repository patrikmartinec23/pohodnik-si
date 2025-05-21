class FooterComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.footerData = {
            about: {
                title: 'O pohodnik.si',
                content:
                    'Pohodnik.si je spletna platforma, namenjena povezovanju pohodnikov in društev iz vse Slovenije.',
            },
            links: {
                title: 'Povezave',
                sections: [
                    {
                        label: 'Pomembno:',
                        items: [
                            { text: 'Splošni Pogoji', href: '#' },
                            { text: 'Politika Zasebnosti', href: '#' },
                        ],
                    },
                    {
                        label: 'Uporabno:',
                        items: [
                            { text: 'Vremenska Napoved', href: '#' },
                            { text: 'Google Maps', href: '#' },
                        ],
                    },
                    {
                        label: 'Meni:',
                        items: [
                            { text: 'Domov', href: '#' },
                            { text: 'Pohodi', href: './pohodi.html' },
                            { text: 'Društva', href: './drustva.html' },
                            { text: 'Prijava', href: './prijava.html' },
                        ],
                    },
                ],
            },
            social: {
                icons: [
                    {
                        platform: 'facebook',
                        href: '#',
                        icon: 'fab fa-facebook',
                    },
                    {
                        platform: 'linkedin',
                        href: '#',
                        icon: 'fab fa-linkedin',
                    },
                    {
                        platform: 'instagram',
                        href: '#',
                        icon: 'fab fa-instagram',
                    },
                    {
                        platform: 'pinterest',
                        href: '#',
                        icon: 'fab fa-pinterest',
                    },
                ],
                contact: {
                    text: 'Radi bi slišali vaše mnenje, pišite nam na:',
                    email: 'pohodnik@site.si',
                },
            },
        };
    }

    render() {
        const { about, links, social } = this.footerData;

        this.container.innerHTML = `
            <footer class="footer bg-secondary py-6 text-white">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 my-3">
                            <h6>${about.title}</h6>
                            <p>${about.content}</p>
                        </div>
                        <div class="col-md-4 my-3">
                            <h6>${links.title}</h6>
                            <ul class="list-unstyled">
                                ${links.sections
                                    .map(
                                        (section) => `
                                    <li>
                                        ${section.label}
                                        ${section.items
                                            .map(
                                                (item, index) => `
                                            <a href="${
                                                item.href
                                            }" class="text-white">
                                                ${item.text}
                                            </a>${
                                                index < section.items.length - 1
                                                    ? ','
                                                    : ''
                                            }
                                        `
                                            )
                                            .join('')}
                                    </li>
                                `
                                    )
                                    .join('')}
                            </ul>
                        </div>
                        <div class="col-md-4 my-3">
                            <div class="mb-4">
                                ${social.icons
                                    .map(
                                        (icon) => `
                                    <a href="${icon.href}" class="text-decoration-none">
                                        <i class="${icon.icon} fa-3x text-light mx-2"></i>
                                    </a>
                                `
                                    )
                                    .join('')}
                            </div>
                            <p>
                                ${social.contact.text}
                                <a href="mailto:${
                                    social.contact.email
                                }" class="text-white">
                                    <strong>${social.contact.email}</strong>
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Initialize the footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const footer = new FooterComponent('footer');
    footer.render();
});
