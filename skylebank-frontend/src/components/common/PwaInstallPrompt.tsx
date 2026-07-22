import React, { useState, useEffect } from 'react';
import { Download, X, Share, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [justInstalled, setJustInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Permanently hide if already marked as installed
    const isAlreadyInstalled = localStorage.getItem('skylebank_pwa_installed') === 'true';
    if (isAlreadyInstalled) {
      return;
    }

    // 2. Permanently hide if currently running inside the installed PWA window/standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      localStorage.setItem('skylebank_pwa_installed', 'true');
      return;
    }

    // 3. Temporarily hide if dismissed in the last 7 days
    const lastDismissed = localStorage.getItem('skylebank_pwa_prompt_dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        return;
      }
    }

    // 4. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isIosDevice) {
      setIsIos(true);
      setShowPrompt(true);
      return;
    }

    // 5. Listen for Android / Chrome / Desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // 6. Listen for instant installation completion
    const handleAppInstalled = () => {
      localStorage.setItem('skylebank_pwa_installed', 'true');
      setJustInstalled(true);
      setTimeout(() => setShowPrompt(false), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      localStorage.setItem('skylebank_pwa_installed', 'true');
      setJustInstalled(true);
      setTimeout(() => setShowPrompt(false), 3000);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('skylebank_pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:max-w-sm z-50 animate-bounce-in">
      <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl shadow-2xl shadow-cyan-950/50 flex flex-col gap-3">
        {justInstalled ? (
          <div className="flex items-center gap-3 py-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-100 text-sm">App Installed!</h4>
              <p className="text-xs text-slate-400">SkyleBank is ready on your home screen.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 text-sm">Install SkyleBank App</h4>
                  <p className="text-xs text-slate-400">Add to your home screen for fast mobile banking.</p>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIos ? (
              <div className="bg-slate-800/80 rounded-xl p-2.5 text-xs text-slate-300 flex items-center gap-2">
                <Share className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Tap the <strong>Share</strong> button and select <strong>Add to Home Screen</strong>.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-md shadow-cyan-500/20 text-center"
                >
                  Install App
                </button>
                <button
                  onClick={handleDismiss}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-2 px-3 rounded-xl transition-colors"
                >
                  Not Now
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
