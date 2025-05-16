import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import Home from './Pages/Home';
import Drustva from './Pages/Drustva';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/pohodi"
                    element={<div>Pohodi Page Coming Soon</div>}
                />
                <Route path="/drustva" element={<Drustva />} />
                <Route
                    path="/prijava"
                    element={<div>Prijava Page Coming Soon</div>}
                />
            </Routes>
        </Router>
    );
}

export default App;
