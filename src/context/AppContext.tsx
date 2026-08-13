import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  db,
  subscribeToCollection,
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  syncCollectionToFirestore
} from '../firebase';
import {
  Fornecedor,
  Recebimento,
  CompraOrdem,
  Lote,
  DocumentoEmitido,
  TransferenciaDestino,
  PerfilUsuario,
  DestinoTipo,
  SituacaoLote,
  ItemDestino,
  Quebrador,
  TabelaPrecoQuebra,
  ProducaoQuebraDiaria,
  PagamentoQuebra,
  RegistroAuditoriaQuebra,
  AppUser,
  PermissoesPerfil,
  LogAuditoriaSistema,
  SolicitacaoRecuperacaoSenha,
  StatusUsuario,
  ContaPagar,
  ContaReceber,
  ExpedicaoItem,
  FormaPagamento,
  Cliente,
  ItemEstoqueBeneficiada,
  TipoCastanhaBeneficiadaSubtipo,
  RomaneioRetirada,
  ItemRomaneioRetirada,
  EmpresaConfig,
  ExpectativaCompra,
  MotivoBaixaExpectativa,
  StatusExpectativa,
  UnidadeFilial,
  AporteComprador,
  ModulosUnidade,
  TipoContratoCompra,
  ProprietarioTerceiro
} from '../types';
import {
  INITIAL_FORNECEDORES,
  INITIAL_RECEBIMENTOS,
  INITIAL_COMPRAS,
  INITIAL_LOTES,
  INITIAL_DOCUMENTOS,
  INITIAL_TRANSFERENCIAS,
  INITIAL_QUEBRADORES,
  INITIAL_TABELA_PRECO_QUEBRA,
  INITIAL_PRODUCOES_QUEBRA,
  INITIAL_PAGAMENTOS_QUEBRA,
  INITIAL_AUDITORIA_QUEBRA,
  INITIAL_USERS,
  INITIAL_PERMISSOES,
  INITIAL_AUDITORIA_SISTEMA,
  INITIAL_CONTAS_PAGAR,
  INITIAL_CONTAS_RECEBER,
  INITIAL_EXPEDICOES,
  INITIAL_CLIENTES,
  INITIAL_ESTOQUE_BENEFICIADA,
  INITIAL_ROMANEIOS_RETIRADA,
  INITIAL_EMPRESA_CONFIG,
  INITIAL_EXPECTATIVAS_COMPRA,
  INITIAL_UNIDADES,
  INITIAL_APORTES_COMPRADOR,
  INITIAL_PROPRIETARIOS_TERCEIROS
} from '../data/initialData';
import {
  generateReceiptCode,
  generateBatchCode,
  generateDocCode,
  hlToLatas,
  calculateRealKgFactors
} from '../utils/conversions';

