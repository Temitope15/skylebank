import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Send, 
  Wallet as WalletIcon, 
  History, 
  ShieldCheck,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { walletService } from '../../services/walletService';
import type { WalletInfo } from '../../types/wallet';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchWallet() {
      try {
        setLoading(true);
        const data = await walletService.getWalletDetails();
        setWallet(data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load wallet details.');
      } finally {
        setLoading(false);
      }
    }
    fetchWallet();
  }, []);

  const handleCopyNuban = () => {
    if (wallet?.walletNumber) {
      navigator.clipboard.writeText(wallet.walletNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNuban = (nuban: string) => {
    if (!nuban) return '';
    return `${nuban.slice(0, 3)} ${nuban.slice(3, 6)} ${nuban.slice(6)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary-light/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-card shadow-sm text-center">
        <h3 className="text-lg font-bold mb-2">Error Loading Dashboard</h3>
        <p className="text-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-btn text-sm font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-text-primary font-heading">
          Hello, {user?.firstName} 👋
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Here is your financial overview for today.
        </p>
      </div>

      {/* Credit Card & Status Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visa-style Premium Card */}
        <div className="lg:col-span-2 relative bg-gradient-to-br from-accent to-accent-light rounded-card p-6 md:p-8 text-white shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-between group">
          {/* Background Decorative Circles */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500"></div>
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-accent-light/40 rounded-full blur-2xl"></div>

          {/* Top Row: Brand & Eye Toggle */}
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">SkyleBank Account</p>
              <h3 className="text-lg font-bold font-heading mt-0.5">Premium Wallet</h3>
            </div>
            <button 
              onClick={() => setHideBalance(!hideBalance)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white transition-all focus:outline-none"
              title={hideBalance ? "Show balance" : "Hide balance"}
            >
              {hideBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>

          {/* Middle Row: Balance Display */}
          <div className="my-6 z-10">
            <p className="text-xs text-gray-400 font-medium">Available Balance</p>
            <div className="text-3xl md:text-4xl font-bold mt-1 tracking-tight">
              {hideBalance ? "₦ ••••••••" : formatBalance(wallet?.balance || 0)}
            </div>
          </div>

          {/* Bottom Row: NUBAN & Account Holder */}
          <div className="flex justify-between items-end border-t border-white/10 pt-4 z-10">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Account Number (NUBAN)</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-mono text-base md:text-lg font-semibold tracking-wider">
                  {formatNuban(wallet?.walletNumber || '')}
                </span>
                <button 
                  onClick={handleCopyNuban}
                  className="p-1 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors"
                  title="Copy account number"
                >
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/20 text-success border border-success/30 capitalize">
                {wallet?.walletStatus.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Account Details Quick Stats */}
        <div className="bg-white border border-neutral-border rounded-card p-6 flex flex-col justify-between shadow-sm">
          <h3 className="text-base font-bold text-text-primary font-heading border-b border-neutral-border pb-3 mb-4">
            Account Limits & Status
          </h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-sky-50 rounded-btn text-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">KYC Status</p>
                  <p className="text-sm font-semibold text-text-primary">Tier 1 Savings</p>
                </div>
              </div>
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-btn">Verified</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-50 rounded-btn text-warning">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Daily Transfer Limit</p>
                  <p className="text-sm font-semibold text-text-primary">₦50,000.00</p>
                </div>
              </div>
              <span className="text-xs text-text-secondary">Default</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-btn text-success">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Account Security</p>
                  <p className="text-sm font-semibold text-text-primary">Strong</p>
                </div>
              </div>
              <span className="text-xs text-primary font-bold">Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary font-heading">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/transfer')}
            className="p-6 bg-white border border-neutral-border hover:border-primary rounded-card shadow-sm hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="h-10 w-10 bg-primary/10 rounded-btn flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <Send className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-text-primary font-heading">Send Money</h4>
            <p className="text-xs text-text-secondary mt-1">Transfer funds instantly</p>
          </button>

          <button 
            onClick={() => navigate('/wallet')}
            className="p-6 bg-white border border-neutral-border hover:border-primary rounded-card shadow-sm hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="h-10 w-10 bg-primary/10 rounded-btn flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <WalletIcon className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-text-primary font-heading">My Wallet</h4>
            <p className="text-xs text-text-secondary mt-1">Manage details & currencies</p>
          </button>

          <button 
            onClick={() => navigate('/transactions')}
            className="p-6 bg-white border border-neutral-border hover:border-primary rounded-card shadow-sm hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="h-10 w-10 bg-primary/10 rounded-btn flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <History className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-text-primary font-heading">History</h4>
            <p className="text-xs text-text-secondary mt-1">Track financial activities</p>
          </button>

          <button 
            onClick={() => navigate('/security')}
            className="p-6 bg-white border border-neutral-border hover:border-primary rounded-card shadow-sm hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="h-10 w-10 bg-primary/10 rounded-btn flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-text-primary font-heading">Security</h4>
            <p className="text-xs text-text-secondary mt-1">Configure limits & locks</p>
          </button>
        </div>
      </div>
    </div>
  );
}
