import React, { useState, useEffect } from 'react';
import { kycService } from '../../services/kycService';
import type { UserProfileResponse } from '../../services/kycService';

export default function Security() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await kycService.getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load security profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setMessage({ type: 'error', text: 'New PIN must be exactly 4 digits' });
      return;
    }

    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: 'New PIN and Confirmation PIN do not match' });
      return;
    }

    if (profile?.hasTransactionPin && (!oldPin || oldPin.length !== 4)) {
      setMessage({ type: 'error', text: 'Please enter your current 4-digit transaction PIN' });
      return;
    }

    setIsSubmitting(false);
    setIsSubmitting(true);
    try {
      await kycService.setupPin(newPin, oldPin || undefined);
      setMessage({ type: 'success', text: 'Transaction PIN has been updated successfully.' });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      await fetchProfile();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to update transaction PIN. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-neutral-dark">Security Settings</h2>
        <p className="text-text-secondary text-sm">Manage your security options and configure authorization controls.</p>
      </div>

      <div className="p-8 bg-white border border-neutral-border rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
        <div className="flex items-start space-x-4 mb-6">
          <div className="p-3 bg-primary-light rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-dark">4-Digit Transaction PIN</h3>
            <p className="text-text-secondary text-xs mt-1">
              {profile?.hasTransactionPin
                ? 'Your transaction PIN is currently active. Use the form below to change it.'
                : 'Configure a transaction PIN to authorize payouts and transfers.'}
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-xl border flex items-center space-x-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {profile?.hasTransactionPin && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Current PIN</label>
              <input
                type="password"
                maxLength={4}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-4 py-3 bg-neutral-light border border-neutral-border rounded-xl font-mono text-center text-lg tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">New 4-Digit PIN</label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 bg-neutral-light border border-neutral-border rounded-xl font-mono text-center text-lg tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Confirm New PIN</label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 bg-neutral-light border border-neutral-border rounded-xl font-mono text-center text-lg tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Saving updates...</span>
              </>
            ) : (
              <span>Save Transaction PIN</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
