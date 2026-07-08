import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  User, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Award, 
  Activity, 
  Coins, 
  HelpCircle,
  FileText,
  Clock,
  BadgeAlert
} from 'lucide-react';
import { Facture, Client, Commercial, Service, Paiement } from '../types';

interface InvoiceDetailProps {
  invoiceId: string;
  factures: Facture[];
  clients: Client[];
  commerciaux: Commercial[];
  services: Service[];
  paiements: Paiement[];
  onBackToList: () => void;
  onEditInvoice: (id: string) => void;
  onAddPayment: (payment: Omit<Paiement, 'id'>) => void;
  onDeletePayment: (id: string) => void;
}

export default function InvoiceDetail({
  invoiceId,
  factures,
  clients,
  commerciaux,
  services,
  paiements,
  onBackToList,
  onEditInvoice,
  onAddPayment,
  onDeletePayment
}: InvoiceDetailProps) {
  // Inline add payment form state
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [payMontant, setPayMontant] = useState('');
  const [payMode, setPayMode] = useState('Virement');
  const [payRef, setPayRef] = useState('');
  const [payObs, setPayObs] = useState('');

  // Target Invoice
  const invoice = useMemo(() => {
    return factures.find(f => f.id === invoiceId);
  }, [factures, invoiceId]);

  // Client, Commercial and Service info
  const client = useMemo(() => {
    if (!invoice) return null;
    return clients.find(c => c.id === invoice.client_id);
  }, [clients, invoice]);

  const commercial = useMemo(() => {
    if (!invoice) return null;
    return commerciaux.find(co => co.id === invoice.commercial_id);
  }, [commerciaux, invoice]);

  const service = useMemo(() => {
    if (!invoice) return null;
    return services.find(s => s.id === invoice.service_id);
  }, [services, invoice]);

  // Payments related to this invoice
  const relatedPayments = useMemo(() => {
    return paiements.filter(p => p.facture_id === invoiceId);
  }, [paiements, invoiceId]);

  if (!invoice) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl card-elevation">
        <p className="text-slate-500 font-semibold mb-4">La facture demandée est introuvable.</p>
        <button onClick={onBackToList} className="bg-[#00488d] text-white px-5 py-2 rounded-full font-bold text-xs">
          Retour aux factures
        </button>
      </div>
    );
  }

  // Margin percent
  const margePct = invoice.montant > 0 ? Math.round((invoice.marge / invoice.montant) * 100) : 0;

  // Handle adding payment
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMontant = parseFloat(payMontant);
    if (isNaN(parsedMontant) || parsedMontant <= 0) {
      alert('Veuillez saisir un montant de paiement valide.');
      return;
    }

    if (parsedMontant > invoice.reste) {
      if (!confirm(`Le montant saisi (${parsedMontant} €) dépasse le reste à payer de cette facture (${invoice.reste} €). Souhaitez-vous quand même enregistrer ce paiement ?`)) {
        return;
      }
    }

    onAddPayment({
      facture_id: invoice.id,
      montant: parsedMontant,
      date_paiement: new Date().toISOString().split('T')[0],
      mode_paiement: payMode,
      reference: payRef || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      observation: payObs
    });

    // Reset Form
    setPayMontant('');
    setPayRef('');
    setPayObs('');
    setShowAddPaymentForm(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Detail Header / Nav Operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={onBackToList}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00488d] dark:text-blue-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à la liste des factures</span>
        </button>
        <button 
          onClick={() => onEditInvoice(invoice.id)}
          className="bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 px-5 rounded-full shadow-sm"
        >
          Modifier la facture
        </button>
      </div>

      {/* Main Invoice Card Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Invoice Core Ledger */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-8">
          {/* Header invoice information */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-6 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">FICHE FINANCIÈRE</span>
              <h3 className="text-2xl font-extrabold text-[#00488d] dark:text-blue-400 font-mono mt-1">{invoice.numero}</h3>
            </div>
            
            {/* Elegant Status indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Statut de la créance :</span>
              {invoice.statut === 'Payée' ? (
                <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Payée
                </span>
              ) : invoice.statut === 'En retard' ? (
                <span className="bg-red-100 dark:bg-rose-500/10 text-red-800 dark:text-rose-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  En retard
                </span>
              ) : (
                <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  En attente
                </span>
              )}
            </div>
          </div>

          {/* Client & Commercial Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Informations Client</span>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{client?.nom || 'Client Inconnu'}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Email : <span className="font-semibold text-slate-600 dark:text-slate-300">{client?.email}</span></p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Téléphone : <span className="font-semibold text-slate-600 dark:text-slate-300">{client?.telephone}</span></p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Performance Commerciale</span>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{commercial?.nom || 'Commercial Inconnu'}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{commercial?.poste || 'Négociateur'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Primes d'apport : <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{invoice.prime.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span> (10% de marge)</p>
              </div>
            </div>
          </div>

          {/* Delivery & Due dates details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
              <Calendar className="w-5 h-5 text-[#00488d] dark:text-blue-400" />
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block">Date Livraison</span>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mt-0.5 block">
                  {new Date(invoice.date_livraison).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block">Date Échéance</span>
                <span className={`text-xs font-extrabold mt-0.5 block ${invoice.statut === 'En retard' ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                  {new Date(invoice.date_echeance).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
              <FileText className="w-5 h-5 text-[#516c3a]" />
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block">Service & Catégorie</span>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mt-0.5 block uppercase tracking-tight">
                  {service?.nom} - {invoice.categorie_id.replace('cat_', '')}
                </span>
              </div>
            </div>
          </div>

          {/* Business rule calculation formula guide */}
          <div className="p-4 bg-[#ccedae]/10 rounded-2xl border border-[#ccedae]/40 text-xs text-[#0c2000] space-y-1">
            <p className="font-bold flex items-center gap-1.5"><HelpCircle className="w-4 h-4 shrink-0 text-[#516c3a]" /> Règles métier appliquées :</p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-[#415c2a] mt-1.5">
              <li><strong>Date d'échéance :</strong> Date de livraison + 30 jours ({invoice.date_livraison} + 30j = {invoice.date_echeance})</li>
              <li><strong>Marge bénéficiaire :</strong> Montant facture - Montant utilisé (Coûts) ({invoice.montant.toLocaleString()}€ - {invoice.montant_utilise.toLocaleString()}€ = {invoice.marge.toLocaleString()}€ soit {margePct}%)</li>
              <li><strong>Commission commercial (Prime) :</strong> 10% de la marge réalisée ({invoice.marge.toLocaleString()}€ * 10% = {invoice.prime.toLocaleString()}€)</li>
            </ul>
          </div>
        </div>

        {/* Right Panel: Transactional breakdown */}
        <div className="lg:col-span-4 bg-[#00488d] dark:bg-slate-900/60 text-white p-8 rounded-[32px] flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Abstract background graphics */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300">Bilan Financier</h4>
              <p className="text-xs text-slate-400 mt-1">Calcul des soldes et créances client</p>
            </div>

            {/* Invoiced total */}
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-xs text-slate-300 font-medium">Montant Facturé (CA)</span>
              <span className="text-sm font-extrabold font-mono">{invoice.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
            </div>

            {/* Cost of delivery */}
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-xs text-slate-300 font-medium">Montant Utilisé (Coûts)</span>
              <span className="text-sm font-extrabold font-mono">{invoice.montant_utilise.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
            </div>

            {/* Marge */}
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-xs text-slate-300 font-medium">Marge Réalisée ({margePct}%)</span>
              <span className="text-sm font-extrabold font-mono text-emerald-300">{invoice.marge.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
            </div>

            {/* Primes details */}
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-xs text-slate-300 font-medium">Prime Commerciale (10%)</span>
              <span className="text-sm font-extrabold font-mono text-amber-300">{invoice.prime.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
            </div>

            {/* Amount paid */}
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-xs text-slate-300 font-medium">Déjà Encaissé</span>
              <span className="text-sm font-extrabold font-mono text-emerald-400">{invoice.montant_paye.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>

          {/* Reste à payer Big layout */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-xs text-slate-300 uppercase tracking-wider block">Solde restant dû (Reste)</span>
            <span className="text-3xl font-black font-mono block mt-2 text-rose-300">
              {invoice.reste.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </span>
            <p className="text-[11px] text-slate-400 mt-3 italic">
              {invoice.reste === 0 
                ? 'Cette créance a été intégralement soldée.' 
                : `Il reste ${invoice.reste.toLocaleString()} € à percevoir par virement ou chèque.`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Payment Management Module (Gestion des paiements) */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-[#00488d] dark:text-blue-400 rounded-xl">
              <Coins className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Historique des Paiements Reçus</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Enregistrement et rapprochement bancaire de cette facture</p>
            </div>
          </div>
          
          {invoice.reste > 0 && (
            <button 
              onClick={() => setShowAddPaymentForm(!showAddPaymentForm)}
              className="bg-[#00488d] hover:bg-[#005fb8] text-white font-bold text-xs py-2 px-5 rounded-full flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer un paiement</span>
            </button>
          )}
        </div>

        {/* Inline Payment Form */}
        {showAddPaymentForm && (
          <form 
            onSubmit={handleAddPaymentSubmit}
            className="p-6 bg-[#f1f4fa]/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Saisir un nouveau versement</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Montant */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Montant (€)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={payMontant}
                  onChange={(e) => setPayMontant(e.target.value)}
                  placeholder="Ex: 1250"
                  className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-blue-500 dark:text-white"
                />
              </div>

              {/* Mode de paiement */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mode de règlement</label>
                <select 
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-blue-500 dark:text-white"
                >
                  <option value="Virement">Virement bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Carte">Carte bancaire</option>
                  <option value="Espèces">Espèces</option>
                </select>
              </div>

              {/* Reference */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Référence / N° de chèque</label>
                <input 
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Ex: VIR-NEO-852"
                  className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-blue-500 dark:text-white"
                />
              </div>

              {/* Observation */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observation / Libellé</label>
                <input 
                  type="text"
                  value={payObs}
                  onChange={(e) => setPayObs(e.target.value)}
                  placeholder="Ex: Acompte n°2"
                  className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-blue-500 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                type="button"
                onClick={() => setShowAddPaymentForm(false)}
                className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="bg-[#00488d] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
              >
                Valider le versement
              </button>
            </div>
          </form>
        )}

        {/* Payments table list */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Date de règlement</th>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Mode de paiement</th>
                <th className="py-3 px-4">Observations</th>
                <th className="py-3 px-4 text-right">Montant perçu</th>
                <th className="py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {relatedPayments.length > 0 ? (
                relatedPayments.map((p) => (
                  <tr key={p.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-4 text-xs font-semibold">
                      {new Date(p.date_paiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {p.reference}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold">
                      <span className="bg-[#f1f4fa] dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg font-bold">
                        {p.mode_paiement}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {p.observation || 'Aucune observation.'}
                    </td>
                    <td className="py-4 px-4 text-xs font-black text-right text-slate-800 dark:text-slate-100 font-mono">
                      {p.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => {
                          if (confirm('Voulez-vous supprimer ce versement de la facture ? Les totaux et statuts seront recalculés.')) {
                            onDeletePayment(p.id);
                          }
                        }}
                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-full transition-colors cursor-pointer"
                        title="Annuler le versement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    Aucun versement n'a encore été enregistré pour cette facture.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
