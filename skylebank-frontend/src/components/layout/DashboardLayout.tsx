/**
 * File: DashboardLayout.tsx
 *
 * Purpose:
 * Renders the wrapper layout for logged-in user dashboard screens.
 *
 * Responsibilities:
 * * Render sidebar navigation links for desktop screen sizes
 * * Render responsive top header and thumb-friendly navigation bar for mobile devices
 * * Display user profile initials and trigger session logout actions
 *
 * Why this file exists:
 * To provide a consistent, responsive navigation wrapper around authenticated pages.
 *
 * Usage Flow:
 * Render -> Fetch user profile from useAuthStore -> render welcome banner -> Render Outlet child
 *
 * Design Decisions:
 * * Layout Grid pattern with sidebar + main content viewport
 */
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Send, 
  History, 
  User, 
  Shield, 
  Bell, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

/**
 * Layout for authenticated dashboard pages, containing desktop sidebar, mobile header,
 * and thumb-friendly mobile bottom navigation.
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  const navigation = isAdmin 
    ? [
        { name: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
      ]
    : [
        { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Wallet', to: '/wallet', icon: Wallet },
        { name: 'Transfer', to: '/transfer', icon: Send },
        { name: 'Transactions', to: '/transactions', icon: History },
        { name: 'Profile', to: '/profile', icon: User },
        { name: 'Security', to: '/security', icon: Shield },
      ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const userInitial = user?.firstName?.charAt(0).toUpperCase() || 'U';
  const welcomeName = isAdmin 
    ? 'Admin Command Center' 
    : (user?.firstName ? `Welcome Back, ${user.firstName}` : 'Welcome Back');


  return (
    <div className="flex h-screen bg-neutral-light overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-accent text-white flex-shrink-0">
        <div className="h-16 flex items-center justify-between px-6 border-b border-accent-light">
          <span className="text-xl font-bold font-heading">
            Skyle<span className="text-primary">Bank</span>
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:bg-accent-light hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-accent-light">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-btn text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 h-16 bg-white border-b border-neutral-border lg:px-8 flex-shrink-0">
          <div className="flex items-center space-x-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-primary focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold font-heading">
              Skyle<span className="text-primary">Bank</span>
            </span>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-text-primary">{welcomeName}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-1 text-text-secondary hover:text-primary transition-colors focus:outline-none">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Dynamic Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation (Thumb-friendly navigation) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-border flex items-center justify-around px-2 z-40">
          {(isAdmin ? navigation : navigation.slice(0, 5)).map((item) => (
            <NavLink

              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center space-y-1 w-12 h-12 rounded-full transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Slide-out Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Mobile Sidebar */}
          <aside 
            className="w-64 bg-accent h-full flex flex-col text-white transform translate-x-0 transition-transform shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-accent-light">
              <span className="text-xl font-bold font-heading">SkyleBank</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-accent-light hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-accent-light">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-btn text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-accent/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-card max-w-sm w-full p-6 shadow-2xl border border-neutral-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-50 border border-red-100 text-red-600 mx-auto mb-4">
              <LogOut className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-accent text-center mb-2 font-heading">
              Confirm Logout
            </h3>
            <p className="text-text-secondary text-sm text-center mb-6">
              Are you sure you want to end your active session and log out of SkyleBank?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 px-4 border border-neutral-border hover:bg-neutral-light text-text-primary font-semibold rounded-btn transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-btn transition-colors text-sm shadow-md"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
