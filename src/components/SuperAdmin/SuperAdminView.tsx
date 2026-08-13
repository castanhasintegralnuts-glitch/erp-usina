import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnidadeFilial, ModulosUnidade } from '../../types';
import {
  Building2,
  Plus,
  Sliders,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Boxes,
  Shield,
  Edit2,
  Trash2,
  Users,
  Search,
  ChevronRight,
  BarChart3,
  Check,
  Power
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const {
    unidades,
    addUnidade,
    updateUnidade,
    toggleModuloUnidade,
    deleteUnidade,
    compras,
    recebimentos,
    usuarios,
    registrarLogAuditoria
  } = useApp();

  const [activeTab, setActiveTab] = useState<'usinas' | 'modulos' | 'comparativo'>('usinas');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<UnidadeFilial | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    cnpj: '',
    cidadeUF: '',
    endereco: '',
    responsavel: '',
    telefone: '',
    email: '',
    capacidadeHlMes: 3000,
    isMatriz: false,
    modulosAtivos: {
      dashboard: true,
      recebimento: true,
      producao: true,
      expedicao: true,
      financeiro: true,
      comprador: true,
      configuracoes: true,
      relatorios: true,
      quebraManual: true,
      secagem: true,
    } as ModulosUnidade,
  });

  const handleOpenNewModal = () => {
    setEditingUnidade(null);
    setFormData({
      nome: '',
      codigo: `US-${String(unidades.length + 1).padStart(3, '0')}`,
      cnpj: '',
      cidadeUF: '',
      endereco: '',
      responsavel: '',
      telefone: '',
      email: '',
      capacidadeHlMes: 3000,
      isMatriz: unidades.length === 0,
      modulosAtivos: {
        dashboard: true,
        recebimento: true,
        producao: true,
        expedicao: true,
        financeiro: true,
        comprador: true,
        configuracoes: true,
        relatorios: true,
        quebraManual: true,
        secagem: true,
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: UnidadeFilial) => {
    setEditingUnidade(u);
    setFormData({
      nome: u.nome,
      codigo: u.codigo,
      cnpj: u.cnpj || '',
      cidadeUF: u.cidadeUF,
      endereco: u.endereco || '',
      responsavel: u.responsavel || '',
      telefone: u.telefone || '',
      email: u.email || '',
      capacidadeHlMes: u.capacidadeHlMes || 3000,
      isMatriz: !!u.isMatriz,
      modulosAtivos: { ...u.modulosAtivos },
    });
    setIsModalOpen(true);
  };

  const handleSaveUnidade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.cidadeUF.trim()) return;

    if (editingUnidade) {
      updateUnidade(editingUnidade.id, {
        nome: formData.nome,
        cnpj: formData.cnpj,
        cidadeUF: formData.cidadeUF,
        endereco: formData.endereco,
        responsavel: formData.responsavel,
        telefone: formData.telefone,
        email: formData.email,
        capacidadeHlMes: Number(formData.capacidadeHlMes),
        isMatriz: formData.isMatriz,
        modulosAtivos: formData.modulosAtivos,
      });
    } else {
      addUnidade({
        nome: formData.nome,
        cnpj: formData.cnpj,
        cidadeUF: formData.cidadeUF,
        endereco: formData.endereco,
        responsavel: formData.responsavel,
        telefone: formData.telefone,
        email: formData.email,
        status: 'Ativo',
        isMatriz: formData.isMatriz,
        modulosAtivos: formData.modulosAtivos,
        capacidadeHlMes: Number(formData.capacidadeHlMes),
      });
    }

    setIsModalOpen(false);
  };

  const filteredUnidades = unidades.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cidadeUF.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // General statistics
  const totalUsinasAtivas = unidades.filter((u) => u.status === 'Ativo').length;
  const totalCapacidadeMensal = unidades.reduce((acc, u) => acc + (u.capacidadeHlMes || 0), 0);
  const totalVolumeCompradoHl = compras.reduce((acc, c) => acc + (c.quantidadeHectolitrosPrevista || 0), 0);
  const totalValorCompradoR$ = compras.reduce((acc, c) => acc + (c.valorTotalEstimado || 0), 0);

  const modulosLabels: Record<keyof ModulosUnidade, string> = {
    dashboard: 'Painel Geral',
    recebimento: 'Recebimento & Compra',
    producao: 'Produção e Processamento',
    expedicao: 'Expedição e Logística',
    financeiro: 'Módulo Financeiro',
    comprador: 'Portal do Comprador',
    configuracoes: 'Configurações de Usina',
    relatorios: 'Relatórios & BI',
    quebraManual: 'Quebra Manual',
    secagem: 'Estufa & Secagem',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-900 text-white rounded-xl p-6 shadow-md border border-emerald-700/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                Super Administrador Multiusina
              </span>
              <span className="text-xs text-emerald-200/80">• Gestão Centralizada de Redes & Filiais</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestão Global de Usinas & Módulos</h1>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Cadastre novas unidades, altere permissões de módulos em tempo real e acompanhe a produtividade integrada de todas as usinas da rede Integral NUTS.
            </p>
          </div>
          <button
            id="btn-add-unidade"
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold px-4 py-2.5 rounded-lg text-sm shadow-md transition-all whitespace-nowrap self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Nova Usina / Filial
          </button>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-emerald-950/40 rounded-lg p-3.5 border border-emerald-700/30">
            <span className="text-xs text-emerald-200/70 block">Unidades & Filiais</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{unidades.length}</span>
              <span className="text-xs text-emerald-300">({totalUsinasAtivas} Ativas)</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 rounded-lg p-3.5 border border-emerald-700/30">
            <span className="text-xs text-emerald-200/70 block">Capacidade Processamento</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{totalCapacidadeMensal.toLocaleString('pt-BR')}</span>
              <span className="text-xs text-emerald-300">HL / Mês</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 rounded-lg p-3.5 border border-emerald-700/30">
            <span className="text-xs text-emerald-200/70 block">Volume Total Comprado</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{totalVolumeCompradoHl.toLocaleString('pt-BR')}</span>
              <span className="text-xs text-emerald-300">HL</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 rounded-lg p-3.5 border border-emerald-700/30">
            <span className="text-xs text-emerald-200/70 block">Total Investido em Compras</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">R$ {(totalValorCompradoR$ / 1000).toFixed(0)}k</span>
              <span className="text-xs text-emerald-300">Global</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div className="flex gap-2">
          <button
            id="tab-superadmin-usinas"
            onClick={() => setActiveTab('usinas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'usinas'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Filiais & Usinas ({unidades.length})
          </button>

          <button
            id="tab-superadmin-modulos"
            onClick={() => setActiveTab('modulos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'modulos'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Matriz de Módulos Ativos
          </button>

          <button
            id="tab-superadmin-comparativo"
            onClick={() => setActiveTab('comparativo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'comparativo'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Consolidado Multiusina
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usina, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tab 1: Filiais & Usinas Cards */}
      {activeTab === 'usinas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnidades.map((unidade) => {
            const isMatriz = unidade.isMatriz;
            const activeModulesCount = Object.values(unidade.modulosAtivos).filter(Boolean).length;
            const totalModulesCount = Object.keys(unidade.modulosAtivos).length;

            return (
              <div
                key={unidade.id}
                className={`bg-white rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden ${
                  isMatriz ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
                }`}
              >
                {/* Header card */}
                <div className={`p-5 border-b ${isMatriz ? 'bg-amber-50/50 border-amber-200/60' : 'bg-gray-50/60 border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-200/80 text-gray-800">
                          {unidade.codigo}
                        </span>
                        {isMatriz ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Matriz Sede
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Filial
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            unidade.status === 'Ativo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {unidade.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mt-2 leading-tight">{unidade.nome}</h3>
                      <p className="text-xs text-gray-500 mt-1">{unidade.cidadeUF}</p>
                    </div>

                    <button
                      onClick={() => handleOpenEditModal(unidade)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Editar Unidade"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body info */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-400 block">CNPJ</span>
                      <span className="font-medium text-gray-800">{unidade.cnpj || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Responsável</span>
                      <span className="font-medium text-gray-800 truncate block">{unidade.responsavel || 'Não definido'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Capacidade</span>
                      <span className="font-medium text-gray-800">{(unidade.capacidadeHlMes || 0).toLocaleString('pt-BR')} HL/mês</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Módulos Ativos</span>
                      <span className="font-semibold text-emerald-700">{activeModulesCount} / {totalModulesCount}</span>
                    </div>
                  </div>

                  {/* Modules quick toggle grid */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Módulos Ativados</span>
                      <span className="text-[10px] text-gray-400 font-normal">Clique no botão para alternar</span>
                    </h4>

                    <div className="space-y-1.5">
                      {(Object.keys(modulosLabels) as Array<keyof ModulosUnidade>).map((modKey) => {
                        const isEnabled = !!unidade.modulosAtivos[modKey];
                        return (
                          <div
                            key={modKey}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                              isEnabled
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`}
                          >
                            <span className="font-medium">{modulosLabels[modKey]}</span>
                            <button
                              onClick={() => toggleModuloUnidade(unidade.id, modKey)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() =>
                      updateUnidade(unidade.id, {
                        status: unidade.status === 'Ativo' ? 'Inativo' : 'Ativo',
                      })
                    }
                    className={`inline-flex items-center gap-1.5 font-medium ${
                      unidade.status === 'Ativo' ? 'text-amber-700 hover:text-amber-900' : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {unidade.status === 'Ativo' ? 'Desativar Usina' : 'Reativar Usina'}
                  </button>

                  {!isMatriz && (
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja remover a filial ${unidade.nome}?`)) {
                          deleteUnidade(unidade.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Matriz de Módulos em Tabela Cross */}
      {activeTab === 'modulos' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Matriz Global de Permissões de Módulos</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ligue e desligue recursos do sistema para cada usina ou filial com apenas um clique.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 font-semibold text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 min-w-[220px]">Módulo do Sistema</th>
                  {unidades.map((u) => (
                    <th key={u.id} className="py-3 px-4 text-center min-w-[160px]">
                      <div className="font-bold text-gray-900">{u.nome}</div>
                      <div className="text-[10px] text-gray-500 font-normal">{u.codigo} ({u.cidadeUF})</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(Object.keys(modulosLabels) as Array<keyof ModulosUnidade>).map((modKey) => (
                  <tr key={modKey} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900 border-r border-gray-100">
                      {modulosLabels[modKey]}
                    </td>
                    {unidades.map((u) => {
                      const isEnabled = !!u.modulosAtivos[modKey];
                      return (
                        <td key={u.id} className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleModuloUnidade(u.id, modKey)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-xs ${
                              isEnabled
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {isEnabled ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Habilitado
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                Desativado
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Consolidado Multiusina */}
      {activeTab === 'comparativo' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Relatório Consolidado de Unidades</h2>
            <p className="text-xs text-gray-500">Comparativo operacional e financeiro entre as usinas e filiais ativas.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                  <th className="p-3">Código & Usina</th>
                  <th className="p-3">Localização</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Capacidade Mensal</th>
                  <th className="p-3 text-right">Compras Vinculadas</th>
                  <th className="p-3 text-right">Volume Comprado</th>
                  <th className="p-3 text-right">Total Investido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {unidades.map((u) => {
                  const comprasUnidade = compras.filter((c) => c.unidadeId === u.id || (!c.unidadeId && u.isMatriz));
                  const volumeUnidade = comprasUnidade.reduce((acc, c) => acc + (c.quantidadeHectolitrosPrevista || 0), 0);
                  const valorUnidade = comprasUnidade.reduce((acc, c) => acc + (c.valorTotalEstimado || 0), 0);

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        <div className="text-gray-900 font-bold">{u.nome}</div>
                        <div className="text-xs text-gray-400">{u.codigo} {u.isMatriz && '• Matriz'}</div>
                      </td>
                      <td className="p-3 text-gray-600">{u.cidadeUF}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono">{(u.capacidadeHlMes || 0).toLocaleString('pt-BR')} HL</td>
                      <td className="p-3 text-right font-mono">{comprasUnidade.length} ordens</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">{volumeUnidade.toLocaleString('pt-BR')} HL</td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">R$ {valorUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cadastrar / Editar Usina */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingUnidade ? 'Editar Usina / Filial' : 'Cadastrar Nova Usina ou Filial'}
                </h3>
                <p className="text-xs text-gray-500">Preencha os dados operacionais da unidade industrial.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnidade} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nome da Usina / Unidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Usina Almeirim - Filial"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Código Identificador</label>
                  <input
                    type="text"
                    disabled
                    value={formData.codigo}
                    className="w-full border border-gray-200 bg-gray-100 rounded-lg p-2 text-sm font-mono text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade / UF *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Almeirim - PA"
                    value={formData.cidadeUF}
                    onChange={(e) => setFormData({ ...formData, cidadeUF: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Responsável Operacional</label>
                  <input
                    type="text"
                    placeholder="Nome do gerente ou supervisor"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Telefone de Contato</label>
                  <input
                    type="text"
                    placeholder="(93) 90000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Capacidade Estimada (HL/Mês)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={formData.capacidadeHlMes}
                    onChange={(e) => setFormData({ ...formData, capacidadeHlMes: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chk-is-matriz"
                    checked={formData.isMatriz}
                    onChange={(e) => setFormData({ ...formData, isMatriz: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="chk-is-matriz" className="text-xs font-medium text-gray-800">
                    Definir como Matriz / Sede Principal
                  </label>
                </div>
              </div>

              {/* Modules Toggles in Modal */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Módulos Iniciais Ativos nesta Unidade
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(modulosLabels) as Array<keyof ModulosUnidade>).map((modKey) => (
                    <label key={modKey} className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.modulosAtivos[modKey]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            modulosAtivos: {
                              ...formData.modulosAtivos,
                              [modKey]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-gray-700 font-medium">{modulosLabels[modKey]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-xs"
                >
                  {editingUnidade ? 'Salvar Alterações' : 'Cadastrar Unidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
