import { useEffect, useState } from 'react';
import { 
  Users, 
  Wallet as WalletIcon, 
  History, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  Clock, 
  Search, 
  CheckCircle, 
  AlertOctagon, 
  Lock, 
  Unlock,
  MessageSquare,
  RefreshCw,
  FileCheck,
  XCircle,
  FileText
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { kycService } from '../../services/kycService';
import type { KycUpgradeRequest } from '../../services/kycService';
import type { AdminStats, AdminUser, AdminTransaction, ComplaintInfo } from '../../services/adminService';

type TabType = 'overview' | 'users' | 'transactions' | 'complaints' | 'kyc';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [complaints, setComplaints] = useState<ComplaintInfo[]>([]);
  const [kycRequests, setKycRequests] = useState<KycUpgradeRequest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [complaintFilter, setComplaintFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [kycFilter, setKycFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, usersData, txData, complaintsData, kycData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getTransactions(),
        adminService.getComplaints(),
        kycService.getPendingRequests()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setTransactions(txData);
      setComplaints(complaintsData);
      setKycRequests(kycData);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => {
    const targetStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(`user-${userId}`);
    try {
      await adminService.updateUserStatus(userId, targetStatus);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleWalletStatus = async (walletNumber: string, currentStatus: 'ACTIVE' | 'SUSPENDED' | 'N/A') => {
    if (currentStatus === 'N/A') return;
    const targetStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(`wallet-${walletNumber}`);
    try {
      await adminService.updateWalletStatus(walletNumber, targetStatus);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update wallet status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveComplaint = async (complaintId: number) => {
    setActionLoading(`complaint-${complaintId}`);
    try {
      await adminService.resolveComplaint(complaintId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveKyc = async (requestId: string) => {
    setActionLoading(`kyc-${requestId}`);
    try {
      await kycService.approveRequest(requestId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve KYC upgrade request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectKyc = async (requestId: string) => {
    setActionLoading(`kyc-${requestId}`);
    try {
      await kycService.rejectRequest(requestId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject KYC upgrade request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  // Filters
  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.walletNumber.includes(userSearch)
  );

  const filteredTx = transactions.filter(t => 
    t.reference.toLowerCase().includes(txSearch.toLowerCase()) ||
    (t.sourceWalletNumber && t.sourceWalletNumber.includes(txSearch)) ||
    t.targetWalletNumber.includes(txSearch)
  );

  const filteredComplaints = complaints.filter(c => {
    if (complaintFilter === 'ALL') return true;
    return c.status === complaintFilter;
  });

  const filteredKycRequests = kycRequests.filter(req => {
    if (kycFilter === 'ALL') return true;
    return req.status === kycFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary-light/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="text-text-secondary text-sm">Gathering system intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-card shadow-sm text-center">
        <h3 className="text-lg font-bold mb-2">Administrative Error</h3>
        <p className="text-sm mb-4">{error}</p>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-btn text-sm font-semibold transition-colors"
        >
          Try Reloading
        </button>
      </div>
    );
  }

  const pendingKycCount = kycRequests.filter(req => req.status === 'PENDING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary font-heading flex items-center">
            Admin Command Center <ShieldCheck className="ml-2 h-7 w-7 text-primary" />
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            System status monitoring, money flow audit, and virtual banking controls.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="p-2.5 bg-white border border-neutral-border hover:border-primary rounded-btn text-text-secondary hover:text-primary transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Total Users</p>
              <h3 className="text-2xl font-bold text-text-primary mt-2">{stats?.totalUsers}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-btn text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Active Wallets</p>
              <h3 className="text-2xl font-bold text-text-primary mt-2">{stats?.totalActiveWallets}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-btn text-green-600">
              <WalletIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Audit Transactions</p>
              <h3 className="text-2xl font-bold text-text-primary mt-2">{stats?.totalTransactions}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-btn text-purple-600">
              <History className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">System Net Balance</p>
              <h3 className="text-2xl font-bold text-text-primary mt-2">{formatMoney(stats?.totalSystemBalance || 0)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-btn text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-border">
        <nav className="flex space-x-8">
          {(['overview', 'users', 'transactions', 'complaints', 'kyc'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 text-sm font-semibold capitalize border-b-2 transition-all ${
                activeTab === tab 
                  ? 'border-primary text-primary font-bold' 
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-neutral-border'
              }`}
            >
              {tab === 'overview' ? 'System Overview' : tab === 'kyc' ? 'KYC Verifications' : tab}
              {tab === 'complaints' && (stats?.unresolvedComplaints || 0) > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {stats?.unresolvedComplaints}
                </span>
              )}
              {tab === 'kyc' && pendingKycCount > 0 && (
                <span className="ml-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingKycCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* Tab 1: System Overview (Health Status) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Health Checklist */}
            <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm space-y-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-text-primary font-heading flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Active Nodes & Services
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-light rounded-btn">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${stats?.dbStatus === 'UP' ? 'bg-success/15 text-success' : 'bg-red-15 text-red-600'}`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">PostgreSQL Database</p>
                      <p className="text-xs text-text-secondary">Core relational storage</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stats?.dbStatus === 'UP' ? 'bg-success/10 text-success' : 'bg-red-50 text-red-600'}`}>
                    {stats?.dbStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-light rounded-btn">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-success/15 text-success">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Caffeine Cache node</p>
                      <p className="text-xs text-text-secondary">Token & metadata store</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/10 text-success">
                    UP
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-light rounded-btn">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-success/15 text-success">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">MailHog SMTP service</p>
                      <p className="text-xs text-text-secondary">System reset-mailer client</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/10 text-success">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Resources Widgets */}
            <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-text-primary font-heading flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" /> Core Resource Specs
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-text-secondary">JVM Available Memory</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="w-full bg-neutral-border h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                      {formatMemory(stats?.systemFreeMemoryBytes || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-border pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-text-secondary" />
                    <span className="text-sm text-text-secondary">Server Uptime</span>
                  </div>
                  <span className="text-sm font-bold text-text-primary">
                    {formatUptime(stats?.systemUptimeSeconds || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-border pt-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-text-secondary" />
                    <span className="text-sm text-text-secondary">Unresolved Complaints</span>
                  </div>
                  <span className={`text-sm font-bold ${stats?.unresolvedComplaints && stats.unresolvedComplaints > 0 ? 'text-red-500 animate-pulse' : 'text-text-primary'}`}>
                    {stats?.unresolvedComplaints}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User & VBAN Management */}
        {activeTab === 'users' && (
          <div className="bg-white border border-neutral-border rounded-card shadow-sm overflow-hidden">
            {/* Search filter bar */}
            <div className="p-4 border-b border-neutral-border bg-neutral-light flex items-center">
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search user name, email, or NUBAN number..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="block w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-border rounded-btn focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
                />
              </div>
            </div>

            {/* Users Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-light border-b border-neutral-border text-xs font-semibold text-text-secondary uppercase">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Email & Phone</th>
                    <th className="p-4">NUBAN</th>
                    <th className="p-4">Naira Balance</th>
                    <th className="p-4">User Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">No users found matching your search.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-neutral-light/50 transition-colors">
                        <td className="p-4">
                           <p className="font-bold text-text-primary capitalize">{u.firstName} {u.lastName}</p>
                           <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase mt-0.5">{u.role}</span>
                        </td>
                        <td className="p-4">
                          <p className="text-text-primary font-medium">{u.email}</p>
                          <p className="text-xs text-text-secondary">{u.phoneNumber}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-mono bg-neutral-light px-2 py-0.5 rounded border border-neutral-border text-xs tracking-wider">
                            {u.walletNumber !== 'N/A' ? u.walletNumber : 'NO WALLET'}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-text-primary">
                          {u.walletNumber !== 'N/A' ? formatMoney(u.walletBalance) : 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${
                            u.accountStatus === 'ACTIVE' 
                              ? 'bg-success/10 text-success border-success/20' 
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.accountStatus === 'ACTIVE' ? 'bg-success' : 'bg-red-600'}`}></span>
                            {u.accountStatus.toLowerCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {/* Toggle User status (Suspend / Activate) */}
                          <button
                            disabled={actionLoading !== null || u.role === 'ADMIN'}
                            onClick={() => handleToggleUserStatus(u.userId, u.accountStatus)}
                            className={`px-3 py-1.5 rounded-btn text-xs font-bold border transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-0 ${
                              u.role === 'ADMIN'
                                ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400'
                                : u.accountStatus === 'ACTIVE'
                                  ? 'bg-red-50 border-red-200 hover:bg-red-100 text-red-600'
                                  : 'bg-success/5 border-success/20 hover:bg-success/10 text-success'
                            }`}
                          >
                            {u.accountStatus === 'ACTIVE' ? (
                              <><Lock className="h-3 w-3" /> Suspend</>
                            ) : (
                              <><Unlock className="h-3 w-3" /> Activate</>
                            )}
                          </button>

                          {/* Toggle Wallet status (VBAN block / unblock) */}
                          {u.walletNumber !== 'N/A' && (
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => handleToggleWalletStatus(u.walletNumber, u.walletStatus)}
                              className={`px-3 py-1.5 rounded-btn text-xs font-bold border transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-0 ${
                                u.walletStatus === 'ACTIVE'
                                  ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700'
                                  : 'bg-green-50 border-green-200 hover:bg-green-100 text-green-600'
                              }`}
                            >
                              {u.walletStatus === 'ACTIVE' ? (
                                <><AlertOctagon className="h-3 w-3" /> VBAN Block</>
                              ) : (
                                <><CheckCircle className="h-3 w-3" /> VBAN Restore</>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Money Flow (Audit Ledger) */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-neutral-border rounded-card shadow-sm overflow-hidden">
            {/* Search filter bar */}
            <div className="p-4 border-b border-neutral-border bg-neutral-light flex items-center">
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Tx reference or account number..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="block w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-border rounded-btn focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-light border-b border-neutral-border text-xs font-semibold text-text-secondary uppercase">
                    <th className="p-4">Reference</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Sender (Debit)</th>
                    <th className="p-4">Receiver (Credit)</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border text-sm">
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">No transactions recorded in the audit trail.</td>
                    </tr>
                  ) : (
                    filteredTx.map((t) => (
                      <tr key={t.id} className="hover:bg-neutral-light/50 transition-colors">
                        <td className="p-4">
                          <p className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">{t.reference}</p>
                          <span className="text-[11px] text-text-secondary mt-0.5 block">{t.description}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                            t.transactionType === 'DEPOSIT' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {t.transactionType}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-text-secondary">
                          {t.sourceWalletNumber ? t.sourceWalletNumber : 'EXTERNAL SOURCE'}
                        </td>
                        <td className="p-4 font-mono text-xs text-text-primary font-semibold">
                          {t.targetWalletNumber}
                        </td>
                        <td className="p-4 font-bold text-text-primary">
                          {formatMoney(t.amount)}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            t.status === 'SUCCESS' 
                              ? 'bg-success/10 text-success' 
                              : t.status === 'FAILED'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-yellow-50 text-yellow-600'
                          }`}>
                            {t.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleString('en-NG')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Complaints Resolution Console */}
        {activeTab === 'complaints' && (
          <div className="bg-white border border-neutral-border rounded-card shadow-sm overflow-hidden">
            {/* Filters bar */}
            <div className="p-4 border-b border-neutral-border bg-neutral-light flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-primary" /> Tickets Ledger
              </h3>
              <div className="flex gap-2">
                {(['ALL', 'PENDING', 'RESOLVED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setComplaintFilter(filter)}
                    className={`px-3 py-1 rounded-btn text-xs font-bold border transition-colors ${
                      complaintFilter === filter
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-white border-neutral-border hover:bg-neutral-light text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Complaints List */}
            <div className="divide-y divide-neutral-border">
              {filteredComplaints.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No support tickets reported.</div>
              ) : (
                filteredComplaints.map((c) => (
                  <div key={c.id} className="p-6 hover:bg-neutral-light/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.category === 'SECURITY' 
                            ? 'bg-red-50 text-red-600 border-red-200' 
                            : c.category === 'TRANSACTION'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {c.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          c.status === 'RESOLVED' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse'
                        }`}>
                          {c.status.toLowerCase()}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          Submitted by <strong className="text-text-primary capitalize">{c.userFullName}</strong> ({c.userEmail})
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(c.createdAt).toLocaleString('en-NG')}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-text-primary font-heading">{c.title}</h4>
                      <p className="text-sm text-text-secondary">{c.description}</p>
                    </div>

                    <div className="whitespace-nowrap">
                      {c.status === 'PENDING' ? (
                        <button
                          disabled={actionLoading === `complaint-${c.id}`}
                          onClick={() => handleResolveComplaint(c.id)}
                          className="px-4 py-2 bg-success hover:bg-success-dark text-white text-xs font-bold rounded-btn transition-colors shadow-sm inline-flex items-center gap-1.5 focus:outline-none"
                        >
                          <CheckCircle className="h-4.5 w-4.5" /> Resolve Ticket
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-success flex items-center gap-1">
                          <CheckCircle className="h-4.5 w-4.5" /> Ticket Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: KYC Verification Panel */}
        {activeTab === 'kyc' && (
          <div className="bg-white border border-neutral-border rounded-card shadow-sm overflow-hidden">
            {/* Filters bar */}
            <div className="p-4 border-b border-neutral-border bg-neutral-light flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Upgrade Requests Console
              </h3>
              <div className="flex gap-2">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setKycFilter(filter)}
                    className={`px-3 py-1 rounded-btn text-xs font-bold border transition-colors ${
                      kycFilter === filter
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-white border-neutral-border hover:bg-neutral-light text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* KYC Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-light border-b border-neutral-border text-xs font-semibold text-text-secondary uppercase">
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Target Upgrade</th>
                    <th className="p-4">Submitted Credentials</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border text-sm">
                  {filteredKycRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">No KYC upgrade requests found in this scope.</td>
                    </tr>
                  ) : (
                    filteredKycRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-neutral-light/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-text-primary capitalize">{req.user.firstName} {req.user.lastName}</p>
                          <p className="text-xs text-text-secondary">{req.user.email}</p>
                        </td>
                        <td className="p-4 font-semibold text-primary">
                          {req.targetTier}
                        </td>
                        <td className="p-4 space-y-1">
                          {req.targetTier === 'TIER_2' ? (
                            <div className="text-xs text-text-secondary space-y-0.5">
                              <p>BVN: <span className="font-mono font-semibold text-text-primary">{req.bvn}</span></p>
                              <p>NIN: <span className="font-mono font-semibold text-text-primary">{req.nin}</span></p>
                            </div>
                          ) : (
                            <div className="text-xs text-text-secondary flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              <a
                                href={req.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary font-semibold hover:underline flex items-center space-x-0.5"
                              >
                                <span>Proof of Address.pdf</span>
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs text-text-secondary">
                          {new Date(req.createdAt).toLocaleString('en-NG')}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            req.status === 'APPROVED' 
                              ? 'bg-success/10 text-success' 
                              : req.status === 'REJECTED'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse'
                          }`}>
                            {req.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {req.status === 'PENDING' ? (
                            <>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => handleApproveKyc(req.id)}
                                className="px-3 py-1.5 bg-success hover:bg-success-dark disabled:bg-neutral-border text-white text-xs font-bold rounded-btn transition-colors shadow-sm inline-flex items-center gap-1 focus:outline-none"
                              >
                                <FileCheck className="h-3.5 w-3.5" /> Approve
                              </button>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => handleRejectKyc(req.id)}
                                className="px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 disabled:bg-neutral-border text-red-600 text-xs font-bold rounded-btn transition-colors inline-flex items-center gap-1 focus:outline-none"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-text-secondary italic">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
