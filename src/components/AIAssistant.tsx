import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  Loader2, 
  FileText, 
  Mail, 
  Copy, 
  Check, 
  TrendingUp, 
  AlertTriangle, 
  UserSquare, 
  RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Commercial, Facture } from '../types';

interface AIAssistantProps {
  factures: Facture[];
  clients: Client[];
  commerciaux: Commercial[];
  onViewInvoice: (id: string) => void;
  onTriggerNotification?: (message: string, type: 'success' | 'info' | 'error') => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function AIAssistant({ 
  factures, 
  clients, 
  commerciaux, 
  onViewInvoice,
  onTriggerNotification 
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'relances' | 'rapport'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Bonjour ! Je suis l'Intelligence Artificielle d'Hinov. J'ai un accès en temps réel à vos données de facturation (factures, marges, clients et performance commerciale). Comment puis-je vous aider aujourd'hui ? Vous pouvez me demander de rédiger des courriels de relance, d'analyser la rentabilité de vos commerciaux ou de résumer les factures impayées.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reminder (relance) generator state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [tone, setTone] = useState<'diplomatic' | 'assertive' | 'formal'>('diplomatic');
  const [generatedReminder, setGeneratedReminder] = useState('');
  const [isReminderLoading, setIsReminderLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Executive summary state
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Generate Data Summary for Gemini Context
  const getContextString = () => {
    const totalCA = factures.reduce((acc, f) => acc + f.montant, 0);
    const totalMarge = factures.reduce((acc, f) => acc + f.marge, 0);
    const totalReste = factures.reduce((acc, f) => acc + f.reste, 0);
    const enRetard = factures.filter(f => f.statut === 'En retard');
    const totalEnRetard = enRetard.reduce((acc, f) => acc + f.reste, 0);

    // Grouping invoices per salesperson to compute salesperson performances
    const salespersonSummary = commerciaux.map(c => {
      const relatedInvoices = factures.filter(f => f.commercial_id === c.id);
      const salesCA = relatedInvoices.reduce((acc, f) => acc + f.montant, 0);
      const salesMarge = relatedInvoices.reduce((acc, f) => acc + f.marge, 0);
      const totalPrimes = relatedInvoices.reduce((acc, f) => acc + f.prime, 0);
      return {
        nom: c.nom,
        ca: salesCA,
        marge: salesMarge,
        primes: totalPrimes,
        nombreFactures: relatedInvoices.length
      };
    }).sort((a, b) => b.ca - a.ca);

    // Grouping per client
    const clientSummary = clients.map(cl => {
      const relatedInvoices = factures.filter(f => f.client_id === cl.id);
      const totalInvoiced = relatedInvoices.reduce((acc, f) => acc + f.montant, 0);
      const totalOwed = relatedInvoices.reduce((acc, f) => acc + f.reste, 0);
      return {
        nom: cl.nom,
        totalInvoiced,
        totalOwed,
        invoicesCount: relatedInvoices.length
      };
    }).sort((a, b) => b.totalInvoiced - a.totalInvoiced);

    // Construct precise contextual JSON string for prompt
    return JSON.stringify({
      metrics: {
        totalCA,
        totalMarge,
        totalReste,
        overdueCount: enRetard.length,
        totalOverdue: totalEnRetard
      },
      commerciaux: salespersonSummary,
      clients: clientSummary,
      facturesCritiques: enRetard.map(f => {
        const client = clients.find(c => c.id === f.client_id);
        const commercial = commerciaux.find(c => c.id === f.commercial_id);
        return {
          numero: f.numero,
          client: client?.nom || 'Inconnu',
          commercial: commercial?.nom || 'Inconnu',
          montant: f.montant,
          reste: f.reste,
          dateEcheance: f.date_echeance
        };
      })
    }, null, 2);
  };

  // Chat Submission Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userMsg = inputMessage;
    setInputMessage('');
    
    const newUserMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userMsg,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      if (localStorage.getItem('hinov_offline_sim') === 'true') {
        throw new Error("Simulated Offline: Connexion réseau interrompue par l'utilisateur.");
      }
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `L'utilisateur demande : "${userMsg}"\n\nVoici les données réelles actuelles de l'application :\n${getContextString()}\n\nDonne une réponse précise, chiffrée si nécessaire, et professionnelle. S'il te demande de rédiger un mail, fais-le directement sans trop de blabla d'introduction.`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite.");
      }

      const botMessage: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: data.text || "Je m'excuse, mais je n'ai pas pu générer de réponse.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'assistant',
        text: "⚠️ Désolé, l'assistant IA est temporairement indisponible ou la clé d'API n'est pas encore configurée. Veuillez essayer de redémarrer le serveur de développement.",
        timestamp: new Date()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Executive summary generator
  const generateExecutiveReport = async () => {
    setIsSummaryLoading(true);
    setExecutiveSummary('');

    try {
      if (localStorage.getItem('hinov_offline_sim') === 'true') {
        throw new Error("Simulated Offline: Connexion réseau interrompue par l'utilisateur.");
      }
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Fais-moi un rapport exécutif financier de premier plan pour Hinov. Présente de manière extrêmement propre :\n1. Une synthèse globale (CA, Marges, Taux de recouvrement)\n2. Une évaluation des risques (factures en retard, clients à risque)\n3. Une analyse des forces commerciales (qui performe, qui a besoin d'accompagnement)\n4. 3 recommandations stratégiques concrètes basées sur ces chiffres.",
          systemInstruction: `Tu es un Directeur Financier Virtuel (CFO AI) pour Hinov. Utilise ces données réelles pour rédiger le rapport :\n${getContextString()}\nFormatte ta réponse en français avec un ton expert, rigoureux et poli, avec de beaux paragraphes, des listes claires et des données chiffrées.`
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setExecutiveSummary(data.text || '');
    } catch (err) {
      console.error(err);
      setExecutiveSummary("❌ Impossible de générer le rapport. Vérifiez que la clé d'API Gemini et le serveur sont bien actifs.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Automated Overdue Reminder draft generator
  const handleGenerateReminder = async () => {
    if (!selectedInvoiceId) return;
    setIsReminderLoading(true);
    setGeneratedReminder('');

    const invoice = factures.find(f => f.id === selectedInvoiceId);
    if (!invoice) return;

    const client = clients.find(c => c.id === invoice.client_id);
    const commercial = commerciaux.find(c => c.id === invoice.commercial_id);

    const toneInstruction = {
      diplomatic: "très courtois, bienveillant, axé sur la collaboration et l'oubli involontaire",
      assertive: "ferme, direct, insistant sur le dépassement de l'échéance et les délais requis",
      formal: "très protocolaire, juridique, mentionnant des pénalités de retard potentielles et mise en demeure"
    }[tone];

    const promptText = `Rédige un e-mail de relance de paiement pour la facture suivante :
- Numéro : ${invoice.numero}
- Client : ${client?.nom || 'Client Hinov'}
- Email Client : ${client?.email || 'contact@client.com'}
- Montant Total : ${invoice.montant.toLocaleString()} €
- Reste dû : ${invoice.reste.toLocaleString()} €
- Date d'Échéance Dépassée : ${new Date(invoice.date_echeance).toLocaleDateString('fr-FR')}
- Vendeur d'apport : ${commercial?.nom || 'Hinov'}

Le ton du courriel doit être ${toneInstruction}.`;

    try {
      if (localStorage.getItem('hinov_offline_sim') === 'true') {
        throw new Error("Simulated Offline: Connexion réseau interrompue par l'utilisateur.");
      }
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: "Tu es un gestionnaire de trésorerie professionnel et rigoureux. Rédige uniquement le texte de l'e-mail (Objet et Corps) prêt à être copié-collé, sans introductions méta ou commentaires externes."
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setGeneratedReminder(data.text || '');
    } catch (err) {
      console.error(err);
      setGeneratedReminder("❌ Échec de la génération de la relance. Vérifiez que le serveur Express fonctionne bien.");
    } finally {
      setIsReminderLoading(false);
    }
  };

  // Copy text to clipboard helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onTriggerNotification) {
      onTriggerNotification("Copié dans le presse-papiers !", "success");
    }
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick Preset Queries
  const quickPrompts = [
    { text: "Qui performe le mieux ?", icon: TrendingUp, query: "Qui est notre meilleur commercial en termes de CA et de marge d'apport ?" },
    { text: "Factures en retard", icon: AlertTriangle, query: "Quelles sont les factures en retard les plus urgentes, et quel est le montant total en souffrance ?" },
    { text: "Synthèse clients", icon: UserSquare, query: "Quels sont nos 3 plus gros clients et ont-ils des factures impayées ?" }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#00488d] dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Intelligence Artificielle</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Pilotez Hinov avec un assistant financier intelligent connecté à vos factures.</p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-800 text-[#00488d] dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Assistant Chat
          </button>
          <button
            onClick={() => setActiveTab('relances')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'relances'
                ? 'bg-white dark:bg-slate-800 text-[#00488d] dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Courriels de Relance
          </button>
          <button
            onClick={() => {
              setActiveTab('rapport');
              if (!executiveSummary) generateExecutiveReport();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rapport'
                ? 'bg-white dark:bg-slate-800 text-[#00488d] dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Rapport CFO Exécutif
          </button>
        </div>
      </div>

      {/* Main Tab Panels switcher */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* TAB 1: INTERACTIVE ASSISTANT CHAT */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
            {/* Left side: Chat area */}
            <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 overflow-hidden h-full">
              {/* Chat messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#00488d] text-white rounded-tr-none font-medium'
                          : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-wrap'
                      }`}>
                        {msg.text}
                        <div className={`text-[9px] mt-2 opacity-60 text-right ${msg.sender === 'user' ? 'text-slate-200' : 'text-slate-400'}`}>
                          {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isChatLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-slate-400 rounded-2xl rounded-tl-none p-4 flex items-center gap-2.5 text-xs font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin text-[#00488d]" />
                        <span>Hinov AI analyse vos données...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2.5">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Posez une question sur vos factures ou vos ventes..."
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#00488d]/30 dark:focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatLoading}
                  className="w-11 h-11 bg-[#00488d] hover:bg-[#005fb8] disabled:opacity-40 text-white rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right side: Presets & dynamic context */}
            <div className="lg:col-span-4 space-y-6">
              {/* Presets Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#00488d] dark:text-blue-400 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4" /> Suggestions rapides
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">Cliquez sur une suggestion pour lancer une analyse contextuelle instantanée.</p>
                <div className="space-y-2.5">
                  {quickPrompts.map((p, idx) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputMessage(p.query);
                          // focus input
                        }}
                        className="w-full text-left p-3.5 bg-slate-50 hover:bg-blue-50/40 dark:bg-slate-800/30 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800/50 rounded-2xl flex items-center gap-3 group transition-all"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-[#00488d] dark:group-hover:text-blue-400 border border-slate-100 dark:border-slate-700/80 shadow-xs shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#00488d] dark:group-hover:text-white transition-colors">{p.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Connected databases checklist */}
              <div className="bg-[#ccedae]/25 dark:bg-[#ccedae]/5 p-6 rounded-[28px] border border-[#ccedae]/30 text-slate-700 dark:text-slate-300 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0c2000] dark:text-emerald-400">Contextes d'application actifs</h4>
                </div>
                <ul className="text-[11px] space-y-2 font-semibold">
                  <li className="flex items-center gap-2">🟢 {factures.length} Factures comptabilisées</li>
                  <li className="flex items-center gap-2">🟢 {clients.length} Clients sécurisés</li>
                  <li className="flex items-center gap-2">🟢 {commerciaux.length} Commerciaux évalués</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OVERDUE REMINDER EMAIL GENERATOR */}
        {activeTab === 'relances' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
            {/* Input Selection Controls */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" /> Paramétrage du message
              </h3>

              <div className="space-y-4">
                {/* 1. Pick overdue invoice */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Facture en attente ou en retard :</label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00488d]/30 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">-- Sélectionnez une facture en attente --</option>
                    {factures
                      .filter(f => f.statut !== 'Payée')
                      .map(f => {
                        const cl = clients.find(c => c.id === f.client_id);
                        return (
                          <option key={f.id} value={f.id}>
                            {f.numero} - {cl?.nom || 'Client'} (Reste: {f.reste.toLocaleString()} € - {f.statut})
                          </option>
                        );
                      })
                    }
                  </select>
                </div>

                {/* 2. Choose tone of reminder */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Ton du courriel :</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'diplomatic', label: 'Diplomatique' },
                      { id: 'assertive', label: 'Direct & Ferme' },
                      { id: 'formal', label: 'Formel / Juridique' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTone(t.id as any)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold border transition-all ${
                          tone === t.id
                            ? 'bg-[#ccedae] border-[#b0df86] text-[#0c2000]'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Action Button */}
                <button
                  type="button"
                  onClick={handleGenerateReminder}
                  disabled={!selectedInvoiceId || isReminderLoading}
                  className="w-full mt-2 bg-[#00488d] hover:bg-[#005fb8] disabled:opacity-40 text-white flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-98"
                >
                  {isReminderLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rédaction IA en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Rédiger le courriel de relance</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Mail Output display */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-[32px] p-6 flex flex-col justify-between h-full min-h-[300px]">
              {generatedReminder ? (
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-3 mb-4">
                      <span className="text-xs font-bold text-[#00488d] dark:text-blue-400 uppercase tracking-widest">Aperçu du courrier rédigé</span>
                      <button
                        onClick={() => handleCopy(generatedReminder)}
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold"
                        title="Copier"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copié !' : 'Copier'}</span>
                      </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap select-all font-sans max-h-[350px] overflow-y-auto shadow-xs">
                      {generatedReminder}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
                  <Mail className="w-12 h-12 stroke-[1.2px] opacity-40 text-slate-400" />
                  <p className="text-xs font-bold">Sélectionnez une facture et cliquez sur le bouton de génération pour rédiger une relance professionnelle personnalisée.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EXECUTIVE CFO REPORT INSIGHTS */}
        {activeTab === 'rapport' && (
          <div className="bg-white dark:bg-slate-900 rounded-[32px] card-elevation border border-slate-100 dark:border-slate-800/40 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#516c3a]" />
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Rapport financier d'analyse d'activité</h3>
              </div>
              <button
                onClick={generateExecutiveReport}
                disabled={isSummaryLoading}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-[#00488d] rounded-full transition-all disabled:opacity-40"
                title="Régénérer l'analyse"
              >
                <RefreshCw className={`w-4 h-4 ${isSummaryLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isSummaryLoading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#00488d]" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Analyse CFO IA en cours...</p>
                  <p className="text-xs text-slate-400">Croisement des factures, calcul des rendements commerciaux et modélisation des risques...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 p-6 sm:p-8 rounded-[24px] text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans space-y-4">
                  {executiveSummary}
                </div>
                {executiveSummary && !executiveSummary.startsWith('❌') && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleCopy(executiveSummary)}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all active:scale-97"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Rapport copié !' : 'Copier le rapport complet'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
