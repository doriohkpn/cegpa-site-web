import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages Publiques
import Accueil from './pages/Accueil';
import Exposition from './pages/Exposition';
import DetailExposition from './pages/DetailExposition';
import Biographie from './pages/Biographie';
import APropos from './pages/APropos';


// Pages Espace Administrateur
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className={!isAdminRoute ? 'site-main-content' : ''} style={{ minHeight: isAdminRoute ? '100vh' : 'calc(100vh - 80px - 160px)', height: isAdminRoute ? '100vh' : 'auto', overflow: isAdminRoute ? 'hidden' : 'visible' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Accueil />} />
          <Route path="/exposition" element={<Exposition />} />
          <Route path="/exposition/resume" element={<DetailExposition />} />
          <Route path="/exposition/biographie" element={<Biographie />} />
          <Route path="/exposition/biographie/:artistId" element={<Biographie />} />
          <Route path="/biographie" element={<Biographie />} />
          <Route path="/biographie/:artistId" element={<Biographie />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/contact" element={<APropos />} />


          {/* Admin Back-Office Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
