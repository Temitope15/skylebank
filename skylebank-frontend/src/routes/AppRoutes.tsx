/**
 * File: AppRoutes.tsx
 *
 * Purpose:
 * Configures the React Router navigation schema and authentication guard wrappers.
 *
 * Responsibilities:
 * * Define layout routing hierarchies (LandingLayout, DashboardLayout)
 * * Restrict unauthorized users from viewing customer-scoped pages using ProtectedRoute
 * * Restrict authenticated users from viewing entry-scoped auth pages using PublicRoute
 * * Run silent token sync checks on application boot
 *
 * Why this file exists:
 * To centralize URL route matching and client-side view security logic.
 *
 * Usage Flow:
 * Browser URL changed -> AppRoutes matching -> PublicRoute/ProtectedRoute check -> Render components
 *
 * Design Decisions:
 * * Declarative Routing layout structure
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import LandingLayout from '../components/layout/LandingLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Import Auth screens
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Import Dashboard screens
import Dashboard from '../pages/dashboard/Dashboard';
import Wallet from '../pages/dashboard/Wallet';

// ==========================================
// Route Guard Components
// ==========================================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

// ==========================================
// Placeholder Screens for Routing Shell
// ==========================================
const Landing = () => (
  <div className="text-center py-20">
    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">Bank Smarter, Faster, Safer</h1>
    <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">Manage money with intelligent security and effortless transactions.</p>
  </div>
);

// Placeholders for pending screens

const Transfer = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold font-heading">Send Money</h2>
    <div className="p-6 bg-white border border-neutral-border rounded-card shadow-sm h-64 flex items-center justify-center text-gray-400">Transfer Form Interface</div>
  </div>
);

const Transactions = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold font-heading">Transaction History</h2>
    <div className="p-6 bg-white border border-neutral-border rounded-card shadow-sm h-64 flex items-center justify-center text-gray-400">Transactions Ledger Table</div>
  </div>
);

const Profile = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold font-heading">Profile Settings</h2>
    <div className="p-6 bg-white border border-neutral-border rounded-card shadow-sm h-64 flex items-center justify-center text-gray-400">User Information Form</div>
  </div>
);

const Security = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold font-heading">Security Dashboard</h2>
    <div className="p-6 bg-white border border-neutral-border rounded-card shadow-sm h-64 flex items-center justify-center text-gray-400">2FA & Session Configs</div>
  </div>
);

const NotFound = () => (
  <div className="text-center py-20">
    <h2 className="text-3xl font-bold font-heading mb-2">404 - Page Not Found</h2>
    <p className="text-text-secondary mb-4">The page you are looking for does not exist.</p>
  </div>
);

export default function AppRoutes() {
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    authService.checkSession();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-light">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary-light opacity-25"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
          </div>
          <p className="text-text-secondary text-sm font-semibold tracking-wide animate-pulse">
            Syncing secure session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes Shell */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
        </Route>

        {/* Protected Customer Routes Shell */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security" element={<Security />} />
        </Route>

        {/* Catch-all Routing */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
