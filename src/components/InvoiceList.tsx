import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  CreditCard,
  Filter
} from 'lucide-react';
import { Facture, Client, Commercial } from '../types';

interface InvoiceListProps {
  factures: Facture[];
  clients: Client[];
  commerciaux: Commercial[];
  onViewInvoice: (id: string) => void;
  onEditInvoice: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
  onCreateInvoice: () => void;
}

export default function InvoiceList({
  factures,
  clients,
  commerciaux,
  onViewInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onCreateInvoice
}: InvoiceListProps) {
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Tous les statuts');
  const [selectedClient, setSelectedClient] = useState('Tous les clients');
  const [selectedCommercial, setSelectedCommercial] = useState('Tous les vendeurs');
  const [selectedPeriod, setSelectedPeriod] = useState('Tout');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Row actions menu dropdown tracker
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Quick filters totals computed dynamically
  const totals = useMemo(() => {
    return {
      payee: factures.filter(f => f.statut === 'Payée').length,
      attente: factures.filter(f => f.statut === 'En attente').length,
      retard: factures.filter(f => f.statut === 'En retard').length
    };
  }, [factures]);

  // Clients options
  const clientOptions = useMemo(() => {
    return Array.from(new Set(clients.map(c => c.nom)));
  }, [clients]);

  // Commercials options
  const commercialOptions = useMemo(() => {
    return Array.from(new Set(commerciaux.map(c => c.nom)));
  }, [commerciaux]);

  // Main filtered factures list
  const filteredFactures = useMemo(() => {
    return factures.filter(f => {
      const client = clients.find(c => c.id === f.client_id);
      const commercial = commerciaux.find(co => co.id === f.commercial_id);
      
      // Text Search matches No Facture, Client Name, Commercial Name
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        f.numero.toLowerCase().includes(searchLower) ||
        (client && client.nom.toLowerCase().includes(searchLower)) ||
        (commercial && commercial.nom.toLowerCase().includes(searchLower));

      // Dropdown Status Filter
      const matchesStatus = 
        selectedStatus === 'Tous les statuts' || 
        f.statut === selectedStatus;

      // Dropdown Client Filter
      const matchesClient = 
        selectedClient === 'Tous les clients' || 
        (client && client.nom === selectedClient);

      // Dropdown Commercial Filter
      const matchesCommercial = 
        selectedCommercial === 'Tous les vendeurs' || 
        (commercial && commercial.nom === selectedCommercial);

      // Dropdown Period Filter
      let matchesPeriod = true;
      if (selectedPeriod === 'Ce mois-ci') {
        matchesPeriod = f.date_livraison.startsWith('2026-07') || f.date_livraison.startsWith('2026-06');
      } else if (selectedPeriod === 'Cette année') {
        matchesPeriod = f.date_livraison.startsWith('2026');
      }

      return matchesSearch && matchesStatus && matchesClient && matchesCommercial && matchesPeriod;
    });
  }, [factures, clients, commerciaux, search, selectedStatus, selectedClient, selectedCommercial, selectedPeriod]);

  // Paginated list
  const paginatedFactures = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFactures.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFactures, currentPage]);

  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage) || 1;

  // Toggle quick selection filters directly by tapping counts
  const handleQuickFilterSelect = (status: 'Payée' | 'En attente' | 'En retard') => {
    if (selectedStatus === status) {
      setSelectedStatus('Tous les statuts');
    } else {
      setSelectedStatus(status);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Liste des Factures</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gérez et suivez l'état de vos règlements clients en temps réel.</p>
        </div>
        
        {/* Quick Clickable Filter Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => handleQuickFilterSelect('Payée')}
            className={`px-4 py-2 rounded-2xl border transition-all text-xs font-bold flex items-center gap-2.5 shadow-sm active:scale-95 ${
              selectedStatus === 'Payée'
                ? 'bg-[#ccedae] border-[#516c3a] text-[#0c2000] scale-105'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>{totals.payee} Payées</span>
          </button>
          
          <button 
            onClick={() => handleQuickFilterSelect('En attente')}
            className={`px-4 py-2 rounded-2xl border transition-all text-xs font-bold flex items-center gap-2.5 shadow-sm active:scale-95 ${
              selectedStatus === 'En attente'
                ? 'bg-amber-100 border-amber-400 text-amber-900 scale-105'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>{totals.attente} En attente</span>
          </button>

          <button 
            onClick={() => handleQuickFilterSelect('En retard')}
            className={`px-4 py-2 rounded-2xl border transition-all text-xs font-bold flex items-center gap-2.5 shadow-sm active:scale-95 ${
              selectedStatus === 'En retard'
                ? 'bg-red-100 border-red-400 text-red-900 scale-105'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>{totals.retard} En retard</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dropdown 1: Statut */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800/60 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Statut</span>
          <select 
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer w-full outline-none"
          >
            <option value="Tous les statuts">Tous les statuts</option>
            <option value="Payée">Payée</option>
            <option value="En attente">En attente</option>
            <option value="En retard">En retard</option>
          </select>
        </div>

        {/* Dropdown 2: Client */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800/60 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client</span>
          <select 
            value={selectedClient}
            onChange={(e) => {
              setSelectedClient(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer w-full outline-none"
          >
            <option value="Tous les clients">Tous les clients</option>
            {clientOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Dropdown 3: Commercial */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800/60 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Commercial</span>
          <select 
            value={selectedCommercial}
            onChange={(e) => {
              setSelectedCommercial(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer w-full outline-none"
          >
            <option value="Tous les vendeurs">Tous les vendeurs</option>
            {commercialOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Dropdown 4: Période */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800/60 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Période</span>
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer w-full outline-none"
            >
              <option value="Tout">Toutes les périodes</option>
              <option value="Ce mois-ci">Ce mois-ci</option>
              <option value="Cette année">Cette année</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Main Table Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800/60 overflow-hidden flex flex-col">
        {/* List Header Search */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher une facture (N° invoice, client, commercial...)"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:text-white dark:placeholder-slate-500"
            />
          </div>
          <button 
            onClick={onCreateInvoice}
            className="w-full sm:w-auto bg-[#00488d] hover:bg-[#005fb8] text-white py-2 px-5 rounded-full text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une facture</span>
          </button>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f1f4fa]/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
              <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">N° Facture</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Commercial</th>
                <th className="px-6 py-4">Livraison</th>
                <th className="px-6 py-4">Échéance</th>
                <th className="px-6 py-4 text-right">Montant</th>
                <th className="px-6 py-4 text-right">Reste</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedFactures.length > 0 ? (
                paginatedFactures.map((f) => {
                  const client = clients.find(c => c.id === f.client_id);
                  const commercial = commerciaux.find(co => co.id === f.commercial_id);
                  const isMenuOpen = activeMenuId === f.id;

                  // Guess location for display subtext
                  let locationStr = 'Paris, France';
                  if (client?.nom.includes('NeoSphere')) locationStr = 'Lyon, France';
                  if (client?.nom.includes('Lumina')) locationStr = 'Bordeaux, France';
                  if (client?.nom.includes('Velocity')) locationStr = 'Marseille, France';
                  if (client?.nom.includes('Pix')) locationStr = 'Lille, France';

                  return (
                    <tr 
                      key={f.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors relative"
                    >
                      {/* Invoice Ref */}
                      <td className="px-6 py-5 font-mono text-sm font-bold text-[#00488d] dark:text-blue-400">
                        {f.numero}
                      </td>

                      {/* Client info with Subtext location */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{client?.nom}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{locationStr}</span>
                        </div>
                      </td>

                      {/* Commercial Name */}
                      <td className="px-6 py-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {commercial?.nom}
                      </td>

                      {/* Delivery Date */}
                      <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {new Date(f.date_livraison).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Due Date / Overdue Check */}
                      <td className={`px-6 py-5 text-sm font-medium ${
                        f.statut === 'En retard' 
                          ? 'text-red-600 dark:text-rose-400 font-bold underline underline-offset-4' 
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {new Date(f.date_echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-5 text-sm font-black text-slate-800 dark:text-slate-100 text-right font-sans">
                        {f.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>

                      {/* Remaining amount */}
                      <td className={`px-6 py-5 text-sm font-black text-right font-sans ${
                        f.reste > 0 
                          ? (f.statut === 'En retard' ? 'text-red-500' : 'text-amber-600') 
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {f.reste.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>

                      {/* Status Badges */}
                      <td className="px-6 py-5">
                        {f.statut === 'Payée' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            Payée
                          </span>
                        ) : f.statut === 'En retard' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                            En retard
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                            En attente
                          </span>
                        )}
                      </td>

                      {/* Actions Menu */}
                      <td className="px-6 py-5 text-center relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : f.id);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Interactive Context Dropdown menu */}
                        {isMenuOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-20" 
                              onClick={() => setActiveMenuId(null)} 
                            />
                            <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 w-44 z-30 text-left">
                              <button 
                                onClick={() => {
                                  onViewInvoice(f.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4 text-blue-500" />
                                <span>Voir le détail</span>
                              </button>
                              <button 
                                onClick={() => {
                                  onEditInvoice(f.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4 text-emerald-500" />
                                <span>Modifier</span>
                              </button>
                              <button 
                                onClick={() => {
                                  onViewInvoice(f.id); // View details will also have payment controls!
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                              >
                                <CreditCard className="w-4 h-4 text-amber-500" />
                                <span>Gérer paiements</span>
                              </button>
                              <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                              <button 
                                onClick={() => {
                                  if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
                                    onDeleteInvoice(f.id);
                                  }
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
                    <Filter className="w-8 h-8 mx-auto stroke-[1.5px] opacity-55 mb-2" />
                    Aucune facture trouvée pour vos critères de filtrage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {paginatedFactures.length > 0 ? (
            paginatedFactures.map((f) => {
              const client = clients.find(c => c.id === f.client_id);
              const commercial = commerciaux.find(co => co.id === f.commercial_id);

              return (
                <div key={f.id} className="p-4.5 space-y-3.5 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-black text-[#00488d] dark:text-blue-400 block tracking-wider uppercase">{f.numero}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{client?.nom}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">Vendeur : {commercial?.nom}</span>
                    </div>
                    {f.statut === 'Payée' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                        Payée
                      </span>
                    ) : f.statut === 'En retard' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 text-[9px] font-bold uppercase tracking-wider">
                        Retard
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                        Attente
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800/40 pt-2.5">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Échéance</span>
                      <span className={`font-semibold ${f.statut === 'En retard' ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {new Date(f.date_echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Montant / Reste</span>
                      <div className="flex items-center justify-end gap-1.5 font-bold">
                        <span className="text-slate-600 dark:text-slate-400">{f.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                        {f.reste > 0 && (
                          <span className="text-rose-500 dark:text-rose-400">({f.reste.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                    <button 
                      onClick={() => onViewInvoice(f.id)}
                      className="text-[11px] font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#00488d] dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700/60 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Détails</span>
                    </button>
                    <button 
                      onClick={() => onEditInvoice(f.id)}
                      className="text-[11px] font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-slate-700/60 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
                          onDeleteInvoice(f.id);
                        }
                      }}
                      className="text-[11px] font-bold px-3 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
              <Filter className="w-8 h-8 mx-auto stroke-[1.5px] opacity-55 mb-2" />
              Aucune facture trouvée pour vos critères de filtrage.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Affichage de {filteredFactures.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à {Math.min(currentPage * itemsPerPage, filteredFactures.length)} sur {filteredFactures.length} factures
          </span>
          
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                    currentPage === pNum 
                      ? 'bg-[#00488d] text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
