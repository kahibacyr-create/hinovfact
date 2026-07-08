import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Director } from '../types';

interface AdminDashboardProps {
  directors: Director[];
  onAddDirector: (email: string) => { link: string; token: string };
  onDeleteDirector: (email: string) => void;
  onLogout: () => void;
  onTriggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function AdminDashboard({
  directors,
  onAddDirector,
  onDeleteDirector,
  onLogout,
  onTriggerNotification
}: AdminDashboardProps) {
  const [newEmail, setNewEmail] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [generatedLinkInfo, setGeneratedLinkInfo] = useState<{ email: string; link: string } | null>(null);

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
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">HINOV ADM_PORTAL</h1>
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
