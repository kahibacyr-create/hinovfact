import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Award,
  ChevronRight,
  ArrowLeft,
  Briefcase,
  X
} from 'lucide-react';
import { Client, Facture } from '../types';

interface ClientsListProps {
  clients: Client[];
  factures: Facture[];
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onViewInvoice: (id: string) => void;
  onTriggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function ClientsList({
  clients,
  factures,
  onAddClient,
  onViewInvoice,
  onTriggerNotification
}: ClientsListProps) {
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Add Client Form Toggle
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // 1. Calculations: client totals
  const clientFinancials = useMemo<Record<string, { totalFacture: number; totalPaye: number; reste: number; count: number }>>(() => {
    const map: Record<string, { totalFacture: number; totalPaye: number; reste: number; count: number }> = {};
    
    // Initialize for all clients
    clients.forEach(c => {
      map[c.id] = { totalFacture: 0, totalPaye: 0, reste: 0, count: 0 };
    });

    // Populate from invoices
    factures.forEach(f => {
      if (map[f.client_id]) {
        map[f.client_id].totalFacture += f.montant;
        map[f.client_id].totalPaye += f.montant_paye;
        map[f.client_id].reste += f.reste;
        map[f.client_id].count += 1;
      }
    });

    return map;
  }, [clients, factures]);

  // Top stats:
  const topStats = useMemo(() => {
    let maxBilling = 0;
    let topClientName = 'N/A';
    let totalOutstanding = 0;

    Object.keys(clientFinancials).forEach((id) => {
      const stats = clientFinancials[id];
      totalOutstanding += stats.reste;
      if (stats.totalFacture > maxBilling) {
        maxBilling = stats.totalFacture;
        const cl = clients.find(c => c.id === id);
        if (cl) topClientName = cl.nom;
      }
    });

    return {
      topClient: topClientName,
      maxBilling: maxBilling,
      totalOutstanding: totalOutstanding,
      activeCount: clients.length
    };
  }, [clients, clientFinancials]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchName = c.nom.toLowerCase().includes(search.toLowerCase());
      const matchEmail = c.email.toLowerCase().includes(search.toLowerCase());
      return matchName || matchEmail;
    });
  }, [clients, search]);

  // Selected client ledger details
  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  const selectedClientInvoices = useMemo(() => {
    if (!selectedClientId) return [];
    return factures.filter(f => f.client_id === selectedClientId);
  }, [factures, selectedClientId]);

  // Handle create client
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      alert('Veuillez remplir le nom et l’adresse email du client.');
      return;
    }

    onAddClient({
      nom: clientName,
      telephone: clientPhone || '+33 6 00 00 00 00',
      email: clientEmail
    });

    onTriggerNotification(`Nouveau client "${clientName}" créé avec succès !`, 'success');

    // Reset Form
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Bento Metric Cards */}
      {!selectedClientId && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Répertoire des Clients</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Consultez l'historique et les encours par portefeuille de clients.</p>
            </div>
            
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#00488d] hover:bg-[#005fb8] text-white py-2 px-5 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau client</span>
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Clients */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 flex items-center gap-4 transition-transform hover:scale-[1.01]">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 text-[#00488d] dark:text-blue-400 rounded-2xl">
                <Users className="w-6 h-6 stroke-[2.3px]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Clients Actifs</span>
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 block mt-0.5">{topStats.activeCount} Portefeuilles</span>
              </div>
            </div>

            {/* Top Client billing */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 flex items-center gap-4 transition-transform hover:scale-[1.01]">
              <div className="p-3.5 bg-[#ccedae]/30 text-emerald-800 dark:text-emerald-400 rounded-2xl">
                <Award className="w-6 h-6 stroke-[2.3px]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Compte Majeur (CA)</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 block mt-0.5 truncate">{topStats.topClient}</span>
                <span className="text-xs text-slate-400 font-semibold">{topStats.maxBilling.toLocaleString('fr-FR')} € Facturé</span>
              </div>
            </div>

            {/* Total client encours */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 flex items-center gap-4 transition-transform hover:scale-[1.01]">
              <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                <DollarSign className="w-6 h-6 stroke-[2.3px]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Créance Client Globale</span>
                <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 block mt-0.5 font-mono">{topStats.totalOutstanding.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Client Form Mode - Modal Overlay */}
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
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Créer une Fiche Client</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Saisissez les informations essentielles pour enregistrer un nouveau portefeuille client.</p>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block pl-1">Raison Sociale / Nom</label>
                    <input 
                      type="text" 
                      required
                      value={clientName} 
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: NeoSphere Technologies" 
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block pl-1">Téléphone de contact</label>
                    <input 
                      type="text" 
                      value={clientPhone} 
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ex: +33 6 12 34 56 78" 
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block pl-1">Adresse email de facturation</label>
                    <input 
                      type="email" 
                      required
                      value={clientEmail} 
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Ex: billing@neosphere.tech" 
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition-all font-medium"
                    />
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
                    Enregistrer le client
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Panel splitting list & details */}
      {!selectedClientId ? (
        <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800/60 overflow-hidden">
          {/* Header search bar */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un client par nom ou email..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* List of Clients Grid or Table */}
          <div className="hidden md:block overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-[#f1f4fa]/40 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-800">
                <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Portefeuille Client</th>
                  <th className="px-6 py-4">Coordonnées de contact</th>
                  <th className="px-6 py-4 text-center">Factures émises</th>
                  <th className="px-6 py-4 text-right">Total Facturé</th>
                  <th className="px-6 py-4 text-right">Total Payé</th>
                  <th className="px-6 py-4 text-right text-rose-600 dark:text-rose-400">Reste Dû</th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredClients.map((c) => {
                  const fin = clientFinancials[c.id] || { totalFacture: 0, totalPaye: 0, reste: 0, count: 0 };
                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedClientId(c.id)}
                      className="hover:bg-[#f1f4fa]/20 dark:hover:bg-slate-800/10 transition-colors cursor-pointer group"
                    >
                      {/* Name of corporate */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 dark:bg-blue-500/10 text-[#00488d] dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                            {c.nom.slice(0, 2)}
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#00488d] dark:group-hover:text-blue-400 transition-colors">
                            {c.nom}
                          </span>
                        </div>
                      </td>

                      {/* Info & contacts */}
                      <td className="px-6 py-4 text-xs font-medium space-y-1 text-slate-500 dark:text-slate-400">
                        <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {c.email}</p>
                        <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {c.telephone}</p>
                      </td>

                      {/* Number of invoices */}
                      <td className="px-6 py-4 text-sm font-extrabold text-center text-slate-700 dark:text-slate-300">
                        {fin.count}
                      </td>

                      {/* Total invoiced */}
                      <td className="px-6 py-4 text-sm font-black text-right text-slate-800 dark:text-slate-100">
                        {fin.totalFacture.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>

                      {/* Total paid */}
                      <td className="px-6 py-4 text-sm font-bold text-right text-emerald-600 dark:text-emerald-400">
                        {fin.totalPaye.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>

                      {/* Outstanding remaining */}
                      <td className={`px-6 py-4 text-sm font-black text-right ${fin.reste > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {fin.reste.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>

                      {/* Details navigation link */}
                      <td className="px-6 py-4 text-center">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile directory list */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredClients.map((c) => {
              const fin = clientFinancials[c.id] || { totalFacture: 0, totalPaye: 0, reste: 0, count: 0 };
              return (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedClientId(c.id)}
                  className="p-4.5 space-y-3.5 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 dark:bg-blue-500/10 text-[#00488d] dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {c.nom.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block truncate">{c.nom}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block truncate">{c.email}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 dark:border-slate-800/40 pt-2.5">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Factures</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{fin.count}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Facturé</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{fin.totalFacture.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-rose-400 block text-[9px] font-bold uppercase tracking-wider">Reste dû</span>
                      <span className={`font-black ${fin.reste > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>{fin.reste.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Selected Client Detailed Card / Historical Ledger (Fiche Client) */
        <div className="space-y-6">
          {/* Back Operations Header */}
          <button 
            onClick={() => setSelectedClientId(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00488d] dark:text-blue-400 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour à l'annuaire des clients</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client summary Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
              <div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">FICHE DU PORT_FEUILLE</span>
                <h3 className="text-xl font-extrabold text-[#00488d] dark:text-blue-400 mt-1">{selectedClient?.nom}</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold">{selectedClient?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold">{selectedClient?.telephone}</span>
                </div>
              </div>

              {/* Accounting details summary */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Total facturé :</span>
                  <span className="text-slate-800 dark:text-slate-100">{(clientFinancials[selectedClientId] || { totalFacture: 0 }).totalFacture.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Total payé :</span>
                  <span className="text-emerald-600 font-bold">{(clientFinancials[selectedClientId] || { totalPaye: 0 }).totalPaye.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-xs font-extrabold">
                  <span className="text-slate-500">Solde restant dû :</span>
                  <span className="text-rose-600">{(clientFinancials[selectedClientId] || { reste: 0 }).reste.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </div>

              {/* Invoices associated Ledger history list */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Registre des transactions de ce client</h4>
                </div>

                <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f1f4fa]/40 dark:bg-slate-800/10 border-b border-slate-200 dark:border-slate-800">
                    <tr className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Facture</th>
                      <th className="py-3 px-4">Date de livraison</th>
                      <th className="py-3 px-4 text-right">Montant</th>
                      <th className="py-3 px-4 text-right">Reste dû</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {selectedClientInvoices.length > 0 ? (
                      selectedClientInvoices.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-4 font-mono text-xs font-bold text-[#00488d] dark:text-blue-400">
                            {f.numero}
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                            {new Date(f.date_livraison).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-right text-slate-800 dark:text-slate-100 font-mono">
                            {f.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className={`py-4 px-4 text-xs font-black text-right font-mono ${f.reste > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {f.reste.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="py-4 px-4">
                            {f.statut === 'Payée' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                                Soldée
                              </span>
                            ) : f.statut === 'En retard' ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider">
                                Retard
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                                Attente
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button 
                              onClick={() => onViewInvoice(f.id)}
                              className="text-xs font-bold text-blue-500 hover:underline"
                            >
                              Fiche
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          Aucune facture n'a été émise pour ce client à ce jour.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile transaction list */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/40">
                {selectedClientInvoices.length > 0 ? (
                  selectedClientInvoices.map((f) => (
                    <div key={f.id} className="p-4 space-y-2.5 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#00488d] dark:text-blue-400 block">{f.numero}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">Livré le {new Date(f.date_livraison).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {f.statut === 'Payée' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                            Soldée
                          </span>
                        ) : f.statut === 'En retard' ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-rose-500/10 text-red-800 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider">
                            Retard
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                            Attente
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Montant</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{f.montant.toLocaleString('fr-FR')} €</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 dark:text-rose-400 block text-[9px] font-bold uppercase tracking-wider">Reste dû</span>
                          <span className={`font-black ${f.reste > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>{f.reste.toLocaleString('fr-FR')} €</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => onViewInvoice(f.id)}
                          className="text-xs font-bold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#00488d] border border-slate-200 dark:border-slate-700 rounded-xl"
                        >
                          Voir la facture
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    Aucune facture n'a été émise pour ce client à ce jour.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
