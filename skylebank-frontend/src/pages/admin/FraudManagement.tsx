import { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  Check, 
  X, 
  TrendingUp,  
  Zap, 
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { FraudAlertInfo } from '../../services/adminService';

export default function FraudManagement() {
  const [alerts, setAlerts] = useState<FraudAlertInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlertInfo | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getFraudAlerts();
      setAlerts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve fraud assessment reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Are you sure you want to APPROVE this transfer? The transaction will execute and funds will move.')) {
      return;
    }
    setActionLoading(id);
    setError(null);
    setSuccessMessage(null);
    try {
      await adminService.approveFraudAlert(id);
      setSuccessMessage('Suspicious transaction successfully approved and processed.');
      setSelectedAlert(null);
      await fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve transaction.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Are you sure you want to REJECT this transfer? The transaction will be marked as FAILED.')) {
      return;
    }
    setActionLoading(id);
    setError(null);
    setSuccessMessage(null);
    try {
      await adminService.rejectFraudAlert(id);
      setSuccessMessage('Suspicious transaction successfully rejected.');
      setSelectedAlert(null);
      await fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject transaction.');
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getRiskBarColor = (score: number) => {
    if (score >= 70) return 'bg-red-600';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  // Rule Name translation/beautifier
  const formatRule = (rule: string) => {
    return rule.replace(/_/g, ' ');
  };

  const filteredAlerts = alerts.filter(a => 
    a.transactionReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.senderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.senderWalletNumber.includes(searchQuery) ||
    a.recipientWalletNumber.includes(searchQuery) ||
    a.ruleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalPending = alerts.length;
  const highRiskCount = alerts.filter(a => a.riskScore >= 70).length;
  const velocityCount = alerts.filter(a => a.ruleName.includes('VELOCITY')).length;
  const thresholdCount = alerts.filter(a => a.ruleName.includes('THRESHOLD')).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary-light/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="text-text-secondary text-sm">Evaluating transaction threats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-primary font-heading flex items-center">
            Fraud Risk Engine <ShieldAlert className="ml-2 h-7 w-7 text-red-500" />
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Analyze, approve, or reject transactions flagged for high risk score or suspicious patterns.
          </p>
        </div>
        <button 
          onClick={fetchAlerts}
          className="p-2.5 bg-white border border-neutral-border hover:border-primary rounded-btn text-text-secondary hover:text-primary transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Success/Error Alerts */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-btn text-sm font-medium animate-in slide-in-from-top-2 duration-300">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-btn text-sm font-medium animate-in slide-in-from-top-2 duration-300">
          {error}
        </div>
      )}

      {/* Fraud Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Active Alerts</p>
              <h3 className="text-2xl font-bold text-text-primary mt-2">{totalPending}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-btn text-red-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Critical Threat</p>
              <h3 className="text-2xl font-bold text-text-primary mt-2">{highRiskCount}</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-btn text-red-700 animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Velocity Hits</p>
              <h3 className="text-2xl font-bold text-text-primary mt-2">{velocityCount}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-btn text-orange-500">
              <Zap className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-border rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Large Amounts</p>
              <h3 className="text-2xl font-bold text-text-primary mt-2">{thresholdCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-btn text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Section */}
      <div className="bg-white border border-neutral-border rounded-card shadow-sm overflow-hidden">
        {/* Search filter bar */}
        <div className="p-4 border-b border-neutral-border bg-neutral-light flex items-center">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by Tx ref, wallet number, email, or rule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-border rounded-btn focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-light border-b border-neutral-border text-xs font-semibold text-text-secondary uppercase">
                <th className="p-4">Reference</th>
                <th className="p-4">Sender Details</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Triggered Rules</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border text-sm">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No pending fraud alerts to resolve.</td>
                </tr>
              ) : (
                filteredAlerts.map((a) => (
                  <tr 
                    key={a.id} 
                    className="hover:bg-neutral-light/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAlert(a)}
                  >
                    <td className="p-4">
                      <p className="font-mono text-xs font-bold text-text-primary tracking-wider uppercase">{a.transactionReference}</p>
                      <span className="text-[10px] text-text-secondary mt-0.5 block">
                        {new Date(a.createdAt).toLocaleString('en-NG')}
                      </span>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <p className="font-semibold text-text-primary capitalize">{a.senderEmail.split('@')[0]}</p>
                      <span className="font-mono text-xs text-text-secondary">{a.senderWalletNumber}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-text-primary">{a.recipientWalletNumber}</span>
                    </td>
                    <td className="p-4 font-bold text-text-primary">
                      {formatMoney(a.amount)}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <span className="inline-flex px-2.5 py-1 rounded text-xs font-bold border capitalize bg-red-50 text-red-600 border-red-200">
                        {formatRule(a.ruleName)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${getRiskScoreColor(a.riskScore)}`}>
                          {a.riskScore}%
                        </span>
                        <div className="w-16 bg-neutral-border h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full ${getRiskBarColor(a.riskScore)}`} style={{ width: `${a.riskScore}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleApprove(a.id)}
                        className="p-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-btn text-xs font-bold transition-colors inline-flex items-center gap-1 focus:outline-none"
                        title="Approve transaction and transfer funds"
                      >
                        <Check className="h-4 w-4" />
                        <span className="hidden md:inline">Approve</span>
                      </button>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleReject(a.id)}
                        className="p-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 rounded-btn text-xs font-bold transition-colors inline-flex items-center gap-1 focus:outline-none"
                        title="Reject transaction and cancel transfer"
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden md:inline">Reject</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Overlay Drawer Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-accent/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl border border-neutral-border animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-neutral-light transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-accent mb-1 font-heading flex items-center">
              Flagged Transaction Intelligence <ShieldAlert className="ml-1.5 h-5.5 w-5.5 text-red-500" />
            </h3>
            <p className="text-xs text-text-secondary mb-6 border-b border-neutral-border pb-3">
              Reference: <span className="font-mono text-text-primary font-bold uppercase">{selectedAlert.transactionReference}</span>
            </p>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-light rounded-btn">
                  <p className="text-xs text-text-secondary font-semibold">Sender Email</p>
                  <p className="text-sm font-bold text-text-primary capitalize mt-0.5">{selectedAlert.senderEmail}</p>
                </div>
                <div className="p-3 bg-neutral-light rounded-btn">
                  <p className="text-xs text-text-secondary font-semibold">Debit Wallet</p>
                  <p className="text-sm font-mono font-bold text-text-primary mt-0.5">{selectedAlert.senderWalletNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-light rounded-btn">
                  <p className="text-xs text-text-secondary font-semibold">Recipient Wallet</p>
                  <p className="text-sm font-mono font-bold text-text-primary mt-0.5">{selectedAlert.recipientWalletNumber}</p>
                </div>
                <div className="p-3 bg-neutral-light rounded-btn">
                  <p className="text-xs text-text-secondary font-semibold">Transfer Amount</p>
                  <p className="text-sm font-bold text-text-primary mt-0.5">{formatMoney(selectedAlert.amount)}</p>
                </div>
              </div>

              <div className="p-4 border border-red-200 bg-red-50/30 rounded-btn space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Threat Assessment</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${getRiskScoreColor(selectedAlert.riskScore)}`}>
                    Score: {selectedAlert.riskScore}%
                  </span>
                </div>
                <p className="text-sm font-bold text-text-primary">{formatRule(selectedAlert.ruleName)}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{selectedAlert.reason}</p>
              </div>

              {/* User Agent Information */}
              <div className="p-3 bg-neutral-light rounded-btn flex items-start gap-2.5">
                <Smartphone className="h-5 w-5 text-text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary font-semibold">Initiating Device & User-Agent</p>
                  <p className="text-xs font-medium text-text-primary mt-1 leading-normal font-mono break-all bg-white p-2 border border-neutral-border rounded">
                    {selectedAlert.reason.includes('Device') || selectedAlert.reason.includes('User-Agent') || true
                      ? selectedAlert.reason.split('User-Agent:')[1]?.trim() || 'Unknown device browser details'
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 py-2 px-4 border border-neutral-border hover:bg-neutral-light text-text-primary font-semibold rounded-btn transition-colors text-sm"
              >
                Close details
              </button>
              <button
                onClick={() => handleReject(selectedAlert.id)}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-btn transition-colors text-sm shadow-md flex items-center justify-center gap-1"
              >
                <X className="h-4 w-4" /> Reject transfer
              </button>
              <button
                onClick={() => handleApprove(selectedAlert.id)}
                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-btn transition-colors text-sm shadow-md flex items-center justify-center gap-1"
              >
                <Check className="h-4 w-4" /> Approve transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
