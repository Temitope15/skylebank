import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Info,
  User,
  X,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { walletService } from '../../services/walletService';
import { transferService } from '../../services/transferService';
import { kycService } from '../../services/kycService';
import type { UserProfileResponse } from '../../services/kycService';
import type { TransferResponse } from '../../services/transferService';

export default function Transfer() {
  const navigate = useNavigate();
  
  // Account/balance details
  const [balance, setBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  
  // Form fields
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  
  // Recipient verification state
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [verifyingRecipient, setVerifyingRecipient] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  
  // UX states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processingTransfer, setProcessingTransfer] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferReceipt, setTransferReceipt] = useState<TransferResponse | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Anomaly Warning States
  const [showAnomalyWarning, setShowAnomalyWarning] = useState(false);
  const [anomalyMessage, setAnomalyMessage] = useState('');
  const [trustConfirmed, setTrustConfirmed] = useState(false);

  const fetchProfileAndBalance = async () => {
    try {
      setLoadingBalance(true);
      const balanceData = await walletService.getWalletBalance();
      setBalance(balanceData.balance);
      
      const profileData = await kycService.getUserProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to initialize transfer screen:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchProfileAndBalance();
  }, []);

  // Trigger lookup when account number is exactly 10 digits
  useEffect(() => {
    if (accountNumber.length === 10) {
      verifyRecipient(accountNumber);
    } else {
      setRecipientName(null);
      setRecipientError(null);
    }
  }, [accountNumber]);

  const verifyRecipient = async (nuban: string) => {
    try {
      setVerifyingRecipient(true);
      setRecipientError(null);
      setRecipientName(null);
      const data = await walletService.lookupRecipient(nuban);
      setRecipientName(data.fullName);
    } catch (err: any) {
      setRecipientError(err.response?.data?.message || 'Recipient not found');
    } finally {
      setVerifyingRecipient(false);
    }
  };

  // Get daily limit based on user KYC tier
  const getDailyLimit = () => {
    if (!profile) return 500000;
    if (profile.kycLevel === 'TIER_1') return 500000;
    if (profile.kycLevel === 'TIER_2') return 1000000;
    return Infinity; // Tier 3
  };

  const dailyLimit = getDailyLimit();

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName) return;
    setTransferError(null);
    setPin('');
    setShowConfirmModal(true);
  };

  const executeTransfer = async (overrideTrust = false) => {
    try {
      setProcessingTransfer(true);
      setTransferError(null);
      
      const payload = {
        targetWalletNumber: accountNumber,
        amount: parseFloat(amount),
        description: description || 'Transfer from SkyleBank',
        pin,
        trustConfirmed: overrideTrust || trustConfirmed
      };

      const result = await transferService.executeTransfer(payload);
      setTransferReceipt(result);
      setShowConfirmModal(false);
      setShowAnomalyWarning(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'An unexpected error occurred during the transfer.';
      
      if (errMsg.includes('ANOMALY_WARNING')) {
        const cleanedMsg = errMsg.replace('ANOMALY_WARNING:', '').trim();
        setAnomalyMessage(cleanedMsg);
        setShowConfirmModal(false);
        setShowAnomalyWarning(true);
      } else {
        setTransferError(errMsg);
      }
    } finally {
      setProcessingTransfer(false);
    }
  };

  const handleAnomalyProceed = () => {
    setTrustConfirmed(true);
    executeTransfer(true);
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
    if (val === Infinity) return 'Unlimited';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(val);
  };

  // Basic validation rules
  const enteredAmount = parseFloat(amount) || 0;
  const isAmountValid = enteredAmount >= 10 && enteredAmount <= balance;
  const isLimitExceeded = enteredAmount > dailyLimit;
  const hasPinConfigured = profile?.hasTransactionPin;
  const canSubmit = accountNumber.length === 10 && recipientName !== null && isAmountValid && !isLimitExceeded && !verifyingRecipient && hasPinConfigured;

  if (transferReceipt) {
    return (
      <div className="max-w-md mx-auto py-4 animate-in zoom-in duration-300">
        <div className="bg-white border border-neutral-border rounded-card shadow-lg overflow-hidden print:border-none print:shadow-none">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-accent to-accent-light p-6 text-white text-center relative">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-bold font-heading">Transfer Successful</h2>
            <p className="text-sm text-gray-300 mt-1">Your funds have been sent</p>
          </div>

          {/* Receipt Body */}
          <div className="p-6 space-y-6">
            <div className="text-center pb-4 border-b border-neutral-border">
              <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Amount Transferred</span>
              <div className="text-3xl font-bold text-text-primary mt-1 font-heading">
                {formatCurrency(transferReceipt.amount)}
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Recipient Name</span>
                <span className="font-semibold text-text-primary">{recipientName}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Recipient Account</span>
                <span className="font-mono font-semibold text-text-primary">
                  {accountNumber.slice(0, 3) + ' ' + accountNumber.slice(3, 6) + ' ' + accountNumber.slice(6)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Source Account</span>
                <span className="font-mono font-semibold text-text-primary">
                  {transferReceipt.sourceWalletNumber.slice(0, 3) + ' ' + transferReceipt.sourceWalletNumber.slice(3, 6) + ' ' + transferReceipt.sourceWalletNumber.slice(6)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Reference Code</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-semibold text-text-primary bg-neutral-light px-2 py-0.5 rounded">
                    {transferReceipt.reference}
                  </span>
                  <button 
                    onClick={() => handleCopyReference(transferReceipt.reference)}
                    className="p-1 hover:bg-neutral-light rounded text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {copiedRef ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Date & Time</span>
                <span className="text-text-primary">
                  {new Date(transferReceipt.createdAt).toLocaleString('en-NG')}
                </span>
              </div>
              <div className="flex justify-between items-start py-1">
                <span className="text-text-secondary">Description</span>
                <span className="text-text-primary max-w-[200px] text-right break-words font-medium">
                  {transferReceipt.description}
                </span>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-border print:hidden">
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 border border-neutral-border hover:border-text-secondary rounded-btn text-sm font-semibold text-text-secondary hover:text-text-primary transition-all focus:outline-none"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-btn text-sm font-semibold transition-all focus:outline-none shadow-sm hover:shadow-md"
              >
                Go Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back Header */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 bg-white hover:bg-neutral-light border border-neutral-border rounded-full text-text-secondary hover:text-text-primary transition-all focus:outline-none"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-heading">Send Money</h2>
          <p className="text-xs text-text-secondary mt-0.5">Transfer funds to other SkyleBank accounts instantly.</p>
        </div>
      </div>

      {/* Available Balance Header Panel */}
      <div className="bg-white border border-neutral-border rounded-card p-5 shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs text-text-secondary font-medium">Available Balance</span>
          <h3 className="text-2xl font-bold text-text-primary mt-1 font-heading">
            {loadingBalance ? '₦ •••,•••.••' : formatCurrency(balance)}
          </h3>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            NGN Wallet
          </span>
        </div>
      </div>

      {/* PIN Alert setup notice */}
      {profile && !profile.hasTransactionPin && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-card flex items-start space-x-4 animate-in slide-in-from-top-2 duration-300">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-amber-900 text-sm">Transaction PIN Required</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              For security, you must configure a 4-digit Transaction PIN before sending funds.
            </p>
            <button
              onClick={() => navigate('/security')}
              className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
            >
              <span>Setup PIN in Settings</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Transfer Form */}
      <div className="bg-white border border-neutral-border rounded-card shadow-sm p-6">
        {transferError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-card flex items-start space-x-3 text-sm">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold">Transfer Failed</h4>
              <p className="mt-0.5">{transferError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleTransferSubmit} className="space-y-6">
          {/* Recipient Account Number */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary font-heading flex items-center justify-between">
              <span>Recipient Account Number (NUBAN)</span>
              <span className="text-[10px] text-text-secondary font-normal font-sans">10 Digits</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                maxLength={10}
                placeholder="e.g. 1010000023"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                disabled={!hasPinConfigured}
                className="w-full pl-4 pr-12 py-3 border border-neutral-border rounded-btn focus:outline-none focus:border-primary font-mono text-lg tracking-wider disabled:bg-neutral-light disabled:cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {verifyingRecipient && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
                {!verifyingRecipient && recipientName && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
              </div>
            </div>
            
            {/* Recipient Name Verification Badging */}
            {recipientName && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-btn flex items-center space-x-2 text-success text-sm font-semibold animate-in slide-in-from-top-1 duration-200">
                <User className="h-4 w-4" />
                <span>Verified: {recipientName}</span>
              </div>
            )}
            {recipientError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-btn flex items-center space-x-2 text-red-600 text-sm font-semibold animate-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4" />
                <span>{recipientError}</span>
              </div>
            )}
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary font-heading">
              Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-text-secondary">₦</span>
              <input 
                type="number" 
                step="0.01"
                min="10"
                placeholder="Min 10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!hasPinConfigured}
                className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-btn focus:outline-none focus:border-primary font-semibold text-lg disabled:bg-neutral-light disabled:cursor-not-allowed"
              />
            </div>
            {isLimitExceeded && (
              <div className="flex items-center space-x-2 text-red-600 text-xs mt-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Amount exceeds your active daily transfer limit of {formatCurrency(dailyLimit)}.</span>
              </div>
            )}
            {!isLimitExceeded && enteredAmount > balance && (
              <div className="flex items-center space-x-2 text-red-600 text-xs mt-1 font-medium">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Amount exceeds your available balance.</span>
              </div>
            )}
          </div>

          {/* Memo / Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary font-heading">
              Add a note (Optional)
            </label>
            <div className="relative">
              <textarea 
                placeholder="What is this transfer for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!hasPinConfigured}
                maxLength={150}
                rows={2}
                className="w-full px-4 py-3 border border-neutral-border rounded-btn focus:outline-none focus:border-primary text-sm resize-none disabled:bg-neutral-light disabled:cursor-not-allowed"
              />
              <span className="absolute right-3 bottom-2 text-[10px] text-text-secondary">
                {description.length}/150
              </span>
            </div>
          </div>

          {/* Informational Panel */}
          <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-btn flex items-start space-x-3 text-xs text-text-secondary">
            <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-text-primary">Instant Transfer Guarantee</p>
              <p>Transactions between SkyleBank accounts are processed in real-time. Please double-check recipient details; once confirmed, transfers are final.</p>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-btn font-bold font-heading text-sm transition-all focus:outline-none flex items-center justify-center space-x-2 ${
              canSubmit 
                ? 'bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg' 
                : 'bg-neutral-border text-text-secondary/50 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Review & Send</span>
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-border rounded-card shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-border bg-neutral-light">
              <h3 className="font-bold text-text-primary font-heading">Confirm Transfer</h3>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="p-1 hover:bg-neutral-border rounded-full text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="text-center">
                <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Sending</span>
                <div className="text-3xl font-bold text-text-primary mt-1 font-heading">
                  {formatCurrency(parseFloat(amount))}
                </div>
              </div>

              <div className="space-y-3 text-sm pb-4 border-b border-neutral-border">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-text-secondary">To Recipient</span>
                  <span className="font-semibold text-text-primary">{recipientName}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-text-secondary">Account Number</span>
                  <span className="font-mono text-text-primary">
                    {accountNumber.slice(0, 3) + ' ' + accountNumber.slice(3, 6) + ' ' + accountNumber.slice(6)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-text-secondary">Fee</span>
                  <span className="text-success font-semibold">₦0.00 (Free)</span>
                </div>
              </div>

              {/* PIN INPUT REQUIREMENT */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">
                  Enter 4-Digit Transaction PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-neutral-light border border-neutral-border rounded-xl font-mono text-center text-lg tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-neutral-light border-t border-neutral-border grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                disabled={processingTransfer}
                className="py-2.5 border border-neutral-border hover:border-text-secondary rounded-btn text-xs font-semibold text-text-secondary hover:text-text-primary transition-all focus:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeTransfer(false)}
                disabled={processingTransfer || pin.length !== 4}
                className="py-2.5 bg-primary hover:bg-primary-dark disabled:bg-neutral-border disabled:text-text-secondary/50 text-white rounded-btn text-xs font-semibold transition-all focus:outline-none flex items-center justify-center space-x-1.5 shadow-sm"
              >
                {processingTransfer ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Send Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust Anomaly Confirmation Warning Modal */}
      {showAnomalyWarning && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-border rounded-card shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-dark">Security Alert</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {anomalyMessage || 'You are about to transfer a large sum of money. Please confirm you initiated this transfer.'}
              </p>
            </div>
            <div className="px-6 py-4 bg-neutral-light border-t border-neutral-border grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setShowAnomalyWarning(false);
                  setPin('');
                }}
                disabled={processingTransfer}
                className="py-2.5 border border-neutral-border hover:border-text-secondary rounded-btn text-xs font-semibold text-text-secondary hover:text-text-primary transition-all focus:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={handleAnomalyProceed}
                disabled={processingTransfer}
                className="py-2.5 bg-primary hover:bg-primary-dark text-white rounded-btn text-xs font-semibold transition-all focus:outline-none flex items-center justify-center space-x-1.5 shadow-sm"
              >
                {processingTransfer ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <span>Yes, Proceed</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
