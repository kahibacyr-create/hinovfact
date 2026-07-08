import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Bell,
  LogOut,
  Receipt,
  Terminal,
  Wifi,
  WifiOff,
  Database,
  Copy,
  PlusCircle
} from 'lucide-react';

import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceDetail from './components/InvoiceDetail';
import InvoiceForm from './components/InvoiceForm';
import ClientsList from './components/ClientsList';
import CommerciauxList from './components/CommerciauxList';
import Reports from './components/Reports';
import Profile from './components/Profile';
import Aide from './components/Aide';
import AIAssistant from './components/AIAssistant';
import AdminDashboard from './components/AdminDashboard';
import SetupDirectorPassword from './components/SetupDirectorPassword';

import { 
  Client, 
  Commercial, 
  Service, 
  Facture, 
  Paiement,
  NotificationAlert,
  Director
} from './types';

import { 
  INITIAL_CLIENTS, 
  INITIAL_COMMERCIAUX, 
  INITIAL_SERVICES, 
  INITIAL_FACTURES, 
  INITIAL_PAIEMENTS,
  calculateInvoiceFields
} from './data/mockData';

export default function App() {
  // Splash & Authentication States
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('hinov_auth') === 'true';
  });

  // Directors List Database
  const [directors, setDirectors] = useState<Director[]>(() => {
    const saved = localStorage.getItem('hinov_directors');
    if (saved) {
      return JSON.parse(saved);
    }
    const defaultDirectors: Director[] = [
      {
        email: 'jm.hinov@hinov-factures.com',
        firstName: 'Jean-Marc',
        lastName: 'Hinov',
        password: 'director2026',
        avatarUrl: '',
        status: 'active',
        setupToken: 'root-token'
      }
    ];
    localStorage.setItem('hinov_directors', JSON.stringify(defaultDirectors));
    return defaultDirectors;
  });

  // Check URL parameters for setup token
  const [setupParams, setSetupParams] = useState<{ token: string; email: string } | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('setup_token');
    const email = params.get('email');
    if (token && email) {
      return { token, email };
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hinov_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email === 'admin@hinov-factures.com') {
        parsed.role = 'admin';
      } else if (!parsed.role) {
        parsed.role = 'director';
      }
      if (!parsed.firstName && parsed.name) {
        const parts = parsed.name.split(' ');
        parsed.firstName = parts[0] || '';
        parsed.lastName = parts.slice(1).join(' ') || '';
      }
      return parsed;
    }
    return {
      firstName: 'Jean-Marc',
      lastName: 'Hinov',
      email: 'jm.hinov@hinov-factures.com',
      password: 'director2026',
      avatarUrl: '',
      role: 'director'
    };
  });

  // Database States
  const [factures, setFactures] = useState<Facture[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [commerciaux, setCommerciaux] = useState<Commercial[]>([]);
  const [services] = useState<Service[]>(INITIAL_SERVICES);

  // Layout & Navigation States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hinov_dark_mode') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global App settings states (Dynamic App Name & Logo)
  const [appName, setAppName] = useState(() => {
    return localStorage.getItem('hinov_app_name') || 'Hinov Factures';
  });
  const [appLogo, setAppLogo] = useState(() => {
    return localStorage.getItem('hinov_app_logo') || '/logo.jpeg';
  });

  const handleUpdateAppSettings = (newName: string, newLogo: string) => {
    setAppName(newName);
    setAppLogo(newLogo);
    localStorage.setItem('hinov_app_name', newName);
    localStorage.setItem('hinov_app_logo', newLogo);
  };

  // Global Search Transfer State
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');

  // Toast Notifications States
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  // Developer / Mock Simulator States
  const [isDevMode, setIsDevMode] = useState(() => {
    return localStorage.getItem('hinov_dev_mode') === 'true';
  });
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(() => {
    return localStorage.getItem('hinov_offline_sim') === 'true';
  });
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);

  // 1. Initialize and Load Offline-First Database from LocalStorage
  useEffect(() => {
    // Clients
    const storedClients = localStorage.getItem('hinov_clients');
    if (storedClients) {
      setClients(JSON.parse(storedClients));
    } else {
      setClients(INITIAL_CLIENTS);
      localStorage.setItem('hinov_clients', JSON.stringify(INITIAL_CLIENTS));
    }

    // Commercials
    const storedCommerciaux = localStorage.getItem('hinov_commerciaux');
    if (storedCommerciaux) {
      setCommerciaux(JSON.parse(storedCommerciaux));
    } else {
      setCommerciaux(INITIAL_COMMERCIAUX);
      localStorage.setItem('hinov_commerciaux', JSON.stringify(INITIAL_COMMERCIAUX));
    }

    // Payments
    const storedPaiements = localStorage.getItem('hinov_paiements');
    if (storedPaiements) {
      setPaiements(JSON.parse(storedPaiements));
    } else {
      setPaiements(INITIAL_PAIEMENTS);
      localStorage.setItem('hinov_paiements', JSON.stringify(INITIAL_PAIEMENTS));
    }

    // Invoices
    const storedFactures = localStorage.getItem('hinov_factures');
    if (storedFactures) {
      setFactures(JSON.parse(storedFactures));
    } else {
      setFactures(INITIAL_FACTURES);
      localStorage.setItem('hinov_factures', JSON.stringify(INITIAL_FACTURES));
    }
  }, []);

  // Sync Dark Mode state with document layout
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hinov_dark_mode', String(darkMode));
  }, [darkMode]);

  // Helper to trigger a floating toast message
  const triggerToast = useCallback((message: string, type: 'success' | 'info' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Recalculates an entire invoice's paid amounts and status based on current payments table
  const recalculateInvoice = useCallback((factureId: string, currentPaiements: Paiement[], currentFactures: Facture[]) => {
    const targetInvoice = currentFactures.find(f => f.id === factureId);
    if (!targetInvoice) return currentFactures;

    // Filter payments for this invoice
    const relatedPayments = currentPaiements.filter(p => p.facture_id === factureId);
    const sumPaid = relatedPayments.reduce((acc, p) => acc + p.montant, 0);

    // Run business rules calculations
    const calculations = calculateInvoiceFields(
      targetInvoice.montant,
      targetInvoice.montant_utilise,
      sumPaid,
      targetInvoice.date_livraison
    );

    // Update the invoice fields
    return currentFactures.map(f => {
      if (f.id === factureId) {
        return {
          ...f,
          montant_paye: sumPaid,
          reste: calculations.reste,
          statut: calculations.statut,
          date_echeance: calculations.dateEcheance,
          marge: calculations.marge,
          prime: calculations.prime
        };
      }
      return f;
    });
  }, []);

  // 2. Authentication handlers
  const handleLogin = (loggedUser: any) => {
    setIsAuthenticated(true);
    setUser(loggedUser);
    localStorage.setItem('hinov_auth', 'true');
    localStorage.setItem('hinov_user', JSON.stringify(loggedUser));
    
    if (loggedUser.role === 'admin') {
      triggerToast('Authentification réussie. Espace Administrateur ouvert.', 'success');
    } else {
      triggerToast(`Authentification réussie. Bienvenue, Directeur ${loggedUser.firstName}.`, 'success');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hinov_auth');
    triggerToast('Session clôturée avec succès.', 'info');
  };

  const handleUpdateProfileUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('hinov_user', JSON.stringify(updatedUser));
    
    // Update credentials in directors list so login works with new password / photo
    if (updatedUser.role === 'director') {
      const updatedList = directors.map((d) => {
        if (d.email.toLowerCase() === updatedUser.email.toLowerCase()) {
          return {
            ...d,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            password: updatedUser.password,
            avatarUrl: updatedUser.avatarUrl,
            status: 'active' as const
          };
        }
        return d;
      });
      setDirectors(updatedList);
      localStorage.setItem('hinov_directors', JSON.stringify(updatedList));
    }
  };

  // Director Operations
  const handleAddDirector = (email: string) => {
    const token = Math.random().toString(36).substring(2, 10);
    const newDirector: Director = {
      email,
      status: 'pending',
      setupToken: token
    };
    const updated = [...directors, newDirector];
    setDirectors(updated);
    localStorage.setItem('hinov_directors', JSON.stringify(updated));

    const link = `${window.location.origin}?setup_token=${token}&email=${encodeURIComponent(email)}`;
    return { link, token };
  };

  const handleDeleteDirector = (email: string) => {
    const updated = directors.filter(d => d.email.toLowerCase() !== email.toLowerCase());
    setDirectors(updated);
    localStorage.setItem('hinov_directors', JSON.stringify(updated));
  };

  const handleCompleteSetup = (firstName: string, lastName: string, password: string, avatarUrl: string) => {
    if (!setupParams) return;
    
    const updatedDirectors = directors.map(d => {
      if (d.email.toLowerCase() === setupParams.email.toLowerCase()) {
        return {
          ...d,
          firstName,
          lastName,
          password,
          avatarUrl,
          status: 'active' as const
        };
      }
      return d;
    });

    setDirectors(updatedDirectors);
    localStorage.setItem('hinov_directors', JSON.stringify(updatedDirectors));

    setSetupParams(null);
    window.history.replaceState({}, document.title, window.location.pathname);
    triggerToast("Compte Directeur configuré ! Connectez-vous avec votre email et mot de passe.", "success");
  };

  // 3. Invoice Operations (CRUD & Business Formula recalculations)
  const handleSaveInvoice = (savedInvoice: Facture) => {
    let updatedFactures = [...factures];
    const exists = factures.some(f => f.id === savedInvoice.id);

    if (exists) {
      // Edit mode: replace and recalculate payments
      updatedFactures = factures.map(f => f.id === savedInvoice.id ? savedInvoice : f);
      triggerToast(`Facture ${savedInvoice.numero} mise à jour avec succès.`, 'success');
    } else {
      // New mode: add
      updatedFactures.unshift(savedInvoice);
      triggerToast(`Nouvelle Facture ${savedInvoice.numero} créée avec succès.`, 'success');
    }

    // Recalculate status and paid sums
    updatedFactures = recalculateInvoice(savedInvoice.id, paiements, updatedFactures);

    setFactures(updatedFactures);
    localStorage.setItem('hinov_factures', JSON.stringify(updatedFactures));
    
    // Return to the invoice manager
    setActiveTab('factures');
    setEditInvoiceId(null);
    setIsCreateInvoiceOpen(false);
    setViewInvoiceId(null);
  };

  const handleDeleteInvoice = (id: string) => {
    const target = factures.find(f => f.id === id);
    
    // Filter out invoice
    const updatedFactures = factures.filter(f => f.id !== id);
    // Also remove associated payments as cascading delete
    const updatedPayments = paiements.filter(p => p.facture_id !== id);

    setFactures(updatedFactures);
    setPaiements(updatedPayments);
    localStorage.setItem('hinov_factures', JSON.stringify(updatedFactures));
    localStorage.setItem('hinov_paiements', JSON.stringify(updatedPayments));

    triggerToast(`Facture ${target?.numero || ''} supprimée.`, 'info');
    
    if (viewInvoiceId === id) setViewInvoiceId(null);
    if (editInvoiceId === id) setEditInvoiceId(null);
  };

  // 4. Payment Operations (CRUD with cascading automatic math updates on invoices)
  const handleAddPayment = (newPaymentRaw: Omit<Paiement, 'id'>) => {
    const paymentWithId: Paiement = {
      ...newPaymentRaw,
      id: `pay_${Math.floor(10000 + Math.random() * 90000)}`
    };

    const updatedPayments = [paymentWithId, ...paiements];
    setPaiements(updatedPayments);
    localStorage.setItem('hinov_paiements', JSON.stringify(updatedPayments));

    // Recalculate target invoice paid status & balance
    const updatedFactures = recalculateInvoice(newPaymentRaw.facture_id, updatedPayments, factures);
    setFactures(updatedFactures);
    localStorage.setItem('hinov_factures', JSON.stringify(updatedFactures));

    triggerToast(`Encaissement de ${newPaymentRaw.montant.toLocaleString()} € enregistré !`, 'success');
  };

  const handleDeletePayment = (paymentId: string) => {
    const targetPayment = paiements.find(p => p.id === paymentId);
    if (!targetPayment) return;

    const updatedPayments = paiements.filter(p => p.id !== paymentId);
    setPaiements(updatedPayments);
    localStorage.setItem('hinov_paiements', JSON.stringify(updatedPayments));

    // Recalculate target invoice paid status & balance
    const updatedFactures = recalculateInvoice(targetPayment.facture_id, updatedPayments, factures);
    setFactures(updatedFactures);
    localStorage.setItem('hinov_factures', JSON.stringify(updatedFactures));

    triggerToast('Versement annulé. Solde restant recalculé.', 'info');
  };

  // 5. Client Operations
  const handleAddClient = (newClientRaw: Omit<Client, 'id'>) => {
    const clientWithId: Client = {
      ...newClientRaw,
      id: `cli_${Math.floor(1000 + Math.random() * 9000)}`
    };
    const updated = [...clients, clientWithId];
    setClients(updated);
    localStorage.setItem('hinov_clients', JSON.stringify(updated));
  };

  // 6. Commercial Operations
  const handleAddCommercial = (newCommRaw: Omit<Commercial, 'id'>) => {
    const commWithId: Commercial = {
      ...newCommRaw,
      id: `com_${Math.floor(1000 + Math.random() * 9000)}`
    };
    const updated = [...commerciaux, commWithId];
    setCommerciaux(updated);
    localStorage.setItem('hinov_commerciaux', JSON.stringify(updated));
  };

  // 7. Data reset back to initial specifications
  const handleResetData = () => {
    localStorage.removeItem('hinov_factures');
    localStorage.removeItem('hinov_paiements');
    localStorage.removeItem('hinov_clients');
    localStorage.removeItem('hinov_commerciaux');

    setClients(INITIAL_CLIENTS);
    setCommerciaux(INITIAL_COMMERCIAUX);
    setPaiements(INITIAL_PAIEMENTS);
    setFactures(INITIAL_FACTURES);

    localStorage.setItem('hinov_clients', JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem('hinov_commerciaux', JSON.stringify(INITIAL_COMMERCIAUX));
    localStorage.setItem('hinov_paiements', JSON.stringify(INITIAL_PAIEMENTS));
    localStorage.setItem('hinov_factures', JSON.stringify(INITIAL_FACTURES));

    setActiveTab('dashboard');
    setViewInvoiceId(null);
    setEditInvoiceId(null);
  };

  // 8. Generate 5 random mock invoices to stress test calculations & dashboard rendering
  const handleSeedRandomInvoices = () => {
    if (clients.length === 0 || commerciaux.length === 0) {
      triggerToast("Impossible de générer des factures : pas de clients ou commerciaux.", "error");
      return;
    }
    const newInvoices: Facture[] = [];
    const generatedPayments: Paiement[] = [];
    
    for (let i = 1; i <= 5; i++) {
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const randomCommercial = commerciaux[Math.floor(Math.random() * commerciaux.length)];
      const randomService = services[Math.floor(Math.random() * services.length)];
      const montantVal = Math.floor(2000 + Math.random() * 15000);
      const costVal = Math.floor(montantVal * (0.4 + Math.random() * 0.45)); // 40-85% cost
      const daysOffset = Math.floor(-45 + Math.random() * 30); // Random dates
      
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      const dateLivraisonStr = date.toISOString().split('T')[0];
      
      const isPaid = Math.random() > 0.5;
      const amountPaid = isPaid ? montantVal : (Math.random() > 0.5 ? Math.floor(montantVal * 0.3) : 0);
      
      const calculations = calculateInvoiceFields(
        montantVal,
        costVal,
        amountPaid,
        dateLivraisonStr
      );
      
      const invoiceId = `fac_dev_${Math.floor(10000 + Math.random() * 90000)}`;
      const numFac = `FAC-DEV-${Math.floor(100 + Math.random() * 900)}`;
      
      const newInvoice: Facture = {
        id: invoiceId,
        numero: numFac,
        client_id: randomClient.id,
        commercial_id: randomCommercial.id,
        service_id: randomService.id,
        categorie_id: 'cat_standard',
        date_livraison: dateLivraisonStr,
        date_echeance: calculations.dateEcheance,
        montant: montantVal,
        montant_utilise: costVal,
        marge: calculations.marge,
        prime: calculations.prime,
        montant_paye: amountPaid,
        reste: calculations.reste,
        statut: calculations.statut,
        created_at: dateLivraisonStr
      };
      
      newInvoices.push(newInvoice);

      if (amountPaid > 0) {
        generatedPayments.push({
          id: `pay_dev_${Math.floor(10000 + Math.random() * 90000)}`,
          facture_id: invoiceId,
          montant: amountPaid,
          date_paiement: dateLivraisonStr,
          mode_paiement: 'Virement',
          reference: 'DEV-SEED-AUTO',
          observation: 'Généré automatiquement par le mode développeur'
        });
      }
    }
    
    const updatedFactures = [...newInvoices, ...factures];
    const updatedPayments = [...generatedPayments, ...paiements];
    
    setFactures(updatedFactures);
    setPaiements(updatedPayments);
    localStorage.setItem('hinov_factures', JSON.stringify(updatedFactures));
    localStorage.setItem('hinov_paiements', JSON.stringify(updatedPayments));
    
    triggerToast("5 factures de simulation générées avec succès !", "success");
  };

  // Global search triggers from Dashboard to Invoice List
  const handleDashboardSearchQuery = (query: string) => {
    setDashboardSearchQuery(query);
    setActiveTab('factures');
  };

  // Count unread notifications (e.g. invoices in 'En retard')
  const overdueCount = useMemo(() => {
    return factures.filter(f => f.statut === 'En retard').length;
  }, [factures]);

  // Main router navigation state solver
  const renderActiveTabContent = () => {
    // Sub-routes override main navigation
    if (viewInvoiceId) {
      return (
        <InvoiceDetail 
          invoiceId={viewInvoiceId}
          factures={factures}
          clients={clients}
          commerciaux={commerciaux}
          services={services}
          paiements={paiements}
          onBackToList={() => setViewInvoiceId(null)}
          onEditInvoice={(id) => {
            setEditInvoiceId(id);
            setViewInvoiceId(null);
          }}
          onAddPayment={handleAddPayment}
          onDeletePayment={handleDeletePayment}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            factures={factures}
            clients={clients}
            commerciaux={commerciaux}
            onViewInvoice={setViewInvoiceId}
            onSearchQuery={handleDashboardSearchQuery}
            onTriggerNotification={triggerToast}
          />
        );
      case 'factures':
        // Transfer search query if triggered from dashboard, then reset
        const initialSearch = dashboardSearchQuery;
        if (dashboardSearchQuery) {
          setTimeout(() => setDashboardSearchQuery(''), 100);
        }
        return (
          <InvoiceList 
            factures={factures}
            clients={clients}
            commerciaux={commerciaux}
            onViewInvoice={setViewInvoiceId}
            onEditInvoice={setEditInvoiceId}
            onDeleteInvoice={handleDeleteInvoice}
            onCreateInvoice={() => setIsCreateInvoiceOpen(true)}
          />
        );
      case 'clients':
        return (
          <ClientsList 
            clients={clients}
            factures={factures}
            onAddClient={handleAddClient}
            onViewInvoice={setViewInvoiceId}
            onTriggerNotification={triggerToast}
          />
        );
      case 'vendeurs':
        return (
          <CommerciauxList 
            commerciaux={commerciaux}
            factures={factures}
            onAddCommercial={handleAddCommercial}
            onTriggerNotification={triggerToast}
          />
        );
      case 'rapports':
        return (
          <Reports 
            factures={factures}
            clients={clients}
            onTriggerNotification={triggerToast}
          />
        );
      case 'ia':
        return (
          <AIAssistant 
            factures={factures}
            clients={clients}
            commerciaux={commerciaux}
            onViewInvoice={setViewInvoiceId}
            onTriggerNotification={triggerToast}
          />
        );
      case 'aide':
        return <Aide />;
      case 'profil':
        return (
          <Profile 
            user={user}
            onUpdateUser={handleUpdateProfileUser}
            onResetData={handleResetData}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onTriggerNotification={triggerToast}
            isDevMode={isDevMode}
            setIsDevMode={(val) => {
               setIsDevMode(val);
               localStorage.setItem('hinov_dev_mode', String(val));
            }}
            onLogout={handleLogout}
          />
        );
      default:
        return <div className="text-slate-400 font-semibold p-8 text-center">Onglet en cours de développement.</div>;
    }
  };

  // Render password definition screen for Director setup link
  if (setupParams) {
    return (
      <SetupDirectorPassword 
        email={setupParams.email}
        token={setupParams.token}
        onCompleteSetup={handleCompleteSetup}
        onTriggerNotification={triggerToast}
      />
    );
  }

  // Render Splash Entrance
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} appName={appName} appLogo={appLogo} />;
  }

  // Render Secured Login Portal
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} appName={appName} appLogo={appLogo} />;
  }

  // Render Admin Dashboard
  if (isAuthenticated && user.role === 'admin') {
    return (
      <AdminDashboard 
        directors={directors}
        onAddDirector={handleAddDirector}
        onDeleteDirector={handleDeleteDirector}
        onLogout={handleLogout}
        onTriggerNotification={triggerToast}
        appName={appName}
        appLogo={appLogo}
        onUpdateAppSettings={handleUpdateAppSettings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] dark:bg-slate-950 font-sans transition-colors duration-200 text-slate-800 dark:text-slate-100 flex pb-16 md:pb-0">
      
      {/* 1. Sidebar Left Panel */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
          // Reset child views when jumping tabs
          setEditInvoiceId(null);
          setViewInvoiceId(null);
        }}
        onCreateInvoice={() => {
          setIsCreateInvoiceOpen(true);
          setEditInvoiceId(null);
          setViewInvoiceId(null);
          setMobileMenuOpen(false);
        }}
        onLogout={handleLogout}
        unreadNotificationsCount={overdueCount}
        user={user}
        appName={appName}
        appLogo={appLogo}
      />

      {/* 2. Main Work Content */}
      <main className="flex-1 md:ml-72 min-h-screen relative flex flex-col">
        {/* Mobile Header Bar */}
        <header className="md:hidden glass-header dark:glass-header-dark border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 h-14 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#00488d] dark:text-blue-400" />
            <h1 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">{appName}</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-rose-500 cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </header>

        {/* Dynamic Inner Panel View with slide transitions */}
        <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (viewInvoiceId || '') + (editInvoiceId || '')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderActiveTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 4. Global Invoice Form Modal Overlay */}
      <AnimatePresence>
        {(isCreateInvoiceOpen || !!editInvoiceId) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCreateInvoiceOpen(false);
                setEditInvoiceId(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-[#f7f9ff] dark:bg-slate-950 w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[32px] p-6 md:p-8 relative shadow-2xl z-10 border border-slate-200 dark:border-slate-850 space-y-6"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCreateInvoiceOpen(false);
                  setEditInvoiceId(null);
                }}
                className="absolute top-6 right-6 p-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer z-30 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pt-2">
                <InvoiceForm 
                  editInvoiceId={editInvoiceId || undefined}
                  factures={factures}
                  clients={clients}
                  commerciaux={commerciaux}
                  services={services}
                  onBack={() => {
                    setIsCreateInvoiceOpen(false);
                    setEditInvoiceId(null);
                  }}
                  onSave={handleSaveInvoice}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Global Floating Notification Toasts Engine */}
      <div className="fixed bottom-20 md:bottom-6 right-6 flex flex-col gap-2.5 z-50 max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border ${
                toast.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                  : toast.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-500/20 text-rose-800 dark:text-rose-400'
                    : 'bg-blue-50 dark:bg-blue-950/90 border-blue-500/20 text-blue-800 dark:text-blue-400'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              )}
              <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 5. Floating Interactive Developer HUD / Console */}
      {isDevMode && (
        <div className="fixed bottom-20 md:bottom-6 left-6 z-50">
          <AnimatePresence>
            {!isDevConsoleOpen ? (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => setIsDevConsoleOpen(true)}
                className="h-11 px-4 bg-slate-900 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold rounded-full border border-emerald-500/30 shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 animate-bounce"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <Terminal className="w-4 h-4" />
                <span>Console Dev</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="bg-slate-900 text-slate-100 p-6 rounded-3xl w-80 max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-800 flex flex-col gap-4 font-mono text-xs"
              >
                {/* HUD Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>HINOV DEV_CONSOLE</span>
                  </div>
                  <button
                    onClick={() => setIsDevConsoleOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section: Network Simulator */}
                <div className="space-y-2.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Simulations Réseau</div>
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-400">Mode Hors-ligne</span>
                    <button
                      onClick={() => {
                        const nextVal = !isOfflineSimulated;
                        setIsOfflineSimulated(nextVal);
                        localStorage.setItem('hinov_offline_sim', String(nextVal));
                        triggerToast(
                          nextVal ? "Réseau simulé coupé. L'assistant IA signalera des erreurs." : "Connexion réseau rétablie.",
                          nextVal ? "error" : "success"
                        );
                      }}
                      className={`h-5 w-9 rounded-full transition-colors relative ${isOfflineSimulated ? 'bg-rose-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all ${isOfflineSimulated ? 'right-0.75' : 'left-0.75'}`} />
                    </button>
                  </div>
                </div>

                {/* Section: Data generation & seeding */}
                <div className="space-y-2.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Seeding & Stress-test</div>
                  <button
                    onClick={handleSeedRandomInvoices}
                    className="w-full h-9 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-emerald-500/20 active:scale-98 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Injecter 5 Factures</span>
                  </button>
                </div>

                {/* Section: Inspect data database */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Base Active (localStorage)</span>
                    <button
                      onClick={() => {
                        const dbStr = JSON.stringify({ factures, paiements, clients, commerciaux }, null, 2);
                        navigator.clipboard.writeText(dbStr);
                        triggerToast("JSON exporté dans le presse-papiers !", "success");
                      }}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copier JSON</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 h-28 overflow-y-auto text-[10px] text-slate-400 space-y-1 select-all font-mono">
                    <div>// Métriques :</div>
                    <div>Factures: {factures.length}</div>
                    <div>Paiements: {paiements.length}</div>
                    <div>Clients: {clients.length}</div>
                    <div>Vendeurs: {commerciaux.length}</div>
                    <div className="text-[9px] text-slate-600 mt-2">// Échantillon :</div>
                    <pre className="text-[8px] leading-tight text-slate-500 whitespace-pre">
                      {JSON.stringify(factures.slice(0, 1), null, 2)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