export type ActiveTab =
  | 'super-admin'
  | 'comprador'
  | 'dashboard'
  | 'recebimento-compra'
  | 'novo-recebimento'
  | 'nova-compra'
  | 'fornecedores'
  | 'estoque-casca'
  | 'lotes'
  | 'quarentena'
  | 'producao'
  | 'quebra-manual'
  | 'secagem'
  | 'estoque-acabado'
  | 'expedicao'
  | 'saidas'
  | 'financeiro'
  | 'documentos'
  | 'relatorios'
  | 'cadastros'
  | 'usuarios'
  | 'auditoria'
  | 'configuracoes';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AppContextType {
  isFirebaseConnected: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activePerfil: PerfilUsuario;
  setActivePerfil: (perfil: PerfilUsuario) => void;

  // Unidades & Super Administrador System
  unidades: UnidadeFilial[];
  activeUnidadeId: string; // 'todas' or unit ID (e.g. 'US-001')
  setActiveUnidadeId: (id: string) => void;
  activeUnidade: UnidadeFilial | null;
  addUnidade: (u: Omit<UnidadeFilial, 'id' | 'dataCriacao' | 'codigo'>) => UnidadeFilial;
  updateUnidade: (id: string, patch: Partial<UnidadeFilial>) => void;
  toggleModuloUnidade: (unidadeId: string, modulo: keyof ModulosUnidade) => void;
  deleteUnidade: (id: string) => void;

  // Proprietários Terceiros (Financiadores Externos)
  proprietariosTerceiros: ProprietarioTerceiro[];
  addProprietarioTerceiro: (p: Omit<ProprietarioTerceiro, 'id' | 'dataCadastro'>) => ProprietarioTerceiro;
  updateProprietarioTerceiro: (id: string, patch: Partial<ProprietarioTerceiro>) => void;
  deleteProprietarioTerceiro: (id: string) => void;

  // Comprador System & Aportes
  aportesComprador: AporteComprador[];
  addAporteComprador: (aporte: Omit<AporteComprador, 'id' | 'codigo'>) => AporteComprador;
  deleteAporteComprador: (id: string) => void;

  // Authentication & Users System
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  usuarios: AppUser[];
  permissoesPerfis: PermissoesPerfil[];
  logsAuditoriaSistema: LogAuditoriaSistema[];
  solicitacoesRecuperacaoSenha: SolicitacaoRecuperacaoSenha[];

  login: (loginInput: string, senhaInput: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (userId: string) => void;

  solicitarRecuperacaoSenha: (loginOuEmail: string, motivo?: string, nomeInformado?: string) => { success: boolean; message: string };
  atenderRecuperacaoSenha: (id: string, acao: 'Aprovar' | 'Rejeitar', novaSenha?: string) => void;

  addUsuario: (u: Omit<AppUser, 'id' | 'dataCriacao' | 'ultimoAcesso'>) => void;
  updateUsuario: (id: string, u: Partial<AppUser>) => void;
  toggleStatusUsuario: (id: string) => void;
  deleteUsuario: (id: string) => void;

  updatePermissoesPerfil: (perfil: PerfilUsuario, novasPermissoes: Partial<PermissoesPerfil>) => void;
  registrarLogAuditoria: (acao: string, registroAlterado: string, usuarioOverride?: AppUser) => void;
  temPermissao: (tabId: string) => boolean;
  podeVerFinanceiro: boolean;
  podeGerenciarUsuarios: boolean;
  
  fornecedores: Fornecedor[];
  recebimentos: Recebimento[];
  compras: CompraOrdem[];
  lotes: Lote[];
  documentos: DocumentoEmitido[];
  transferencias: TransferenciaDestino[];
  
  // Financeiro & Expedição & Estoque
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  expedicoes: ExpedicaoItem[];
  clientes: Cliente[];
  estoqueBeneficiada: ItemEstoqueBeneficiada[];

  deduzirEstoqueBeneficiada: (tipo: TipoCastanhaBeneficiadaSubtipo, caixas: number, pesoKg: number, precoVendaKg: number) => void;
  adicionarEstoqueBeneficiada: (tipo: TipoCastanhaBeneficiadaSubtipo, caixas: number, pesoKg?: number) => void;
  ajustarEstoqueBeneficiada: (tipo: TipoCastanhaBeneficiadaSubtipo, novasCaixas: number, novoUltimoPreco?: number) => void;

  addCliente: (c: Omit<Cliente, 'id' | 'codigo' | 'dataCadastro'>) => Cliente;
  updateCliente: (id: string, patch: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;

  addContaPagar: (novaConta: Omit<ContaPagar, 'id' | 'codigo' | 'valorPago' | 'situacao'>) => ContaPagar;
  registrarPagamentoContaPagar: (id: string, valor: number, forma: FormaPagamento, banco?: string, obs?: string) => void;

  addContaReceber: (novaConta: Omit<ContaReceber, 'id' | 'codigo' | 'valorRecebido' | 'situacao'>) => ContaReceber;
  registrarRecebimentoContaReceber: (id: string, valor: number, forma: FormaPagamento, banco?: string, obs?: string) => void;

  addExpedicao: (expData: Omit<ExpedicaoItem, 'id' | 'codigo'>) => { expedicao: ExpedicaoItem; contaReceber: ContaReceber };
  
  // Romaneio de Retirada
  romaneiosRetirada: RomaneioRetirada[];
  addRomaneioRetirada: (romData: Omit<RomaneioRetirada, 'id' | 'codigo' | 'dataCriacao' | 'responsavelEmissao' | 'numItensTotal' | 'quantidadeTotal' | 'valorTotal'>) => RomaneioRetirada;
  updateRomaneioRetirada: (id: string, patch: Partial<RomaneioRetirada>) => void;
  deleteRomaneioRetirada: (id: string) => void;
  
  // Quebra Manual State
  quebradores: Quebrador[];
  tabelaPrecoQuebra: TabelaPrecoQuebra;
  producoesQuebra: ProducaoQuebraDiaria[];
  pagamentosQuebra: PagamentoQuebra[];
  auditoriaQuebra: RegistroAuditoriaQuebra[];
  selectedQuebradorId: string | null;
  setSelectedQuebradorId: (id: string | null) => void;

  // Actions for Quebra Manual
  addQuebrador: (q: Omit<Quebrador, 'id' | 'matricula'>) => Quebrador;
  updateQuebrador: (id: string, q: Partial<Quebrador>) => void;
  toggleQuebradorStatus: (id: string) => void;
  updateTabelaPrecoQuebra: (novosPrecos: Partial<TabelaPrecoQuebra>, usuario: string, justificativa: string) => void;
  addProducaoQuebra: (p: Omit<ProducaoQuebraDiaria, 'id' | 'totalKg' | 'taxaInteira' | 'taxaQuebrada' | 'taxaAmarela' | 'valorInteira' | 'valorQuebrada' | 'valorAmarela' | 'valorTotal' | 'situacaoPagamento' | 'dataHoraCriacao'>, usuario: string) => ProducaoQuebraDiaria;
  updateProducaoQuebra: (id: string, novosDados: Partial<ProducaoQuebraDiaria>, usuario: string, justificativa: string) => void;
  autorizarProducaoQuebra: (id: string, status: 'Aprovado' | 'Rejeitado', usuario: string, motivo?: string) => void;
  autorizarTodasProducoesQuebra: (ids: string[], usuario: string) => void;
  registrarPagamentoQuebra: (pagamentoData: Omit<PagamentoQuebra, 'id' | 'codigo'>, usuario: string) => PagamentoQuebra;
  
  // Document preview for PDF Modal
  docPreview: {
    tipo: 'Recibo' | 'Romaneio de Entrada' | 'Romaneio de Saída' | 'Romaneio de Retirada' | 'Extrato de Fornecedor' | 'Extrato de Lote' | 'Extrato de Estoque' | 'Relatório Gerencial' | 'Folha de Quebra' | 'Recibo de Quebra';
    data: any;
  } | null;
  setDocPreview: (preview: { tipo: any; data: any } | null) => void;

  // Selected item filters
  selectedFornecedorId: string | null;
  setSelectedFornecedorId: (id: string | null) => void;
  selectedLoteId: string | null;
  setSelectedLoteId: (id: string | null) => void;

  // Actions
  addFornecedor: (fornecedor: Omit<Fornecedor, 'id' | 'codigo' | 'dataCadastro'>) => Fornecedor;
  updateFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  
  addRecebimento: (novoRec: Omit<Recebimento, 'id' | 'codigo' | 'historicoAuditoria'>) => Recebimento;
  cancelRecebimento: (id: string, motivo: string) => void;

  addCompra: (novaCompra: Omit<CompraOrdem, 'id' | 'codigo' | 'status'>) => CompraOrdem;
  vincularRecebimentoACompra: (compraId: string, recebimentoId: string, recebimentoCodigo: string, finalVolumeHl?: number, finalValorTotal?: number, observacoesAdd?: string) => void;
  getCompraPendenteFornecedor: (fornecedorId: string) => CompraOrdem | undefined;
  
  registrarPagamento: (
    recebimentoId: string,
    valor: number,
    forma: any,
    banco?: string,
    obs?: string,
    tipo?: any
  ) => void;

  alterarDestinoEstoque: (
    origemDestino: DestinoTipo,
    novoDestino: DestinoTipo,
    quantidadeHl: number,
    recebimentoId: string,
    motivo: string,
    autorizacao: string,
    localOrigem: string,
    localNovo: string
  ) => boolean;

  addLote: (novoLote: Omit<Lote, 'id' | 'codigo'>) => Lote;
  updateStatusLote: (loteId: string, novaSituacao: SituacaoLote) => void;

  gerarDocumento: (
    tipo: 'Recibo' | 'Romaneio de Entrada' | 'Romaneio de Saída' | 'Extrato de Fornecedor' | 'Extrato de Lote' | 'Extrato de Estoque' | 'Relatório Gerencial',
    referenciaId: string,
    fornecedorNome?: string,
    dadosDoc?: any
  ) => DocumentoEmitido;

  // Expectativas de Compra
  expectativasCompra: ExpectativaCompra[];
  addExpectativaCompra: (data: {
    fornecedorId: string;
    fornecedorNome: string;
    quantidadeEstimada: number;
    unidadeMedida: 'hectolitros' | 'latas' | 'kg' | 'caixas' | string;
    periodoDisponibilidade: string;
    recebimentoOrigemCodigo?: string;
  }) => ExpectativaCompra;
  updateQuantidadeExpectativa: (id: string, novaQuantidade: number) => void;
  darBaixaExpectativa: (id: string, motivo: MotivoBaixaExpectativa) => void;
  converterExpectativaEmCompra: (id: string) => void;

  // Empresa Config
  empresaConfig: EmpresaConfig;
  updateEmpresaConfig: (patch: Partial<EmpresaConfig>) => void;

  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;

  resetToInitialData: () => void;
  limparDadosOperacionais: () => void;
  limparTodosOsDadosSistema: () => void;
  limparDadosDemo: () => void;
  limparRegistrosTeste: () => void;
  limparSessoesAcessosAnteriores: () => void;
  encerrarTodasSessoesAtivas: () => void;
  limparHistoricoNotificacoesMensagens: () => void;
  restaurarBaseLimpa: () => void;
  limparSomenteDadosDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'monte_dourado_factory_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_activeTab`);
    return (saved as ActiveTab) || 'dashboard';
  });
  const [activePerfil, setActivePerfil] = useState<PerfilUsuario>('Administrador');

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_activeTab`, activeTab);
  }, [activeTab]);

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_fornecedores`);
    return saved ? JSON.parse(saved) : INITIAL_FORNECEDORES;
  });

  const [recebimentos, setRecebimentos] = useState<Recebimento[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_recebimentos`);
    return saved ? JSON.parse(saved) : INITIAL_RECEBIMENTOS;
  });

  const [compras, setCompras] = useState<CompraOrdem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_compras`);
    return saved ? JSON.parse(saved) : INITIAL_COMPRAS;
  });

  const [lotes, setLotes] = useState<Lote[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_lotes`);
    return saved ? JSON.parse(saved) : INITIAL_LOTES;
  });

  const [documentos, setDocumentos] = useState<DocumentoEmitido[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_documentos`);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTOS;
  });

  const [transferencias, setTransferencias] = useState<TransferenciaDestino[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_transferencias`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERENCIAS;
  });

  // Financial & Expeditions States
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_contasPagar`);
    return saved ? JSON.parse(saved) : INITIAL_CONTAS_PAGAR;
  });

  const [contasReceber, setContasReceber] = useState<ContaReceber[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_contasReceber`);
    return saved ? JSON.parse(saved) : INITIAL_CONTAS_RECEBER;
  });

  const [expedicoes, setExpedicoes] = useState<ExpedicaoItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_expedicoes`);
    return saved ? JSON.parse(saved) : INITIAL_EXPEDICOES;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_clientes`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
  });

  const [estoqueBeneficiada, setEstoqueBeneficiada] = useState<ItemEstoqueBeneficiada[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_estoqueBeneficiada`);
    return saved ? JSON.parse(saved) : INITIAL_ESTOQUE_BENEFICIADA;
  });

  const [romaneiosRetirada, setRomaneiosRetirada] = useState<RomaneioRetirada[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_romaneiosRetirada`);
    return saved ? JSON.parse(saved) : INITIAL_ROMANEIOS_RETIRADA;
  });

  // Expectativas de Compra State
  const [expectativasCompra, setExpectativasCompra] = useState<ExpectativaCompra[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_expectativasCompra`);
    return saved ? JSON.parse(saved) : INITIAL_EXPECTATIVAS_COMPRA;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expectativasCompra`, JSON.stringify(expectativasCompra));
  }, [expectativasCompra]);

  // Unidades & Multiusinas State
  const [unidades, setUnidades] = useState<UnidadeFilial[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_unidades`);
    return saved ? JSON.parse(saved) : INITIAL_UNIDADES;
  });

  const [activeUnidadeId, setActiveUnidadeId] = useState<string>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_activeUnidadeId`) || 'todas';
  });

  // Proprietários Terceiros State
  const [proprietariosTerceiros, setProprietariosTerceiros] = useState<ProprietarioTerceiro[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_proprietariosTerceiros`);
    return saved ? JSON.parse(saved) : INITIAL_PROPRIETARIOS_TERCEIROS;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_proprietariosTerceiros`, JSON.stringify(proprietariosTerceiros));
  }, [proprietariosTerceiros]);

  // Aportes de Comprador State
  const [aportesComprador, setAportesComprador] = useState<AporteComprador[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_aportesComprador`);
    return saved ? JSON.parse(saved) : INITIAL_APORTES_COMPRADOR;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_unidades`, JSON.stringify(unidades));
  }, [unidades]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_activeUnidadeId`, activeUnidadeId);
  }, [activeUnidadeId]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_aportesComprador`, JSON.stringify(aportesComprador));
  }, [aportesComprador]);

  // Quebra Manual States
  const [quebradores, setQuebradores] = useState<Quebrador[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_quebradores`);
    return saved ? JSON.parse(saved) : INITIAL_QUEBRADORES;
  });

  const [tabelaPrecoQuebra, setTabelaPrecoQuebra] = useState<TabelaPrecoQuebra>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tabelaPrecoQuebra`);
    return saved ? JSON.parse(saved) : INITIAL_TABELA_PRECO_QUEBRA;
  });

  const [producoesQuebra, setProducoesQuebra] = useState<ProducaoQuebraDiaria[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_producoesQuebra`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCOES_QUEBRA;
  });

  const [pagamentosQuebra, setPagamentosQuebra] = useState<PagamentoQuebra[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pagamentosQuebra`);
    return saved ? JSON.parse(saved) : INITIAL_PAGAMENTOS_QUEBRA;
  });

  const [auditoriaQuebra, setAuditoriaQuebra] = useState<RegistroAuditoriaQuebra[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_auditoriaQuebra`);
    return saved ? JSON.parse(saved) : INITIAL_AUDITORIA_QUEBRA;
  });

  // User Management, Permissions Matrix & System Audit Logs
  const [usuarios, setUsuarios] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_usuarios`);
    if (saved) {
      try {
        const parsed: AppUser[] = JSON.parse(saved);
        // Remove old demo users
        const filtered = parsed.filter(
          (u) => !['usr-admin', 'usr-gestor', 'usr-operador', 'usr-quebradora-1', 'usr-quebrador-2', 'usr-inativo'].includes(u.id)
        );
        // Ensure master user is present and ALWAYS has Administrador profile & Ativo status
        const masterIdx = filtered.findIndex(
          (u) => u.login.toLowerCase() === 'castanhasintegralnuts@gmail.com' || u.id === 'usr-master-integral'
        );
        if (masterIdx !== -1) {
          filtered[masterIdx] = {
            ...filtered[masterIdx],
            perfil: 'Administrador',
            status: 'Ativo'
          };
          return filtered;
        } else {
          return [INITIAL_USERS[0], ...filtered];
        }
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [permissoesPerfis, setPermissoesPerfis] = useState<PermissoesPerfil[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_permissoesPerfis`);
    if (saved) {
      try {
        const parsed: PermissoesPerfil[] = JSON.parse(saved);
        const adminBase = INITIAL_PERMISSOES.find((ip) => ip.perfil === 'Administrador')!;
        return parsed.map((p) => {
          if (p.perfil === 'Administrador') {
            return {
              ...adminBase,
              ...p,
              telasPermitidas: adminBase.telasPermitidas,
              podeVerFinanceiro: true,
              podeGerenciarUsuarios: true,
              podeEditarRegistrosOutros: true,
              podeAlterarPrecos: true,
            };
          }
          return p;
        });
      } catch (e) {
        return INITIAL_PERMISSOES;
      }
    }
    return INITIAL_PERMISSOES;
  });

  const [logsAuditoriaSistema, setLogsAuditoriaSistema] = useState<LogAuditoriaSistema[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logsAuditoriaSistema`);
    return saved ? JSON.parse(saved) : INITIAL_AUDITORIA_SISTEMA;
  });

  const [solicitacoesRecuperacaoSenha, setSolicitacoesRecuperacaoSenha] = useState<SolicitacaoRecuperacaoSenha[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_solicitacoesRecuperacaoSenha`);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_currentUser`);
    if (saved) {
      try {
        const parsed: AppUser = JSON.parse(saved);
        if (parsed && parsed.status === 'Ativo') {
          if (parsed.login.toLowerCase() === 'castanhasintegralnuts@gmail.com' || parsed.id === 'usr-master-integral') {
            return {
              ...parsed,
              perfil: 'Administrador',
              status: 'Ativo'
            };
          }
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [selectedQuebradorId, setSelectedQuebradorId] = useState<string | null>(null);

  const [docPreview, setDocPreview] = useState<{ tipo: any; data: any } | null>(null);
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<string | null>(null);
  const [selectedLoteId, setSelectedLoteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      const unsubClientes = subscribeToCollection<Cliente>('clientes', (data) => {
        if (data && data.length > 0) {
          setClientes(data);
        } else {
          syncCollectionToFirestore('clientes', INITIAL_CLIENTES);
        }
        setIsFirebaseConnected(true);
      });
      unsubs.push(unsubClientes);

      const unsubExpedicoes = subscribeToCollection<ExpedicaoItem>('expedicoes', (data) => {
        if (data && data.length > 0) {
          setExpedicoes(data);
        } else {
          syncCollectionToFirestore('expedicoes', INITIAL_EXPEDICOES);
        }
      });
      unsubs.push(unsubExpedicoes);

      const unsubEstoque = subscribeToCollection<ItemEstoqueBeneficiada>('estoqueBeneficiada', (data) => {
        if (data && data.length > 0) {
          setEstoqueBeneficiada(data);
        } else {
          syncCollectionToFirestore('estoqueBeneficiada', INITIAL_ESTOQUE_BENEFICIADA, 'tipo');
        }
      });
      unsubs.push(unsubEstoque);

      const unsubRomaneios = subscribeToCollection<RomaneioRetirada>('romaneiosRetirada', (data) => {
        if (data && data.length > 0) {
          setRomaneiosRetirada(data);
        } else {
          syncCollectionToFirestore('romaneiosRetirada', INITIAL_ROMANEIOS_RETIRADA);
        }
      });
      unsubs.push(unsubRomaneios);

      const unsubContasReceber = subscribeToCollection<ContaReceber>('contasReceber', (data) => {
        if (data && data.length > 0) {
          setContasReceber(data);
        } else {
          syncCollectionToFirestore('contasReceber', INITIAL_CONTAS_RECEBER);
        }
      });
      unsubs.push(unsubContasReceber);

      const unsubFornecedores = subscribeToCollection<Fornecedor>('fornecedores', (data) => {
        if (data && data.length > 0) {
          setFornecedores(data);
        } else {
          syncCollectionToFirestore('fornecedores', INITIAL_FORNECEDORES);
        }
      });
      unsubs.push(unsubFornecedores);

      const unsubCompras = subscribeToCollection<CompraOrdem>('compras', (data) => {
        if (data && data.length > 0) {
          setCompras(data);
        } else {
          syncCollectionToFirestore('compras', INITIAL_COMPRAS);
        }
      });
      unsubs.push(unsubCompras);

      const unsubRecebimentos = subscribeToCollection<Recebimento>('recebimentos', (data) => {
        if (data && data.length > 0) {
          setRecebimentos(data);
        } else {
          syncCollectionToFirestore('recebimentos', INITIAL_RECEBIMENTOS);
        }
      });
      unsubs.push(unsubRecebimentos);

      const unsubContasPagar = subscribeToCollection<ContaPagar>('contasPagar', (data) => {
        if (data && data.length > 0) {
          setContasPagar(data);
        } else {
          syncCollectionToFirestore('contasPagar', INITIAL_CONTAS_PAGAR);
        }
      });
      unsubs.push(unsubContasPagar);

      const unsubUsuarios = subscribeToCollection<AppUser>('usuarios', (data) => {
        if (data && data.length > 0) {
          setUsuarios(data);
        } else {
          syncCollectionToFirestore('usuarios', INITIAL_USERS);
        }
      });
      unsubs.push(unsubUsuarios);
    } catch (e) {
      console.warn('Firebase Firestore real-time error:', e);
    }

    return () => {
      unsubs.forEach((unsub) => {
        try { unsub(); } catch (_) {}
      });
    };
  }, []);

  // Revoke session if user status is set to 'Inativo' or deleted by Admin
  useEffect(() => {
    if (currentUser) {
      const activeRecord = usuarios.find((u) => u.id === currentUser.id || u.login.toLowerCase() === currentUser.login.toLowerCase());
      if (!activeRecord || activeRecord.status === 'Inativo') {
        setCurrentUser(null);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_currentUser`);
        window.history.replaceState(null, '', window.location.pathname);
        addToast('Sua conta foi desativada ou removida pelo Administrador. Acesso revogado.', 'error');
      }
    }
  }, [usuarios]);

  // Sync activePerfil with currentUser and pushState guard for unauthenticated users
  useEffect(() => {
    if (currentUser) {
      setActivePerfil(currentUser.perfil);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_currentUser`);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_usuarios`, JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_permissoesPerfis`, JSON.stringify(permissoesPerfis));
  }, [permissoesPerfis]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logsAuditoriaSistema`, JSON.stringify(logsAuditoriaSistema));
  }, [logsAuditoriaSistema]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_fornecedores`, JSON.stringify(fornecedores));
  }, [fornecedores]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_recebimentos`, JSON.stringify(recebimentos));
  }, [recebimentos]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_compras`, JSON.stringify(compras));
  }, [compras]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_lotes`, JSON.stringify(lotes));
  }, [lotes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_documentos`, JSON.stringify(documentos));
  }, [documentos]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transferencias`, JSON.stringify(transferencias));
  }, [transferencias]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_contasPagar`, JSON.stringify(contasPagar));
  }, [contasPagar]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_contasReceber`, JSON.stringify(contasReceber));
  }, [contasReceber]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expedicoes`, JSON.stringify(expedicoes));
  }, [expedicoes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_clientes`, JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_estoqueBeneficiada`, JSON.stringify(estoqueBeneficiada));
  }, [estoqueBeneficiada]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_romaneiosRetirada`, JSON.stringify(romaneiosRetirada));
  }, [romaneiosRetirada]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_quebradores`, JSON.stringify(quebradores));
  }, [quebradores]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tabelaPrecoQuebra`, JSON.stringify(tabelaPrecoQuebra));
  }, [tabelaPrecoQuebra]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_producoesQuebra`, JSON.stringify(producoesQuebra));
  }, [producoesQuebra]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_pagamentosQuebra`, JSON.stringify(pagamentosQuebra));
  }, [pagamentosQuebra]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_auditoriaQuebra`, JSON.stringify(auditoriaQuebra));
  }, [auditoriaQuebra]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_solicitacoesRecuperacaoSenha`, JSON.stringify(solicitacoesRecuperacaoSenha));
  }, [solicitacoesRecuperacaoSenha]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetToInitialData = () => {
    setFornecedores(INITIAL_FORNECEDORES);
    setRecebimentos(INITIAL_RECEBIMENTOS);
    setLotes(INITIAL_LOTES);
    setDocumentos(INITIAL_DOCUMENTOS);
    setTransferencias(INITIAL_TRANSFERENCIAS);
    setContasPagar(INITIAL_CONTAS_PAGAR);
    setContasReceber(INITIAL_CONTAS_RECEBER);
    setExpedicoes(INITIAL_EXPEDICOES);
    setClientes(INITIAL_CLIENTES);
    setEstoqueBeneficiada(INITIAL_ESTOQUE_BENEFICIADA);
    setQuebradores(INITIAL_QUEBRADORES);
    setTabelaPrecoQuebra(INITIAL_TABELA_PRECO_QUEBRA);
    setProducoesQuebra(INITIAL_PRODUCOES_QUEBRA);
    setPagamentosQuebra(INITIAL_PAGAMENTOS_QUEBRA);
    setAuditoriaQuebra(INITIAL_AUDITORIA_QUEBRA);

    setUsuarios(INITIAL_USERS);
    setPermissoesPerfis(INITIAL_PERMISSOES);
    setLogsAuditoriaSistema(INITIAL_AUDITORIA_SISTEMA);
    setCurrentUser(null);
    setActivePerfil('Administrador');

    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_fornecedores`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_recebimentos`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_lotes`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_documentos`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_transferencias`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_contasPagar`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_contasReceber`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_expedicoes`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_quebradores`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_tabelaPrecoQuebra`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_producoesQuebra`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_pagamentosQuebra`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_auditoriaQuebra`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_usuarios`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_permissoesPerfis`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logsAuditoriaSistema`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_currentUser`);

    addToast('Dados de demonstração e acessos restaurados com sucesso!', 'info');
  };

  const [empresaConfig, setEmpresaConfig] = useState<EmpresaConfig>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_empresaConfig`);
    return saved ? JSON.parse(saved) : INITIAL_EMPRESA_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_empresaConfig`, JSON.stringify(empresaConfig));
  }, [empresaConfig]);

  const updateEmpresaConfig = (patch: Partial<EmpresaConfig>) => {
    setEmpresaConfig((prev) => {
      const updated = { ...prev, ...patch };
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_empresaConfig`, JSON.stringify(updated));
      return updated;
    });
    registrarLogAuditoria(
      'ALTERAR_DADOS_EMPRESA',
      `Dados da empresa alterados: ${patch.razaoSocial || patch.nomeFantasia || 'Atualização de campos'}`
    );
    addToast('Dados da empresa salvos e atualizados em todo o sistema!', 'success');
  };

  // Funções de Gerenciamento de Expectativas de Compra
  const addExpectativaCompra = (data: {
    fornecedorId: string;
    fornecedorNome: string;
    quantidadeEstimada: number;
    unidadeMedida: 'hectolitros' | 'latas' | 'kg' | 'caixas' | string;
    periodoDisponibilidade: string;
    recebimentoOrigemCodigo?: string;
  }): ExpectativaCompra => {
    const nextSeq = expectativasCompra.length + 1;
    const codigo = `EXP-${String(nextSeq).padStart(3, '0')}`;
    const nova: ExpectativaCompra = {
      id: `exp-${Date.now()}`,
      codigo,
      fornecedorId: data.fornecedorId,
      fornecedorNome: data.fornecedorNome,
      quantidadeEstimada: Number(data.quantidadeEstimada) || 0,
      unidadeMedida: data.unidadeMedida || 'hectolitros',
      periodoDisponibilidade: data.periodoDisponibilidade || 'Não especificado',
      status: 'Ativa',
      dataCriacao: new Date().toISOString(),
      recebimentoOrigemCodigo: data.recebimentoOrigemCodigo,
    };

    setExpectativasCompra((prev) => [nova, ...prev]);
    registrarLogAuditoria(
      'REGISTRAR_EXPECTATIVA_COMPRA',
      `Expectativa ${codigo} registrada para ${data.fornecedorNome}: ${data.quantidadeEstimada} ${data.unidadeMedida}`
    );
    addToast(`Expectativa de compra ${codigo} registrada com sucesso!`, 'success');
    return nova;
  };

  const updateQuantidadeExpectativa = (id: string, novaQuantidade: number) => {
    setExpectativasCompra((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantidadeEstimada: Number(novaQuantidade) || 0,
              dataAtualizacao: new Date().toISOString(),
            }
          : item
      )
    );
    addToast('Quantidade estimada atualizada com sucesso!', 'info');
  };

  const darBaixaExpectativa = (id: string, motivo: MotivoBaixaExpectativa) => {
    setExpectativasCompra((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Baixada',
              motivoBaixa: motivo,
              dataAtualizacao: new Date().toISOString(),
            }
          : item
      )
    );
    registrarLogAuditoria(
      'BAIXA_EXPECTATIVA_COMPRA',
      `Baixa realizada na expectativa. Motivo: ${motivo}`
    );
    addToast('Expectativa de compra baixada com sucesso.', 'info');
  };

  const converterExpectativaEmCompra = (id: string) => {
    setExpectativasCompra((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Convertida em Compra',
              dataAtualizacao: new Date().toISOString(),
            }
          : item
      )
    );
    addToast('Expectativa marcada como convertida em compra!', 'success');
  };

  // Zerar apenas movimentações e estoques (Início limpo mantendo cadastros base)
  const limparDadosOperacionais = () => {
    setRecebimentos([]);
    setCompras([]);
    setLotes([]);
    setDocumentos([]);
    setTransferencias([]);
    setContasPagar([]);
    setContasReceber([]);
    setExpedicoes([]);
    setProducoesQuebra([]);
    setPagamentosQuebra([]);
    setAuditoriaQuebra([]);
    setLogsAuditoriaSistema([]);

    setEstoqueBeneficiada((prev) =>
      prev.map((item) => ({
        ...item,
        caixas: 0,
        pesoKg: 0,
        totalKgVendidoHistorico: 0,
        totalValorVendidoHistorico: 0,
        dataUltimaAtualizacao: new Date().toISOString().split('T')[0]
      }))
    );

    registrarLogAuditoria('ZERAR_OPERANCEIS', 'Movimentações operacionais e saldos de estoque zerados.');
    addToast('Operações zeradas! Todas as movimentações e estoques foram limpos para início de operação sem contaminação.', 'warning');
  };

  // Zerar tudo (Reset total do sistema: movimentações + fornecedores, clientes e quebradores)
  const limparTodosOsDadosSistema = () => {
    limparDadosOperacionais();
    setFornecedores([]);
    setClientes([]);
    setQuebradores([]);

    registrarLogAuditoria('LIMPEZA_TOTAL_SISTEMA', 'Limpeza total do sistema executada (operacional + cadastros gerais).');
    addToast('Limpeza total executada com sucesso! O sistema está zerado e pronto para operação do zero.', 'warning');
  };

  const limparSomenteDadosDemo = () => {
    const demoFornecedorIds = INITIAL_FORNECEDORES.map((f) => f.id);
    const demoRecebimentoIds = INITIAL_RECEBIMENTOS.map((r) => r.id);
    const demoCompraIds = INITIAL_COMPRAS.map((c) => c.id);
    const demoLoteIds = INITIAL_LOTES.map((l) => l.id);
    const demoRomaneioIds = INITIAL_ROMANEIOS_RETIRADA.map((r) => r.id);

    setFornecedores((prev) => prev.filter((f) => !demoFornecedorIds.includes(f.id)));
    setRecebimentos((prev) => prev.filter((r) => !demoRecebimentoIds.includes(r.id)));
    setCompras((prev) => prev.filter((c) => !demoCompraIds.includes(c.id)));
    setLotes((prev) => prev.filter((l) => !demoLoteIds.includes(l.id)));
    setRomaneiosRetirada((prev) => prev.filter((r) => !demoRomaneioIds.includes(r.id)));

    registrarLogAuditoria('LIMPEZA_DADOS_DEMO', 'Excluídos registros de demonstração iniciais, mantendo cadastros reais do cliente.');
    addToast('Dados de demonstração removidos com sucesso! Registros reais foram mantidos.', 'success');
  };

  const limparDadosDemo = () => {
    limparSomenteDadosDemo();
  };

  const limparRegistrosTeste = () => {
    setRecebimentos((prev) => prev.filter((r) => !r.codigo.includes('TEST') && !r.observacoesQualidade?.includes('teste')));
    setCompras((prev) => prev.filter((c) => !c.codigo.includes('TEST')));
    setDocumentos((prev) => prev.filter((d) => !d.numeroDocumento.includes('TEST')));
    setAuditoriaQuebra([]);
    registrarLogAuditoria('LIMPEZA_REGISTROS_TESTE', 'Registros e documentos de teste do sistema foram removidos.');
    addToast('Registros e histórico de teste removidos com sucesso.', 'info');
  };

  const limparSessoesAcessosAnteriores = () => {
    setSolicitacoesRecuperacaoSenha([]);
    setLogsAuditoriaSistema((prev) => prev.filter((l) => l.acao === 'SISTEMA_INICIALIZADO' || l.usuarioId === currentUser?.id));
    registrarLogAuditoria('LIMPEZA_SESSOES_ACESSOS', 'Histórico de solicitações e logs de acessos anteriores foram limpos.');
    addToast('Histórico de acessos e solicitações anteriores limpos.', 'info');
  };

  const encerrarTodasSessoesAtivas = () => {
    setSolicitacoesRecuperacaoSenha([]);
    registrarLogAuditoria('ENCERRAR_TODAS_SESSOES', 'Todas as sessões ativas foram encerradas pelo Administrador.');
    addToast('Todas as sessões de acessos pendentes foram encerradas.', 'warning');
  };

  const limparHistoricoNotificacoesMensagens = () => {
    setToasts([]);
    setSolicitacoesRecuperacaoSenha([]);
    registrarLogAuditoria('LIMPEZA_NOTIFICACOES', 'Histórico de notificações e mensagens de teste zerado.');
    addToast('Histórico de notificações e mensagens limpo.', 'info');
  };

  const restaurarBaseLimpa = () => {
    limparTodosOsDadosSistema();
    setDocumentos([]);
    setSolicitacoesRecuperacaoSenha([]);
    setRomaneiosRetirada([]);
    registrarLogAuditoria('RESTAURAR_BASE_LIMPA', 'Aplicativo restaurado para uma base limpa de produção.');
    addToast('Aplicativo restaurado para uma base 100% limpa e pronta para uso!', 'success');
  };

  // Contas a Pagar (Agendadas & Recorrentes) Actions
  const addContaPagar = (novaContaData: Omit<ContaPagar, 'id' | 'codigo' | 'valorPago' | 'situacao'>): ContaPagar => {
    const seq = contasPagar.length + 1;
    const codigo = `CP-2026-${String(seq).padStart(3, '0')}`;
    const novaConta: ContaPagar = {
      ...novaContaData,
      id: `cp-${Date.now()}`,
      codigo,
      valorPago: 0,
      situacao: 'A Pagar',
      pagamentosEfetuados: [],
    };
    setContasPagar((prev) => [novaConta, ...prev]);
    saveDocumentToFirestore('contasPagar', novaConta);
    addToast(`Conta a Pagar (${novaConta.tipo}) ${codigo} cadastrada com sucesso!`, 'success');
    return novaConta;
  };

  const registrarPagamentoContaPagar = (
    id: string,
    valor: number,
    forma: FormaPagamento,
    banco: string = 'Banpará',
    obs: string = 'Pagamento de conta a pagar baixado no caixa'
  ) => {
    setContasPagar((prev) =>
      prev.map((cp) => {
        if (cp.id === id) {
          const pags = cp.pagamentosEfetuados || [];
          const novoPagamento = {
            id: `pag-cp-${Date.now()}`,
            data: new Date().toISOString().split('T')[0],
            valor,
            formaPagamento: forma,
            banco,
            responsavel: activePerfil,
            tipo: 'Parcial' as const,
            observacoes: obs,
          };
          const novosPags = [...pags, novoPagamento];
          const totalPago = novosPags.reduce((sum, p) => sum + p.valor, 0);
          const novaSituacao = totalPago >= cp.valorTotal ? 'Paga' : 'Parcialmente Paga';

          const updated = {
            ...cp,
            valorPago: totalPago,
            situacao: novaSituacao as any,
            pagamentosEfetuados: novosPags,
          };
          saveDocumentToFirestore('contasPagar', updated);
          return updated;
        }
        return cp;
      })
    );
    addToast('Pagamento registrado e Conta a Pagar atualizada!', 'success');
  };

  // Contas a Receber (Atreladas às Expedições) Actions
  const addContaReceber = (novaContaData: Omit<ContaReceber, 'id' | 'codigo' | 'valorRecebido' | 'situacao'>): ContaReceber => {
    const seq = contasReceber.length + 1;
    const codigo = `CR-2026-${String(seq).padStart(3, '0')}`;
    const novaConta: ContaReceber = {
      ...novaContaData,
      id: `cr-${Date.now()}`,
      codigo,
      valorRecebido: 0,
      situacao: 'A Receber',
      recebimentosEfetuados: [],
    };
    setContasReceber((prev) => [novaConta, ...prev]);
    saveDocumentToFirestore('contasReceber', novaConta);
    addToast(`Título em Contas a Receber ${codigo} gerado com sucesso!`, 'success');
    return novaConta;
  };

  const registrarRecebimentoContaReceber = (
    id: string,
    valor: number,
    forma: FormaPagamento,
    banco: string = 'Banpará',
    obs: string = 'Recebimento de cliente baixado no caixa'
  ) => {
    setContasReceber((prev) =>
      prev.map((cr) => {
        if (cr.id === id) {
          const recs = cr.recebimentosEfetuados || [];
          const novoRec = {
            id: `rec-cr-${Date.now()}`,
            data: new Date().toISOString().split('T')[0],
            valor,
            formaPagamento: forma,
            banco,
            responsavel: activePerfil,
            observacoes: obs,
          };
          const novosRecs = [...recs, novoRec];
          const totalRec = novosRecs.reduce((sum, r) => sum + r.valor, 0);
          const novaSituacao = totalRec >= cr.valorTotal ? 'Recebido' : 'Parcialmente Recebido';

          const updated = {
            ...cr,
            valorRecebido: totalRec,
            situacao: novaSituacao as any,
            recebimentosEfetuados: novosRecs,
          };
          saveDocumentToFirestore('contasReceber', updated);
          return updated;
        }
        return cr;
      })
    );
    addToast('Baixa de recebimento confirmada no Módulo Financeiro!', 'success');
  };

  // Stock Control for Castanha Beneficiada (Extra Large, Large, Média, Miúda, Pedaço, Pedacinho)
  const deduzirEstoqueBeneficiada = (
    tipoTarget: TipoCastanhaBeneficiadaSubtipo,
    caixasDeduzidas: number,
    pesoKgDeduzido: number,
    precoVendaKg: number
  ) => {
    setEstoqueBeneficiada((prev) =>
      prev.map((item) => {
        if (item.tipo === tipoTarget) {
          const novasCaixas = Math.max(0, item.caixas - caixasDeduzidas);
          const novoPesoKg = Math.max(0, item.pesoKg - pesoKgDeduzido);
          const novoTotalKgVendido = item.totalKgVendidoHistorico + pesoKgDeduzido;
          const novoTotalValorVendido = item.totalValorVendidoHistorico + (pesoKgDeduzido * precoVendaKg);
          const novoPrecoMedio = novoTotalKgVendido > 0 ? (novoTotalValorVendido / novoTotalKgVendido) : item.precoMedioVenda;

          const updated = {
            ...item,
            caixas: novasCaixas,
            pesoKg: novoPesoKg,
            ultimoPrecoVenda: precoVendaKg > 0 ? precoVendaKg : item.ultimoPrecoVenda,
            precoMedioVenda: Math.round(novoPrecoMedio * 100) / 100,
            totalKgVendidoHistorico: novoTotalKgVendido,
            totalValorVendidoHistorico: novoTotalValorVendido,
            dataUltimaAtualizacao: new Date().toISOString().split('T')[0]
          };
          saveDocumentToFirestore('estoqueBeneficiada', updated, 'tipo');
          return updated;
        }
        return item;
      })
    );
  };

  const adicionarEstoqueBeneficiada = (
    tipoTarget: TipoCastanhaBeneficiadaSubtipo,
    caixasAdicionadas: number,
    pesoKgAdicionado?: number
  ) => {
    const kg = pesoKgAdicionado || caixasAdicionadas * 20;
    setEstoqueBeneficiada((prev) =>
      prev.map((item) => {
        if (item.tipo === tipoTarget) {
          const updated = {
            ...item,
            caixas: item.caixas + caixasAdicionadas,
            pesoKg: item.pesoKg + kg,
            dataUltimaAtualizacao: new Date().toISOString().split('T')[0]
          };
          saveDocumentToFirestore('estoqueBeneficiada', updated, 'tipo');
          return updated;
        }
        return item;
      })
    );
    addToast(`Entrada de +${caixasAdicionadas} cx (${kg} kg) de Castanha Beneficiada (${tipoTarget}) registrada!`, 'success');
  };

  const ajustarEstoqueBeneficiada = (
    tipoTarget: TipoCastanhaBeneficiadaSubtipo,
    novasCaixas: number,
    novoUltimoPreco?: number
  ) => {
    setEstoqueBeneficiada((prev) =>
      prev.map((item) => {
        if (item.tipo === tipoTarget) {
          const updated = {
            ...item,
            caixas: novasCaixas,
            pesoKg: novasCaixas * 20,
            ultimoPrecoVenda: novoUltimoPreco !== undefined && novoUltimoPreco > 0 ? novoUltimoPreco : item.ultimoPrecoVenda,
            dataUltimaAtualizacao: new Date().toISOString().split('T')[0]
          };
          saveDocumentToFirestore('estoqueBeneficiada', updated, 'tipo');
          return updated;
        }
        return item;
      })
    );
    addToast(`Estoque de Castanha Beneficiada (${tipoTarget}) ajustado para ${novasCaixas} cx (${novasCaixas * 20} kg).`, 'info');
  };

  // Expedição Action (Auto-gerando Conta a Receber)
  const addExpedicao = (expData: Omit<ExpedicaoItem, 'id' | 'codigo'>) => {
    const seqExp = expedicoes.length + 1;
    const codigoExp = `EXP-2026-${String(seqExp).padStart(3, '0')}`;
    const seqCR = contasReceber.length + 1;
    const codigoCR = `CR-2026-${String(seqCR).padStart(3, '0')}`;

    const expId = `exp-${Date.now()}`;
    const crId = `cr-${Date.now()}`;

    const novaExpedicao: ExpedicaoItem = {
      ...expData,
      id: expId,
      codigo: codigoExp,
      contaReceberId: crId,
      contaReceberCodigo: codigoCR,
    };

    const novaContaReceber: ContaReceber = {
      id: crId,
      codigo: codigoCR,
      dataEmissao: expData.data,
      dataVencimento: expData.dataVencimento || expData.data,
      cliente: expData.cliente,
      cpfCnpj: expData.cpfCnpj,
      tipoCastanha: expData.tipoCastanha,
      expedicaoId: expId,
      expedicaoCodigo: codigoExp,
      produtoDescricao: `${expData.produto} (${expData.classificacao})`,
      quantidadeKg: expData.pesoKg,
      valorTotal: expData.valorTotal,
      valorRecebido: 0,
      situacao: 'A Receber',
      formaPagamentoPrevista: 'PIX',
      observacoes: `Atrelado à expedição ${codigoExp} (${expData.tipoCastanha}).`,
      recebimentosEfetuados: [],
    };

    setExpedicoes((prev) => [novaExpedicao, ...prev]);
    setContasReceber((prev) => [novaContaReceber, ...prev]);

    saveDocumentToFirestore('expedicoes', novaExpedicao);
    saveDocumentToFirestore('contasReceber', novaContaReceber);

    // Deduct stock if Castanha Beneficiada
    if (expData.tipoCastanha === 'Castanha Beneficiada') {
      const subtipo = expData.subtipoBeneficiada || (expData.classificacao as TipoCastanhaBeneficiadaSubtipo);
      if (subtipo) {
        deduzirEstoqueBeneficiada(
          subtipo,
          expData.caixas || Math.round(expData.pesoKg / 20),
          expData.pesoKg,
          expData.precoUnitarioKg || (expData.valorTotal / (expData.pesoKg || 1))
        );
      }
    }

    addToast(`Expedição ${codigoExp} e Conta a Receber ${codigoCR} (${expData.tipoCastanha}) geradas com sucesso!`, 'success');

    return { expedicao: novaExpedicao, contaReceber: novaContaReceber };
  };

  // Actions para Romaneio de Retirada
  const addRomaneioRetirada = (
    romData: Omit<RomaneioRetirada, 'id' | 'codigo' | 'dataCriacao' | 'responsavelEmissao' | 'numItensTotal' | 'quantidadeTotal' | 'valorTotal'>
  ): RomaneioRetirada => {
    const seq = romaneiosRetirada.length + 1;
    const codigo = `ROM-RET-2026-${String(seq).padStart(3, '0')}`;
    const id = `rom-ret-${Date.now()}`;

    const numItensTotal = romData.itens.length;
    const quantidadeTotal = romData.itens.reduce((acc, i) => acc + (Number(i.quantidade) || 0), 0);
    const valorTotal = romData.itens.reduce((acc, i) => acc + (Number(i.valor) || 0), 0);

    const novoRomaneio: RomaneioRetirada = {
      ...romData,
      id,
      codigo,
      numItensTotal,
      quantidadeTotal,
      valorTotal,
      responsavelEmissao: activePerfil,
      dataCriacao: new Date().toISOString(),
    };

    setRomaneiosRetirada((prev) => [novoRomaneio, ...prev]);
    saveDocumentToFirestore('romaneiosRetirada', novoRomaneio);

    // Registrar log de auditoria
    registrarLogAuditoria(
      `Cadastrou Romaneio de Retirada ${codigo} (${romData.clienteNome} - ${numItensTotal} itens, Total: R$ ${valorTotal.toFixed(2)})`,
      codigo
    );

    addToast(`Romaneio de Retirada ${codigo} cadastrado com sucesso!`, 'success');
    return novoRomaneio;
  };

  const updateRomaneioRetirada = (id: string, patch: Partial<RomaneioRetirada>) => {
    setRomaneiosRetirada((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedItens = patch.itens || r.itens;
          const numItensTotal = updatedItens.length;
          const quantidadeTotal = updatedItens.reduce((acc, i) => acc + (Number(i.quantidade) || 0), 0);
          const valorTotal = updatedItens.reduce((acc, i) => acc + (Number(i.valor) || 0), 0);

          const updated = {
            ...r,
            ...patch,
            numItensTotal,
            quantidadeTotal,
            valorTotal,
          };
          saveDocumentToFirestore('romaneiosRetirada', updated);
          return updated;
        }
        return r;
      })
    );
    addToast('Romaneio de Retirada atualizado com sucesso!', 'info');
  };

  const deleteRomaneioRetirada = (id: string) => {
    const target = romaneiosRetirada.find((r) => r.id === id);
    setRomaneiosRetirada((prev) => prev.filter((r) => r.id !== id));
    deleteDocumentFromFirestore('romaneiosRetirada', id);
    if (target) {
      registrarLogAuditoria(`Excluiu Romaneio de Retirada ${target.codigo}`, target.codigo);
      addToast(`Romaneio de Retirada ${target.codigo} excluído com sucesso.`, 'warning');
    }
  };

  // Helper function to register audit logs
  const registrarLogAuditoria = (
    acao: string,
    registroAlterado: string,
    usuarioOverride?: AppUser
  ) => {
    const usr = usuarioOverride || currentUser;
    const device = typeof window !== 'undefined' && window.navigator?.userAgent?.includes('Mobile')
      ? 'Dispositivo Móvel'
      : 'Navegador Web (Desktop)';
    const newLog: LogAuditoriaSistema = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      usuarioId: usr ? usr.id : 'sistema',
      usuarioNome: usr ? usr.nome : 'Sistema / Convidado',
      usuarioPerfil: usr ? usr.perfil : 'Consulta',
      dataHora: new Date().toLocaleString('pt-BR'),
      dispositivo: device,
      acao,
      registroAlterado
    };
    setLogsAuditoriaSistema((prev) => [newLog, ...prev]);
  };

  // Auth Methods
  const login = (loginInput: string, senhaInput: string) => {
    const cleanInput = loginInput.trim().toLowerCase();
    const foundUser = usuarios.find(
      (u) => u.login.toLowerCase() === cleanInput || u.nome.toLowerCase() === cleanInput
    );

    if (!foundUser) {
      return { success: false, message: 'Usuário não encontrado com este e-mail/CPF.' };
    }

    if (foundUser.status === 'Inativo') {
      return { success: false, message: 'Usuário bloqueado/inativo! Solicite liberação ao Administrador.' };
    }

    if (foundUser.senha !== senhaInput) {
      return { success: false, message: 'Senha incorreta. Tente novamente.' };
    }

    const updatedUser: AppUser = {
      ...foundUser,
      ultimoAcesso: new Date().toLocaleString('pt-BR')
    };

    setUsuarios((prev) => prev.map((u) => (u.id === foundUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setActivePerfil(updatedUser.perfil);

    if (updatedUser.perfil === 'Quebrador') {
      setActiveTab('quebra-manual');
    } else if (updatedUser.perfil === 'Comprador') {
      setActiveTab('comprador');
    }

    registrarLogAuditoria('LOGIN_SUCESSO', 'Acesso autorizado no sistema', updatedUser);
    addToast(`Bem-vindo, ${updatedUser.nome}! Perfil: ${updatedUser.perfil}`, 'success');
    return { success: true, message: 'Login realizado com sucesso!' };
  };

  const logout = () => {
    if (currentUser) {
      registrarLogAuditoria('LOGOUT', `Sessão encerrada pelo usuário: ${currentUser.nome}`, currentUser);
    }
    setCurrentUser(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_currentUser`);
    addToast('Sessão encerrada com sucesso. Faça login novamente.', 'info');
  };

  const switchUser = (userId: string) => {
    const target = usuarios.find((u) => u.id === userId);
    if (!target) return;
    if (target.status === 'Inativo') {
      addToast(`Atenção: O usuário ${target.nome} está INATIVO/BLOQUEADO.`, 'error');
      return;
    }
    const updated = { ...target, ultimoAcesso: new Date().toLocaleString('pt-BR') };
    setCurrentUser(updated);
    setActivePerfil(updated.perfil);
    if (updated.perfil === 'Quebrador') {
      setActiveTab('quebra-manual');
    } else if (updated.perfil === 'Comprador') {
      setActiveTab('comprador');
    }
    registrarLogAuditoria('TROCA_USUARIO', `Sessão alterada para ${updated.nome} (${updated.perfil})`, updated);
    addToast(`Sessão alterada para ${updated.nome} (${updated.perfil})`, 'info');
  };

  // User CRUD
  const addUsuario = (uData: Omit<AppUser, 'id' | 'dataCriacao' | 'ultimoAcesso'>) => {
    const newId = `usr-${Date.now()}`;
    const newUser: AppUser = {
      ...uData,
      id: newId,
      dataCriacao: new Date().toLocaleString('pt-BR'),
      ultimoAcesso: 'Nunca acessou'
    };
    setUsuarios((prev) => [newUser, ...prev]);
    saveDocumentToFirestore('usuarios', newUser);
    registrarLogAuditoria('CRIAR_USUARIO', `Cadastrado novo usuário: ${newUser.nome} (${newUser.perfil})`);
    addToast(`Usuário ${newUser.nome} cadastrado com sucesso!`, 'success');
  };

  const updateUsuario = (id: string, uData: Partial<AppUser>) => {
    let nomeAlt = '';
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          nomeAlt = u.nome;
          const updated = { ...u, ...uData };
          if (u.login.toLowerCase() === 'castanhasintegralnuts@gmail.com' || u.id === 'usr-master-integral') {
            updated.perfil = 'Administrador';
            updated.status = 'Ativo';
          }
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          saveDocumentToFirestore('usuarios', updated);
          return updated;
        }
        return u;
      })
    );
    registrarLogAuditoria('EDITAR_USUARIO', `Dados do usuário ${nomeAlt || id} atualizados`);
    addToast('Dados do usuário atualizados com sucesso!', 'success');
  };

  const toggleStatusUsuario = (id: string) => {
    const targetUser = usuarios.find((u) => u.id === id);
    if (!targetUser) return;

    if (targetUser.login.toLowerCase() === 'castanhasintegralnuts@gmail.com' || targetUser.id === 'usr-master-integral') {
      addToast('O usuário Master/Administrador não pode ser desativado.', 'warning');
      return;
    }

    const novoStatus: 'Ativo' | 'Inativo' = targetUser.status === 'Ativo' ? 'Inativo' : 'Ativo';
    const targetName = targetUser.nome;

    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, status: novoStatus };
          saveDocumentToFirestore('usuarios', updated);
          return updated;
        }
        return u;
      })
    );

    registrarLogAuditoria(
      novoStatus === 'Inativo' ? 'BLOQUEAR_USUARIO' : 'DESBLOQUEAR_USUARIO',
      `Status do usuário ${targetName || id} alterado para ${novoStatus}`
    );
    addToast(`Usuário ${targetName} agora está ${novoStatus}!`, novoStatus === 'Ativo' ? 'success' : 'warning');
  };

  const deleteUsuario = (id: string) => {
    const target = usuarios.find((u) => u.id === id);
    if (!target) return;

    if (target.login.toLowerCase() === 'castanhasintegralnuts@gmail.com' || target.id === 'usr-master-integral') {
      addToast('O usuário Master/Administrador não pode ser excluído.', 'warning');
      return;
    }

    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    deleteDocumentFromFirestore('usuarios', id);
    registrarLogAuditoria('EXCLUIR_USUARIO', `Usuário excluído: ${target.nome} (${target.login})`);
    addToast(`Usuário ${target.nome} removido com sucesso.`, 'info');
  };

  // Password Recovery System
  const solicitarRecuperacaoSenha = (loginOuEmail: string, motivo?: string, nomeInformado?: string) => {
    const novaSolicitacao: SolicitacaoRecuperacaoSenha = {
      id: `rec-${Date.now()}`,
      loginOuEmail,
      nomeInformado,
      dataSolicitacao: new Date().toLocaleString('pt-BR'),
      motivo: motivo || 'Esquecimento de senha de acesso',
      status: 'Pendente'
    };

    setSolicitacoesRecuperacaoSenha((prev) => [novaSolicitacao, ...prev]);

    // System Log
    const logItem: LogAuditoriaSistema = {
      id: `log-sys-${Date.now()}`,
      usuarioId: 'visitante',
      usuarioNome: nomeInformado || loginOuEmail,
      usuarioPerfil: 'Operador',
      dataHora: new Date().toLocaleString('pt-BR'),
      dispositivo: 'Acesso Web / Tela de Login',
      acao: 'SOLICITACAO_RECUPERACAO_SENHA',
      registroAlterado: `Solicitação de nova senha para: ${loginOuEmail}. Motivo: ${motivo || 'Esquecimento'}`
    };
    setLogsAuditoriaSistema((prev) => [logItem, ...prev]);

    addToast(`Notificação enviada ao Usuário Master! Solicitação para ${loginOuEmail} registrada.`, 'info');
    return {
      success: true,
      message: 'Sua solicitação foi enviada com sucesso! O Usuário Master foi notificado e concederá sua senha no sistema.'
    };
  };

  const atenderRecuperacaoSenha = (id: string, acao: 'Aprovar' | 'Rejeitar', novaSenha?: string) => {
    const targetReq = solicitacoesRecuperacaoSenha.find((s) => s.id === id);
    if (!targetReq) return;

    if (acao === 'Aprovar') {
      const senhaParaAtribuir = novaSenha || '123456';
      setUsuarios((prev) =>
        prev.map((u) => {
          if (u.login.toLowerCase() === targetReq.loginOuEmail.toLowerCase()) {
            return { ...u, senha: senhaParaAtribuir };
          }
          return u;
        })
      );

      setSolicitacoesRecuperacaoSenha((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'Aprovado',
                novaSenhaProvisoria: senhaParaAtribuir,
                atendidoPor: currentUser?.nome || 'Usuário Master',
                dataAtendimento: new Date().toLocaleString('pt-BR')
              }
            : s
        )
      );

      registrarLogAuditoria(
        'APROVAR_RECUPERACAO_SENHA',
        `Senha redefinida e concedida para ${targetReq.loginOuEmail}. Nova senha: ${senhaParaAtribuir}`
      );
      addToast(`Recuperação APROVADA! Nova senha '${senhaParaAtribuir}' definida para ${targetReq.loginOuEmail}.`, 'success');
    } else {
      setSolicitacoesRecuperacaoSenha((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'Rejeitado',
                atendidoPor: currentUser?.nome || 'Usuário Master',
                dataAtendimento: new Date().toLocaleString('pt-BR')
              }
            : s
        )
      );

      registrarLogAuditoria('REJEITAR_RECUPERACAO_SENHA', `Solicitação de senha para ${targetReq.loginOuEmail} foi rejeitada.`);
      addToast(`Solicitação de senha para ${targetReq.loginOuEmail} foi rejeitada.`, 'warning');
    }
  };

  // Permission Matrix customization
  const updatePermissoesPerfil = (perfilTarget: PerfilUsuario, novasPermissoes: Partial<PermissoesPerfil>) => {
    setPermissoesPerfis((prev) =>
      prev.map((p) => {
        if (p.perfil === perfilTarget) {
          if (perfilTarget === 'Administrador') {
            const adminBase = INITIAL_PERMISSOES.find((ip) => ip.perfil === 'Administrador')!;
            return {
              ...p,
              ...novasPermissoes,
              telasPermitidas: adminBase.telasPermitidas,
              podeVerFinanceiro: true,
              podeGerenciarUsuarios: true,
              podeEditarRegistrosOutros: true,
              podeAlterarPrecos: true,
            };
          }
          return { ...p, ...novasPermissoes };
        }
        return p;
      })
    );
    registrarLogAuditoria('ALTERAR_PERMISSOES', `Matriz de permissões do perfil ${perfilTarget} foi atualizada pelo Administrador`);
    addToast(`Permissões do perfil ${perfilTarget} atualizadas com sucesso!`, 'success');
  };

  const isSuperAdmin =
    currentUser?.perfil === 'SuperAdministrador' ||
    currentUser?.perfil === 'Administrador' ||
    currentUser?.login?.toLowerCase() === 'superadmin@integralnuts.com.br' ||
    currentUser?.login?.toLowerCase() === 'castanhasintegralnuts@gmail.com';

  const isAdmin = isSuperAdmin;

  const activeUnidade = unidades.find((u) => u.id === activeUnidadeId) || null;

  const addUnidade = (uData: Omit<UnidadeFilial, 'id' | 'dataCriacao' | 'codigo'>): UnidadeFilial => {
    const seq = unidades.length + 1;
    const codigo = `US-${String(seq).padStart(3, '0')}`;
    const newU: UnidadeFilial = {
      ...uData,
      id: codigo,
      codigo,
      dataCriacao: new Date().toISOString().split('T')[0],
    };
    setUnidades((prev) => [...prev, newU]);
    registrarLogAuditoria('CADASTRAR_UNIDADE', `Nova filial/usina ${newU.nome} (${newU.codigo}) cadastrada`);
    addToast(`Unidade ${newU.nome} cadastrada com sucesso!`, 'success');
    return newU;
  };

  const updateUnidade = (id: string, patch: Partial<UnidadeFilial>) => {
    setUnidades((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    registrarLogAuditoria('ATUALIZAR_UNIDADE', `Dados da unidade ${id} foram alterados`);
    addToast('Unidade/Filial atualizada com sucesso!', 'info');
  };

  const toggleModuloUnidade = (unidadeId: string, modulo: keyof ModulosUnidade) => {
    setUnidades((prev) =>
      prev.map((u) => {
        if (u.id === unidadeId) {
          const valAtual = !!u.modulosAtivos[modulo];
          return {
            ...u,
            modulosAtivos: {
              ...u.modulosAtivos,
              [modulo]: !valAtual,
            },
          };
        }
        return u;
      })
    );
    registrarLogAuditoria('TOGGLE_MODULO_UNIDADE', `Módulo ${String(modulo)} alterado na unidade ${unidadeId}`);
    addToast('Módulo atualizado com sucesso para a unidade!', 'info');
  };

  const deleteUnidade = (id: string) => {
    if (unidades.length <= 1) {
      addToast('Não é possível excluir a única unidade cadastrada no sistema.', 'error');
      return;
    }
    setUnidades((prev) => prev.filter((u) => u.id !== id));
    registrarLogAuditoria('EXCLUIR_UNIDADE', `Unidade ${id} removida do sistema`);
    addToast('Unidade/Filial removida com sucesso.', 'warning');
  };

  const addProprietarioTerceiro = (pData: Omit<ProprietarioTerceiro, 'id' | 'dataCadastro'>): ProprietarioTerceiro => {
    const newP: ProprietarioTerceiro = {
      ...pData,
      id: `prop-${Date.now()}`,
      dataCadastro: new Date().toISOString().split('T')[0],
    };
    setProprietariosTerceiros((prev) => [newP, ...prev]);
    registrarLogAuditoria('CADASTRAR_PROPRIETARIO_TERCEIRO', `Proprietário/Financiador Terceiro cadastrado: ${newP.nome}`);
    addToast(`Proprietário Terceiro '${newP.nome}' cadastrado com sucesso!`, 'success');
    return newP;
  };

  const updateProprietarioTerceiro = (id: string, patch: Partial<ProprietarioTerceiro>) => {
    setProprietariosTerceiros((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
    addToast('Dados do Proprietário Terceiro atualizados.', 'info');
  };

  const deleteProprietarioTerceiro = (id: string) => {
    setProprietariosTerceiros((prev) => prev.filter((p) => p.id !== id));
    addToast('Proprietário Terceiro removido.', 'info');
  };

  const addAporteComprador = (aData: Omit<AporteComprador, 'id' | 'codigo'>): AporteComprador => {
    const seq = aportesComprador.length + 1;
    const codigo = `APT-2026-${String(seq).padStart(3, '0')}`;
    const newAporte: AporteComprador = {
      ...aData,
      id: `apt-${Date.now()}`,
      codigo,
    };
    setAportesComprador((prev) => [newAporte, ...prev]);
    registrarLogAuditoria(
      'REGISTRAR_APORTE_COMPRADOR',
      `Aporte ${codigo} de R$ ${aData.valorAporte.toLocaleString('pt-BR')} lançado para comprador ${aData.compradorNome}`
    );
    addToast(`Aporte de R$ ${aData.valorAporte.toLocaleString('pt-BR')} registrado com sucesso!`, 'success');
    return newAporte;
  };

  const deleteAporteComprador = (id: string) => {
    setAportesComprador((prev) => prev.filter((a) => a.id !== id));
    addToast('Aporte removido.', 'info');
  };

  const currentPerms = permissoesPerfis.find((p) => p.perfil === (currentUser?.perfil || activePerfil)) || {
    perfil: activePerfil,
    telasPermitidas: [
      'super-admin',
      'comprador',
      'dashboard',
      'recebimento-compra',
      'producao',
      'expedicao',
      'financeiro',
      'documentos',
      'configuracoes',
      'fornecedores',
      'estoque-casca',
      'lotes',
      'quebra-manual',
      'quarentena',
      'saidas',
      'relatorios',
      'usuarios',
      'auditoria'
    ],
    podeVerFinanceiro: true,
    podeGerenciarUsuarios: true,
    podeEditarRegistrosOutros: true,
    podeAlterarPrecos: true,
  };

  const temPermissao = (tabId: string): boolean => {
    if (!currentUser) return false;
    if (isSuperAdmin && tabId === 'super-admin') return true;
    if (isSuperAdmin) return true;

    // Role level check
    const allowedByRole = currentPerms.telasPermitidas.includes(tabId);
    if (!allowedByRole) return false;

    // Unit level check if an active unit is set
    if (activeUnidade && activeUnidadeId !== 'todas') {
      const mod = activeUnidade.modulosAtivos;
      if ((tabId === 'recebimento-compra' || tabId === 'novo-recebimento' || tabId === 'nova-compra') && mod.recebimento === false) {
        return false;
      }
      if ((tabId === 'producao' || tabId === 'quebra-manual' || tabId === 'secagem') && mod.producao === false) {
        return false;
      }
      if ((tabId === 'expedicao' || tabId === 'saidas') && mod.expedicao === false) {
        return false;
      }
      if (tabId === 'financeiro' && mod.financeiro === false) {
        return false;
      }
      if (tabId === 'comprador' && mod.comprador === false) {
        return false;
      }
      if (tabId === 'configuracoes' && mod.configuracoes === false) {
        return false;
      }
      if (tabId === 'relatorios' && mod.relatorios === false) {
        return false;
      }
    }

    return true;
  };

  const podeVerFinanceiro = isAdmin || currentPerms.podeVerFinanceiro;
  const podeGerenciarUsuarios = isAdmin || currentPerms.podeGerenciarUsuarios;

  const addQuebrador = (qData: Omit<Quebrador, 'id' | 'matricula'>): Quebrador => {
    const seq = quebradores.length + 1;
    const matricula = `QBR-${String(seq).padStart(3, '0')}`;
    const newQ: Quebrador = {
      ...qData,
      id: `qbr-${Date.now()}`,
      matricula,
    };
    setQuebradores((prev) => [...prev, newQ]);
    addToast(`Quebrador(a) ${newQ.nome} cadastrado(a) com sucesso!`, 'success');
    return newQ;
  };

  const updateQuebrador = (id: string, qData: Partial<Quebrador>) => {
    setQuebradores((prev) => prev.map((q) => (q.id === id ? { ...q, ...qData } : q)));
    addToast('Dados do colaborador atualizados com sucesso.', 'info');
  };

  const toggleQuebradorStatus = (id: string) => {
    setQuebradores((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, situacao: q.situacao === 'Ativo' ? 'Inativo' : 'Ativo' }
          : q
      )
    );
    addToast('Situação do colaborador alterada com sucesso.', 'info');
  };

  const updateTabelaPrecoQuebra = (
    novosPrecos: Partial<TabelaPrecoQuebra>,
    usuario: string,
    justificativa: string
  ) => {
    const valorAnt = `Inteira R$${tabelaPrecoQuebra.precoInteiraPerKg.toFixed(2)} / Quebrada R$${tabelaPrecoQuebra.precoQuebradaPerKg.toFixed(2)} / Amarela R$${tabelaPrecoQuebra.precoAmarelaPerKg.toFixed(2)}`;
    
    const updated: TabelaPrecoQuebra = {
      ...tabelaPrecoQuebra,
      ...novosPrecos,
      dataAtualizacao: new Date().toISOString().split('T')[0],
      atualizadoPor: usuario,
    };

    const valorNov = `Inteira R$${updated.precoInteiraPerKg.toFixed(2)} / Quebrada R$${updated.precoQuebradaPerKg.toFixed(2)} / Amarela R$${updated.precoAmarelaPerKg.toFixed(2)}`;

    setTabelaPrecoQuebra(updated);

    // Audit log
    const auditEntry: RegistroAuditoriaQuebra = {
      id: `aud-${Date.now()}`,
      dataHora: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      usuario,
      acao: 'Alteração na Tabela de Preços de Quebra',
      valorAnterior: valorAnt,
      valorNovo: valorNov,
      justificativa: justificativa || 'Ajuste de tabela pelo administrador.',
    };

    setAuditoriaQuebra((prev) => [auditEntry, ...prev]);
    addToast('Tabela de preços da quebra atualizada e auditada com sucesso.', 'success');
  };

  const addProducaoQuebra = (
    pData: Omit<
      ProducaoQuebraDiaria,
      | 'id'
      | 'totalKg'
      | 'taxaInteira'
      | 'taxaQuebrada'
      | 'taxaAmarela'
      | 'valorInteira'
      | 'valorQuebrada'
      | 'valorAmarela'
      | 'valorTotal'
      | 'situacaoPagamento'
      | 'dataHoraCriacao'
    >,
    usuario: string
  ): ProducaoQuebraDiaria => {
    const totalKg = Math.round((pData.kgInteira + pData.kgQuebrada + pData.kgAmarela) * 100) / 100;
    
    const taxaInteira = tabelaPrecoQuebra.precoInteiraPerKg;
    const taxaQuebrada = tabelaPrecoQuebra.precoQuebradaPerKg;
    const taxaAmarela = tabelaPrecoQuebra.precoAmarelaPerKg;

    const valorInteira = Math.round((pData.kgInteira * taxaInteira) * 100) / 100;
    const valorQuebrada = Math.round((pData.kgQuebrada * taxaQuebrada) * 100) / 100;
    const valorAmarela = Math.round((pData.kgAmarela * taxaAmarela) * 100) / 100;
    const valorTotal = Math.round((valorInteira + valorQuebrada + valorAmarela) * 100) / 100;

    const isQuebradorLaunch = usuario.toLowerCase().includes('quebrador') || activePerfil === 'Quebrador';
    const statusAutorizacao: 'Pendente' | 'Aprovado' = isQuebradorLaunch ? 'Pendente' : 'Aprovado';
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const novaProd: ProducaoQuebraDiaria = {
      ...pData,
      id: `prod-${Date.now()}`,
      totalKg,
      taxaInteira,
      taxaQuebrada,
      taxaAmarela,
      valorInteira,
      valorQuebrada,
      valorAmarela,
      valorTotal,
      situacaoPagamento: 'Pendente',
      statusAutorizacao,
      autorizadoPor: statusAutorizacao === 'Aprovado' ? usuario : undefined,
      dataHoraAutorizacao: statusAutorizacao === 'Aprovado' ? nowStr : undefined,
      criadoPor: usuario,
      dataHoraCriacao: nowStr,
    };

    setProducoesQuebra((prev) => [novaProd, ...prev]);

    const auditEntry: RegistroAuditoriaQuebra = {
      id: `aud-${Date.now()}`,
      dataHora: novaProd.dataHoraCriacao,
      usuario,
      acao: isQuebradorLaunch ? 'Lançamento de Produção por Quebrador (Aguardando Autorização)' : 'Lançamento de Produção Diária de Quebra',
      valorAnterior: 'Nenhum',
      valorNovo: `${novaProd.quebradorNome} • ${totalKg} kg • R$ ${valorTotal.toFixed(2)} (Lote ${novaProd.loteCodigo})`,
      justificativa: isQuebradorLaunch ? 'Lançado diretamente pelo colaborador. Aguardando aprovação do Gestor.' : 'Novo lançamento diário de produção por gestor.',
    };
    setAuditoriaQuebra((prev) => [auditEntry, ...prev]);

    if (isQuebradorLaunch) {
      addToast(`Sua produção (${totalKg} kg) foi enviada com sucesso! Aguardando autorização do Gestor.`, 'info');
    } else {
      addToast(`Produção de ${novaProd.quebradorNome} (${totalKg} kg = R$ ${valorTotal.toFixed(2)}) lançada com sucesso!`, 'success');
    }
    return novaProd;
  };

  const autorizarProducaoQuebra = (
    id: string,
    status: 'Aprovado' | 'Rejeitado',
    usuario: string,
    motivo?: string
  ) => {
    const prod = producoesQuebra.find((p) => p.id === id);
    if (!prod) return;

    const dataHora = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    setProducoesQuebra((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              statusAutorizacao: status,
              autorizadoPor: usuario,
              dataHoraAutorizacao: dataHora,
              motivoRejeicao: status === 'Rejeitado' ? motivo : undefined,
            }
          : p
      )
    );

    const auditEntry: RegistroAuditoriaQuebra = {
      id: `aud-${Date.now()}`,
      dataHora,
      usuario,
      acao: status === 'Aprovado' ? 'Autorização de Lançamento de Quebrador' : 'Rejeição de Lançamento de Quebrador',
      valorAnterior: `Pendente (${prod.quebradorNome} • ${prod.totalKg} kg)`,
      valorNovo: status === 'Aprovado' ? `Aprovado por ${usuario}` : `Rejeitado: ${motivo || 'Sem motivo'}`,
      justificativa: status === 'Aprovado' ? 'Aprovação pelo gestor da unidade.' : `Rejeição pelo gestor: ${motivo || 'Valores incoerentes'}`,
    };
    setAuditoriaQuebra((prev) => [auditEntry, ...prev]);

    if (status === 'Aprovado') {
      addToast(`Lançamento de ${prod.quebradorNome} (${prod.totalKg} kg) APROVADO com sucesso!`, 'success');
    } else {
      addToast(`Lançamento de ${prod.quebradorNome} REJEITADO pelo Gestor.`, 'warning');
    }
  };

  const autorizarTodasProducoesQuebra = (ids: string[], usuario: string) => {
    const dataHora = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    setProducoesQuebra((prev) =>
      prev.map((p) =>
        ids.includes(p.id)
          ? {
              ...p,
              statusAutorizacao: 'Aprovado',
              autorizadoPor: usuario,
              dataHoraAutorizacao: dataHora,
            }
          : p
      )
    );

    const auditEntry: RegistroAuditoriaQuebra = {
      id: `aud-${Date.now()}`,
      dataHora,
      usuario,
      acao: 'Autorização em Lote de Lançamentos de Quebra',
      valorAnterior: `${ids.length} lançamentos pendentes`,
      valorNovo: 'Aprovados em lote',
      justificativa: 'Aprovação em massa realizada pelo Gestor.',
    };
    setAuditoriaQuebra((prev) => [auditEntry, ...prev]);

    addToast(`${ids.length} lançamentos foram APROVADOS em lote com sucesso!`, 'success');
  };

  const updateProducaoQuebra = (
    id: string,
    novosDados: Partial<ProducaoQuebraDiaria>,
    usuario: string,
    justificativa: string
  ) => {
    const oldProd = producoesQuebra.find((p) => p.id === id);
    if (!oldProd) return;

    const kgInteira = novosDados.kgInteira ?? oldProd.kgInteira;
    const kgQuebrada = novosDados.kgQuebrada ?? oldProd.kgQuebrada;
    const kgAmarela = novosDados.kgAmarela ?? oldProd.kgAmarela;
    const totalKg = Math.round((kgInteira + kgQuebrada + kgAmarela) * 100) / 100;

    const taxaInteira = oldProd.taxaInteira;
    const taxaQuebrada = oldProd.taxaQuebrada;
    const taxaAmarela = oldProd.taxaAmarela;

    const valorInteira = Math.round((kgInteira * taxaInteira) * 100) / 100;
    const valorQuebrada = Math.round((kgQuebrada * taxaQuebrada) * 100) / 100;
    const valorAmarela = Math.round((kgAmarela * taxaAmarela) * 100) / 100;
    const valorTotal = Math.round((valorInteira + valorQuebrada + valorAmarela) * 100) / 100;

    const valorAnt = `${oldProd.totalKg} kg (R$ ${oldProd.valorTotal.toFixed(2)})`;
    const valorNov = `${totalKg} kg (R$ ${valorTotal.toFixed(2)})`;

    const modHist = {
      usuario,
      dataHora: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      valorAnterior: valorAnt,
      valorNovo: valorNov,
      justificativa: justificativa || 'Ajuste operacional de lançamento.',
    };

    setProducoesQuebra((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...novosDados,
              kgInteira,
              kgQuebrada,
              kgAmarela,
              totalKg,
              valorInteira,
              valorQuebrada,
              valorAmarela,
              valorTotal,
              historicoModificacoes: [...(p.historicoModificacoes || []), modHist],
            }
          : p
      )
    );

    const auditEntry: RegistroAuditoriaQuebra = {
      id: `aud-${Date.now()}`,
      dataHora: modHist.dataHora,
      usuario,
      acao: 'Correção de Produção Diária de Quebra',
      valorAnterior: valorAnt,
      valorNovo: valorNov,
      justificativa: modHist.justificativa,
    };
    setAuditoriaQuebra((prev) => [auditEntry, ...prev]);

    addToast('Lançamento de produção corrigido e auditado.', 'info');
  };

  const registrarPagamentoQuebra = (
    pData: Omit<PagamentoQuebra, 'id' | 'codigo'>,
    usuario: string
  ): PagamentoQuebra => {
    const seq = pagamentosQuebra.length + 1;
    const codigo = `PG-QBR-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;

    const novoPg: PagamentoQuebra = {
      ...pData,
      id: `pg-${Date.now()}`,
      codigo,
    };

    setPagamentosQuebra((prev) => [novoPg, ...prev]);

    setProducoesQuebra((prev) =>
      prev.map((prod) =>
        pData.producoesIds.includes(prod.id)
          ? { ...prod, situacaoPagamento: 'Pago', pagamentoId: novoPg.id }
          : prod
      )
    );

    const auditEntry: RegistroAuditoriaQuebra = {
      id: `aud-${Date.now()}`,
      dataHora: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      usuario,
      acao: 'Registro de Pagamento da Quebra',
      valorAnterior: 'Pendente',
      valorNovo: `Pago R$ ${pData.valorPago.toFixed(2)} para ${pData.quebradorNome} (${codigo})`,
      justificativa: pData.observacoes || 'Pagamento efetuado aos quebradores.',
    };
    setAuditoriaQuebra((prev) => [auditEntry, ...prev]);

    addToast(`Pagamento de R$ ${pData.valorPago.toFixed(2)} registrado para ${pData.quebradorNome}!`, 'success');
    return novoPg;
  };

  const addFornecedor = (fData: Omit<Fornecedor, 'id' | 'codigo' | 'dataCadastro'>): Fornecedor => {
    const seq = fornecedores.length + 1;
    const codigo = `FORN-${String(seq).padStart(3, '0')}`;
    const newFornecedor: Fornecedor = {
      ...fData,
      id: `forn-${Date.now()}`,
      codigo,
      dataCadastro: new Date().toISOString().split('T')[0],
    };
    setFornecedores((prev) => [newFornecedor, ...prev]);
    saveDocumentToFirestore('fornecedores', newFornecedor);
    addToast(`Fornecedor ${newFornecedor.nomeCompleto} cadastrado com sucesso!`);
    return newFornecedor;
  };

  const updateFornecedor = (id: string, patch: Partial<Fornecedor>) => {
    setFornecedores((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...patch };
          saveDocumentToFirestore('fornecedores', updated);
          return updated;
        }
        return f;
      })
    );
    addToast('Dados do fornecedor atualizados com sucesso.');
  };

  const addCliente = (cData: Omit<Cliente, 'id' | 'codigo' | 'dataCadastro'>): Cliente => {
    const seq = clientes.length + 1;
    const codigo = `CLI-${String(seq).padStart(3, '0')}`;
    const newCliente: Cliente = {
      ...cData,
      id: `cli-${Date.now()}`,
      codigo,
      dataCadastro: new Date().toISOString().split('T')[0],
      comprasCount: cData.comprasCount || 0,
      totalKgComprado: cData.totalKgComprado || 0,
    };
    setClientes((prev) => [newCliente, ...prev]);
    saveDocumentToFirestore('clientes', newCliente);
    addToast(`Cliente ${newCliente.nome} cadastrado com sucesso!`, 'success');
    registrarLogAuditoria('CADASTRO_CLIENTE', `Novo cliente cadastrado: ${newCliente.nome} (${newCliente.cpfCnpj})`);
    return newCliente;
  };

  const updateCliente = (id: string, patch: Partial<Cliente>) => {
    setClientes((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...patch };
          saveDocumentToFirestore('clientes', updated);
          return updated;
        }
        return c;
      })
    );
    addToast('Dados do cliente atualizados com sucesso.', 'info');
  };

  const deleteCliente = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    deleteDocumentFromFirestore('clientes', id);
    addToast('Cliente removido do cadastro.', 'info');
  };

  const addRecebimento = (
    recData: Omit<Recebimento, 'id' | 'codigo' | 'historicoAuditoria'>
  ): Recebimento => {
    const seq = recebimentos.length + 1;
    const codigo = generateReceiptCode(seq);
    
    // Check if real factors kg/hl
    const factors = calculateRealKgFactors(recData.pesoLiquidoKg, recData.quantidadeBrutaHl);

    const newRec: Recebimento = {
      ...recData,
      id: `rec-${Date.now()}`,
      codigo,
      fatorKgPorHl: factors.kgPorHl,
      fatorKgPorLata: factors.kgPorLata,
      historicoAuditoria: [
        {
          usuario: recData.responsavelRecebimento || activePerfil,
          dataHora: new Date().toLocaleString('pt-BR'),
          acao: 'Recebimento Registrado',
          detalhes: `Recebimento criado com ${recData.quantidadeBrutaHl} hl e ${recData.destinos.length} destinos definidos.`,
        },
      ],
    };

    setRecebimentos((prev) => [newRec, ...prev]);
    saveDocumentToFirestore('recebimentos', newRec);

    // Also auto update or create Lote if requested
    if (newRec.loteId) {
      setLotes((prevLotes) =>
        prevLotes.map((lote) => {
          if (lote.id === newRec.loteId) {
            const newHl = lote.quantidadeAtualHl + newRec.quantidadeLiquidaHl;
            const newLatas = hlToLatas(newHl);
            const fornList = lote.fornecedoresNomes.includes(newRec.fornecedorNome)
              ? lote.fornecedoresNomes
              : [...lote.fornecedoresNomes, newRec.fornecedorNome];
            return {
              ...lote,
              quantidadeAtualHl: newHl,
              quantidadeLatas: newLatas,
              fornecedoresNomes: fornList,
              recebimentosIds: [...lote.recebimentosIds, newRec.id],
              recebimentosCodigos: [...lote.recebimentosCodigos, newRec.codigo],
            };
          }
          return lote;
        })
      );
    }

    // Auto generate Romaneio de Entrada Document
    gerarDocumento('Romaneio de Entrada', newRec.id, newRec.fornecedorNome, newRec);

    // Auto update linked CompraOrdem status if applicable
    if (newRec.compraOrdemId) {
      vincularRecebimentoACompra(
        newRec.compraOrdemId,
        newRec.id,
        newRec.codigo,
        newRec.quantidadeLiquidaHl,
        newRec.compra?.valorBruto,
        `Recebimento ${newRec.codigo} concluído com volume entregue de ${newRec.quantidadeLiquidaHl} HL`
      );
    }

    addToast(`Recebimento ${codigo} registrado com sucesso!`);
    return newRec;
  };

  const addCompra = (
    compraData: Omit<CompraOrdem, 'id' | 'codigo' | 'status'>
  ): CompraOrdem => {
    const seq = compras.length + 1;
    const codigo = `MD-CMP-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
    const novaCompra: CompraOrdem = {
      ...compraData,
      id: `cmp-${Date.now()}`,
      codigo,
      status: 'Pendente de Recebimento',
      criadoPor: activePerfil,
    };

    setCompras((prev) => [novaCompra, ...prev]);
    saveDocumentToFirestore('compras', novaCompra);
    registrarLogAuditoria(
      'NOVA_COMPRA_REGISTRADA',
      `Nova compra ${codigo} negociada com ${novaCompra.fornecedorNome} (${novaCompra.quantidadeHectolitrosPrevista} Hl)`
    );
    addToast(`Nova Compra ${codigo} registrada com sucesso!`, 'success');
    return novaCompra;
  };

  const vincularRecebimentoACompra = (
    compraId: string,
    recebimentoId: string,
    recebimentoCodigo: string,
    finalVolumeHl?: number,
    finalValorTotal?: number,
    observacoesAdd?: string
  ) => {
    setCompras((prev) =>
      prev.map((c) => {
        if (c.id === compraId) {
          const updated = {
            ...c,
            status: 'Recebido' as const,
            recebimentoId,
            recebimentoCodigo,
            dataRecebimento: new Date().toISOString().split('T')[0],
            quantidadeHectolitrosPrevista: finalVolumeHl !== undefined ? Math.max(c.quantidadeHectolitrosPrevista, finalVolumeHl) : c.quantidadeHectolitrosPrevista,
            valorTotalEstimado: finalValorTotal !== undefined ? Math.max(c.valorTotalEstimado, finalValorTotal) : c.valorTotalEstimado,
            observacoes: observacoesAdd ? `${c.observacoes ? c.observacoes + ' | ' : ''}${observacoesAdd}` : c.observacoes,
          };
          saveDocumentToFirestore('compras', updated);
          return updated;
        }
        return c;
      })
    );
  };

  const getCompraPendenteFornecedor = (fornecedorId: string): CompraOrdem | undefined => {
    return compras.find(
      (c) => c.fornecedorId === fornecedorId && c.status === 'Pendente de Recebimento'
    );
  };

  const cancelRecebimento = (id: string, motivo: string) => {
    setRecebimentos((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          return {
            ...rec,
            cancelado: true,
            motivoCancelamento: motivo,
            historicoAuditoria: [
              ...rec.historicoAuditoria,
              {
                usuario: activePerfil,
                dataHora: new Date().toLocaleString('pt-BR'),
                acao: 'Cancelamento de Recebimento',
                detalhes: `Recebimento cancelado por: ${motivo}`,
              },
            ],
          };
        }
        return rec;
      })
    );
    addToast('Recebimento cancelado com registro permanente de auditoria.', 'warning');
  };

  const registrarPagamento = (
    recebimentoId: string,
    valor: number,
    forma: any,
    banco?: string,
    obs?: string,
    tipo: 'Integral' | 'Parcial' | 'Adiantamento' | 'Complemento' = 'Parcial'
  ) => {
    setRecebimentos((prev) =>
      prev.map((rec) => {
        if (rec.id === recebimentoId) {
          const pagamentosAtuais = rec.compra.pagamentosEfetuados || [];
          const novoPagamento = {
            id: `pag-${Date.now()}`,
            data: new Date().toISOString().split('T')[0],
            valor,
            formaPagamento: forma,
            banco: banco || 'Banpará',
            responsavel: activePerfil,
            tipo,
            observacoes: obs,
          };
          const totalPago = [...pagamentosAtuais, novoPagamento].reduce((acc, p) => acc + p.valor, 0);
          const valorLiquido = rec.compra.valorLiquido;

          let novaSituacao = rec.compra.situacao;
          if (totalPago >= valorLiquido - 0.01) {
            novaSituacao = 'Paga';
          } else if (totalPago > 0) {
            novaSituacao = 'Parcialmente paga';
          }

          const recAtualizado = {
            ...rec,
            compra: {
              ...rec.compra,
              situacao: novaSituacao,
              pagamentosEfetuados: [...pagamentosAtuais, novoPagamento],
            },
            historicoAuditoria: [
              ...rec.historicoAuditoria,
              {
                usuario: activePerfil,
                dataHora: new Date().toLocaleString('pt-BR'),
                acao: 'Pagamento Registrado',
                detalhes: `Pagamento de R$ ${valor.toFixed(2)} (${forma}) registrado.`,
              },
            ],
          };

          // Auto generate Recibo Document
          gerarDocumento('Recibo', rec.id, rec.fornecedorNome, {
            recebimento: recAtualizado,
            pagamento: novoPagamento,
          });

          return recAtualizado;
        }
        return rec;
      })
    );
    addToast(`Pagamento de R$ ${valor.toFixed(2)} registrado com sucesso!`);
  };

  const alterarDestinoEstoque = (
    origemDestino: DestinoTipo,
    novoDestino: DestinoTipo,
    quantidadeHl: number,
    recebimentoId: string,
    motivo: string,
    autorizacao: string,
    localOrigem: string,
    localNovo: string
  ): boolean => {
    let alterouComSucesso = false;

    setRecebimentos((prev) =>
      prev.map((rec) => {
        if (rec.id === recebimentoId) {
          const destinoItemOrigem = rec.destinos.find((d) => d.destino === origemDestino);
          if (!destinoItemOrigem || destinoItemOrigem.quantidadeHectolitros < quantidadeHl) {
            addToast(`Quantidade insuficiente no destino de origem (${origemDestino}).`, 'error');
            return rec;
          }

          alterouComSucesso = true;

          // Deduct from origin, add/update in new destination
          const novosDestinos: ItemDestino[] = rec.destinos.map((d) => {
            if (d.destino === origemDestino) {
              const qRestante = Math.round((d.quantidadeHectolitros - quantidadeHl) * 100) / 100;
              return {
                ...d,
                quantidadeHectolitros: qRestante,
                quantidadeLatas: hlToLatas(qRestante),
              };
            }
            return d;
          });

          const destinoItemNovoIndex = novosDestinos.findIndex((d) => d.destino === novoDestino);
          if (destinoItemNovoIndex >= 0) {
            const qAntiga = novosDestinos[destinoItemNovoIndex].quantidadeHectolitros;
            const qNova = Math.round((qAntiga + quantidadeHl) * 100) / 100;
            novosDestinos[destinoItemNovoIndex] = {
              ...novosDestinos[destinoItemNovoIndex],
              quantidadeHectolitros: qNova,
              quantidadeLatas: hlToLatas(qNova),
              localArmazenamento: localNovo || novosDestinos[destinoItemNovoIndex].localArmazenamento,
            };
          } else {
            novosDestinos.push({
              destino: novoDestino,
              quantidadeHectolitros: quantidadeHl,
              quantidadeLatas: hlToLatas(quantidadeHl),
              localArmazenamento: localNovo,
              responsavel: activePerfil,
              data: new Date().toISOString().split('T')[0],
              observacoes: `Transferido de ${origemDestino}. Motivo: ${motivo}`,
            });
          }

          return {
            ...rec,
            destinos: novosDestinos.filter((d) => d.quantidadeHectolitros > 0),
            historicoAuditoria: [
              ...rec.historicoAuditoria,
              {
                usuario: activePerfil,
                dataHora: new Date().toLocaleString('pt-BR'),
                acao: 'Transferência de Destino',
                detalhes: `Transferido ${quantidadeHl} hl de ${origemDestino} para ${novoDestino}. Motivo: ${motivo}. Autorização: ${autorizacao}`,
              },
            ],
          };
        }
        return rec;
      })
    );

    if (alterouComSucesso) {
      const novaTransferencia: TransferenciaDestino = {
        id: `transf-${Date.now()}`,
        dataHora: new Date().toLocaleString('pt-BR'),
        origemDestino,
        novoDestino,
        quantidadeHl,
        quantidadeLatas: hlToLatas(quantidadeHl),
        localArmazenamentoOrigem: localOrigem,
        localArmazenamentoNovo: localNovo,
        responsavel: activePerfil,
        motivo,
        autorizacao,
      };

      setTransferencias((prev) => [novaTransferencia, ...prev]);
      addToast(`Transferência de ${quantidadeHl} hl de ${origemDestino} para ${novoDestino} concluída!`);
    }

    return alterouComSucesso;
  };

  const addLote = (loteData: Omit<Lote, 'id' | 'codigo'>): Lote => {
    const seq = lotes.length + 1;
    const codigo = generateBatchCode(seq);
    const newLote: Lote = {
      ...loteData,
      id: `lote-${Date.now()}`,
      codigo,
    };
    setLotes((prev) => [newLote, ...prev]);
    addToast(`Lote ${codigo} criado com sucesso!`);
    return newLote;
  };

  const updateStatusLote = (loteId: string, novaSituacao: SituacaoLote) => {
    let loteCodigoTarget = '';
    setLotes((prev) =>
      prev.map((l) => {
        if (l.id === loteId) {
          loteCodigoTarget = l.codigo;
          return { ...l, situacao: novaSituacao };
        }
        // Exclusivity rule: Only 1 lot at a time can be in 'Em quebra'
        if (novaSituacao === 'Em quebra' && l.situacao === 'Em quebra') {
          return { ...l, situacao: 'Disponível para beneficiamento' };
        }
        return l;
      })
    );

    if (novaSituacao === 'Em quebra') {
      addToast(`Lote ${loteCodigoTarget || loteId} é agora o ÚNICO Lote Ativo na Etapa de Quebra Manual!`, 'success');
    } else {
      addToast(`Status do lote alterado para: ${novaSituacao}`);
    }
  };

  const gerarDocumento = (
    tipo: 'Recibo' | 'Romaneio de Entrada' | 'Romaneio de Saída' | 'Romaneio de Retirada' | 'Extrato de Fornecedor' | 'Extrato de Lote' | 'Extrato de Estoque' | 'Relatório Gerencial' | 'Contrato de Compra Futura',
    referenciaId: string,
    fornecedorNome?: string,
    dadosDoc?: any
  ): DocumentoEmitido => {
    const seq = documentos.length + 1;
    const prefixMap: Record<string, string> = {
      'Recibo': 'REC',
      'Romaneio de Entrada': 'ROM-IN',
      'Romaneio de Saída': 'ROM-OUT',
      'Romaneio de Retirada': 'ROM-RET',
      'Extrato de Fornecedor': 'EXT-FORN',
      'Extrato de Lote': 'EXT-LOT',
      'Extrato de Estoque': 'EXT-EST',
      'Relatório Gerencial': 'REL-GER',
      'Contrato de Compra Futura': 'CTR-FUT',
    };

    const numDoc = generateDocCode(prefixMap[tipo] || 'DOC', seq);
    const novoDoc: DocumentoEmitido = {
      id: `doc-${Date.now()}`,
      numeroDocumento: numDoc,
      tipo,
      dataEmissao: new Date().toISOString().split('T')[0],
      horarioEmissao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      responsavel: activePerfil,
      referenciaId,
      fornecedorNome,
      codigoRastreabilidade: `MD-TRC-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    };

    setDocumentos((prev) => [novoDoc, ...prev]);

    // Open in preview modal automatically
    setDocPreview({
      tipo,
      data: {
        docMeta: novoDoc,
        extraData: dadosDoc,
      },
    });

    return novoDoc;
  };

  return (
    <AppContext.Provider
      value={{
        isFirebaseConnected,
        activeTab,
        setActiveTab,
        activePerfil,
        setActivePerfil,
        unidades,
        activeUnidadeId,
        setActiveUnidadeId,
        activeUnidade,
        addUnidade,
        updateUnidade,
        toggleModuloUnidade,
        deleteUnidade,
        proprietariosTerceiros,
        addProprietarioTerceiro,
        updateProprietarioTerceiro,
        deleteProprietarioTerceiro,
        aportesComprador,
        addAporteComprador,
        deleteAporteComprador,
        currentUser,
        setCurrentUser,
        usuarios,
        permissoesPerfis,
        logsAuditoriaSistema,
        solicitacoesRecuperacaoSenha,
        login,
        logout,
        switchUser,
        solicitarRecuperacaoSenha,
        atenderRecuperacaoSenha,
        addUsuario,
        updateUsuario,
        toggleStatusUsuario,
        deleteUsuario,
        updatePermissoesPerfil,
        registrarLogAuditoria,
        temPermissao,
        podeVerFinanceiro,
        podeGerenciarUsuarios,
        fornecedores,
        recebimentos,
        compras,
        lotes,
        documentos,
        transferencias,
        contasPagar,
        contasReceber,
        expedicoes,
        clientes,
        estoqueBeneficiada,
        romaneiosRetirada,
        addRomaneioRetirada,
        updateRomaneioRetirada,
        deleteRomaneioRetirada,
        deduzirEstoqueBeneficiada,
        adicionarEstoqueBeneficiada,
        ajustarEstoqueBeneficiada,
        addCliente,
        updateCliente,
        deleteCliente,
        addContaPagar,
        registrarPagamentoContaPagar,
        addContaReceber,
        registrarRecebimentoContaReceber,
        addExpedicao,
        quebradores,
        tabelaPrecoQuebra,
        producoesQuebra,
        pagamentosQuebra,
        auditoriaQuebra,
        selectedQuebradorId,
        setSelectedQuebradorId,
        addQuebrador,
        updateQuebrador,
        toggleQuebradorStatus,
        updateTabelaPrecoQuebra,
        addProducaoQuebra,
        updateProducaoQuebra,
        autorizarProducaoQuebra,
        autorizarTodasProducoesQuebra,
        registrarPagamentoQuebra,
        docPreview,
        setDocPreview,
        selectedFornecedorId,
        setSelectedFornecedorId,
        selectedLoteId,
        setSelectedLoteId,
        addFornecedor,
        updateFornecedor,
        addRecebimento,
        cancelRecebimento,
        addCompra,
        vincularRecebimentoACompra,
        getCompraPendenteFornecedor,
        registrarPagamento,
        alterarDestinoEstoque,
        addLote,
        updateStatusLote,
        gerarDocumento,
        empresaConfig,
        updateEmpresaConfig,
        expectativasCompra,
        addExpectativaCompra,
        updateQuantidadeExpectativa,
        darBaixaExpectativa,
        converterExpectativaEmCompra,
        toasts,
        addToast,
        removeToast,
        resetToInitialData,
        limparDadosOperacionais,
        limparTodosOsDadosSistema,
        limparDadosDemo,
        limparRegistrosTeste,
        limparSessoesAcessosAnteriores,
        encerrarTodasSessoesAtivas,
        limparHistoricoNotificacoesMensagens,
        restaurarBaseLimpa,
        limparSomenteDadosDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
