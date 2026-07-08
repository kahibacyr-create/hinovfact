import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Save, 
  HelpCircle, 
  Calculator, 
  Calendar,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Facture, Client, Commercial, Service, Categorie } from '../types';
import { calculateInvoiceFields } from '../data/mockData';

interface InvoiceFormProps {
  editInvoiceId?: string;
  factures: Facture[];
  clients: Client[];
  commerciaux: Commercial[];
  services: Service[];
  onBack: () => void;
  onSave: (facture: Facture) => void;
}

export default function InvoiceForm({
  editInvoiceId,
  factures,
  clients,
  commerciaux,
  services,
  onBack,
  onSave
}: InvoiceFormProps) {
  const isEdit = !!editInvoiceId;

  // Retrieve current invoice if editing
  const existingInvoice = useMemo(() => {
    if (!isEdit) return null;
    return factures.find(f => f.id === editInvoiceId);
  }, [factures, editInvoiceId, isEdit]);

  // Form Field States
  const [clientId, setClientId] = useState('');
  const [commercialId, setCommercialId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [categorieId, setCategorieId] = useState('cat_standard');
  const [dateLivraison, setDateLivraison] = useState('');
  const [montant, setMontant] = useState('');
  const [montantUtilise, setMontantUtilise] = useState('');

  // Set default values or prefill if editing
  useEffect(() => {
    if (existingInvoice) {
      setClientId(existingInvoice.client_id);
      setCommercialId(existingInvoice.commercial_id);
      setServiceId(existingInvoice.service_id);
      setCategorieId(existingInvoice.categorie_id);
      setDateLivraison(existingInvoice.date_livraison);
      setMontant(existingInvoice.montant.toString());
      setMontantUtilise(existingInvoice.montant_utilise.toString());
    } else {
      // Defaults for creation
      if (clients.length > 0) setClientId(clients[0].id);
      if (commerciaux.length > 0) setCommercialId(commerciaux[0].id);
      if (services.length > 0) setServiceId(services[0].id);
      setDateLivraison(new Date().toISOString().split('T')[0]);
      setMontant('1000');
      setMontantUtilise('700');
    }
  }, [existingInvoice, clients, commerciaux, services]);

  // Real-time automatic math computations
  const liveCalculations = useMemo(() => {
    const numMontant = parseFloat(montant) || 0;
    const numUtilise = parseFloat(montantUtilise) || 0;
    
    // Payments sum (keep current paid amount if editing, else 0 for new)
    const currentPaid = existingInvoice ? existingInvoice.montant_paye : 0;

    return calculateInvoiceFields(numMontant, numUtilise, currentPaid, dateLivraison || new Date().toISOString().split('T')[0]);
  }, [montant, montantUtilise, dateLivraison, existingInvoice]);

  const liveMargePct = useMemo(() => {
    const m = parseFloat(montant) || 0;
    const mu = parseFloat(montantUtilise) || 0;
    if (m === 0) return 0;
    return Math.round(((m - mu) / m) * 100);
  }, [montant, montantUtilise]);

  // Form Submit Action
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedMontant = parseFloat(montant);
    const parsedUtilise = parseFloat(montantUtilise);

    if (isNaN(parsedMontant) || parsedMontant <= 0) {
      alert('Veuillez saisir un montant de facturation valide.');
      return;
    }
    if (isNaN(parsedUtilise) || parsedUtilise < 0) {
      alert('Veuillez saisir un coût (montant utilisé) valide.');
      return;
    }
    if (parsedUtilise > parsedMontant) {
      if (!confirm('Le montant utilisé (coûts) est supérieur au montant facturé. Cela entraînera une marge négative. Voulez-vous continuer ?')) {
        return;
      }
    }

    // Prepare Invoice Object
    const targetId = existingInvoice ? existingInvoice.id : `fac_${Math.floor(10000 + Math.random() * 90000)}`;
    const targetNumero = existingInvoice 
      ? existingInvoice.numero 
      : `FAC-2026-${Math.floor(100 + Math.random() * 900)}`;

    const savedInvoice: Facture = {
      id: targetId,
      numero: targetNumero,
      client_id: clientId,
      commercial_id: commercialId,
      service_id: serviceId,
      categorie_id: categorieId,
      date_livraison: dateLivraison,
      date_echeance: liveCalculations.dateEcheance,
      montant: parsedMontant,
      montant_utilise: parsedUtilise,
      marge: liveCalculations.marge,
      prime: liveCalculations.prime,
      montant_paye: existingInvoice ? existingInvoice.montant_paye : 0,
      reste: liveCalculations.reste,
      statut: liveCalculations.statut,
      created_at: existingInvoice ? existingInvoice.created_at : new Date().toISOString().split('T')[0]
    };

    onSave(savedInvoice);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-full transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEdit ? `Modifier la Facture ${existingInvoice?.numero}` : 'Créer une Nouvelle Facture'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {isEdit ? 'Mettez à jour les conditions financières.' : 'Saisissez les termes commerciaux et bénéficiez de calculs automatiques.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Input Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Client Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">Client bénéficiaire</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Commercial Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">Commercial / Vendeur d'apport</label>
              <select
                required
                value={commercialId}
                onChange={(e) => setCommercialId(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {commerciaux.map(co => (
                  <option key={co.id} value={co.id}>{co.nom}</option>
                ))}
              </select>
            </div>

            {/* Service Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">Service vendu</label>
              <select
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">Catégorie tarifaire</label>
              <select
                required
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="cat_standard">Standard</option>
                <option value="cat_premium">Premium</option>
                <option value="cat_express">Express</option>
              </select>
            </div>

            {/* Delivery Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">Date de livraison</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dateLivraison}
                  onChange={(e) => setDateLivraison(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Calculated Due Date Preview (livraison + 30j) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block pl-1">Échéance calculée (+30 jours)</label>
              <div className="w-full h-11 px-4 bg-slate-100 dark:bg-slate-800/40 border border-transparent rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>
                  {dateLivraison 
                    ? new Date(liveCalculations.dateEcheance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
                    : "Saisir la date de livraison..."}
                </span>
              </div>
            </div>

            {/* Montant à payer (CA) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">Montant à payer (€)</label>
              <input
                type="number"
                step="0.01"
                required
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Montant utilisé (Coûts / used amount) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">Montant utilisé / Coûts (€)</label>
              <input
                type="number"
                step="0.01"
                required
                value={montantUtilise}
                onChange={(e) => setMontantUtilise(e.target.value)}
                placeholder="Ex: 3500"
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onBack}
              className="px-6 h-11 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 h-11 bg-[#00488d] hover:bg-[#005fb8] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la facture</span>
            </button>
          </div>
        </form>

        {/* Right Side: Dynamic Financial Simulator Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl space-y-6 relative overflow-hidden">
            {/* Visual indicator of dynamic math simulation */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 text-xs text-blue-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>Calculateur Live</span>
            </div>

            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Simulation financière</h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculs en temps réel (Cahier des charges)</p>
            </div>

            {/* Summary Metrics */}
            <div className="space-y-4">
              {/* Marge */}
              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="text-xs text-slate-300 font-medium">Marge bénéficiaire</span>
                <div className="text-right">
                  <span className={`text-sm font-extrabold font-mono block ${liveCalculations.marge >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {liveCalculations.marge.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Rendement : {liveMargePct}%</span>
                </div>
              </div>

              {/* Commission commercial (Prime) */}
              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="text-xs text-slate-300 font-medium">Prime commercial (10%)</span>
                <div className="text-right">
                  <span className="text-sm font-extrabold font-mono text-amber-400 block">
                    {liveCalculations.prime.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">10% de la marge brute</span>
                </div>
              </div>

              {/* Due date calculated */}
              <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="text-xs text-slate-300 font-medium">Échéance de paiement</span>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-100 block">
                    {dateLivraison 
                      ? new Date(liveCalculations.dateEcheance).toLocaleDateString('fr-FR') 
                      : 'Non définie'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Délai standard : 30 jours</span>
                </div>
              </div>

              {/* Status simulation */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs text-slate-300 font-medium">Statut prévisionnel</span>
                {liveCalculations.statut === 'Payée' ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Soldée
                  </span>
                ) : liveCalculations.statut === 'En retard' ? (
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Dépassée / Retard
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Actif / En attente
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Guidelines notes */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <Calculator className="w-5 h-5 text-[#00488d] dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Assistance financière</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Toutes les valeurs de primes et de marges sont garanties en conformité avec la réglementation comptable interne de Hinov Group.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
