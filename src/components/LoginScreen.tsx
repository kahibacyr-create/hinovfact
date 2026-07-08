import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Receipt, ShieldAlert, Key, User, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    role: 'admin' | 'director'; 
    avatarUrl: string; 
  }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('jm.hinov@hinov-factures.com');
  const [password, setPassword] = useState('director2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Abstract glowing background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <Receipt className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Hinov Factures</h2>
          <p className="text-slate-400 text-sm mt-1">Espace de Pilotage Décisionnel</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-400 font-medium leading-relaxed">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Adresse professionnelle
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="directeur@hinov-factures.com"
                className="w-full h-12 bg-slate-950/50 border border-slate-700 focus:border-blue-500 rounded-xl pl-11 pr-4 text-white text-sm placeholder-slate-600 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mot de passe
              </label>
              <a href="#reset" className="text-xs text-blue-500 hover:underline font-medium">
                Oublié ?
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••••••"
                className="w-full h-12 bg-slate-950/50 border border-slate-700 focus:border-blue-500 rounded-xl pl-11 pr-4 text-white text-sm placeholder-slate-600 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/15"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/40 text-center">
          <span className="text-slate-500 text-xs">
            Accès crypté et sécurisé.
          </span>
          <div className="mt-3 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 text-left space-y-2">
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              🔑 Comptes de Démonstration :
            </p>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p><span className="font-semibold text-slate-300">Administrateur :</span> admin@hinov-factures.com</p>
              <p><span className="font-semibold text-slate-300">Mot de passe :</span> admin2026</p>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-700/50 pt-1.5 space-y-0.5">
              <p><span className="font-semibold text-slate-300">Directeur Général :</span> jm.hinov@hinov-factures.com</p>
              <p><span className="font-semibold text-slate-300">Mot de passe :</span> director2026</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
