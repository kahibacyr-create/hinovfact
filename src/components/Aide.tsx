import React from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Calculator, 
  Coins, 
  Clock, 
  Database,
  ArrowRight,
  ShieldCheck,
  Compass,
  Award
} from 'lucide-react';

export default function Aide() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Centre d'Aide & Guide</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Comprendre le fonctionnement comptable, les règles métier et les performances de Hinov Factures.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Help topics */}
        <div className="lg:col-span-8 space-y-6">
          {/* Guide Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" /> Guide d'utilisation rapide</h3>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Enregistrement des Factures</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Cliquez sur le bouton <strong>"Créer une facture"</strong>, sélectionnez un client et un commercial d'apport, renseignez la date de livraison ainsi que le montant. Les marges et primes d'apport commercial sont automatiquement calculées.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Enregistrement des Règlements (Paiements)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Depuis la liste, ouvrez l'onglet <strong>"Voir le détail"</strong> de n'importe quelle facture. Dans la section <strong>"Historique des Paiements"</strong>, cliquez sur <strong>"Enregistrer un paiement"</strong>. Renseignez le montant reçu pour mettre à jour automatiquement le solde restant.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Analyse de la Performance</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Accédez aux modules <strong>"Vendeurs"</strong> et <strong>"Rapports"</strong> pour suivre le classement en temps réel de vos commerciaux, la marge moyenne et générer des relevés fiscaux pour l'expert comptable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical & Accounting rules definitions */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Calculator className="w-5 h-5 text-[#516c3a]" /> Algorithmes financiers & Règles de calcul</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center gap-2 text-[#516c3a]">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Date d'Échéance</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Calculée automatiquement selon la formule : <code>Date de livraison + 30 jours calendaires</code>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center gap-2 text-[#516c3a]">
                  <Coins className="w-4 h-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Marge Brute</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Calculée automatiquement selon la formule : <code>Montant Facturé - Coût Utilisé</code>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center gap-2 text-[#516c3a]">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Prime Commerciale</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Calculée automatiquement selon la formule : <code>10% de la Marge Brute réalisée</code>. Aucune prime n'est accordée en cas de marge nulle ou négative.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center gap-2 text-[#516c3a]">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Statut Comptable</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  - Reste dû = 0 → "Payée"<br />
                  - Reste dû &gt; 0 & Échéance &gt;= Aujourd'hui → "En attente"<br />
                  - Reste dû &gt; 0 & Échéance &lt; Aujourd'hui → "En retard"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Help Desk Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#00488d] text-white p-6 rounded-[24px] shadow-lg space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 flex items-center gap-1.5"><Compass className="w-4 h-4" /> Support Hinov</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Pour toute anomalie de facturation ou modification structurelle de vos équipes, veuillez contacter le service informatique de Hinov Group.
            </p>
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs font-mono text-slate-400">
              <p>Email : support@hinov.fr</p>
              <p>Téléphone : +33 1 44 88 55 00</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] card-elevation border border-slate-100 dark:border-slate-800/40 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-[#516c3a] mx-auto stroke-[1.8px]" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Application Sécurisée</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Vos rapports financiers et coordonnées clients sont protégés par chiffrement local AES-256 et transmissions SSL cryptées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
