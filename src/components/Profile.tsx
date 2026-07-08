import React, { useState, useRef } from 'react';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  RefreshCw, 
  Moon, 
  Sun, 
  Lock, 
  FileText,
  AlertOctagon,
  CheckCircle,
  Camera,
  Upload,
  Trash2,
  LogOut
} from 'lucide-react';

interface ProfileProps {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    password?: string;
    avatarUrl?: string;
    role?: string;
  };
  onUpdateUser: (updatedUser: any) => void;
  onResetData: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onTriggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  isDevMode: boolean;
  setIsDevMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onLogout?: () => void;
}

export default function Profile({
  user,
  onUpdateUser,
  onResetData,
  darkMode,
  setDarkMode,
  onTriggerNotification,
  isDevMode,
  setIsDevMode,
  onLogout
}: ProfileProps) {
  // Input fields
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState(user.password || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [phone, setPhone] = useState('+33 1 23 45 67 89');
  
  // Extra options
  const [enable2FA, setEnable2FA] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      onTriggerNotification('Veuillez renseigner un prénom, un nom et un email.', 'error');
      return;
    }
    
    const updatedUser = {
      ...user,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      avatarUrl
    };

    onUpdateUser(updatedUser);
    setSavedSuccess(true);
    onTriggerNotification('Modifications de profil enregistrées avec succès !', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
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

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onTriggerNotification("Veuillez sélectionner un fichier image.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
        onTriggerNotification("Photo de profil chargée !", "success");
      }
    };
    reader.readAsDataURL(file);
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

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    onTriggerNotification("Photo de profil retirée.", "info");
  };

  const handle2FAToggle = () => {
    const nextVal = !enable2FA;
    setEnable2FA(nextVal);
    onTriggerNotification(
      nextVal ? 'Double Facteur (2FA) activé avec succès par SMS.' : 'Double Facteur (2FA) désactivé.',
      nextVal ? 'success' : 'info'
    );
  };

  const handleThemeChange = (dark: boolean) => {
    setDarkMode(dark);
    onTriggerNotification(
      `Thème visuel basculé en mode ${dark ? 'Sombre' : 'Clair'}.`,
      'info'
    );
  };

  const handleResetDatabase = () => {
    if (confirm('Êtes-vous certain de vouloir réinitialiser toutes les données de l’application ? Toutes vos factures et paiements personnalisés seront effacés et remplacés par les données de démonstration du cahier des charges.')) {
      onResetData();
      onTriggerNotification('La base de données locale a été réinitialisée avec succès !', 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Paramètres du Compte</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Ajustez vos préférences système, profils utilisateurs et sécurité financière.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Profile Settings */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4">
              {user.role === 'admin' ? 'Coordonnées de l’Administrateur' : 'Coordonnées du Directeur'}
            </h3>
            
            {savedSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Les informations de votre profil ont été mises à jour.</span>
              </div>
            )}

            {/* Profile Picture Uploader */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Aperçu" 
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-3xl border border-blue-200 dark:border-blue-900 shadow-sm uppercase">
                    {(firstName[0] || user.email[0] || 'U')}{(lastName[0] || '')}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-transform active:scale-90"
                  title="Modifier la photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-500/5' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Faites glisser votre photo ici, ou <span className="text-blue-600 dark:text-blue-400">parcourez</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG jusqu'à 2 Mo</p>
              </div>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold shrink-0 self-center"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Prénom */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block pl-1">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean-Marc"
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Nom */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block pl-1">Nom de famille</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Hinov"
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block pl-1">Adresse email</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jm.hinov@hinov-factures.com"
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block pl-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Telephone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block pl-1">Téléphone mobile sécurisé</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Role Display */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block pl-1">Niveau d'accréditation</label>
                <div className="w-full h-11 px-4 bg-slate-100 dark:bg-slate-800/40 border border-transparent rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00488d] dark:text-blue-400" />
                  <span>
                    {user.role === 'admin' ? 'Administrateur Général' : 'Directeur Général & Fondateur'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="bg-[#00488d] hover:bg-[#005fb8] text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
              >
                Enregistrer le profil
              </button>
            </div>
          </form>

          {/* Local database synchronization control */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4">Mode Hors-Ligne & Synchronisation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              L'application Hinov Factures fonctionne par défaut sur un moteur <strong>Offline-First</strong>. Toutes vos opérations et encaissements de factures sont stockés localement sur votre terminal et synchronisés dès qu'un réseau actif est détecté.
            </p>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Synchronisation locale active</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Dernière mise à jour : il y a quelques secondes</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => onTriggerNotification('Forçage de synchronisation réussi ! 0 facture en attente.', 'success')}
                className="w-full sm:w-auto bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Forcer la synchronisation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Options and Theme controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Visual theme cards */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Préférences d'Affichage</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Mode Sombre (Dark Theme)</span>
              <div className="flex items-center bg-[#f1f4fa] dark:bg-slate-800 p-1 rounded-full">
                <button 
                  type="button"
                  onClick={() => handleThemeChange(false)}
                  className={`p-1.5 rounded-full transition-all ${!darkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  title="Activer mode clair"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => handleThemeChange(true)}
                  className={`p-1.5 rounded-full transition-all ${darkMode ? 'bg-slate-700 text-yellow-400 shadow-sm' : 'text-slate-500'}`}
                  title="Activer mode sombre"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Secure 2FA toggle card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Sécurité de l'App</h4>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-800 dark:text-slate-200 font-extrabold block">Double Authentification (2FA)</span>
                <span className="text-[10px] text-slate-400 block leading-tight">SMS requis pour valider les suppressions de factures</span>
              </div>
              <button 
                type="button"
                onClick={handle2FAToggle}
                className={`w-11 h-6 rounded-full transition-all relative ${enable2FA ? 'bg-[#00488d]' : 'bg-slate-200'}`}
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 transition-all ${enable2FA ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Mode Développeur Toggle Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Outils de Développement</h4>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-800 dark:text-slate-200 font-extrabold block">Mode Développeur</span>
                <span className="text-[10px] text-slate-400 block leading-tight">Activer la console de débogage et le simulateur réseau</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  const nextVal = !isDevMode;
                  setIsDevMode(nextVal);
                  onTriggerNotification(
                    nextVal ? 'Mode Développeur activé ! Un badge de contrôle apparaît.' : 'Mode Développeur désactivé.',
                    nextVal ? 'success' : 'info'
                  );
                }}
                className={`w-11 h-6 rounded-full transition-all relative ${isDevMode ? 'bg-[#00488d]' : 'bg-slate-200'}`}
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 transition-all ${isDevMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Active Session Management with explicit Logout */}
          {onLogout && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Session Active</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                Vous êtes connecté en tant que <strong>{user.firstName || 'Directeur'}</strong>. Vous pouvez fermer votre session de pilotage en toute sécurité à tout moment.
              </p>
              <button 
                type="button"
                onClick={onLogout}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-rose-50/20 border border-rose-500/10 p-6 rounded-[24px] space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-rose-600 flex items-center gap-1.5"><AlertOctagon className="w-4 h-4 shrink-0" /> Zone de Danger</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              La réinitialisation supprimera toutes les factures et paiements personnalisés que vous avez saisis. Votre base repassera aux valeurs de démonstration standard.
            </p>
            <button 
              type="button"
              onClick={handleResetDatabase}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Réinitialiser l'application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
