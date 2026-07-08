import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserSquare2, 
  Plus, 
  TrendingUp, 
  Coins, 
  Award, 
  UserPlus, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Target,
  X
} from 'lucide-react';
import { Commercial, Facture } from '../types';

interface CommerciauxListProps {
  commerciaux: Commercial[];
  factures: Facture[];
  onAddCommercial: (commercial: Omit<Commercial, 'id'>) => void;
  onTriggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function CommerciauxList({
  commerciaux,
  factures,
  onAddCommercial,
  onTriggerNotification
}: CommerciauxListProps) {
  const [search, setSearch] = useState('');
  
  // Add Commercial form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [commName, setCommName] = useState('');
  const [commPhone, setCommPhone] = useState('');
  const [commPoste, setCommPoste] = useState('Business Developer');

  // Sales Target constant
  const SALES_TARGET = 50000;

  // 1. Calculations: commercial performance analytics
  const performanceData = useMemo<Record<string, { ca: number; marge: number; primes: number; count: number; avgMargePct: number; }>>(() => {
    const stats: Record<string, { 
      ca: number; 
      marge: number; 
      primes: number; 
      count: number; 
      avgMargePct: number;
    }> = {};

    // Initialize all salespeople
    commerciaux.forEach(co => {
      stats[co.id] = { ca: 0, marge: 0, primes: 0, count: 0, avgMargePct: 0 };
    });

    // Populate from invoices
    factures.forEach(f => {
      if (stats[f.commercial_id]) {
        stats[f.commercial_id].ca += f.montant;
        stats[f.commercial_id].marge += f.marge;
        stats[f.commercial_id].primes += f.prime;
        stats[f.commercial_id].count += 1;
      }
    });

    // Compute average margin percentages
    Object.keys(stats).forEach(id => {
      const s = stats[id];
      s.avgMargePct = s.ca > 0 ? Math.round((s.marge / s.ca) * 100) : 0;
    });

    return stats;
  }, [commerciaux, factures]);

  // Rankings and top analytics
  const rankingSummary = useMemo(() => {
    let topProducerName = 'N/A';
    let topCA = 0;
    let highestMarginPct = 0;
    let highestMarginName = 'N/A';
    let totalCommissions = 0;

    Object.keys(performanceData).forEach((id) => {
      const data = performanceData[id];
      totalCommissions += data.primes;
      if (data.ca > topCA) {
        topCA = data.ca;
        const s = commerciaux.find(co => co.id === id);
        if (s) topProducerName = s.nom;
      }
      if (data.avgMargePct > highestMarginPct && data.count > 0) {
        highestMarginPct = data.avgMargePct;
        const s = commerciaux.find(co => co.id === id);
        if (s) highestMarginName = s.nom;
      }
    });

    return {
      topProducer: topProducerName,
      topCA: topCA,
      highestMarginRate: highestMarginPct,
      highestMarginName: highestMarginName,
      totalComms: totalCommissions
    };
  }, [commerciaux, performanceData]);

  // Search filter
  const filteredCommerciaux = useMemo(() => {
    return commerciaux.filter(co => 
      co.nom.toLowerCase().includes(search.toLowerCase()) ||
      (co.poste && co.poste.toLowerCase().includes(search.toLowerCase()))
    );
  }, [commerciaux, search]);

  // Handle add commercial submit
  const handleAddCommercialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName) {
      alert('Veuillez saisir le nom du commercial.');
      return;
    }

    onAddCommercial({
      nom: commName,
      telephone: commPhone || '+33 6 00 00 00 00',
      poste: commPoste
    });

    onTriggerNotification(`Le commercial "${commName}" a rejoint l'équipe de vente !`, 'success');

    // Reset Form
    setCommName('');
    setCommPhone('');
    setCommPoste('Business Developer');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Operations */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Performances Commerciaux</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Suivez les chiffres d'affaires, les marges dégagées et les primes associées.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#00488d] hover:bg-[#005fb8] text-white py-2 px-5 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un commercial</span>
        </button>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Producer (CA) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 flex items-center gap-4 transition-transform hover:scale-[1.01]">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 text-[#00488d] dark:text-blue-400 rounded-2xl">
            <Award className="w-6 h-6 stroke-[2.3px]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Meilleur Performeur (CA)</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 block mt-0.5 truncate">{rankingSummary.topProducer}</span>
            <span className="text-xs text-slate-400 font-semibold">{rankingSummary.topCA.toLocaleString('fr-FR')} € Générés</span>
          </div>
        </div>

