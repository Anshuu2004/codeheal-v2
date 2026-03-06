import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { Integrations } from './pages/Integrations';
import { Changelog } from './pages/Changelog';
import { Documentation } from './pages/Documentation';
import { APIReference } from './pages/APIReference';
import { Blog } from './pages/Blog';
import { Community } from './pages/Community';
import { AboutUs } from './pages/AboutUs';
import { Careers } from './pages/Careers';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/api" element={<APIReference />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/community" element={<Community />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
