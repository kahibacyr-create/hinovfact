import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  UserSquare2, 
  BarChart3, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Plus,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCreateInvoice: () => void;
  onLogout: () => void;
  unreadNotificationsCount: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
    role?: string;
  };
  appName?: string;
  appLogo?: string;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onCreateInvoice, 
  onLogout,
  unreadNotificationsCount,
  user,
  appName = 'Hinov Factures',
  appLogo = '/logo.jpeg'
}: SidebarProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'factures', label: 'Factures', icon: Receipt },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'vendeurs', label: 'Vendeurs', icon: UserSquare2 },
    { id: 'rapports', label: 'Rapports', icon: BarChart3 },
    { id: 'ia', label: 'Assistant IA', icon: Sparkles }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full max-h-screen overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-[#f1f4fa]/60 dark:bg-slate-900/40 flex flex-col p-6 w-72 z-40 hidden md:flex scrollbar-thin">
        {/* Header Branding */}
        <div className="mb-6 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-white border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            <img src={appLogo} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#00488d] dark:text-blue-400 leading-none">{appName.split(' ')[0] || appName}</h1>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Gestion Financière</p>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="mb-6 p-3 bg-white/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex items-center gap-3">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-850"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs uppercase border border-blue-200/50 dark:border-blue-900/40">
                {(user.firstName?.[0] || user.email[0] || 'U')}{(user.lastName?.[0] || '')}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Directeur'}
              </h4>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        {/* Primary Call to Action Button */}
        <button 
          onClick={onCreateInvoice}
          className="mb-8 w-full bg-[#00488d] hover:bg-[#005fb8] text-white flex items-center justify-center gap-2 py-3 px-4 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une facture</span>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                  isActive 
                    ? 'bg-[#ccedae] text-[#0c2000] shadow-sm font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'factures' && unreadNotificationsCount > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white font-bold text-[10px] flex items-center justify-center rounded-full">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 mt-auto space-y-1.5">
          <button 
            onClick={() => setActiveTab('aide')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'aide' 
                ? 'bg-[#ccedae] text-[#0c2000] font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-5 h-5 stroke-[1.8px]" />
            <span>Aide</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('profil')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'profil' 
                ? 'bg-[#ccedae] text-[#0c2000] font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-5 h-5 stroke-[1.8px]" />
            <span>Paramètres</span>
          </button>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-sm font-semibold text-rose-600 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 stroke-[1.8px]" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Responsive Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800/80 flex justify-around items-center h-16 z-50 px-3 backdrop-blur-md">
        {/* Dashboard */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileDrawerOpen(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-[#00488d] dark:text-blue-400 scale-105' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 stroke-[2px]" />
          <span className="text-[10px] font-bold tracking-tight">Accueil</span>
        </button>

        {/* Factures */}
        <button
          onClick={() => {
            setActiveTab('factures');
            setIsMobileDrawerOpen(false);
          }}
          className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'factures' ? 'text-[#00488d] dark:text-blue-400 scale-105' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Receipt className="w-5 h-5 stroke-[2px]" />
          <span className="text-[10px] font-bold tracking-tight">Factures</span>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Quick action button float for mobile */}
        <button
          onClick={() => {
            onCreateInvoice();
            setIsMobileDrawerOpen(false);
          }}
          className="w-12 h-12 bg-[#00488d] hover:bg-[#005fb8] text-white rounded-full shadow-lg -mt-8 flex items-center justify-center active:scale-90 transition-transform border-4 border-white dark:border-slate-900"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Assistant IA */}
        <button
          onClick={() => {
            setActiveTab('ia');
            setIsMobileDrawerOpen(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'ia' ? 'text-[#00488d] dark:text-blue-400 scale-105' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5 stroke-[2px]" />
          <span className="text-[10px] font-bold tracking-tight">IA Client</span>
        </button>

        {/* More Menu Toggle */}
        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            isMobileDrawerOpen ? 'text-[#00488d] dark:text-blue-400 scale-105' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {isMobileDrawerOpen ? (
            <X className="w-5 h-5 stroke-[2px] text-red-500" />
          ) : (
            <Menu className="w-5 h-5 stroke-[2px]" />
          )}
          <span className="text-[10px] font-bold tracking-tight">Plus</span>
        </button>
      </nav>

      {/* Mobile Drawer Slide-up Overlay */}
      {isMobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer Sheet */}
          <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-[32px] z-40 p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Menu de Navigation</span>
              <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setActiveTab('clients'); setIsMobileDrawerOpen(false); }}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold transition-all ${
                  activeTab === 'clients' 
                    ? 'bg-[#ccedae] border-[#b0df86] text-[#0c2000]' 
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Users className="w-4.5 h-4.5 shrink-0" />
                <span>Clients</span>
              </button>

              <button
                onClick={() => { setActiveTab('vendeurs'); setIsMobileDrawerOpen(false); }}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold transition-all ${
                  activeTab === 'vendeurs' 
                    ? 'bg-[#ccedae] border-[#b0df86] text-[#0c2000]' 
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <UserSquare2 className="w-4.5 h-4.5 shrink-0" />
                <span>Vendeurs</span>
              </button>

              <button
                onClick={() => { setActiveTab('rapports'); setIsMobileDrawerOpen(false); }}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold transition-all ${
                  activeTab === 'rapports' 
                    ? 'bg-[#ccedae] border-[#b0df86] text-[#0c2000]' 
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <BarChart3 className="w-4.5 h-4.5 shrink-0" />
                <span>Rapports</span>
              </button>

              <button
                onClick={() => { setActiveTab('aide'); setIsMobileDrawerOpen(false); }}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold transition-all ${
                  activeTab === 'aide' 
                    ? 'bg-[#ccedae] border-[#b0df86] text-[#0c2000]' 
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <HelpCircle className="w-4.5 h-4.5 shrink-0" />
                <span>Aide</span>
              </button>

              <button
                onClick={() => { setActiveTab('profil'); setIsMobileDrawerOpen(false); }}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold col-span-2 transition-all ${
                  activeTab === 'profil' 
                    ? 'bg-[#ccedae] border-[#b0df86] text-[#0c2000]' 
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Settings className="w-4.5 h-4.5 shrink-0" />
                <span>Paramètres de Profil & Thème</span>
              </button>
            </div>

            <button 
              onClick={() => { onLogout(); setIsMobileDrawerOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 transition-all border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnecter {appName.split(' ')[0] || appName}</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
