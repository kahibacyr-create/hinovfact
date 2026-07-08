import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Key, User, ArrowRight, Download, Smartphone, Monitor, X, Info } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    role: 'admin' | 'director'; 
    avatarUrl: string; 
  }) => void;
  appName?: string;
  appLogo?: string;
}

export default function LoginScreen({ 
  onLogin,
  appName = 'Hinov Factures',
  appLogo = '/logo.jpeg'
}: LoginScreenProps) {
  const [email, setEmail] = useState('jm.hinov@hinov-factures.com');
  const [password, setPassword] = useState('director2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showPwaGuide, setShowPwaGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already running in standalone (PWA) mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: show the guide for cross-platform/sandbox installation
      setShowPwaGuide(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs requis.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      
      // 1. Check if Admin
      if (cleanEmail === 'admin@hinov-factures.com' && password === 'admin2026') {
        onLogin({
          firstName: 'Admin',
          lastName: 'Hinov',
          email: cleanEmail,
          role: 'admin',
          avatarUrl: ''
        });
        return;
      }

      // 2. Check if Director in localStorage
      const stored = localStorage.getItem('hinov_directors');
      const directors = stored ? JSON.parse(stored) : [
        {
          email: 'jm.hinov@hinov-factures.com',
          firstName: 'Jean-Marc',
          lastName: 'Hinov',
          password: 'director2026',
          avatarUrl: '',
          status: 'active'
        }
      ];

      const director = directors.find((d: any) => d.email.toLowerCase() === cleanEmail);

      if (director) {
        if (director.status === 'pending') {
          setError('Votre compte est en attente de configuration. Veuillez utiliser le lien fourni par l’administrateur.');
          setLoading(false);
        } else if (director.password === password) {
          onLogin({
            firstName: director.firstName,
            lastName: director.lastName,
            email: director.email,
            role: 'director',
            avatarUrl: director.avatarUrl || ''
          });
        } else {
          setError('Mot de passe incorrect.');
          setLoading(false);
        }
      } else {
        setError('Identifiants incorrects ou compte inexistant.');
        setLoading(false);
      }
    }, 1000);
  };  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Abstract glowing background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Elegant Header or Floating installation pill */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Installer l'App (PWA)</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-white border border-slate-100 rounded-2xl items-center justify-center shadow-md mb-4 overflow-hidden shrink-0">
            <img src={appLogo} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{appName}</h2>
          <p className="text-[#00488d] text-xs font-bold uppercase tracking-widest mt-1">Espace de Pilotage Décisionnel</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 font-medium leading-relaxed">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
              Adresse professionnelle
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="directeur@hinov-factures.com"
                className="w-full h-12 bg-slate-50/70 border border-slate-200 focus:border-[#00488d] focus:bg-white rounded-xl pl-11 pr-4 text-slate-900 text-sm placeholder-slate-400 focus:ring-1 focus:ring-[#00488d] transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Mot de passe
              </label>
              <a href="#reset" className="text-xs text-[#00488d] hover:underline font-bold">
                Oublié ?
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••••••"
                className="w-full h-12 bg-slate-50/70 border border-slate-200 focus:border-[#00488d] focus:bg-white rounded-xl pl-11 pr-4 text-slate-900 text-sm placeholder-slate-400 focus:ring-1 focus:ring-[#00488d] transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#00488d] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#003c75] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-blue-900/10 cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Dynamic PWA Action inline button for high visibility */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full h-11 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="text-xs">Installer sur cet appareil (PWA)</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <span className="text-slate-400 text-xs">
            Accès crypté et sécurisé.
          </span>
          <div className="mt-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-left space-y-2">
            <p className="text-[11px] font-bold text-[#00488d] uppercase tracking-wider flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
              🔑 Comptes de Démonstration :
            </p>
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <p><span className="font-semibold text-slate-800">Administrateur :</span> admin@hinov-factures.com</p>
              <p><span className="font-semibold text-slate-800">Mot de passe :</span> admin2026</p>
            </div>
            <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 space-y-0.5">
              <p><span className="font-semibold text-slate-800">Directeur Général :</span> jm.hinov@hinov-factures.com</p>
              <p><span className="font-semibold text-slate-800">Mot de passe :</span> director2026</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* PWA Instruction modal/dialog */}
      <AnimatePresence>
        {showPwaGuide && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowPwaGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <div className="inline-flex w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Installer l'application</h3>
                <p className="text-xs text-slate-500">Pour une expérience optimale sur grand écran ou mobile comme une application native :</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Safari iOS */}
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">iOS & iPadOS (Safari)</h4>
                    <p className="text-slate-500 mt-1">Appuyez sur le bouton <strong>Partager</strong> <span className="text-blue-600 font-bold">⎋</span> puis choisissez <strong>Sur l'écran d'accueil</strong>.</p>
                  </div>
                </div>

                {/* Google Chrome Desktop / Mobile */}
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Chrome, Edge ou Firefox</h4>
                    <p className="text-slate-500 mt-1">Cliquez sur l'icône d'installation dans la barre d'adresse, ou ouvrez le menu puis sélectionnez <strong>Installer l'application</strong>.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-blue-50/50 p-3.5 border border-blue-100/40 rounded-xl">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>La PWA fonctionne hors-ligne et démarre instantanément en plein écran.</span>
              </div>

              <button
                onClick={() => setShowPwaGuide(false)}
                className="w-full h-11 bg-[#00488d] hover:bg-[#003c75] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Compris
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

