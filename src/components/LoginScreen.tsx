import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Key, User, ArrowRight, Download } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

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
      setError('');
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
      // Fallback message when clicked in iframe or unsupported browser/platform
      setError("Le navigateur ne détecte pas de demande d'installation automatique. Si l'application est déjà installée, ouvrez-la directement. Sinon, ouvrez ce site hors d'un cadre (iframe) ou utilisez l'option d'installation de votre navigateur (Chrome, Edge, Safari...).");
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
                placeholder="votre@email.com"
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
        </div>
      </motion.div>

    </div>
  );
}

