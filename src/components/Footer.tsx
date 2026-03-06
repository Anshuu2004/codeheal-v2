import { Bot, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 border-t border-neutral-800 text-neutral-400 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight text-white">CodeHeal</span>
          </div>
          <p className="text-sm">
            AI-Powered Code Remediation. Automatically detect and fix bugs in your GitHub repositories.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
            <li><Link to="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
            <li><Link to="/api" className="hover:text-white transition-colors">API Reference</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-neutral-800 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} CodeHeal. All rights reserved.</p>
      </div>
    </footer>
  );
}
