import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UsuariosView } from '../Usuarios/UsuariosView';
import { AuditoriaView } from '../Auditoria/AuditoriaView';
import { CadastrosGeraisView } from '../Cadastros/CadastrosGeraisView';
import {
  Settings,
  UserCog,
  Building2,
  Database,
  History,
  Save,
  Trash2,
  Eraser,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  RotateCcw,
  ShieldAlert,
  BellOff,
  LogOut,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { EmpresaConfig } from '../../types';

interface ConfiguracoesViewProps {
  defaultSubTab?: 'limpeza' | 'empresa' | 'usuarios' | 'auditoria' | 'cadastros';
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ defaultSubTab }) => {
  const {
    addToast,
    empresaConfig,
    updateEmpresaConfig,
    limparDadosDemo,
    limparSomenteDadosDemo,
    limparRegistrosTeste,
    limparSessoesAcessosAnteriores,
    encerrarTodasSessoesAtivas,
    limparHistoricoNotificacoesMensagens,
    restaurarBaseLimpa
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'limpeza' | 'empresa' | 'usuarios' | 'auditoria' | 'cadastros'
  >(defaultSubTab || 'limpeza');

  // Confirmation modal state for cleanup
  const [modalAction, setModalAction] = useState<
    | 'excluir_demo'
    | 'limpar_somente_demo'
    | 'limpar_testes'
    | 'limpar_sessoes'
    | 'encerrar_sessoes'
    | 'limpar_notificacoes'
    | 'restaurar_base'
    | null
  >(null);

  const [confirmText, setConfirmText] = useState('');

  // Form state for Empresa
  const [empresaForm, setEmpresaForm] = useState<EmpresaConfig>({
    razaoSocial: empresaConfig?.razaoSocial || 'INTEGRAL NUTS LTDA',
    nomeFantasia: empresaConfig?.nomeFantasia || 'Integral NUTS — Monte Dourado',
    cnpj: empresaConfig?.cnpj || '18.293.001/0001-44',
    inscricaoEstadual: empresaConfig?.inscricaoEstadual || '15.123.456-7',
    endereco: empresaConfig?.endereco || 'Rodovia Almeirim - Monte Dourado, Km 12',
    municipioUF: empresaConfig?.municipioUF || 'Almeirim / Monte Dourado - PA',
    telefone: empresaConfig?.telefone || '(93) 99123-4567',
    email: empresaConfig?.email || 'contato@integralnuts.com.br',
    logotipoUrl: empresaConfig?.logotipoUrl || '',
    unidadeIndustrial: empresaConfig?.unidadeIndustrial || 'Unidade Industrial de Monte Dourado — Pará (Vale do Jari)'
  });

  const handleSalvarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmpresaConfig(empresaForm);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('O logotipo deve ter no máximo 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmpresaForm((prev) => ({ ...prev, logotipoUrl: reader.result as string }));
        addToast('Logotipo carregado com sucesso!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecuteAction = () => {
    if (!modalAction) return;

    // Check confirmation text requirement for major deletions
    if (
      ['excluir_demo', 'limpar_somente_demo', 'limpar_testes', 'restaurar_base'].includes(modalAction)
    ) {
      if (confirmText.trim().toUpperCase() !== 'CONFIRMAR') {
        addToast('Digite "CONFIRMAR" em maiúsculas para prosseguir.', 'error');
        return;
      }
    }

    switch (modalAction) {
      case 'excluir_demo':
        limparDadosDemo();
        break;
      case 'limpar_somente_demo':
        limparSomenteDadosDemo();
        break;
      case 'limpar_testes':
        limparRegistrosTeste();
        break;
      case 'limpar_sessoes':
        limparSessoesAcessosAnteriores();
        break;
      case 'encerrar_sessoes':
        encerrarTodasSessoesAtivas();
        break;
      case 'limpar_notificacoes':
        limparHistoricoNotificacoesMensagens();
        break;
      case 'restaurar_base':
        restaurarBaseLimpa();
        break;
    }

    setModalAction(null);
    setConfirmText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#091D13] text-white p-6 rounded-3xl shadow-lg border border-[#143D23] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Módulo Administrativo do Sistema</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Configurações do Sistema</h1>
          <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Limpeza e Reinicialização de Dados, Configuração da Empresa Proprietária, Gestão de Usuários e Auditoria.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {[
          { id: 'limpeza', label: '1. Limpeza de Dados', icon: Eraser },
          { id: 'empresa', label: '2. Dados da Empresa', icon: Building2 },
          { id: 'usuarios', label: '3. Gestão de Usuários', icon: UserCog },
          { id: 'auditoria', label: 'Trilha de Auditoria', icon: History },
          { id: 'cadastros', label: 'Cadastros Gerais', icon: Database },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#143D23] text-amber-300 shadow-sm border border-emerald-700/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================== */}
      {/* AREA 1: LIMPEZA DE DADOS E REINICIALIZAÇÃO */}
      {/* ========================================== */}
      {activeSubTab === 'limpeza' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-200">
                  <Eraser className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-lg">
                    Limpeza e Reinicialização do Sistema
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Remova dados de teste ou demonstração antes do uso em produção real.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-3 py-1 bg-amber-100 text-amber-950 rounded-full border border-amber-300">
                Ações Administrativas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Option 1: Excluir Dados de Demonstração */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <Trash2 className="w-4 h-4 text-amber-600" />
                    <span>Excluir dados de demonstração</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Remove fornecedores, compras e lotes de demonstração inseridos na inicialização do app.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalAction('excluir_demo');
                    setConfirmText('');
                  }}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Dados Demo</span>
                </button>
              </div>

              {/* Option 2: Limpar somente dados DEMO */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <Eraser className="w-4 h-4 text-emerald-600" />
                    <span>Limpar somente dados DEMO</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Filtra e apaga registros marcados internamente com <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">demo = true</code>, preservando dados reais.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalAction('limpar_somente_demo');
                    setConfirmText('');
                  }}
                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Limpar Somente DEMO</span>
                </button>
              </div>

              {/* Option 3: Limpar registros de teste */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>Limpar registros de teste</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Remove ordens, compras e documentos com o prefixo 'TEST' ou criados para homologação.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalAction('limpar_testes');
                    setConfirmText('');
                  }}
                  className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Limpar Registros de Teste</span>
                </button>
              </div>

              {/* Option 4: Limpar sessões e acessos anteriores */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <History className="w-4 h-4 text-indigo-600" />
                    <span>Limpar sessões e acessos anteriores</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Zera a lista de solicitações de senha antigas e histórico de IPs/dispositivos registrados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalAction('limpar_sessoes');
                    setConfirmText('');
                  }}
                  className="w-full py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Limpar Histórico Acessos</span>
                </button>
              </div>

              {/* Option 5: Encerrar todas as sessões ativas */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <LogOut className="w-4 h-4 text-orange-600" />
                    <span>Encerrar todas as sessões ativas</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Força o encerramento de conexões paralelas e revoga solicitações de autorização em aberto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalAction('encerrar_sessoes');
                    setConfirmText('');
                  }}
                  className="w-full py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Encerrar Sessões Ativas</span>
                </button>
              </div>

              {/* Option 6: Limpar histórico de notificações */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <BellOff className="w-4 h-4 text-purple-600" />
                    <span>Limpar notificações e mensagens</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Apaga avisos temporários, pendências de notificação e mensagens de teste da tela.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalAction('limpar_notificacoes');
                    setConfirmText('');
                  }}
                  className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <BellOff className="w-3.5 h-3.5" />
                  <span>Limpar Notificações</span>
                </button>
              </div>

            </div>

            {/* Option 7: Restaurar o aplicativo para uma base limpa (Destaque Vermelho) */}
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-700" />
                  <span>Restaurar o aplicativo para uma base 100% limpa</span>
                </div>
                <p className="text-xs text-rose-800 font-medium max-w-2xl">
                  Apaga todas as compras, lotes, estoques e movimentações financeiras, deixando o aplicativo pronto para operação do zero (mantendo os dados da empresa e o usuário Administrador).
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalAction('restaurar_base');
                  setConfirmText('');
                }}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar para Base Limpa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* AREA 2: DADOS DA EMPRESA                   */}
      {/* ========================================== */}
      {activeSubTab === 'empresa' && (
        <form onSubmit={handleSalvarEmpresa} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-800" />
                <span>Dados da Empresa Proprietária do Sistema</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Estes dados são dinâmicos e atualizam os relatórios, PDFs, romaneios, cabeçalhos e telas do sistema em tempo real.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Salvar Dados da Empresa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Razão Social */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Razão Social *</label>
              <input
                type="text"
                required
                value={empresaForm.razaoSocial}
                onChange={(e) => setEmpresaForm({ ...empresaForm, razaoSocial: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                placeholder="Ex: INTEGRAL NUTS LTDA"
              />
            </div>

            {/* Nome Fantasia */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Nome Fantasia *</label>
              <input
                type="text"
                required
                value={empresaForm.nomeFantasia}
                onChange={(e) => setEmpresaForm({ ...empresaForm, nomeFantasia: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                placeholder="Ex: Integral NUTS — Monte Dourado"
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">CNPJ *</label>
              <input
                type="text"
                required
                value={empresaForm.cnpj}
                onChange={(e) => setEmpresaForm({ ...empresaForm, cnpj: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white font-mono"
                placeholder="00.000.000/0001-00"
              />
            </div>

            {/* Inscrição Estadual */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Inscrição Estadual</label>
              <input
                type="text"
                value={empresaForm.inscricaoEstadual}
                onChange={(e) => setEmpresaForm({ ...empresaForm, inscricaoEstadual: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                placeholder="15.123.456-7"
              />
            </div>

            {/* Telefone / Contato */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Telefone / WhatsApp</label>
              <input
                type="text"
                value={empresaForm.telefone}
                onChange={(e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                placeholder="(93) 99123-4567"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">E-mail Comercial</label>
              <input
                type="email"
                value={empresaForm.email}
                onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                placeholder="contato@empresa.com.br"
              />
            </div>

            {/* Endereço Completo */}
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">Endereço Completo</label>
              <input
                type="text"
                value={empresaForm.endereco}
                onChange={(e) => setEmpresaForm({ ...empresaForm, endereco: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                placeholder="Rodovia Almeirim - Monte Dourado, Km 12"
              />
            </div>

            {/* Município / UF */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Município / UF</label>
              <input
                type="text"
                value={empresaForm.municipioUF}
                onChange={(e) => setEmpresaForm({ ...empresaForm, municipioUF: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                placeholder="Almeirim / Monte Dourado - PA"
              />
            </div>

            {/* Unidade Industrial */}
            <div className="space-y-1 md:col-span-3">
              <label className="block text-xs font-bold text-slate-700">Unidade Industrial / Descrição</label>
              <input
                type="text"
                value={empresaForm.unidadeIndustrial}
                onChange={(e) => setEmpresaForm({ ...empresaForm, unidadeIndustrial: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                placeholder="Unidade Industrial de Monte Dourado — Pará (Vale do Jari)"
              />
            </div>
          </div>

          {/* Logotipo Upload & Preview Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-800" />
              <span>Logotipo da Empresa (Exibido em PDFs, Recibos e Menu)</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Preview Thumbnail */}
              <div className="w-20 h-20 rounded-2xl border-2 border-emerald-800/30 overflow-hidden bg-white shadow-xs shrink-0 flex items-center justify-center p-1">
                {empresaForm.logotipoUrl ? (
                  <img
                    src={empresaForm.logotipoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold text-center">Sem Logo</span>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <label className="block text-xs font-bold text-slate-700">
                  Carregar imagem do computador (PNG, JPG, Max 2MB)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-[#143D23] file:text-white hover:file:bg-[#0E2A18] cursor-pointer"
                  />
                  {empresaForm.logotipoUrl && (
                    <button
                      type="button"
                      onClick={() => setEmpresaForm({ ...empresaForm, logotipoUrl: '' })}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs"
                    >
                      Remover Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-[#143D23] hover:bg-[#0E2C19] text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Salvar Dados da Empresa</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================== */}
      {/* AREA 3: GESTÃO DE USUÁRIOS                */}
      {/* ========================================== */}
      {activeSubTab === 'usuarios' && <UsuariosView />}

      {/* ADDITIONAL SUB-TABS */}
      {activeSubTab === 'auditoria' && <AuditoriaView />}
      {activeSubTab === 'cadastros' && <CadastrosGeraisView />}

      {/* ========================================== */}
      {/* CONFIRMATION MODAL FOR CLEANUP ACTIONS      */}
      {/* ========================================== */}
      {modalAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2.5 rounded-xl ${modalAction === 'restaurar_base' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {modalAction === 'excluir_demo' && 'Excluir Dados de Demonstração'}
                    {modalAction === 'limpar_somente_demo' && 'Limpar Somente Dados DEMO'}
                    {modalAction === 'limpar_testes' && 'Limpar Registros de Teste'}
                    {modalAction === 'limpar_sessoes' && 'Limpar Histórico de Acessos'}
                    {modalAction === 'encerrar_sessoes' && 'Encerrar Sessões Ativas'}
                    {modalAction === 'limpar_notificacoes' && 'Limpar Notificações'}
                    {modalAction === 'restaurar_base' && 'Restaurar para Base Limpa'}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium">Confirmação de Ação Administrativa</p>
                </div>
              </div>
              <button
                onClick={() => setModalAction(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                {modalAction === 'excluir_demo' && 'Removerá todos os cadastros e compras de demonstração pré-carregados na inicialização do aplicativo.'}
                {modalAction === 'limpar_somente_demo' && 'Removerá apenas os registros com a marcação interna DEMO, preservando dados reais do cliente.'}
                {modalAction === 'limpar_testes' && 'Apagará lançamentos de teste, compras com código TEST e logs de teste.'}
                {modalAction === 'limpar_sessoes' && 'Apagará o histórico de solicitações de senha e dispositivos registrados anteriormente.'}
                {modalAction === 'encerrar_sessoes' && 'Invalida solicitações de acesso ativas e encerra sessões paralelas de usuários.'}
                {modalAction === 'limpar_notificacoes' && 'Apagará o histórico de avisos e notificações temporárias da tela.'}
                {modalAction === 'restaurar_base' && 'ATENÇÃO CRÍTICA: Apagará TODAS as compras, lotes, movimentações de estoque e financeiro, restaurando uma base 100% limpa.'}
              </p>

              {['excluir_demo', 'limpar_somente_demo', 'limpar_testes', 'restaurar_base'].includes(modalAction) && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-900">
                    Digite a palavra <span className="text-rose-700 font-black">CONFIRMAR</span> em maiúsculas para continuar:
                  </label>
                  <input
                    type="text"
                    placeholder="Digite CONFIRMAR"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-5 py-2 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  modalAction === 'restaurar_base' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Executar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
