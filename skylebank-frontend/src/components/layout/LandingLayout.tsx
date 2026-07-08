import { Outlet, Link } from 'react-router-dom';

/**
 * Layout for public-facing pages (Landing, Login, Register, Password Resets).
 */
export default function LandingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-accent font-heading">
              Skyle<span className="text-primary">Bank</span>
            </span>
          </div>
          <nav className="flex space-x-4">
            <Link to="/login" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-btn transition-colors">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <Outlet />
      </main>

      <footer className="bg-accent text-white py-8 border-t border-accent-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} SkyleBank. Designed around intelligence. Untracked Local Stack.</p>
        </div>
      </footer>
    </div>
  );
}
