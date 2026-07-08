import React, { useState, useRef } from 'react';
import { 
  UserPlus, 
  Copy, 
  Check, 
  Trash2, 
  ShieldAlert, 
  Activity, 
  CheckCircle, 
  Clock, 
  LogOut,
  Mail,
  User,
  Compass,
  AlertCircle,
  Settings,
  Upload,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { Director } from '../types';

interface AdminDashboardProps {
  directors: Director[];
  onAddDirector: (email: string) => { link: string; token: string };
  onDeleteDirector: (email: string) => void;
  onLogout: () => void;
  onTriggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  appName: string;
  appLogo: string;
  onUpdateAppSettings: (name: string, logo: string) => void;
}

export default function AdminDashboard({
  directors,
  onAddDirector,
  onDeleteDirector,
  onLogout,
  onTriggerNotification,
  appName,
  appLogo,
  onUpdateAppSettings
}: AdminDashboardProps) {
  const [newEmail, setNewEmail] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [generatedLinkInfo, setGeneratedLinkInfo] = useState<{ email: string; link: string } | null>(null);

  // Application Settings States
  const [tempAppName, setTempAppName] = useState(appName);
  const [tempLogo, setTempLogo] = useState(appLogo);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to process image file upload and compression
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onTriggerNotification("Veuillez sélectionner un fichier image valide (PNG, JPG, etc.).", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256; // Max width for local storage optimization
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setTempLogo(compressedBase64);
          onTriggerNotification("Nouveau logo chargé et optimisé avec succès !", "success");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempAppName.trim()) {
      onTriggerNotification("Le nom de l'application ne peut pas être vide.", "error");
      return;
    }
    onUpdateAppSettings(tempAppName.trim(), tempLogo);
    onTriggerNotification("L'identité visuelle de l'application a été mise à jour !", "success");
  };

  const handleResetSettings = () => {
    if (window.confirm("Voulez-vous réinitialiser le nom et le logo par défaut ?")) {
      setTempAppName("Hinov Factures");
      setTempLogo("/logo.jpeg");
      onUpdateAppSettings("Hinov Factures", "/logo.jpeg");
      onTriggerNotification("Identité de l'application réinitialisée !", "info");
    }
  };

  const handleCreateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) {
      onTriggerNotification("Veuillez saisir un email valide.", "error");
      return;
    }
    
    // Check if duplicate
    if (directors.some(d => d.email.toLowerCase() === cleanEmail)) {
      onTriggerNotification("Ce directeur possède déjà un compte ou une invitation active.", "error");
      return;
    }

    const { link } = onAddDirector(cleanEmail);
    setGeneratedLinkInfo({ email: cleanEmail, link });
    setNewEmail('');
    onTriggerNotification(`Invitation créée avec succès pour ${cleanEmail} !`, "success");
  };

  const handleCopyLink = (email: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedEmail(email);
    onTriggerNotification("Lien de configuration copié dans le presse-papiers !", "success");
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleDelete = (email: string) => {
    if (email === 'jm.hinov@hinov-factures.com') {
      onTriggerNotification("Impossible de supprimer le compte directeur de démonstration racine.", "error");
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer le compte ou l’invitation du directeur ${email} ?`)) {
      onDeleteDirector(email);
      onTriggerNotification("Compte directeur révoqué et supprimé.", "info");
      if (generatedLinkInfo && generatedLinkInfo.email === email) {
        setGeneratedLinkInfo(null);
      }
    }
  };

  // Metrics
  const totalDirectors = directors.length;
  const activeDirectors = directors.filter(d => d.status === 'active').length;
  const pendingDirectors = directors.filter(d => d.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f7f9ff] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Admin Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            <img src={appLogo} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">{appName.split(' ')[0] || appName} ADM_PORTAL</h1>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Console d'administration globale</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="h-10 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-2 font-bold text-xs transition-all active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Fermer la session</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8 flex-1">
        
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Supervision des Directeurs</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Créez des invitations sécurisées et gérez les droits d'accès des Directeurs Généraux Hinov.</p>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Comptes</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalDirectors}</h3>
            </div>
            <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold">
              ★
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Actifs</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeDirectors}</h3>
            </div>
            <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              ✓
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">En Attente</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{pendingDirectors}</h3>
            </div>
            <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-bold">
              ⌛
            </div>
          </div>
        </div>

        {/* Content Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Creation Form: Left */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800/40 space-y-6">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Créer un compte Directeur</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Renseignez l'adresse de courrier professionnel du futur Directeur. Un lien unique et hautement sécurisé sera produit pour lui permettre de définir son mot de passe.
              </p>

              <form onSubmit={handleCreateInvitation} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email du Directeur</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="nom.prenom@hinov-factures.com"
                      className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-11 pr-4 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Générer l'Invitation</span>
                </button>
              </form>

              {/* Display generated invitation Link block */}
              {generatedLinkInfo && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl space-y-3.5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span className="text-xs font-bold">Lien généré pour l'utilisateur</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Transmettez le lien d'accès confidentiel suivant au Directeur. Il pourra ainsi configurer ses coordonnées et mot de passe de direction.
                  </p>

                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850">
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedLinkInfo.link} 
                      className="flex-1 bg-transparent border-none text-[10px] text-slate-600 dark:text-slate-300 font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink(generatedLinkInfo.email, generatedLinkInfo.link)}
                      className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                      title="Copier le lien"
                    >
                      {copiedEmail === generatedLinkInfo.email ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Directory: Right */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800/40 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Annuaire des Directeurs</h3>
                </div>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
                  {directors.length} Actif(s) & Invité(s)
                </span>
              </div>

              {/* Custom list of directors */}
              <div className="space-y-4">
                {directors.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">Aucun directeur invité pour le moment.</p>
                  </div>
                ) : (
                  directors.map((director) => {
                    const setupLink = `${window.location.origin}?setup_token=${director.setupToken}&email=${encodeURIComponent(director.email)}`;
                    return (
                      <div 
                        key={director.email} 
                        className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          {director.avatarUrl ? (
                            <img 
                              src={director.avatarUrl} 
                              alt="Profil" 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                              {(director.firstName?.[0] || director.email[0] || 'U')}{(director.lastName?.[0] || '')}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                              {director.status === 'active' 
                                ? `${director.firstName} ${director.lastName}` 
                                : 'Directeur Invité'}
                              <span className="text-[9px] text-slate-400 font-normal">({director.email})</span>
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                director.status === 'active' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                              }`}>
                                {director.status === 'active' ? (
                                  <>
                                    <CheckCircle className="w-2.5 h-2.5" />
                                    <span>Actif</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>En attente</span>
                                  </>
                                )}
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold font-mono uppercase tracking-wider">Compte Directeur</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {director.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(director.email, setupLink)}
                              className="h-8 px-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-1.5 font-bold text-[10px] transition-colors"
                              title="Copier le lien confidentiel"
                            >
                              {copiedEmail === director.email ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copié</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copier Lien</span>
                                </>
                              )}
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => handleDelete(director.email)}
                            disabled={director.email === 'jm.hinov@hinov-factures.com'}
                            className="p-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-rose-200/40 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            title="Rétrograder ou révoquer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NEW SECTION: Visual Identity Configuration */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800/40 space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Identité Visuelle & Marque Blanche</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Configurez le nom de l'application ainsi que l'icône de marque blanche qui s'affichera sur l'ensemble des écrans (Splash, Connexion, Menu latéral et Tableau de bord). Les modifications sont stockées localement de manière persistante.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Form: App Name */}
              <div className="md:col-span-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Nom personnalisé de l'application</label>
                  <input 
                    type="text" 
                    required
                    value={tempAppName}
                    onChange={(e) => setTempAppName(e.target.value)}
                    placeholder="ex: Hinov Factures"
                    className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aperçu en direct</h4>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 max-w-xs">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 dark:border-slate-800/40 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={tempLogo} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-black text-slate-800 dark:text-white truncate">{tempAppName}</span>
                  </div>
                </div>
              </div>

              {/* Right Form: Logo Zone */}
              <div className="md:col-span-6 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Nouveau Logo / Icône</label>
                
                <div className="flex items-center gap-4">
                  {/* Current Preview */}
                  <div className="w-20 h-20 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shrink-0 shadow-inner flex items-center justify-center relative group">
                    <img src={tempLogo} alt="Aperçu logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>

                  {/* Drop zone container */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`flex-1 h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Upload className="w-5 h-5 mb-1 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Glisser-déposer ou cliquer</span>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">JPEG ou PNG (redimensionné en 256x256)</span>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button"
                onClick={handleResetSettings}
                className="h-10 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-xl flex items-center gap-2 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Réinitialiser</span>
              </button>
              
              <button 
                type="submit"
                className="h-10 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          </form>
        </div>

        {/* Audit Logs Trail: Bottom */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldAlert className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Registre d'activités administrative</h4>
          </div>
          <div className="space-y-2.5 max-h-40 overflow-y-auto font-mono text-[10px] text-slate-400 leading-relaxed">
            <div>[SEC_AUDIT] {new Date().toISOString().split('T')[0]} 16:30:00 - Connexion de l'Administrateur Général.</div>
            <div>[SEC_AUDIT] Compte Directeur racine 'jm.hinov@hinov-factures.com' vérifié actif.</div>
            {directors.filter(d => d.status === 'pending').map(d => (
              <div key={d.email}>[SEC_AUDIT] Création d'un lien d'invitation pour le compte directeur : {d.email}</div>
            ))}
            {directors.filter(d => d.status === 'active' && d.email !== 'jm.hinov@hinov-factures.com').map(d => (
              <div key={d.email}>[SEC_AUDIT] Le directeur {d.email} a finalisé sa configuration d'authentification.</div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
