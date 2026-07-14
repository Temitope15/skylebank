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
import { useState, useEffect } from 'react';
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
import { notificationService, type NotificationInfo } from '../../services/notificationService';

/**
 * Layout for authenticated dashboard pages, containing desktop sidebar, mobile header,
 * and thumb-friendly mobile bottom navigation.
 */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  const navigation = isAdmin 
    ? [
        { name: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Fraud Management', to: '/admin/fraud', icon: Shield },
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

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };


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
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 text-text-secondary hover:text-primary transition-colors focus:outline-none hover:bg-neutral-light rounded-full"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-accent/30 backdrop-blur-sm transition-opacity" onClick={() => setShowNotifications(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-neutral-border flex flex-col animate-in slide-in-from-right duration-300">
              <div className="px-6 py-5 border-b border-neutral-border flex items-center justify-between bg-neutral-light">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-accent font-heading">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-full hover:bg-neutral-border/50 text-text-secondary transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="h-16 w-16 bg-neutral-light rounded-full flex items-center justify-center text-text-secondary mb-4 border border-neutral-border">
                      <Bell className="h-8 w-8" />
                    </div>
                    <p className="text-text-primary font-semibold font-heading">All caught up!</p>
                    <p className="text-text-secondary text-sm mt-1">You have no new notifications.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`relative p-4 rounded-card border transition-all duration-200 ${
                        n.isRead 
                          ? 'bg-white border-neutral-border text-text-secondary' 
                          : 'bg-primary/5 border-primary/20 text-text-primary shadow-sm hover:border-primary/40'
                      }`}
                    >
                      {!n.isRead && (
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                          <span className="h-2 w-2 bg-primary rounded-full" />
                          <button 
                            onClick={() => handleMarkAsRead(n.id)}
                            className="text-[10px] text-primary hover:underline font-medium"
                          >
                            Mark read
                          </button>
                        </div>
                      )}
                      <h4 className="font-bold text-sm pr-16">{n.title}</h4>
                      <p className="text-xs mt-1 leading-relaxed text-text-secondary">{n.message}</p>
                      <span className="text-[10px] text-text-muted mt-2 block">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
