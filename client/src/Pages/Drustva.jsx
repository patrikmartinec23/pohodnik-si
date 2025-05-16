import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../Drustva.css';

function Drustva() {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
        return () => AOS.refresh();
    }, []);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-success fixed-top shadow">
                <div className="container">
                    <a className="navbar-brand" href="/">
                        <img
                            src="/logo.png"
                            alt="Pohodnik.si Logo"
                            style={{ height: '40px' }}
                        />
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
                                <a className="nav-link" href="/">
                                    Domov
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/pohodi">
                                    Pohodi
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/drustva">
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

            <div
                className="container"
                style={{ paddingTop: '70px', backgroundColor: '#f4f8f4' }}
            >
                <h2 className="section-title text-center fw-semibold mt-4 mb-3">
                    Pohodniška društva
                </h2>

                <div className="row mb-4" data-aos="fade-down">
                    <div className="col-md-6 mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Išči društva po imenu..."
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <select className="form-select">
                            <option value="">Vse regije</option>
                            <option value="gorenjska">Gorenjska</option>
                            <option value="primorska">Primorska</option>
                            <option value="stajerska">Štajerska</option>
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-4" data-aos="fade-up">
                        <div className="card h-100 shadow-sm border-0">
                            <img
                                src="/index-1.jpg"
                                className="card-img-top"
                                alt="PD Gorenjska"
                            />
                            <div className="card-body">
                                <h5 className="card-title">PD Triglav</h5>
                                <p className="card-text">
                                    Ena najbolj aktivnih društev na Gorenjskem.
                                    Organizirajo redne pohode in tabore.
                                </p>
                                <a href="#" className="btn btn-success">
                                    Pridruži se
                                </a>
                            </div>
                        </div>
                    </div>

                    <div
                        className="col-md-4 mb-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <div className="card h-100 shadow-sm border-0">
                            <img
                                src="/index-1.jpg"
                                className="card-img-top"
                                alt="PD Štajerska"
                            />
                            <div className="card-body">
                                <h5 className="card-title">PD Maribor</h5>
                                <p className="card-text">
                                    Organizatorji mestnih in gorskih pohodov.
                                    Aktivni tudi na področju varstva narave.
                                </p>
                                <a href="#" className="btn btn-success">
                                    Pridruži se
                                </a>
                            </div>
                        </div>
                    </div>

                    <div
                        className="col-md-4 mb-4"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        <div className="card h-100 shadow-sm border-0">
                            <img
                                src="/index-1.jpg"
                                className="card-img-top"
                                alt="PD Primorska"
                            />
                            <div className="card-body">
                                <h5 className="card-title">PD Koper</h5>
                                <p className="card-text">
                                    Pohodi v okolici Trsta, Obale in Krasa.
                                    Poudarek na kulturno-naravni dediščini.
                                </p>
                                <a href="#" className="btn btn-success">
                                    Pridruži se
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-success text-white text-center py-3 mt-5">
                <div className="container">
                    &copy; 2025 Pohodnik.si – Skupaj povezani v naravi.
                </div>
            </footer>
        </>
    );
}

export default Drustva;
