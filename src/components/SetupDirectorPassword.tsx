import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Key, User, Upload, Camera, Trash2, ShieldCheck, ArrowRight, Compass } from 'lucide-react';

interface SetupDirectorPasswordProps {
  email: string;
  token: string;
  onCompleteSetup: (firstName: string, lastName: string, password: string, avatarUrl: string) => void;
  onTriggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function SetupDirectorPassword({
  email,
  token,
  onCompleteSetup,
  onTriggerNotification
}: SetupDirectorPasswordProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onTriggerNotification("Veuillez sélectionner un fichier image.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
        onTriggerNotification("Photo de profil prête !", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !password) {
      onTriggerNotification("Veuillez remplir tous les champs requis.", "error");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      onCompleteSetup(firstName, lastName, password, avatarUrl);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background visual blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6"
      >
        <div className="text-center">
          <div className="inline-flex w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl items-center justify-center shadow-lg mb-4">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Finaliser votre Compte</h2>
          <p className="text-slate-400 text-xs mt-1">Espace Directeur Général — Configuration de sécurité</p>
        </div>

        <div className="bg-blue-950/40 border border-blue-500/20 p-4 rounded-xl space-y-1">
          <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Invitation validée</p>
          <p className="text-xs text-slate-300 font-semibold break-all">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Picture Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Photo de Profil (Optionnelle)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Aperçu" 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border border-slate-600 shadow"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-semibold text-lg border border-slate-600 uppercase">
                    {(firstName[0] || '?')}{(lastName[0] || '')}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-500/5' 
                    : 'border-slate-600 hover:border-slate-500 bg-slate-900/30'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Upload className="w-4 h-4 text-slate-500 mb-1" />
                <span className="text-[10px] font-semibold text-slate-300">Glissez ou cliquez pour charger</span>
                <span className="text-[9px] text-slate-500">Max 2 Mo</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prénom */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block pl-1">
                Prénom *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean-Marc"
                  className="w-full h-11 bg-slate-950/50 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block pl-1">
                Nom *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Hinov"
                  className="w-full h-11 bg-slate-950/50 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block pl-1">
              Définir votre Mot de passe *
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 bg-slate-950/50 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/15"
          >
            {loading ? 'Configuration en cours...' : 'Activer mon Compte Directeur'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-700/40 text-center">
          <p className="text-[10px] text-slate-500 leading-tight">
            En activant ce compte, vous certifiez être habilité(e) à piloter la trésorerie et la facturation pour Hinov SAS.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
