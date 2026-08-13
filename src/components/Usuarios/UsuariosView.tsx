import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, PerfilUsuario, StatusUsuario, PermissoesPerfil } from '../../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Shield,
  Key,
  UserX,
  UserCheck,
  SlidersHorizontal,
  Clock,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  Briefcase,
  HardHat,
  Hammer,
  FileSpreadsheet,
  KeyRound,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';

export const UsuariosView: React.FC = () => {
  const {
    usuarios,
    addUsuario,
    updateUsuario,
    toggleStatusUsuario,
    deleteUsuario,
    permissoesPerfis,
    updatePermissoesPerfil,
    currentUser,
    quebradores,
    solicitacoesRecuperacaoSenha,
    atenderRecuperacaoSenha,
    proprietariosTerceiros
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'matriz' | 'recuperacao'>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | StatusUsuario>('Todos');
  const [perfilFilter, setPerfilFilter] = useState<'Todos' | PerfilUsuario>('Todos');

  // Password Recovery Approval Modal
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [novaSenhaMasterInput, setNovaSenhaMasterInput] = useState('123456');

  const pendingRecoveryCount = (solicitacoesRecuperacaoSenha || []).filter((s) => s.status === 'Pendente').length;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('123');
  const [perfil, setPerfil] = useState<PerfilUsuario>('Operador');
  const [status, setStatus] = useState<StatusUsuario>('Ativo');
  const [cargo, setCargo] = useState('');
  const [quebradorId, setQuebradorId] = useState('');
  const [foto, setFoto] = useState('');

  // Comprador subordination fields
  const [tipoVinculoComprador, setTipoVinculoComprador] = useState<'Usina' | 'ProprietarioTerceiro'>('Usina');
  const [proprietarioTerceiroId, setProprietarioTerceiroId] = useState<string>('');

  const openNewUserModal = () => {
    setEditingUser(null);
    setNome('');
    setLogin('');
    setSenha('123');
    setPerfil('Operador');
    setStatus('Ativo');
    setCargo('');
    setQuebradorId('');
    setFoto('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250');
    setTipoVinculoComprador('Usina');
    setProprietarioTerceiroId(proprietariosTerceiros[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditUserModal = (u: AppUser) => {
    setEditingUser(u);
    setNome(u.nome);
    setLogin(u.login);
    setSenha(u.senha);
    setPerfil(u.perfil);
    setStatus(u.status);
    setCargo(u.cargo || '');
    setQuebradorId(u.quebradorId || '');
    setFoto(u.foto || '');
    setTipoVinculoComprador(u.tipoVinculoComprador || 'Usina');
    setProprietarioTerceiroId(u.proprietarioTerceiroId || (proprietariosTerceiros[0]?.id || ''));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !login.trim()) return;

    const propObj = proprietariosTerceiros.find((p) => p.id === proprietarioTerceiroId);
    const propNome = propObj ? propObj.nome : 'Proprietário Terceiro';

    if (editingUser) {
      updateUsuario(editingUser.id, {
        nome,
        login,
        senha,
        perfil,
        status,
        cargo,
        quebradorId: perfil === 'Quebrador' ? quebradorId : undefined,
        foto,
        tipoVinculoComprador: perfil === 'Comprador' ? tipoVinculoComprador : undefined,
        proprietarioTerceiroId: perfil === 'Comprador' && tipoVinculoComprador === 'ProprietarioTerceiro' ? proprietarioTerceiroId : undefined,
        proprietarioTerceiroNome: perfil === 'Comprador' && tipoVinculoComprador === 'ProprietarioTerceiro' ? propNome : undefined,
      });
    } else {
      addUsuario({
        nome,
        login,
        senha,
        perfil,
        status,
        cargo,
        quebradorId: perfil === 'Quebrador' ? quebradorId : undefined,
        foto,
        tipoVinculoComprador: perfil === 'Comprador' ? tipoVinculoComprador : undefined,
        proprietarioTerceiroId: perfil === 'Comprador' && tipoVinculoComprador === 'ProprietarioTerceiro' ? proprietarioTerceiroId : undefined,
        proprietarioTerceiroNome: perfil === 'Comprador' && tipoVinculoComprador === 'ProprietarioTerceiro' ? propNome : undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Filter Users
  const filteredUsers = usuarios.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.cargo && u.cargo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'Todos' || u.status === statusFilter;
    const matchesPerfil = perfilFilter === 'Todos' || u.perfil === perfilFilter;
    return matchesSearch && matchesStatus && matchesPerfil;
  });

  // Screen List definitions for Permission Matrix
  const screenModules = [
    { id: 'dashboard', label: 'Painel Inicial / KPIs', category: 'Operacional' },
    { id: 'comprador', label: 'Portal do Comprador (Metas & Compras)', category: 'Compras' },
    { id: 'recebimento-compra', label: 'Recebimento & Emissão de Compras', category: 'Compras' },
    { id: 'fornecedores', label: 'Gestão de Fornecedores', category: 'Operacional' },
    { id: 'estoque-casca', label: 'Estoque de Castanha com Casca', category: 'Estoque' },
    { id: 'lotes', label: 'Gestão de Lotes de Produção', category: 'Beneficiamento' },
    { id: 'quebra-manual', label: 'Módulo de Quebra Manual', category: 'Quebra' },
    { id: 'quarentena', label: 'Quarentena e Aeração', category: 'Qualidade' },
    { id: 'producao', label: 'Linha de Beneficiamento Industrial', category: 'Produção' },
    { id: 'expedicao', label: 'Expedição & Saídas', category: 'Logística' },
    { id: 'financeiro', label: 'Financeiro, Custos e Pagamentos', category: 'Financeiro' },
    { id: 'documentos', label: 'Emissão de Documentos A4', category: 'Relatórios' },
    { id: 'relatorios', label: 'Relatórios Gerenciais Completos', category: 'Relatórios' },
    { id: 'usuarios', label: 'Controle de Usuários e Acessos', category: 'Sistema' },
    { id: 'auditoria', label: 'Log de Auditoria do Sistema', category: 'Sistema' },
  ];

  const targetRoles: PerfilUsuario[] = ['Administrador', 'Gestor', 'Comprador', 'Operador', 'Quebrador', 'Diarista'];

  const toggleScreenPermission = (perfilTarget: PerfilUsuario, screenId: string) => {
    const currentObj = permissoesPerfis.find((p) => p.perfil === perfilTarget);
    if (!currentObj) return;

    const currentTelas = currentObj.telasPermitidas;
    const hasScreen = currentTelas.includes(screenId);

    const updatedTelas = hasScreen
      ? currentTelas.filter((id) => id !== screenId)
      : [...currentTelas, screenId];

    updatePermissoesPerfil(perfilTarget, { telasPermitidas: updatedTelas });
  };

  const toggleFlagPermission = (
    perfilTarget: PerfilUsuario,
    flagKey: 'podeVerFinanceiro' | 'podeGerenciarUsuarios' | 'podeEditarRegistrosOutros' | 'podeAlterarPrecos'
  ) => {
    const currentObj = permissoesPerfis.find((p) => p.perfil === perfilTarget);
    if (!currentObj) return;

    updatePermissoesPerfil(perfilTarget, { [flagKey]: !currentObj[flagKey] });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0 border border-emerald-200">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Gestão de Usuários e Controle de Acessos
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                RBAC Avançado
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Cadastre usuários, atribua perfis, bloqueie acessos e personalize a matriz de permissões das telas.
            </p>
          </div>
        </div>

        {/* SubTab Navigation Switcher */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('usuarios')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'usuarios'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lista de Usuários ({usuarios.length})</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('matriz')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'matriz'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Matriz de Permissões</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recuperacao')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'recuperacao'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Solicitações de Senha</span>
            {pendingRecoveryCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {pendingRecoveryCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'usuarios' ? (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Usuários</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{usuarios.length}</div>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuários Ativos</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {usuarios.filter((u) => u.status === 'Ativo').length}
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administradores</span>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {usuarios.filter((u) => u.perfil === 'Administrador').length}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl text-blue-800">
                <Shield className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bloqueados / Inativos</span>
                <div className="text-2xl font-black text-rose-700 mt-1">
                  {usuarios.filter((u) => u.status === 'Inativo').length}
                </div>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl text-rose-800">
                <UserX className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Controls Bar: Search, Filters & Add Button */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full md:w-auto relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome completo, e-mail, CPF ou cargo..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={perfilFilter}
                onChange={(e) => setPerfilFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Todos">Todos os Perfis</option>
                <option value="Administrador">Administrador</option>
                <option value="Gestor">Gestor</option>
                <option value="Comprador">Comprador</option>
                <option value="Operador">Operador</option>
                <option value="Quebrador">Quebrador</option>
                <option value="Diarista">Diarista</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Inativo">Inativos</option>
              </select>

              <button
                onClick={openNewUserModal}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>
            </div>
          </div>

          {/* User Cards / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const isSelf = currentUser?.id === u.id;
              const isBlocked = u.status === 'Inativo';

              return (
                <div
                  key={u.id}
                  className={`bg-white rounded-3xl border transition-all p-5 shadow-xs flex flex-col justify-between relative ${
                    isBlocked
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    {/* User Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.foto ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'
                          }
                          alt={u.nome}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0"
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                            {u.nome}
                            {isSelf && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                VOCÊ
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">{u.login}</p>
                          {u.cargo && (
                            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{u.cargo}</p>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          isBlocked
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500 text-[11px]">Tipo / Perfil de Acesso:</span>
                        <span
                          className={`font-black text-[11px] px-2.5 py-0.5 rounded-full border ${
                            u.perfil === 'Administrador'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : u.perfil === 'Gestor'
                              ? 'bg-teal-100 text-teal-900 border-teal-300'
                              : u.perfil === 'Comprador'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : u.perfil === 'Quebrador'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : u.perfil === 'Diarista'
                              ? 'bg-orange-100 text-orange-900 border-orange-300'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                        >
                          {u.perfil}
                        </span>
                      </div>

                      {u.perfil === 'Comprador' && (
                        <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-500">Vínculo de Financiamento:</span>
                          <span className={`font-black px-2 py-0.5 rounded-md text-[10px] ${
                            u.tipoVinculoComprador === 'ProprietarioTerceiro'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {u.tipoVinculoComprador === 'ProprietarioTerceiro'
                              ? `Terceiro: ${u.proprietarioTerceiroNome || 'Financiador'}`
                              : `Usina: ${u.unidadeNome || 'Monte Dourado'}`}
                          </span>
                        </div>
                      )}

                      {/* Display Allowed Accesses Summary for this user */}
                      <div className="pt-1.5 border-t border-slate-200/70">
                        <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                          Acessos Liberados no Sistema:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const perfObj = permissoesPerfis.find((p) => p.perfil === u.perfil);
                            const telas = perfObj?.telasPermitidas || [];
                            
                            const labelMap: Record<string, string> = {
                              'dashboard': 'Painel',
                              'comprador': 'Portal Comprador',
                              'recebimento-compra': 'Recebimento',
                              'producao': 'Produção',
                              'quebra-manual': 'Quebra Manual',
                              'expedicao': 'Expedição',
                              'financeiro': 'Financeiro',
                              'usuarios': 'Usuários',
                              'documentos': 'Documentos',
                              'relatorios': 'Relatórios',
                              'auditoria': 'Auditoria',
                              'fornecedores': 'Fornecedores',
                              'lotes': 'Lotes',
                              'quarentena': 'Quarentena'
                            };

                            if (telas.length === 0) {
                              return <span className="text-[10px] text-slate-400 italic">Nenhum acesso configurado</span>;
                            }

                            return telas.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700"
                              >
                                {labelMap[t] || t}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                        <span className="font-bold text-slate-500 text-[11px]">Último Acesso:</span>
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {u.ultimoAcesso}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openEditUserModal(u)}
                      className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => toggleStatusUsuario(u.id)}
                      className={`py-1.5 px-3 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                        isBlocked
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
                      }`}
                      title={isBlocked ? 'Ativar Acesso do Usuário' : 'Bloquear/Inativar Usuário'}
                    >
                      {isBlocked ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Ativar</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          <span>Bloquear</span>
                        </>
                      )}
                    </button>

                    {!isSelf && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir permanentemente o usuário ${u.nome}?`)) {
                            deleteUsuario(u.id);
                          }
                        }}
                        className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="Excluir Usuário Permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Excluir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : activeSubTab === 'matriz' ? (
        /* Matriz de Permissões SubTab */
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-700" />
                Matriz Dinâmica de Permissões por Perfil
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Conceda ou remova permissões de visualização para cada tela em tempo real sem alterar código. O sistema esconde automaticamente menus e botões.
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Personalização Ativa para o Administrador</span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-100 uppercase text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Módulo / Tela do Sistema</th>
                  <th className="px-4 py-3.5">Categoria</th>
                  {targetRoles.map((r) => (
                    <th key={r} className="px-4 py-3.5 text-center">
                      <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-200">
                        {r}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {screenModules.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-extrabold text-slate-900">{m.label}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-500">{m.category}</td>
                    {targetRoles.map((role) => {
                      const pObj = permissoesPerfis.find((p) => p.perfil === role);
                      const isAllowed = pObj?.telasPermitidas.includes(m.id) || role === 'Administrador';

                      return (
                        <td key={role} className="px-4 py-3 text-center">
                          <button
                            disabled={role === 'Administrador'}
                            onClick={() => toggleScreenPermission(role, m.id)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              role === 'Administrador'
                                ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed opacity-80'
                                : isAllowed
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-pointer'
                            }`}
                          >
                            {isAllowed ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Special Feature Flags per Role */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              Regras Especiais de Sigilo e Ações Operacionais
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {targetRoles.map((role) => {
                const pObj = permissoesPerfis.find((p) => p.perfil === role);
                if (!pObj) return null;

                return (
                  <div key={role} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-emerald-700" />
                        Perfil: {role}
                      </span>
                      {role === 'Administrador' && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-100 text-purple-900 rounded">
                          ACESSO TOTAL
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Visualizar dados financeiros, custos e lucros</span>
                        <input
                          type="checkbox"
                          disabled={role === 'Administrador'}
                          checked={pObj.podeVerFinanceiro}
                          onChange={() => toggleFlagPermission(role, 'podeVerFinanceiro')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Editar registros pertencentes a outros usuários</span>
                        <input
                          type="checkbox"
                          disabled={role === 'Administrador'}
                          checked={pObj.podeEditarRegistrosOutros}
                          onChange={() => toggleFlagPermission(role, 'podeEditarRegistrosOutros')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Alterar Tabela de Preços do Módulo de Quebra</span>
                        <input
                          type="checkbox"
                          disabled={role === 'Administrador'}
                          checked={pObj.podeAlterarPrecos}
                          onChange={() => toggleFlagPermission(role, 'podeAlterarPrecos')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Recuperação de Senha View */
        <div className="space-y-6">
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-amber-950">Solicitações de Recuperação de Senha</h3>
                <p className="text-xs text-amber-800 font-medium">
                  Atendimento de notificações de redefinição de senha enviadas pelos colaboradores na tela de login.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-200 text-amber-900 text-xs font-black rounded-full border border-amber-300">
                {pendingRecoveryCount} Pendente(s)
              </span>
            </div>
          </div>

          {(solicitacoesRecuperacaoSenha || []).length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-extrabold text-slate-800 text-sm">Nenhuma solicitação registrada no momento.</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando um colaborador clicar em "Esqueceu a senha?" na tela de login, a notificação aparecerá nesta central para autorização do Usuário Master.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solicitacoesRecuperacaoSenha.map((req) => (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 bg-white ${
                    req.status === 'Pendente'
                      ? 'border-amber-300 shadow-sm ring-1 ring-amber-400/30'
                      : req.status === 'Aprovado'
                      ? 'border-emerald-200 opacity-90'
                      : 'border-rose-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                        <span>{req.loginOuEmail}</span>
                      </div>
                      {req.nomeInformado && (
                        <div className="text-xs text-slate-600 font-bold mt-0.5">{req.nomeInformado}</div>
                      )}
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Solicitado em: {req.dataSolicitacao}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'Pendente'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : req.status === 'Aprovado'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motivo Informado:</span>
                    <p className="text-slate-800 font-medium italic text-xs">{req.motivo || 'Nenhum detalhe adicional.'}</p>
                  </div>

                  {req.status === 'Aprovado' && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center justify-between">
                      <span>Senha Provisória Atribuída:</span>
                      <code className="bg-emerald-100 px-2 py-0.5 rounded font-mono text-emerald-950 font-black">{req.novaSenhaProvisoria}</code>
                    </div>
                  )}

                  {req.status === 'Pendente' ? (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedReqId(req.id);
                          setNovaSenhaMasterInput('123456');
                        }}
                        className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Conceder Senha</span>
                      </button>
                      <button
                        onClick={() => atenderRecuperacaoSenha(req.id, 'Rejeitar')}
                        className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-bold text-right pt-1">
                      Atendido por {req.atendidoPor} em {req.dataAtendimento}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Password Recovery Approval Modal */}
      {selectedReqId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-700" />
                Definir Nova Senha de Acesso
              </h3>
              <button
                onClick={() => setSelectedReqId(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Informe a nova senha que será atribuída e concedida a este usuário no sistema.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nova Senha de Acesso do Colaborador *
              </label>
              <input
                type="text"
                value={novaSenhaMasterInput}
                onChange={(e) => setNovaSenhaMasterInput(e.target.value)}
                placeholder="Ex: 123456 ou montedourado2026"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedReqId(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  atenderRecuperacaoSenha(selectedReqId, 'Aprovar', novaSenhaMasterInput.trim() || '123456');
                  setSelectedReqId(null);
                }}
                className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar & Conceder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for User Creation & Edition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                {editingUser ? 'Editar Cadastro de Usuário' : 'Novo Usuário de Acesso'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Mendes"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login (E-mail ou CPF) *</label>
                  <input
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="carlos@integralnuts.com.br"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Senha de Acesso *</label>
                  <input
                    type="text"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="123"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tipo de Usuário / Perfil Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Tipo de Usuário e Perfil de Acesso <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 block mb-1">
                  Selecione um dos perfis principais de operação ou escolha outro perfil no menu:
                </span>

                {/* 4 Main Role Quick Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPerfil('Administrador')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      perfil === 'Administrador'
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Shield className={`w-4 h-4 ${perfil === 'Administrador' ? 'text-purple-700' : 'text-slate-500'}`} />
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-purple-100 text-purple-900 rounded">
                        Acesso Total
                      </span>
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 block">Administrador</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      Acesso completo a todas as telas, relatórios e gestão.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPerfil('Comprador')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      perfil === 'Comprador'
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <ShoppingBag className={`w-4 h-4 ${perfil === 'Comprador' ? 'text-emerald-700' : 'text-slate-500'}`} />
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded">
                        Compras & Safra
                      </span>
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 block">Comprador</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      Portal do Comprador, ordens de compra e metas.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPerfil('Quebrador')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      perfil === 'Quebrador'
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Hammer className={`w-4 h-4 ${perfil === 'Quebrador' ? 'text-amber-700' : 'text-slate-500'}`} />
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded">
                        Produção
                      </span>
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 block">Quebrador</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      Produção, quebra e rendimento individual.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPerfil('Diarista')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      perfil === 'Diarista'
                        ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Briefcase className={`w-4 h-4 ${perfil === 'Diarista' ? 'text-orange-700' : 'text-slate-500'}`} />
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-orange-100 text-orange-900 rounded">
                        Diária / Apoio
                      </span>
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 block">Diarista</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      Lançamentos de Produção e Quebra do dia.
                    </span>
                  </button>
                </div>

                {/* Dropdown for other roles */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Ou selecione outro perfil específico:</span>
                  <select
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Diarista">Diarista</option>
                    <option value="Quebrador">Quebrador</option>
                    <option value="Gestor">Gestor</option>
                    <option value="Operador">Operador</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Estoque">Estoque</option>
                    <option value="Comprador">Comprador</option>
                    <option value="Recebimento">Recebimento</option>
                    <option value="Qualidade">Qualidade</option>
                    <option value="Consulta">Consulta</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Live Access Summary Box for Selected Profile */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Acessos que o usuário [{perfil}] terá:
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Definido na Matriz
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(() => {
                    const perfObj = permissoesPerfis.find((p) => p.perfil === perfil);
                    const telas = perfObj?.telasPermitidas || [];

                    const labelMap: Record<string, string> = {
                      'dashboard': 'Painel Geral',
                      'recebimento-compra': 'Recebimento & Compra',
                      'producao': 'Produção & Lotes',
                      'quebra-manual': 'Quebra Manual',
                      'expedicao': 'Expedição',
                      'financeiro': 'Financeiro & Pagamentos',
                      'usuarios': 'Gestão de Usuários',
                      'documentos': 'Documentos A4',
                      'relatorios': 'Relatórios Gerenciais',
                      'auditoria': 'Log de Auditoria',
                      'fornecedores': 'Fornecedores',
                      'lotes': 'Lotes',
                      'quarentena': 'Quarentena'
                    };

                    if (telas.length === 0) {
                      return <span className="text-xs text-slate-400 italic">Nenhum módulo liberado para este perfil.</span>;
                    }

                    return telas.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-extrabold px-2 py-1 bg-[#122B1E] border border-[#1E4D34] rounded-lg text-emerald-200 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        {labelMap[t] || t}
                      </span>
                    ));
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status no Sistema *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusUsuario)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Ativo">Ativo (Permitido)</option>
                    <option value="Inativo">Inativo (Bloqueado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Função do Colaborador</label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ex: Quebrador de Castanha / Apoio"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {perfil === 'Quebrador' && (
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Vincular ao Cadastro de Quebrador</label>
                  <select
                    value={quebradorId}
                    onChange={(e) => setQuebradorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-black text-amber-950 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Selecione o cadastrado na ficha...</option>
                    {quebradores.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.nome} ({q.matricula})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {perfil === 'Comprador' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Subordinação & Financiador do Comprador
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTipoVinculoComprador('Usina')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        tipoVinculoComprador === 'Usina'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <strong className="text-xs font-black text-slate-900 block">Subordinado à Usina</strong>
                      <span className="text-[10px] text-slate-500 block">Castanha comprada com recursos da Usina</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoVinculoComprador('ProprietarioTerceiro')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        tipoVinculoComprador === 'ProprietarioTerceiro'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <strong className="text-xs font-black text-slate-900 block">Proprietário Terceiro</strong>
                      <span className="text-[10px] text-slate-500 block">Castanha financiada por terceiro/investidor</span>
                    </button>
                  </div>

                  {tipoVinculoComprador === 'ProprietarioTerceiro' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Selecione o Proprietário/Investidor Terceiro:
                      </label>
                      <select
                        value={proprietarioTerceiroId}
                        onChange={(e) => setProprietarioTerceiroId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      >
                        {proprietariosTerceiros.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.documento || 'Sem doc'}) — {p.contato || 'Ativo'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL da Foto de Perfil (Opcional)</label>
                <input
                  type="text"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
