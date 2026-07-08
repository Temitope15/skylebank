import { useEffect, useState } from 'react';
import { 
  Wallet as WalletIcon, 
  Copy, 
  Check, 
  Plus, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import { walletService } from '../../services/walletService';
import type { WalletInfo } from '../../types/wallet';

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchWallet(showLoading = false) {
      try {
        if (showLoading) setLoading(true);
        const data = await walletService.getWalletDetails();
        if (active) {
          setWallet(data);
        }
      } catch (err: any) {
        console.error(err);
        if (showLoading && active) {
          setError(err.response?.data?.message || 'Failed to load wallet details.');
        }
      } finally {
        if (showLoading && active) {
          setLoading(false);
        }
      }
    }

    fetchWallet(true);

    const interval = setInterval(() => {
      fetchWallet(false);
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleCopyNuban = () => {
    if (wallet?.walletNumber) {
      navigator.clipboard.writeText(wallet.walletNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBalance = (amount: number, currencyCode: string) => {
    const locale = currencyCode === 'NGN' ? 'en-NG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
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
        <h3 className="text-lg font-bold mb-2">Error Loading Wallet</h3>
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
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary font-heading">
            My Wallet
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Manage your currency balances, status, and deposit accounts.
          </p>
        </div>
        <button 
          className="flex items-center space-x-2 py-2.5 px-4 bg-primary hover:bg-primary-dark text-accent font-semibold rounded-btn transition-colors text-sm shadow-md"
          title="Create Multi-Currency Wallet"
          disabled
        >
          <Plus className="h-4 w-4" />
          <span>Add Currency</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Current active currency wallets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary/10 rounded-btn flex items-center justify-center text-primary flex-shrink-0">
                <WalletIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-bold text-text-primary font-heading">
                    Nigerian Naira Wallet
                  </h4>
                  <span className="text-[10px] bg-sky-50 text-primary border border-sky-100 px-2 py-0.5 rounded-full font-bold">
                    Primary
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  NUBAN: {wallet?.walletNumber}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-text-secondary">Balance</p>
              <h3 className="text-2xl font-bold text-text-primary font-heading mt-0.5">
                {formatBalance(wallet?.balance || 0, wallet?.currency || 'NGN')}
              </h3>
            </div>
          </div>

          {/* Virtual Card Placeholder */}
          <div className="bg-gradient-to-r from-accent-light to-accent rounded-card p-6 text-white shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold font-heading">Virtual Debit Card</h4>
                <p className="text-[10px] text-gray-400">Secure online checkouts</p>
              </div>
              <Lock className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-4 my-4">
              <span className="text-sm text-gray-300 font-mono tracking-widest">•••• •••• •••• 9012</span>
            </div>

            <div className="flex justify-between items-end border-t border-white/5 pt-3">
              <span className="text-xs text-gray-400 font-semibold uppercase">Coming Soon</span>
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">Inactive</span>
            </div>
          </div>
        </div>

        {/* Right Side: Account details metadata & warning checks */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-text-primary font-heading border-b border-neutral-border pb-3">
              Direct Deposit Details
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-secondary">Bank Name</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">SkyleBank Nigeria</p>
              </div>

              <div>
                <p className="text-xs text-text-secondary">Account Number (NUBAN)</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className="font-mono text-sm font-bold text-text-primary tracking-wide">
                    {wallet?.walletNumber}
                  </p>
                  <button 
                    onClick={handleCopyNuban}
                    className="p-1 hover:bg-neutral-light rounded text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-secondary">Wallet Status</p>
                <p className="text-sm font-semibold text-success mt-0.5 capitalize">
                  {wallet?.walletStatus.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50/50 border border-yellow-100 rounded-card p-6 space-y-3">
            <div className="flex items-center space-x-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="text-sm font-bold font-heading">Important Note</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              This is a sandbox wallet loaded with ₦1,000,000.00 mock funds. Please do not attempt to use this NUBAN details outside of this application space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
