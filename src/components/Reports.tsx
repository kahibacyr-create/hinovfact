import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FileDown, 
  Calendar, 
  DollarSign, 
  Activity, 
  CheckCircle,
  Clock,
  Briefcase,
  Sliders,
  FileSpreadsheet
} from 'lucide-react';
import { Facture, Client } from '../types';

interface ReportsProps {
  factures: Facture[];
  clients: Client[];
  onTriggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function Reports({
  factures,
  clients,
  onTriggerNotification
}: ReportsProps) {
  const [reportType, setReportType] = useState<'mensuel' | 'annuel' | 'quotidien'>('mensuel');
  const [exporting, setExporting] = useState<string | null>(null);

  // Financial aggregates calculated from active invoices
  const totals = useMemo(() => {
    let revenue = 0;
    let costs = 0;
    let paid = 0;
    let primes = 0;

    factures.forEach(f => {
      revenue += f.montant;
      costs += f.montant_utilise;
      paid += f.montant_paye;
      primes += f.prime;
    });

    const netProfit = revenue - costs;
    const remainingBalance = revenue - paid;

    return {
      revenue,
      costs,
      paid,
      netProfit,
      primes,
      remainingBalance
    };
  }, [factures]);

  // Handle mock report export
  const handleExport = (format: 'Excel' | 'PDF') => {
    setExporting(format);
    setTimeout(() => {
      setExporting(null);
      onTriggerNotification(
        `Rapport financier ${reportType === 'mensuel' ? 'mensuel' : reportType === 'annuel' ? 'annuel' : 'journalier'} exporté avec succès au format ${format} !`,
        'success'
      );
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Filter Operations */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Rapports & Comptes Rendus</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Analysez les comptes d'exploitation consolidés, les flux de trésorerie et le recouvrement.</p>
        </div>

        {/* Report range selector */}
        <div className="flex gap-1.5 bg-[#f1f4fa] dark:bg-slate-800/60 p-1 rounded-full self-start sm:self-auto">
          <button 
            onClick={() => setReportType('quotidien')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              reportType === 'quotidien' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Quotidien
          </button>
          <button 
            onClick={() => setReportType('mensuel')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              reportType === 'mensuel' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mensuel
          </button>
          <button 
            onClick={() => setReportType('annuel')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              reportType === 'annuel' 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Annuel
          </button>
        </div>
      </div>

      {/* Financial Statement Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total revenue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Chiffre d'Affaires</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1.5 font-sans">
            {totals.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">▲ +12.4% vs l'an dernier</span>
        </div>

        {/* Total costs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Coûts de fonctionnement</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1.5 font-sans">
            {totals.costs.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">Ratio de charges : {Math.round((totals.costs / totals.revenue) * 100)}%</span>
        </div>

        {/* Net Margin profit */}
        <div className="bg-[#ccedae]/25 border border-[#ccedae]/60 p-6 rounded-[24px] dark:bg-slate-900/30">
          <span className="text-[10px] font-bold text-[#516c3a] dark:text-emerald-400 uppercase tracking-widest block">Excédent Brut (Marge)</span>
          <span className="text-2xl font-black text-emerald-800 dark:text-emerald-400 block mt-1.5 font-sans">
            {totals.netProfit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </span>
          <span className="text-[10px] text-[#516c3a] dark:text-emerald-500 font-bold block mt-1">Rendement net moyen : {Math.round((totals.netProfit / totals.revenue) * 100)}%</span>
        </div>

        {/* Total encours restants */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Créances à recouvrer</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block mt-1.5 font-sans">
            {totals.remainingBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </span>
          <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold block mt-1">Taux de recouvrement : {Math.round((totals.paid / totals.revenue) * 100)}%</span>
        </div>
      </div>

      {/* Export operations console */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Sliders className="w-6 h-6 stroke-[2px]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Exportation et Archivage Fiscal</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Générez des rapports conformes pour votre cabinet comptable ou les audits.</p>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            disabled={exporting !== null}
            onClick={() => handleExport('Excel')}
            className="flex-1 sm:flex-initial bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-5 rounded-full flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {exporting === 'Excel' ? (
              <span>Génération Excel...</span>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exporter vers Excel</span>
              </>
            )}
          </button>
          
          <button 
            disabled={exporting !== null}
            onClick={() => handleExport('PDF')}
            className="flex-1 sm:flex-initial bg-[#00488d] hover:bg-[#005fb8] text-white font-bold text-xs py-2.5 px-5 rounded-full flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {exporting === 'PDF' ? (
              <span>Génération PDF...</span>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Télécharger le PDF</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Detailed Ledger Audit list */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800/60 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Registre d'Émargement des Écritures Comptables</h3>
        </div>

        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-[#f1f4fa]/40 dark:bg-slate-800/10 border-b border-slate-200 dark:border-slate-800">
              <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Opération / Facture</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4 text-right">Montant brut</th>
                <th className="px-6 py-4 text-right">Coût</th>
                <th className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">Excédent (Marge)</th>
                <th className="px-6 py-4">Rendement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {factures.map((f) => {
                const client = clients.find(c => c.id === f.client_id);
                const efficiency = f.montant > 0 ? Math.round((f.marge / f.montant) * 100) : 0;
                return (
                  <tr key={f.id} className="hover:bg-[#f1f4fa]/10 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#00488d] dark:text-blue-400">
                      {f.numero}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {client?.nom}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-right text-slate-800 dark:text-slate-100 font-mono">
                      {f.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-right text-slate-400 dark:text-slate-500 font-mono">
                      {f.montant_utilise.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-right text-emerald-600 dark:text-emerald-400 font-mono">
                      {f.marge.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        efficiency >= 35 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                          : efficiency >= 20 
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {efficiency}% Yield
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card layout for accounting ledger */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {factures.map((f) => {
            const client = clients.find(c => c.id === f.client_id);
            const efficiency = f.montant > 0 ? Math.round((f.marge / f.montant) * 100) : 0;

            return (
              <div key={f.id} className="p-4.5 space-y-3 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#00488d] dark:text-blue-400 block">{f.numero}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{client?.nom}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    efficiency >= 35 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                      : efficiency >= 20 
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  }`}>
                    {efficiency}% Yield
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 dark:border-slate-800/40 pt-2.5 font-sans">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Brut</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{f.montant.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Coût</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{f.montant_utilise.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[9px] font-bold uppercase tracking-wider">Marge</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{f.marge.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
