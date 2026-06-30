import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from '../components/layout/LandingLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// ==========================================
// Placeholder Screens for Routing Shell
// ==========================================
const Landing = () => (
  <div className="text-center py-20">
    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">Bank Smarter, Faster, Safer</h1>
    <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">Manage money with intelligent security and effortless transactions.</p>
  </div>
);

const Login = () => (
  <div className="w-full max-w-md p-8 bg-white border border-neutral-border rounded-card shadow-md">
    <h2 className="text-2xl font-bold font-heading mb-6 text-center">Login to SkyVault</h2>
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-300 rounded-btn text-gray-400">LoginForm Placeholder</div>
  </div>
);

const Register = () => (
  <div className="w-full max-w-md p-8 bg-white border border-neutral-border rounded-card shadow-md">
    <h2 className="text-2xl font-bold font-heading mb-6 text-center">Create Account</h2>
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-300 rounded-btn text-gray-400">RegisterForm Placeholder</div>
  </div>
);

const ForgotPassword = () => (
  <div className="w-full max-w-md p-8 bg-white border border-neutral-border rounded-card shadow-md">
    <h2 className="text-2xl font-bold font-heading mb-6 text-center">Forgot Password</h2>
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-300 rounded-btn text-gray-400">ForgotPassword Placeholder</div>
  </div>
);

const ResetPassword = () => (
  <div className="w-full max-w-md p-8 bg-white border border-neutral-border rounded-card shadow-md">
    <h2 className="text-2xl font-bold font-heading mb-6 text-center">Reset Password</h2>
    <div className="h-40 flex items-center justify-center border border-dashed border-gray-300 rounded-btn text-gray-400">ResetPassword Placeholder</div>
  </div>
);

// Protected placeholders
const Dashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold font-heading">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-white border border-neutral-border rounded-card shadow-sm h-36 flex items-center justify-center text-gray-400">Balance Widget</div>
      <div className="p-6 bg-white border border-neutral-border rounded-card shadow-sm h-36 flex items-center justify-center text-gray-400">Quick Actions</div>
      <div className="p-6 bg-white border border-neutral-border rounded-card shadow-sm h-36 flex items-center justify-center text-gray-400">Insights</div>
    </div>
  </div>
);

const Wallet = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold font-heading">My Wallet</h2>
    <div className="p-6 bg-white border border-neutral-border rounded-card shadow-sm h-64 flex items-center justify-center text-gray-400">Wallet Management UI</div>
  </div>
);

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
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes Shell */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Customer Routes Shell */}
        <Route element={<DashboardLayout />}>
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
