import React, { useState, useEffect } from 'react';
import { kycService } from '../../services/kycService';
import type { UserProfileResponse } from '../../services/kycService';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tier 2 states
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);

  // Tier 3 states
  const [documentType, setDocumentType] = useState('Utility Bill');
  const [documentName, setDocumentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [pendingRequestTier, setPendingRequestTier] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await kycService.getUserProfile();
      setProfile(data);
      
      // Check if user has a pending upgrade request
      const pendingRequests = await kycService.getPendingRequests();
      // Since admin can see all, let's look if there is any pending request matching this user
      const userPending = pendingRequests.find(req => req.user.email === data.email && req.status === 'PENDING');
      if (userPending) {
        setHasPendingRequest(true);
        setPendingRequestTier(userPending.targetTier);
      } else {
        setHasPendingRequest(false);
        setPendingRequestTier(null);
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateIdentityVerify = (e: React.MouseEvent) => {
    e.preventDefault();
    if (bvn.length !== 11 || nin.length !== 11) {
      setMessage({ type: 'error', text: 'BVN and NIN must be exactly 11 digits' });
      return;
    }
    
    setMessage(null);
    setIsVerifyingIdentity(true);
    
    setTimeout(() => {
      setIsVerifyingIdentity(false);
      setVerifiedName(`${profile?.firstName} ${profile?.lastName}`);
      setMessage({ type: 'success', text: 'Identity successfully queried from NimC & NIBSS databases.' });
    }, 2000);
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setDocumentName(file.name);
      }, 1500);
    }
  };

  const handleSubmitUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (profile?.kycLevel === 'TIER_1') {
        if (!bvn || !nin || !verifiedName) {
          throw new Error('Please perform database lookup verification first');
        }
        await kycService.submitUpgrade({
          targetTier: 'TIER_2',
          bvn,
          nin
        });
      } else if (profile?.kycLevel === 'TIER_2') {
        if (!documentName) {
          throw new Error('Please upload your proof of address document');
        }
        await kycService.submitUpgrade({
          targetTier: 'TIER_3',
          documentUrl: `https://skylebank-s3.s3.amazonaws.com/uploads/${profile.id}_proof_of_address.pdf`
        });
      }
      
      setMessage({ type: 'success', text: 'Upgrade application submitted successfully for administrator approval.' });
      setBvn('');
      setNin('');
      setVerifiedName(null);
      setDocumentName('');
      await loadData();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to submit upgrade. Please try again.';
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

  const getTierDetails = (level: string) => {
    switch (level) {
      case 'TIER_1':
        return {
          title: 'Tier 1 (Base)',
          sendLimit: '₦500,000.00 / day',
          receiveLimit: '₦5,000,000.00 max balance',
          color: 'border-amber-200 bg-amber-50 text-amber-800'
        };
      case 'TIER_2':
        return {
          title: 'Tier 2 (Silver)',
          sendLimit: '₦1,000,000.00 / day',
          receiveLimit: '₦10,000,000.00 max balance',
          color: 'border-slate-200 bg-slate-50 text-slate-800'
        };
      case 'TIER_3':
        return {
          title: 'Tier 3 (Gold)',
          sendLimit: 'Unlimited',
          receiveLimit: 'Unlimited',
          color: 'border-emerald-200 bg-emerald-50 text-emerald-800'
        };
      default:
        return { title: 'Unknown', sendLimit: 'N/A', receiveLimit: 'N/A', color: '' };
    }
  };

  const activeTier = getTierDetails(profile?.kycLevel || 'TIER_1');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-heading text-neutral-dark">My Profile</h2>
        <p className="text-text-secondary text-sm">Review your account verification status, personal info, and transactional limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: General Profile Card */}
        <div className="p-6 bg-white border border-neutral-border rounded-2xl shadow-sm h-fit space-y-6">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-primary/10 text-primary font-bold text-2xl rounded-full flex items-center justify-center mx-auto">
              {profile?.firstName[0]}{profile?.lastName[0]}
            </div>
            <h3 className="text-lg font-bold text-neutral-dark">{profile?.firstName} {profile?.lastName}</h3>
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${activeTier.color}`}>
              {activeTier.title}
            </span>
          </div>

          <div className="border-t border-neutral-border pt-4 space-y-3 text-sm">
            <div>
              <span className="text-text-secondary block text-xs font-semibold uppercase tracking-wider mb-0.5">Email Address</span>
              <span className="font-medium text-neutral-dark">{profile?.email}</span>
            </div>
            <div>
              <span className="text-text-secondary block text-xs font-semibold uppercase tracking-wider mb-0.5">Phone Number</span>
              <span className="font-medium text-neutral-dark">{profile?.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Right Side: KYC Upgrade / Info Panels */}
        <div className="md:col-span-2 space-y-6">
          {/* Current Limits Status */}
          <div className="p-6 bg-white border border-neutral-border rounded-2xl shadow-sm grid grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-light rounded-xl">
              <span className="text-text-secondary text-xs font-semibold uppercase block mb-1">Daily Sending Limit</span>
              <span className="text-lg font-bold text-neutral-dark">{activeTier.sendLimit}</span>
            </div>
            <div className="p-4 bg-neutral-light rounded-xl">
              <span className="text-text-secondary text-xs font-semibold uppercase block mb-1">Wallet Receive Limit</span>
              <span className="text-lg font-bold text-neutral-dark">{activeTier.receiveLimit}</span>
            </div>
          </div>

          {/* Upgrade Card / Pending status */}
          <div className="p-8 bg-white border border-neutral-border rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
            
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

            {hasPendingRequest ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-200 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-neutral-dark">Verification Review Pending</h4>
                <p className="text-text-secondary text-sm max-w-md mx-auto">
                  Your request to upgrade to <span className="font-semibold text-primary">{pendingRequestTier}</span> has been logged. Our risk compliance team is currently reviewing your details.
                </p>
              </div>
            ) : profile?.kycLevel === 'TIER_1' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-dark">Upgrade to Tier 2 (Silver)</h3>
                  <p className="text-text-secondary text-xs mt-1">Unlock a ₦1,000,000.00 daily transfer limit and ₦10,000,000.00 balance maximum by verifying identity.</p>
                </div>

                <form onSubmit={handleSubmitUpgrade} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Bank Verification Number (BVN)</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={bvn}
                        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                        placeholder="222********"
                        disabled={!!verifiedName}
                        className="w-full px-4 py-3 bg-neutral-light border border-neutral-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition disabled:opacity-60"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">National Identification Number (NIN)</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={nin}
                        onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                        placeholder="102********"
                        disabled={!!verifiedName}
                        className="w-full px-4 py-3 bg-neutral-light border border-neutral-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition disabled:opacity-60"
                        required
                      />
                    </div>
                  </div>

                  {!verifiedName ? (
                    <button
                      type="button"
                      onClick={handleSimulateIdentityVerify}
                      disabled={isVerifyingIdentity || bvn.length !== 11 || nin.length !== 11}
                      className="w-full py-3.5 bg-neutral-dark hover:bg-neutral-dark/95 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isVerifyingIdentity ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Querying compliance registries...</span>
                        </>
                      ) : (
                        <span>Lookup Database Credentials</span>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-sm text-emerald-800">
                        <span>Identity Registry Match: <strong className="font-semibold">{verifiedName}</strong></span>
                        <button type="button" onClick={() => setVerifiedName(null)} className="text-xs underline font-semibold hover:text-emerald-950">Change</button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>Submitting review...</span>
                          </>
                        ) : (
                          <span>Submit Upgrade Request</span>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            ) : profile?.kycLevel === 'TIER_2' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-dark">Upgrade to Tier 3 (Gold)</h3>
                  <p className="text-text-secondary text-xs mt-1">Acquire Unlimited transactional capacities. Requires submission of Address Verification credentials.</p>
                </div>

                <form onSubmit={handleSubmitUpgrade} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Document Type</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-light border border-neutral-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    >
                      <option value="Utility Bill">Utility Bill (Electricity, Water, Gas)</option>
                      <option value="Bank Statement">Recent Bank Statement</option>
                      <option value="Tax Certificate">Government Tax Assessment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Upload Proof of Address Document</label>
                    <div className="border-2 border-dashed border-neutral-border hover:border-primary rounded-xl p-6 flex flex-col items-center justify-center bg-neutral-light/50 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleSimulateUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {isUploading ? (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                          <span className="text-xs text-text-secondary">Parsing document metadata...</span>
                        </div>
                      ) : documentName ? (
                        <div className="flex flex-col items-center space-y-2 text-center">
                          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-emerald-800">{documentName}</span>
                          <span className="text-[10px] text-text-secondary">Click or drop to replace file</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2 text-center text-text-secondary">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-neutral-dark/40">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                          </svg>
                          <span className="text-xs font-semibold">Click to upload document</span>
                          <span className="text-[10px]">PDF, PNG, JPG up to 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !documentName}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Uploading credentials...</span>
                      </>
                    ) : (
                      <span>Submit Address Verification</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-neutral-dark">Verification Fully Completed</h4>
                <p className="text-text-secondary text-sm max-w-md mx-auto">
                  Your identity files have been approved. You are operating at the highest capability level.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
