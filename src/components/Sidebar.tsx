import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../context/AppContext';
import {
  LayoutDashboard,
  Truck,
  Boxes,
  Layers,
  ShieldAlert,
  Factory,
  Hammer,
  Flame,
  PackageCheck,
  Send,
  DollarSign,
  FileText,
  BarChart3,
  Database,
  UserCog,
  History,
  Settings,
  X,
  MapPin,
  ShieldCheck,
  Award,
  LogOut,
  Building2,
  Wallet
} from 'lucide-react';

// Import official logo generated asset
import logoImg from '../assets/images/integral_nuts_logo_1785983199171.jpg';

interface SidebarProps {
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  isDesktopOpen?: boolean;
  onOpenNovoRecebimento?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenOnMobile,
  onCloseMobile,
  isDesktopOpen = true,
}) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    temPermissao,
    solicitacoesRecuperacaoSenha,
    logout,
    empresaConfig
  } = useApp();

  const pendentesSenha = (solicitacoesRecuperacaoSenha || []).filter((s) => s.status === 'Pendente').length;

  // Core Navigation Items
  const allNavItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'super-admin', label: 'Super Admin', icon: Building2 },
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'recebimento-compra', label: 'Recebimento e Compra', icon: Truck },
    { id: 'comprador', label: 'Portal do Comprador', icon: Wallet },
    { id: 'producao', label: 'Produção', icon: Factory },
    { id: 'expedicao', label: 'Expedição', icon: Send },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, badge: pendentesSenha > 0 ? `${pendentesSenha} ped.` : undefined },
  ];

  // RBAC Permission Filter: Filter modules according to current user's role
  const visibleNavItems = allNavItems.filter((item) => temPermissao(item.id));

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Dark Overlay Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#06120B]/80 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Retractable Sidebar Drawer styled in Amazon Forest Green (#0C2317) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[78vw] max-w-[300px] sm:w-72 bg-[#0C2317] text-amber-50 border-r border-[#193F2B] flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isDesktopOpen ? 'lg:static lg:translate-x-0 lg:w-72' : 'lg:hidden'
        } ${
          isOpenOnMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header Section with Official Brand Logo */}
        <div className="p-4 sm:p-5 border-b border-[#183E2A] flex items-center justify-between shrink-0 bg-[#091D13]">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleSelectTab('dashboard')}
          >
            {/* Official Logo Frame */}
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md shrink-0 bg-amber-50">
              <img
                src={empresaConfig?.logotipoUrl || logoImg}
                alt={`${empresaConfig?.nomeFantasia || 'Empresa'} Logo`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="min-w-0">
              <div className="font-black text-sm sm:text-base text-white tracking-tight truncate leading-tight flex items-center gap-1">
                <span>{empresaConfig?.nomeFantasia || empresaConfig?.razaoSocial || 'Integral NUTS'}</span>
              </div>
              <div className="text-[10px] text-amber-300/90 font-bold flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{empresaConfig?.municipioUF || 'Monte Dourado • PA'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {/* Category Header with Tagline */}
          <div className="px-3 pt-1 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-300/80 tracking-widest uppercase">
              PRINCIPAL
            </span>
            <span className="text-[9px] font-bold text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
              {currentUser?.perfil || 'Acesso'}
            </span>
          </div>

          {/* Tagline Badge */}
          <div className="px-3 pb-3">
            <div className="text-[9px] font-semibold text-amber-200/70 bg-[#143B27] px-2.5 py-1 rounded-lg border border-[#1F5438] flex items-center gap-1.5">
              <Award className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Qualidade • Origem • Confiança</span>
            </div>
          </div>

          {/* Module Links List */}
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#1C4D33] text-white font-bold shadow-sm border border-emerald-500/40'
                    : 'text-slate-200 hover:text-white hover:bg-[#143B27]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-amber-400'
                        : 'text-emerald-300/70 group-hover:text-emerald-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Fixed Footer: Developer Credit & Active User Info */}
        <div className="p-3.5 border-t border-[#183E2A] bg-[#07160E] space-y-2.5 shrink-0">
          <div className="text-[9px] text-amber-200/50 font-bold uppercase tracking-widest px-1 text-center sm:text-left">
            USINA MONTE DOURADO — VALE DO JARI
          </div>

          {/* Active User Card */}
          <div className="bg-[#102D1E] p-2.5 rounded-2xl border border-[#1A4730] flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* User Photo / Icon Circle */}
              <div className="relative shrink-0">
                {currentUser?.foto ? (
                  <img
                    src={currentUser.foto}
                    alt={currentUser.nome}
                    className="w-9 h-9 rounded-full object-cover border border-amber-400/50 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#6E3B19] flex items-center justify-center text-amber-100 font-extrabold text-xs shadow-xs border border-amber-400/40">
                    {currentUser?.nome ? currentUser.nome.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#102D1E]" />
              </div>

              {/* User Name & Profile Badge */}
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate leading-snug">
                  {currentUser?.nome || 'Usuário'}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="px-2 py-0.2 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-[#5C2C10] text-amber-200 border border-amber-500/30">
                    {currentUser?.perfil || 'Administrador'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout / Sair Button */}
            <button
              onClick={() => {
                logout();
                if (isOpenOnMobile) onCloseMobile();
              }}
              className="p-2 bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-white rounded-xl border border-red-800/60 transition-all cursor-pointer shrink-0 flex items-center gap-1 text-[11px] font-black group shadow-2xs"
              title="Sair do Sistema (Delogar)"
            >
              <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="inline">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

