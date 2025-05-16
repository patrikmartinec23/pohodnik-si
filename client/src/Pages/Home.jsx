import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../Home.css';

function Home() {
    useEffect(() => {
        AOS.init();
        return () => {
            AOS.refresh();
        };
    }, []);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-success fixed-top shadow">
                <div className="container">
                    <a className="navbar-brand" href="#">
                        <img src="/logo.png" alt="Pohodnik.si Logo" />
                        Pohodnik.si
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link active" href="/">
                                    Domov
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/pohodi">
                                    Pohodi
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/drustva">
                                    Društva
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/prijava">
                                    Prijavi se
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <section className="hero" data-aos="fade-up" data-aos-delay="200">
                <div className="container">
                    <h1>Dobrodošli na Pohodnik.si</h1>
                    <p className="lead">
                        Prijavi se na pohode, pridruži društvu in oceni svoje
                        izkušnje v naravi!
                    </p>
                </div>
            </section>

            <div className="container">
                <h2 className="section-title">Kaj ponujamo</h2>
                <div className="row text-center">
                    <div
                        className="col-md-4 mb-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <div className="card p-4">
                            <h4>Prijava na pohod</h4>
                            <p>
                                Izberi svoj najljubši pohod in se prijavi
                                enostavno.
                            </p>
                            <a
                                className="btn btn-outline-success"
                                href="/pohodi"
                            >
                                Prijavi se
                            </a>
                        </div>
                    </div>
                    <div
                        className="col-md-4 mb-4"
                        data-aos="fade-up"
                        data-aos-delay="300"
                    >
                        <div className="card p-4">
                            <h4>Včlanitev v društvo</h4>
                            <p>
                                Postani del pohodniške skupnosti in uživaj v
                                ugodnostih članstva.
                            </p>
                            <a
                                className="btn btn-outline-success"
                                href="/drustva"
                            >
                                Včlani se
                            </a>
                        </div>
                    </div>
                    <div
                        className="col-md-4 mb-4"
                        data-aos="fade-up"
                        data-aos-delay="500"
                    >
                        <div className="card p-4">
                            <h4>Ustvari račun</h4>
                            <p>
                                Prijavite se kot društvo ali pohodnik in
                                raziščite svoje možnosti.
                            </p>
                            <a
                                className="btn btn-outline-success"
                                href="/prijava"
                            >
                                Prijavi se
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="container mt-5"
                data-aos="fade-up"
                data-aos-delay="400"
            >
                <div className="row text-center">
                    <div className="col-md-4">
                        <img
                            src="/index-1.jpg"
                            className="img-fluid"
                            alt="index-1"
                            data-aos="fade-up"
                            data-aos-delay="400"
                        />
                    </div>

                    <div
                        className="col-md-8"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        <h2>
                            Pohodnik.si je zvest spremljevalec ljubiteljev
                            narave že več let.
                        </h2>
                        <p>
                            Naša spletna stran združuje pohodniške navdušence iz
                            vse Slovenije, ki se vsakodnevno prijavljajo na
                            organizirane pohode, ocenjujejo poti in se
                            povezujejo z drugimi pohodniki. Z večletno
                            prisotnostjo smo si pridobili zaupanje številnih
                            društev in posameznikov, ki nam z veseljem zaupajo
                            organizacijo, informacije in ocene pohodniških
                            doživetij. Z uporabo platforme Pohodnik.si so se
                            povezali že stotine članov, mnogi med njimi pa nas
                            spremljajo od samega začetka. Z vami rastemo,
                            stopamo in raziskujemo nove poti – skupaj.
                        </p>
                    </div>
                </div>
            </div>

            <footer>
                <div className="container">
                    &copy; 2025 Pohodnik.si – Vsi pohodi, en klik stran.
                </div>
            </footer>
        </>
    );
}

export default Home;
