import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { HomeDashboard } from './components/HomeDashboard';
import { RecebimentoWizardModal } from './components/RecebimentoWizard/RecebimentoWizardModal';
import { RecebimentoCompraView } from './components/Recebimento/RecebimentoCompraView';
import { ExpedicaoView } from './components/Expedicao/ExpedicaoView';
import { FinanceiroView } from './components/Financeiro/FinanceiroView';
import { DocumentosView } from './components/Documentos/DocumentosView';
import { RelatoriosView } from './components/Relatorios/RelatoriosView';
import { QuebraManualView } from './components/QuebraManual/QuebraManualView';
import { UsuariosView } from './components/Usuarios/UsuariosView';
import { AuditoriaView } from './components/Auditoria/AuditoriaView';
import { ProducaoView } from './components/Producao/ProducaoView';
import { SecagemView } from './components/Secagem/SecagemView';
import { EstoqueAcabadoView } from './components/EstoqueAcabado/EstoqueAcabadoView';
import { SaidasEntregasView } from './components/Saidas/SaidasEntregasView';
import { CadastrosGeraisView } from './components/Cadastros/CadastrosGeraisView';
import { ConfiguracoesView } from './components/Configuracoes/ConfiguracoesView';
import { SuperAdminView } from './components/SuperAdmin/SuperAdminView';
import { CompradorView } from './components/Comprador/CompradorView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { A4DocumentModal } from './components/A4DocumentModal';
import { LoginView } from './components/Auth/LoginView';

const MainContent: React.FC = () => {
  const { activeTab, temPermissao, currentUser } = useApp();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(true);

  const handleToggleMenu = () => {
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen((prev) => !prev);
    } else {
      setIsDesktopMenuOpen((prev) => !prev);
    }
  };

  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Permission Check for current tab
  const hasAccess = temPermissao(activeTab);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex selection:bg-emerald-500 selection:text-white">
      
      {/* Left Navigation Sidebar */}
      <Sidebar
        isOpenOnMobile={isMobileMenuOpen}
        isDesktopOpen={isDesktopMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenNovoRecebimento={() => setIsWizardOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Header Bar */}
        <Header
          onToggleMenu={handleToggleMenu}
          onOpenNovoRecebimento={() => setIsWizardOpen(true)}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!hasAccess ? (
            <AccessDeniedView />
          ) : (
            <>
              {activeTab === 'super-admin' && <SuperAdminView />}
              {activeTab === 'comprador' && <CompradorView onOpenNovaCompra={() => setIsWizardOpen(true)} />}
              {activeTab === 'dashboard' && (
                <HomeDashboard
                  onOpenNovoRecebimento={() => setIsWizardOpen(true)}
                  onOpenNovaCompra={() => setIsWizardOpen(true)}
                />
              )}
              {activeTab === 'recebimento-compra' && (
                <RecebimentoCompraView
                  onOpenNovoRecebimento={() => setIsWizardOpen(true)}
                  onOpenNovaCompra={() => setIsWizardOpen(true)}
                />
              )}
              {activeTab === 'usuarios' && <ConfiguracoesView defaultSubTab="usuarios" />}
              {activeTab === 'producao' && <ProducaoView />}
              {activeTab === 'expedicao' && <ExpedicaoView />}
              {activeTab === 'financeiro' && <FinanceiroView />}
              {activeTab === 'documentos' && <DocumentosView />}
              {activeTab === 'relatorios' && <RelatoriosView />}
              {activeTab === 'auditoria' && <AuditoriaView />}
              {activeTab === 'cadastros' && <CadastrosGeraisView />}
              {activeTab === 'configuracoes' && <ConfiguracoesView />}

              {/* Legacy fallback routing */}
              {activeTab === 'quebra-manual' && <QuebraManualView />}
              {activeTab === 'saidas' && <ExpedicaoView />}
              {activeTab === 'fornecedores' && (
                <RecebimentoCompraView
                  onOpenNovoRecebimento={() => setIsWizardOpen(true)}
                  onOpenNovaCompra={() => setIsWizardOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 font-medium">
            Integral NUTS, Monte Dourado — Pará • Sistema de Gestão Industrial & Rastreabilidade Integrada
          </div>
        </footer>

      </div>

      {/* Recebimento Wizard Modal */}
      <RecebimentoWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      {/* A4 Document Modal Previewer */}
      <A4DocumentModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
