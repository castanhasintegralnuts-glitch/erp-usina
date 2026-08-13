import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, ArrowLeft, PackagePlus, ShieldCheck, LogOut, Building2, Database } from 'lucide-react';

import logoImg from '../assets/images/integral_nuts_logo_1785983199171.jpg';

interface HeaderProps {
  onToggleMenu: () => void;
  onOpenNovoRecebimento: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMenu, onOpenNovoRecebimento }) => {
  const {
    isFirebaseConnected,
    activeTab,
    setActiveTab,
    currentUser,
    usuarios,
    switchUser,
    temPermissao,
    logout,
    empresaConfig,
    unidades,
    activeUnidadeId,
    setActiveUnidadeId
  } = useApp();

  const tabTitles: Record<string, string> = {
    'super-admin': 'Super Administrador — Gestão Multiusina & Módulos',
    comprador: 'Portal do Comprador — Desempenho & Ordens de Compra',
    dashboard: 'Painel Inicial e Controle Operacional',
    fornecedores: 'Gestão e Cadastro de Fornecedores',
    'estoque-casca': 'Estoque de Castanha com Casca',
    lotes: 'Formação e Rastreabilidade de Lotes',
    'quebra-manual': 'Gestão da Quebra Manual da Usina',
    quarentena: 'Controle de Quarentena e Aeração',
    producao: 'Linha de Beneficiamento Industrial',
    secagem: 'Estufagem e Desidratação',
    'estoque-acabado': 'Estoque de Produto Acabado',
    saidas: 'Saídas e Expedição de Romaneios',
    financeiro: 'Módulo Financeiro e Pagamentos',
    documentos: 'Central de Documentos A4',
    relatorios: 'Relatórios Gerenciais e Exportação',
    cadastros: 'Cadastros Gerais do Sistema',
    usuarios: 'Gestão de Usuários e Controle de Acesso',
    auditoria: 'Trilha de Auditoria e Logs do Sistema',
    configuracoes: 'Parâmetros da Fábrica',
  };

  return (
    <header className="bg-white border-b border-emerald-900/10 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Menu Toggle Button & Title & Back Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMenu}
            className="px-3 py-2 text-[#143D23] hover:text-[#0E2C19] bg-emerald-50 hover:bg-emerald-100/80 rounded-xl transition-all cursor-pointer border border-emerald-200/80 flex items-center gap-2 shadow-2xs group"
            aria-label="Abrir ou recolher menu lateral"
            title="Abrir / Alternar Menu Lateral"
          >
            <Menu className="w-5 h-5 text-[#143D23] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-[#143D23] hidden sm:inline">Menu</span>
          </button>

          {activeTab !== 'dashboard' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#143D23] hover:bg-[#0E2C19] text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-xs border border-emerald-700/60 shrink-0"
              title="Voltar ao Painel Principal"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Voltar</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            {/* Small Brand Logo Thumbnail */}
            <img
              src={empresaConfig?.logotipoUrl || logoImg}
              alt="Logo da Empresa"
              className="w-9 h-9 rounded-full object-cover border border-amber-500/40 shadow-xs shrink-0 hidden sm:block"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[#143D23] text-sm sm:text-base tracking-tight">
                  {empresaConfig?.nomeFantasia || empresaConfig?.razaoSocial || 'Integral NUTS — Monte Dourado'}
                </span>
                <span className="bg-[#143D23]/10 text-[#143D23] text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-800/20 hidden md:inline-block">
                  Qualidade • Origem • Confiança
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {tabTitles[activeTab] || 'Gestão da Fábrica'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Active User Status & Unit Selector */}
        <div className="flex items-center gap-2.5">
          
          {/* Seletor de Unidade / Filial */}
          <div className="hidden lg:flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/80 text-xs text-amber-900">
            <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
            <select
              value={activeUnidadeId}
              onChange={(e) => setActiveUnidadeId(e.target.value)}
              className="bg-transparent font-bold text-amber-950 focus:outline-none cursor-pointer py-0.5"
            >
              <option value="todas">🌐 Visão Consolidada (Todas)</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  🏭 {u.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Firebase Firestore Connection Status */}
          <div className="hidden sm:flex items-center gap-1.5 bg-sky-50/90 px-2.5 py-1 rounded-xl border border-sky-200 text-xs text-sky-900 font-bold" title="Banco de dados Firestore ativado e sincronizado em tempo real">
            <Database className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-sky-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{isFirebaseConnected ? 'Firestore Ativo' : 'Conectando...'}</span>
          </div>

          {/* Active User Switcher Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-2xl border border-emerald-200 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#143D23] shrink-0" />
            <div className="flex items-center gap-1 font-bold text-[#143D23]">
              <span>Usuário:</span>
              <select
                value={currentUser?.id || ''}
                onChange={(e) => switchUser(e.target.value)}
                className="bg-transparent font-black text-[#143D23] focus:outline-none cursor-pointer py-0.5"
                title="Alternar Usuário de Teste / Sessão"
              >
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.perfil})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {temPermissao('fornecedores') && (
            <button
              onClick={onOpenNovoRecebimento}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#143D23] hover:bg-[#0E2C19] text-white font-extrabold rounded-xl text-xs shadow-xs transition-all cursor-pointer border border-emerald-700/50"
            >
              <PackagePlus className="w-4 h-4 text-amber-400" />
              <span>Novo Recebimento</span>
            </button>
          )}

          {/* Sair / Delogar Button */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 hover:text-rose-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer border border-rose-200/80 shadow-2xs"
            title="Sair / Delogar do Sistema"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>

      </div>
    </header>
  );
};

