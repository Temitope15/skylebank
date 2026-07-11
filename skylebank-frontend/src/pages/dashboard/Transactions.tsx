import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Copy, 
  Check, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter,
  RefreshCw
} from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import type { TransactionResponse } from '../../services/transactionService';
import { useAuthStore } from '../../store/authStore';

export default function Transactions() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  // Data fetching state
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtering state
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Active UI filters (only trigger fetch on submit/change)
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Selected Transaction for receipt modal
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // reset page to 0 on search
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch transactions when filters or page/size changes
  useEffect(() => {
    fetchTransactions();
  }, [page, size, type, status, startDate, endDate, debouncedSearch]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert dates to ISO String if present
      let formattedStart = '';
      if (startDate) {
        formattedStart = new Date(startDate).toISOString();
      }
      let formattedEnd = '';
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        formattedEnd = end.toISOString();
      }

      const data = await transactionService.getTransactions({
        type: type || undefined,
        status: status || undefined,
        startDate: formattedStart || undefined,
        endDate: formattedEnd || undefined,
        search: debouncedSearch || undefined,
        page,
        size,
        sort: 'createdAt,desc'
      });

      setTransactions(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(val);
  };

  const isOutgoing = (tx: TransactionResponse) => {
    // If the current user owns the source wallet, it's outgoing.
    // If sourceWalletNumber is N/A or empty, it's incoming.
    if (!tx.sourceWalletNumber || tx.sourceWalletNumber === 'N/A') return false;
    
    // Check if the current user name or wallet number matches
    // But since we flatten it, let's use the current user's firstName/lastName check or match names.
    // However, we can simply compare names or have it determined by check:
    // If the sender's wallet number matches the user's logged-in wallet, it is outgoing.
    // Let's check how we can fetch the user's wallet number. We can check if the sourceWalletOwnerName matches
    // the user's first/last name or we can simply inspect the transactionType:
    // If type is DEPOSIT, it's incoming. If type is TRANSFER, we can check who is the target vs source.
    // To do this reliably, we can match:
    const currentUserFullName = `${currentUser?.firstName} ${currentUser?.lastName}`.trim().toLowerCase();
    const sourceName = tx.sourceWalletOwnerName.trim().toLowerCase();
    
    return sourceName === currentUserFullName;
  };

  const resetFilters = () => {
    setType('');
    setStatus('');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white hover:bg-neutral-light border border-neutral-border rounded-full text-text-secondary hover:text-text-primary transition-all focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary font-heading">Transaction History</h2>
            <p className="text-xs text-text-secondary mt-0.5">View, filter, and export all your wallet transaction records.</p>
          </div>
        </div>
        <button 
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 border border-neutral-border hover:bg-neutral-light rounded-btn text-sm font-semibold text-text-secondary hover:text-text-primary transition-all focus:outline-none bg-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filtering Panel */}
      <div className="bg-white border border-neutral-border rounded-card p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-border">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-text-primary font-heading">Search & Filter Ledger</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Keyword Search */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Search Details</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input 
                type="text" 
                placeholder="Reference, name, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-border rounded-btn focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 border border-neutral-border rounded-btn focus:outline-none focus:border-primary text-sm bg-white"
            >
              <option value="">All Types</option>
              <option value="TRANSFER">Transfer</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>

          {/* Transaction Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 border border-neutral-border rounded-btn focus:outline-none focus:border-primary text-sm bg-white"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">From Date</label>
            <div className="relative">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 border border-neutral-border rounded-btn focus:outline-none focus:border-primary text-sm bg-white"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">To Date</label>
            <div className="relative">
              <input 
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 border border-neutral-border rounded-btn focus:outline-none focus:border-primary text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Reset Filters Option */}
        {(type || status || search || startDate || endDate) && (
          <div className="flex justify-end pt-2">
            <button 
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-card flex items-start space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold">Error Loading Ledger</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Ledger Table Section */}
      <div className="bg-white border border-neutral-border rounded-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-light border-b border-neutral-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Reference / Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Direction / Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Description / Counterparty</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border text-sm">
              {loading ? (
                // Skeleton Rows
                Array.from({ length: size }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-neutral-border rounded w-28 mb-2"></div>
                      <div className="h-3 bg-neutral-border rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-neutral-border rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-neutral-border rounded w-40 mb-2"></div>
                      <div className="h-3 bg-neutral-border rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-neutral-border rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-neutral-border rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-text-secondary font-medium bg-neutral-light/10">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="h-12 w-12 bg-neutral-border/40 rounded-full flex items-center justify-center mx-auto text-text-secondary">
                        <Search className="h-6 w-6" />
                      </div>
                      <p className="text-base text-text-primary font-bold">No Transactions Found</p>
                      <p className="text-xs">We couldn't find any transaction matches. Try modifying your filter conditions or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const outgoing = isOutgoing(tx);
                  const isSuccess = tx.status === 'SUCCESS';
                  const isFailed = tx.status === 'FAILED';
                  
                  // Detail labels
                  let counterparty = '';
                  let detailsLabel = '';

                  if (tx.transactionType === 'DEPOSIT') {
                    detailsLabel = 'Fund Deposit';
                    counterparty = tx.sourceWalletOwnerName || 'System';
                  } else if (tx.transactionType === 'TRANSFER') {
                    if (outgoing) {
                      detailsLabel = 'Transfer to';
                      counterparty = tx.targetWalletOwnerName;
                    } else {
                      detailsLabel = 'Transfer from';
                      counterparty = tx.sourceWalletOwnerName;
                    }
                  } else {
                    detailsLabel = tx.transactionType;
                    counterparty = outgoing ? tx.targetWalletOwnerName : tx.sourceWalletOwnerName;
                  }

                  return (
                    <tr 
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-neutral-light/40 cursor-pointer transition-colors"
                    >
                      {/* Ref & Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-text-primary block bg-neutral-light px-2 py-0.5 rounded w-max mb-1">
                          {tx.reference.slice(0, 8)}...
                        </span>
                        <span className="text-xs text-text-secondary">
                          {new Date(tx.createdAt).toLocaleString('en-NG')}
                        </span>
                      </td>

                      {/* Direction / Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`p-1.5 rounded-full ${
                            outgoing 
                              ? 'bg-red-50 text-red-600' 
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {outgoing ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                          </span>
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            tx.transactionType === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            tx.transactionType === 'TRANSFER' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                            'bg-gray-50 text-gray-700 border border-gray-100'
                          }`}>
                            {tx.transactionType}
                          </span>
                        </div>
                      </td>

                      {/* Description & Counterparty */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary">
                          {detailsLabel} <span className="text-primary font-bold">{counterparty}</span>
                        </div>
                        <div className="text-xs text-text-secondary truncate max-w-[240px] mt-0.5">
                          {tx.description || 'No description provided'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isSuccess ? 'bg-green-50 text-success' :
                          isFailed ? 'bg-red-50 text-red-600' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {isSuccess && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {isFailed && <AlertCircle className="h-3.5 w-3.5" />}
                          {!isSuccess && !isFailed && <Clock className="h-3.5 w-3.5 animate-pulse" />}
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-base">
                        <span className={outgoing ? 'text-text-primary' : 'text-success'}>
                          {outgoing ? '-' : '+'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && totalElements > 0 && (
          <div className="px-6 py-4 border-t border-neutral-border bg-neutral-light/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Elements count */}
            <div className="text-xs text-text-secondary font-medium">
              Showing <span className="font-semibold text-text-primary">{page * size + 1}</span> to{' '}
              <span className="font-semibold text-text-primary">
                {Math.min((page + 1) * size, totalElements)}
              </span>{' '}
              of <span className="font-semibold text-text-primary">{totalElements}</span> entries
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-text-secondary">Rows per page:</span>
                <select
                  value={size}
                  onChange={(e) => { setSize(parseInt(e.target.value)); setPage(0); }}
                  className="px-2 py-1 border border-neutral-border rounded-btn text-xs bg-white focus:outline-none focus:border-primary font-semibold text-text-primary"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                  className="p-1.5 border border-neutral-border hover:bg-neutral-light disabled:opacity-40 rounded-btn text-text-secondary hover:text-text-primary focus:outline-none transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-xs text-text-secondary font-medium px-2">
                  Page <span className="font-semibold text-text-primary">{page + 1}</span> of{' '}
                  <span className="font-semibold text-text-primary">{totalPages}</span>
                </div>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 border border-neutral-border hover:bg-neutral-light disabled:opacity-40 rounded-btn text-text-secondary hover:text-text-primary focus:outline-none transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details / Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-border rounded-card shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:my-0">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-border bg-neutral-light print:hidden">
              <h3 className="font-bold text-text-primary font-heading">Transaction Details</h3>
              <button 
                onClick={() => setSelectedTx(null)}
                className="p-1 hover:bg-neutral-border rounded-full text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Receipt Modal Body */}
            <div>
              {/* Status Banner */}
              <div className={`p-6 text-white text-center relative ${
                selectedTx.status === 'SUCCESS' ? 'bg-gradient-to-br from-accent to-accent-light' :
                selectedTx.status === 'FAILED' ? 'bg-gradient-to-br from-red-600 to-red-500' :
                'bg-gradient-to-br from-yellow-600 to-yellow-500'
              }`}>
                <div className="mx-auto w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  {selectedTx.status === 'SUCCESS' ? <CheckCircle2 className="h-8 w-8 text-white" /> :
                   selectedTx.status === 'FAILED' ? <AlertCircle className="h-8 w-8 text-white" /> :
                   <Clock className="h-8 w-8 text-white animate-pulse" />}
                </div>
                <h2 className="text-xl font-bold font-heading">
                  Transaction {selectedTx.status === 'SUCCESS' ? 'Successful' : selectedTx.status === 'FAILED' ? 'Failed' : 'Pending'}
                </h2>
                <p className="text-xs text-gray-300 mt-1">SkyleBank Official Receipt</p>
              </div>

              {/* Receipt Information Details */}
              <div className="p-6 space-y-6">
                <div className="text-center pb-4 border-b border-neutral-border">
                  <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Transaction Amount</span>
                  <div className="text-3xl font-bold text-text-primary mt-1 font-heading">
                    {formatCurrency(selectedTx.amount)}
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  {/* Type */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Transaction Type</span>
                    <span className="font-semibold text-text-primary uppercase">{selectedTx.transactionType}</span>
                  </div>

                  {/* Sender Name */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Sender Name</span>
                    <span className="font-semibold text-text-primary">{selectedTx.sourceWalletOwnerName}</span>
                  </div>

                  {/* Sender Account */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Sender Account (NUBAN)</span>
                    <span className="font-mono font-semibold text-text-primary">
                      {selectedTx.sourceWalletNumber !== 'N/A' 
                        ? selectedTx.sourceWalletNumber.slice(0, 3) + ' ' + selectedTx.sourceWalletNumber.slice(3, 6) + ' ' + selectedTx.sourceWalletNumber.slice(6)
                        : 'System Account'
                      }
                    </span>
                  </div>

                  {/* Recipient Name */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Recipient Name</span>
                    <span className="font-semibold text-text-primary">{selectedTx.targetWalletOwnerName}</span>
                  </div>

                  {/* Recipient Account */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Recipient Account (NUBAN)</span>
                    <span className="font-mono font-semibold text-text-primary">
                      {selectedTx.targetWalletNumber.slice(0, 3) + ' ' + selectedTx.targetWalletNumber.slice(3, 6) + ' ' + selectedTx.targetWalletNumber.slice(6)}
                    </span>
                  </div>

                  {/* Reference Code */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Reference Code</span>
                    <div className="flex items-center space-x-2 print:hidden">
                      <span className="font-mono text-xs font-semibold text-text-primary bg-neutral-light px-2 py-0.5 rounded">
                        {selectedTx.reference}
                      </span>
                      <button 
                        onClick={() => handleCopyReference(selectedTx.reference)}
                        className="p-1 hover:bg-neutral-light rounded text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                      >
                        {copiedRef ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    {/* Mono plain reference code for printing */}
                    <span className="hidden print:inline font-mono text-xs font-semibold text-text-primary">
                      {selectedTx.reference}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Date & Time</span>
                    <span className="text-text-primary font-medium">
                      {new Date(selectedTx.createdAt).toLocaleString('en-NG')}
                    </span>
                  </div>

                  {/* Memo */}
                  <div className="flex justify-between items-start py-1">
                    <span className="text-text-secondary">Description / Note</span>
                    <span className="text-text-primary max-w-[200px] text-right break-words font-medium italic">
                      {selectedTx.description || 'N/A'}
                    </span>
                  </div>

                  {/* Fee */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary">Transaction Fee</span>
                    <span className="text-success font-semibold">₦0.00 (Free)</span>
                  </div>
                </div>

                {/* Print & Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-border print:hidden">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 border border-neutral-border hover:border-text-secondary rounded-btn text-sm font-semibold text-text-secondary hover:text-text-primary transition-all focus:outline-none bg-white"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Receipt</span>
                  </button>
                  <button 
                    onClick={() => setSelectedTx(null)}
                    className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-btn text-sm font-semibold transition-all focus:outline-none shadow-sm hover:shadow-md text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