        {/* Highest Margin Rate */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 flex items-center gap-4 transition-transform hover:scale-[1.01]">
          <div className="p-3.5 bg-[#ccedae]/30 text-emerald-800 dark:text-emerald-400 rounded-2xl">
            <TrendingUp className="w-6 h-6 stroke-[2.3px]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Meilleur Taux de Marge</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 block mt-0.5 truncate">{rankingSummary.highestMarginName}</span>
            <span className="text-xs text-slate-400 font-semibold">Taux moyen de {rankingSummary.highestMarginRate}%</span>
          </div>
        </div>

        {/* Total Commissions paid */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 flex items-center gap-4 transition-transform hover:scale-[1.01]">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Coins className="w-6 h-6 stroke-[2.3px]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Commissions & Primes</span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 block mt-0.5 font-mono">{rankingSummary.totalComms.toLocaleString('fr-FR')} €</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block mt-1">Garantie 10% marge</span>
          </div>
        </div>
      </div>

      {/* Add Commercial Form - Modal Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[28px] card-elevation border border-slate-100 dark:border-slate-800 w-full max-w-2xl relative shadow-2xl z-10 space-y-5"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="absolute top-5 right-5 p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Inscrire un Commercial / Vendeur</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Créez le profil d'un membre de l'équipe de vente pour attribuer des objectifs et calculer ses primes.</p>
              </div>

              <form onSubmit={handleAddCommercialSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block pl-1">Nom complet</label>
                    <input 
                      type="text" 
                      required
                      value={commName} 
                      onChange={(e) => setCommName(e.target.value)}
                      placeholder="Ex: Alice Martin" 
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block pl-1 font-sans">N° Téléphone</label>
                    <input 
                      type="text" 
                      value={commPhone} 
                      onChange={(e) => setCommPhone(e.target.value)}
                      placeholder="Ex: +33 6 22 33 44 55" 
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block pl-1">Poste occupé</label>
                    <select 
                      value={commPoste}
                      onChange={(e) => setCommPoste(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition-all font-semibold cursor-pointer"
                    >
                      <option value="Sénior Account Manager">Sénior Account Manager</option>
                      <option value="Account Executive">Account Executive</option>
                      <option value="Business Developer">Business Developer</option>
                      <option value="Sales Consultant">Sales Consultant</option>
                      <option value="Junior Sales Representative">Junior Sales Representative</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="px-5 h-10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 h-10 bg-[#00488d] hover:bg-[#005fb8] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer"
                  >
                    Enregistrer le commercial
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Roster & Ranking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales performance list with progress targets */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800/60 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un vendeur ou un poste..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-[#f1f4fa]/40 dark:bg-slate-800/10 border-b border-slate-200 dark:border-slate-800">
                <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Commercial</th>
                  <th className="px-6 py-4 text-center">Ventes (Nbre)</th>
                  <th className="px-6 py-4 text-right">CA Réalisé</th>
                  <th className="px-6 py-4 text-right">Marge Réalisée</th>
                  <th className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">Primes Acquises</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCommerciaux.map((co) => {
                  const data = performanceData[co.id] || { ca: 0, marge: 0, primes: 0, count: 0, avgMargePct: 0 };
                  
                  // Compute target achievement percentage
                  const achievementPct = Math.min(Math.round((data.ca / SALES_TARGET) * 100), 100);

                  return (
                    <tr key={co.id} className="hover:bg-[#f1f4fa]/10 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{co.nom}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">{co.poste}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-center text-slate-700 dark:text-slate-300">
                        {data.count}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-sans">{data.ca.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                          
                          {/* Achievement scale line */}
                          <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${achievementPct}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-400 font-semibold mt-1">Objectif : {achievementPct}%</span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right text-sm font-bold text-slate-800 dark:text-slate-200">
                        {data.marge.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal mt-0.5">Taux : {data.avgMargePct}%</span>
                      </td>

                      <td className="px-6 py-5 text-right text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {data.primes.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout for commercial performances */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredCommerciaux.map((co) => {
              const data = performanceData[co.id] || { ca: 0, marge: 0, primes: 0, count: 0, avgMargePct: 0 };
              const achievementPct = Math.min(Math.round((data.ca / SALES_TARGET) * 100), 100);

              return (
                <div key={co.id} className="p-4.5 space-y-3 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{co.nom}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">{co.poste}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg">
                      Primes : {data.primes.toLocaleString('fr-FR')} €
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800/40">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">CA Réalisé ({data.count} ventes)</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200 block">{data.ca.toLocaleString('fr-FR')} €</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-850 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${achievementPct}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">Objectif : {achievementPct}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Marge Brut</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200 block">{data.marge.toLocaleString('fr-FR')} €</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Taux : {data.avgMargePct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales leaderboard target guidelines */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Objectifs trimestriels</h4>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Seuil de performance :</span>
                <span className="text-slate-800 dark:text-slate-100 font-mono">50 000,00 €</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Les commerciaux atteignant ce seuil de chiffre d'affaires débloquent un bonus annuel complémentaire de 1.5% sur le volume global de leurs marges.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Taux de marge cible :</span>
                <span className="text-emerald-600 font-bold">25% Minimum</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Le conseil d'administration préconise une marge brute moyenne de 25% sur l'ensemble des contrats de consulting et développement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
