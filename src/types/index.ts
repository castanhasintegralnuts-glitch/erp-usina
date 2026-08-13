export type TipoFornecedor =
  | 'Extrativista'
  | 'Produtor'
  | 'Cooperativa'
  | 'Associação'
  | 'Intermediário'
  | 'Empresa'
  | 'Outro';

export type DestinoTipo =
  | 'Beneficiamento'
  | 'Venda com Casca'
  | 'Quarentena'
  | 'Devolução'
  | 'Descarte';

export type ResultadoAvaliacao =
  | 'Aprovada'
  | 'Aprovada com desconto'
  | 'Aprovada para beneficiamento'
  | 'Aprovada para venda com casca'
  | 'Enviada para quarentena'
  | 'Recusada'
  | 'Devolvida'
  | 'Descartada';

export type SituacaoFinanceira =
  | 'A pagar'
  | 'Parcialmente paga'
  | 'Paga'
  | 'Cancelada'
  | 'Aguardando conferência';

export type FormaPagamento =
  | 'PIX'
  | 'Dinheiro'
  | 'Transferência'
  | 'Depósito'
  | 'Cheque'
  | 'Outra';

export type SituacaoLote =
  | 'Em formação'
  | 'Aguardando análise'
  | 'Disponível para beneficiamento'
  | 'Disponível para venda com casca'
  | 'Em quarentena'
  | 'Em quebra'
  | 'Bloqueado'
  | 'Encerrado';

export type StatusUsuario = 'Ativo' | 'Inativo';

export type PerfilUsuario =
  | 'SuperAdministrador'
  | 'Administrador'
  | 'Gestor'
  | 'Operador'
  | 'Quebrador'
  | 'Diarista'
  | 'Comprador'
  | 'Recebimento'
  | 'Qualidade'
  | 'Financeiro'
  | 'Estoque'
  | 'Consulta';

export interface ModulosUnidade {
  dashboard: boolean;
  recebimento: boolean;
  producao: boolean;
  expedicao: boolean;
  financeiro: boolean;
  comprador: boolean;
  configuracoes: boolean;
  relatorios: boolean;
  quebraManual?: boolean;
  secagem?: boolean;
}

export interface ProprietarioTerceiro {
  id: string;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  unidadeVinculadaId?: string;
  unidadeVinculadaNome?: string;
  observacoes?: string;
  dataCadastro: string;
}

export interface UnidadeFilial {
  id: string;
  codigo: string; // Ex: US-001
  nome: string; // Ex: Usina Monte Dourado (Sede PA)
  cnpj?: string;
  cidadeUF: string; // Ex: Almeirim / Monte Dourado - PA
  endereco?: string;
  responsavel?: string;
  administradorId?: string; // ID do Usuário Administrador Master da Usina
  administradorNome?: string; // Nome do Usuário Administrador Master da Usina
  telefone?: string;
  email?: string;
  status: 'Ativo' | 'Inativo';
  isMatriz?: boolean;
  modulosAtivos: ModulosUnidade;
  dataCriacao: string;
  capacidadeHlMes?: number;
}

export type TipoContratoCompra = 'A Termo' | 'Preço Fixo' | 'Balcão / Spot' | 'Cooperativa' | 'Adiantamento Futuro';

export interface AporteComprador {
  id: string;
  codigo: string; // Ex: APT-2026-001
  compradorId: string;
  compradorNome: string;
  unidadeId?: string;
  dataAporte: string; // YYYY-MM-DD
  valorAporte: number; // R$
  origemRecurso: string; // Ex: 'Tesouraria Matriz', 'Crédito Basa', 'Capital Próprio', 'Adiantamento Direto'
  observacoes?: string;
  status: 'Ativo' | 'Cancelado';
  criadoPor: string;
}

export interface EmpresaConfig {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  endereco: string;
  municipioUF: string;
  telefone: string;
  email: string;
  logotipoUrl?: string;
  unidadeIndustrial: string;
}

export interface AppUser {
  id: string;
  nome: string;
  login: string; // e-mail ou CPF
  senha: string; // senha criptografada/hash
  status: StatusUsuario;
  foto?: string;
  perfil: PerfilUsuario;
  dataCriacao: string;
  ultimoAcesso: string;
  quebradorId?: string;
  cargo?: string;
  unidadeId?: string;
  unidadeNome?: string;
  unidadesAcesso?: string[];
  
  // Subordinação do Comprador (quando perfil === 'Comprador')
  tipoVinculoComprador?: 'Usina' | 'ProprietarioTerceiro'; // 'Usina' = Compra Direta p/ Fábrica, 'ProprietarioTerceiro' = Financiamento Terceiro
  proprietarioTerceiroId?: string;
  proprietarioTerceiroNome?: string;
}

export interface PermissoesPerfil {
  perfil: PerfilUsuario;
  telasPermitidas: string[];
  podeVerFinanceiro: boolean;
  podeGerenciarUsuarios: boolean;
  podeEditarRegistrosOutros: boolean;
  podeAlterarPrecos: boolean;
}

export interface LogAuditoriaSistema {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioPerfil: PerfilUsuario;
  dataHora: string;
  dispositivo: string;
  acao: string;
  registroAlterado: string;
}

export interface SolicitacaoRecuperacaoSenha {
  id: string;
  loginOuEmail: string;
  nomeInformado?: string;
  dataSolicitacao: string;
  motivo?: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  novaSenhaProvisoria?: string;
  atendidoPor?: string;
  dataAtendimento?: string;
}

export interface Quebrador {
  id: string;
  matricula: string;
  nome: string;
  cpf?: string;
  situacao: 'Ativo' | 'Inativo';
  dataAdmissao: string;
  usuarioAcesso: string;
  telefone?: string;
}

export interface TabelaPrecoQuebra {
  id: string;
  precoInteiraPerKg: number; // default R$ 5,00
  precoQuebradaPerKg: number; // default R$ 2,50
  precoAmarelaPerKg: number; // default R$ 2,50
  dataAtualizacao: string;
  atualizadoPor: string;
}

export interface ProducaoQuebraDiaria {
  id: string;
  data: string; // YYYY-MM-DD
  quebradorId: string;
  quebradorNome: string;
  loteId: string;
  loteCodigo: string;
  
  // Weight in kg
  kgInteira: number;
  kgQuebrada: number;
  kgAmarela: number;
  totalKg: number;

  // Snapshot of rates at creation
  taxaInteira: number;
  taxaQuebrada: number;
  taxaAmarela: number;

  // Calculated values in BRL
  valorInteira: number;
  valorQuebrada: number;
  valorAmarela: number;
  valorTotal: number;

  // Status
  situacaoPagamento: 'Pendente' | 'Parcial' | 'Pago';
  pagamentoId?: string;

  // Authorization workflow
  statusAutorizacao?: 'Pendente' | 'Aprovado' | 'Rejeitado';
  motivoRejeicao?: string;
  autorizadoPor?: string;
  dataHoraAutorizacao?: string;

  criadoPor: string;
  dataHoraCriacao: string;
  historicoModificacoes?: {
    usuario: string;
    dataHora: string;
    valorAnterior: string;
    valorNovo: string;
    justificativa: string;
  }[];
}

export interface PagamentoQuebra {
  id: string;
  codigo: string; // Ex: PG-QBR-2026-0001
  dataPagamento: string;
  quebradorId: string;
  quebradorNome: string;
  valorPago: number;
  periodoInicio: string;
  periodoFim: string;
  formaPagamento: FormaPagamento;
  responsavel: string;
  observacoes?: string;
  producoesIds: string[];
}

export interface RegistroAuditoriaQuebra {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  valorAnterior: string;
  valorNovo: string;
  justificativa: string;
}

export interface Fornecedor {
  id: string;
  codigo: string; // Ex: FORN-001
  nomeCompleto: string;
  razaoSocial?: string;
  cpfCnpj: string;
  tipo: TipoFornecedor;
  telefone: string;
  endereco: string;
  municipio: string;
  estado: string; // Ex: PA, AP
  comunidade: string;
  colocacao?: string;
  propriedade?: string;
  localOrigemCastanha: string;
  dadosBancarios?: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'Corrente' | 'Poupança';
  };
  chavePix?: string;
  observacoes?: string;
  dataCadastro: string;
}

export interface ItemDestino {
  destino: DestinoTipo;
  quantidadeHectolitros: number;
  quantidadeLatas: number; // hl * 5
  quantidadeKg?: number;
  localArmazenamento: string;
  responsavel: string;
  data: string;
  observacoes?: string;
}

export interface AvaliacaoQualidade {
  umidadePorcentagem: number;
  impurezasPorcentagem: number;
  podresPorcentagem: number;
  mofadasPorcentagem: number;
  brocadasPorcentagem: number;
  xoxasPorcentagem: number;
  aparenciaGeral: 'Excelente' | 'Boa' | 'Regular' | 'Ruim';
  odor: 'Característico (Normal)' | 'Anormal (Mofo/Azedo)';
  presencaPragas: boolean;
  estadoCarga: 'Seca' | 'Úmida' | 'Encharcada';
  resultado: ResultadoAvaliacao;
  responsavelAvaliacao: string;
  observacoes?: string;
  fotosUrl?: string[];
}

export interface DescontoItem {
  id: string;
  tipo: 'Umidade' | 'Impurezas' | 'Castanhas Avariadas' | 'Frete' | 'Acordo Comercial' | 'Outro';
  motivo: string;
  percentual?: number;
  quantidadeHectolitros: number;
  quantidadeLatas: number;
  valorR$: number;
  responsavel: string;
  observacoes?: string;
}

export interface PagamentoRegistro {
  id: string;
  data: string;
  valor: number;
  formaPagamento: FormaPagamento;
  banco?: string;
  comprovanteRef?: string;
  responsavel: string;
  tipo: 'Integral' | 'Parcial' | 'Adiantamento' | 'Complemento';
  observacoes?: string;
}

export interface CompraOrdem {
  id: string;
  codigo: string; // Ex: MD-CMP-2026-0001
  dataCompra: string;
  fornecedorId: string;
  fornecedorNome: string;
  tipoPreco?: 'FECHADO' | 'ABERTO'; // 'FECHADO' = Preço/Volume travado; 'ABERTO' = Preço/Quantidade a definir no recebimento
  tipoContrato?: TipoContratoCompra;
  
  // Atrelamento Obrigatório ao Comprador e Subordinação/Proprietário
  compradorId: string;
  compradorNome: string;
  tipoFinanciador?: 'Usina' | 'ProprietarioTerceiro';
  proprietarioNome?: string;

  unidadeId?: string;
  quantidadeHectolitrosPrevista: number;
  quantidadeLatasPrevista: number;
  quantidadeKgPrevista?: number;
  quantidadeHectolitrosEntregue?: number;
  quantidadeKgEntregue?: number;
  valorPorHectolitro: number;
  valorEquivalentePorLata: number;
  valorPorKg?: number;
  valorTotalEstimado: number;
  freteEstimado: number;
  adiantamento: number;
  formaPagamentoPrevista: FormaPagamento;
  dataPrevistaEntrega: string;
  localOrigemCastanha?: string;
  comunidade?: string;
  municipio?: string;
  documentoFiscal?: string;
  observacoes?: string;
  status: 'Pendente de Recebimento' | 'Recebido' | 'Cancelado';
  recebimentoId?: string;
  recebimentoCodigo?: string;
  dataRecebimento?: string;
  criadoPor?: string;
}

export interface CompraFinanceira {
  quantidadePagoHectolitros: number;
  quantidadePagoLatas: number;
  valorPorHectolitro: number;
  valorEquivalentePorLata: number; // valorPorHectolitro / 5
  valorPorKg?: number;
  valorBruto: number;
  descontosFinanceiros: number;
  acrescimos: number;
  frete: number;
  comissao: number;
  adiantamento: number;
  outrosCustos: number;
  valorLiquido: number;
  formaPagamentoPrevista: FormaPagamento;
  dataPrevistaPagamento: string;
  situacao: SituacaoFinanceira;
  pagamentosEfetuados: PagamentoRegistro[];
  observacoes?: string;
}

export interface Recebimento {
  id: string;
  codigo: string; // Ex: MD-REC-2026-0001
  data: string;
  horario: string;
  unidade: string; // "Monte Dourado - PA"
  unidadeId?: string;
  
  // Atrelamento Obrigatório ao Comprador
  compradorId: string;
  compradorNome: string;
  tipoFinanciador?: 'Usina' | 'ProprietarioTerceiro';
  proprietarioNome?: string;

  responsavelRecebimento: string;
  fornecedorId: string;
  fornecedorNome: string;
  origemCastanha: string;
  comunidade: string;
  municipio: string;
  safra: string; // Ex: "2026/2027"
  documentoFiscal?: string;
  veiculo?: string;
  placa?: string;
  motorista?: string;
  
  // Quantidades recebidas
  quantidadeBrutaHl: number;
  quantidadeBrutaLatas: number; // Hl * 5
  pesoBrutoKg?: number;
  taraKg?: number;
  pesoLiquidoKg?: number;
  
  // Descontos
  descontos: DescontoItem[];
  quantidadeDescontadaHl: number;
  quantidadeDescontadaLatas: number;
  quantidadeRejeitadaHl: number;
  quantidadeAprovadaHl: number;
  quantidadeLiquidaHl: number; // Aprovada - Descontos
  quantidadeLiquidaLatas: number;
  
  // Conversão individual do recebimento
  fatorKgPorHl?: number;
  fatorKgPorLata?: number;

  // Avaliação e Destinos
  avaliacao: AvaliacaoQualidade;
  destinos: ItemDestino[];

  // Financeiro
  compra: CompraFinanceira;

  // Lote
  loteId?: string;
  loteCodigo?: string;

  // Vinculo com Compra em Aberto
  compraOrdemId?: string;
  compraOrdemCodigo?: string;

  observacoes?: string;
  cancelado?: boolean;
  motivoCancelamento?: string;
  historicoAuditoria: {
    usuario: string;
    dataHora: string;
    acao: string;
    detalhes: string;
  }[];
}

export interface Lote {
  id: string;
  codigo: string; // Ex: MD-LOT-2026-0001
  dataAbertura: string;
  dataEncerramento?: string;
  
  quantidadeInicialHl: number;
  quantidadeAtualHl: number;
  quantidadeLatas: number;
  quantidadeKg?: number;
  
  fornecedoresNomes: string[];
  recebimentosIds: string[];
  recebimentosCodigos: string[];
  
  safra: string;
  origemDominante: string;
  destinoDominante: DestinoTipo;
  localArmazenamento: string;
  
  custoMedioPorHl: number;
  custoMedioPorLata: number;
  custoMedioPorKg?: number;
  
  situacao: SituacaoLote;
  observacoes?: string;
}

export interface TransferenciaDestino {
  id: string;
  dataHora: string;
  origemDestino: DestinoTipo;
  novoDestino: DestinoTipo;
  quantidadeHl: number;
  quantidadeLatas: number;
  quantidadeKg?: number;
  loteOrigemId?: string;
  loteDestinoId?: string;
  localArmazenamentoOrigem: string;
  localArmazenamentoNovo: string;
  responsavel: string;
  motivo: string;
  autorizacao: string;
  observacoes?: string;
}

export interface DocumentoEmitido {
  id: string;
  numeroDocumento: string;
  tipo: 'Recibo' | 'Romaneio de Entrada' | 'Romaneio de Saída' | 'Romaneio de Retirada' | 'Extrato de Fornecedor' | 'Extrato de Lote' | 'Extrato de Estoque' | 'Relatório Gerencial' | 'Contrato de Compra Futura';
  dataEmissao: string;
  horarioEmissao: string;
  responsavel: string;
  referenciaId: string; // ID do recebimento, lote, fornecedor, etc.
  fornecedorNome?: string;
  codigoRastreabilidade: string;
  cancelado?: boolean;
}

export type TipoContaPagar = 'Agendada' | 'Recorrente' | 'Fornecedor_MP';
export type FrequenciaRecorrencia = 'Semanal' | 'Quinzenal' | 'Mensal' | 'Anual';

export interface ContaPagar {
  id: string;
  codigo: string; // Ex: CP-2026-001
  descricao: string;
  fornecedorOuFavorecido: string;
  fornecedorNome?: string;
  categoria: string;
  tipo: TipoContaPagar;
  frequencia?: FrequenciaRecorrencia;
  frequenciaRecorrencia?: FrequenciaRecorrencia;
  dataEmissao: string;
  dataVencimento: string;
  dataAgendamento?: string;
  valorTotal: number;
  valorPago: number;
  saldoDevedor?: number;
  situacao: 'A Pagar' | 'Parcialmente Paga' | 'Paga' | 'Atrasada' | 'Cancelada' | 'Pendente' | 'Parcial';
  formaPagamentoPrevista?: FormaPagamento;
  banco?: string;
  observacoes?: string;
  pagamentosEfetuados?: PagamentoRegistro[];
  recebimentoId?: string;
  compraOrdemId?: string;
}

export interface Cliente {
  id: string;
  codigo: string; // Ex: CLI-001
  nome: string; // Nome / Razão Social
  cpfCnpj: string;
  endereco: string;
  cidade: string;
  telefone?: string;
  email?: string;
  inscricaoEstadual?: string;
  observacoes?: string;
  dataCadastro: string;
  comprasCount?: number;
  totalKgComprado?: number;
}

export type TipoCastanhaExpedicao = 'Castanha Beneficiada' | 'Castanha In Natura / Com Casca';

export type TipoCastanhaBeneficiadaSubtipo =
  | 'Extra Large'
  | 'Large'
  | 'Média'
  | 'Miúda'
  | 'Pedaço'
  | 'Pedacinho';

export interface ItemEstoqueBeneficiada {
  tipo: TipoCastanhaBeneficiadaSubtipo;
  descricao: string;
  caixas: number; // quantidade em caixas (20kg cada)
  pesoKg: number; // caixas * 20
  ultimoPrecoVenda: number; // R$/kg da última venda registrada
  precoMedioVenda: number; // R$/kg preço médio histórico das vendas
  totalKgVendidoHistorico: number;
  totalValorVendidoHistorico: number;
  dataUltimaAtualizacao?: string;
}

export interface ContaReceber {
  id: string;
  codigo: string; // Ex: CR-2026-001
  dataEmissao: string;
  dataVencimento: string;
  cliente: string;
  clienteNome?: string;
  cpfCnpj?: string;
  tipoCastanha: TipoCastanhaExpedicao;
  expedicaoId?: string;
  expedicaoCodigo?: string; // Ex: EXP-2026-001
  produtoDescricao: string;
  descricao?: string;
  quantidadeKg: number;
  valorTotal: number;
  valorRecebido: number;
  saldoAReceber?: number;
  situacao: 'A Receber' | 'Parcialmente Recebido' | 'Recebido' | 'Atrasado' | 'Cancelado' | 'Pendente' | 'Parcial';
  formaPagamentoPrevista?: FormaPagamento;
  observacoes?: string;
  recebimentosEfetuados?: {
    id: string;
    data: string;
    valor: number;
    formaPagamento: FormaPagamento;
    banco?: string;
    responsavel: string;
    observacoes?: string;
  }[];
}

export interface ExpedicaoItem {
  id: string;
  codigo: string; // Ex: EXP-2026-001
  cliente: string;
  cpfCnpj: string;
  endereco: string;
  tipoCastanha: TipoCastanhaExpedicao;
  produto: string;
  classificacao: string;
  loteCodigo?: string;
  loteId?: string;
  quantidade: number;
  pesoKg: number;
  caixas: number;
  precoUnitarioKg?: number;
  valorTotal: number;
  condicaoPagamento?: string;
  dataVencimento?: string;
  motorista: string;
  veiculo: string;
  transportadora: string;
  data: string;
  status: 'Em andamento' | 'Concluída' | 'Pendente' | 'Cancelada';
  subtipoBeneficiada?: TipoCastanhaBeneficiadaSubtipo;
  valorPorCaixa?: number;
  observacoes?: string;
  contaReceberId?: string;
  contaReceberCodigo?: string;
}

export interface ParcelaPagamento {
  id: string;
  numero: number;
  valor: number;
  dataVencimento: string;
  formaPagamento?: string;
  status?: 'Pendente' | 'Pago';
  observacao?: string;
}

export interface ItemRomaneioRetirada {
  id: string;
  nf: string; // Número da Nota Fiscal (NF-e)
  produto: string; // Ex: Castanha do Pará Broken-D CX 20 kg
  quantidade: number; // Inteiro ou decimal
  valorUnitario?: number; // Valor Unitário (R$)
  valor: number; // Valor Total do Item (quantidade * valorUnitario)
  dataPagamento?: string; // YYYY-MM-DD
  observacaoItem?: string;
}

export interface RomaneioRetirada {
  id: string;
  codigo: string; // Ex: ROM-RET-2026-001
  numeroNf?: string; // Número da Nota Fiscal (NF-e geral do Romaneio)
  dataEmissao: string; // YYYY-MM-DD
  dataRetirada?: string;
  clienteNome: string;
  clienteCpfCnpj?: string;
  clienteTelefone?: string;
  motorista?: string;
  placaVeiculo?: string;
  transportadora?: string;
  condicaoPagamento?: string; // Ex: 'À Vista', '30 Dias', '30/60/90 Dias', etc.
  parcelas?: ParcelaPagamento[];
  status: 'Concluído' | 'Pendente' | 'Cancelado';
  itens: ItemRomaneioRetirada[];
  numItensTotal: number;
  quantidadeTotal: number;
  valorTotal: number;
  observacoes?: string;
  responsavelEmissao: string;
  dataCriacao: string;
}

export type MotivoBaixaExpectativa =
  | 'Mercadoria negociada com terceiros'
  | 'Fornecedor não possui mais a mercadoria'
  | 'Estimativa cancelada'
  | 'Outro motivo';

export type StatusExpectativa = 'Ativa' | 'Convertida em Compra' | 'Baixada';

export interface ExpectativaCompra {
  id: string;
  codigo: string; // Ex: EXP-001
  fornecedorId: string;
  fornecedorNome: string;
  quantidadeEstimada: number;
  unidadeMedida: 'hectolitros' | 'latas' | 'kg' | 'caixas' | string;
  periodoDisponibilidade: string; // Data, mês ou período aproximado
  status: StatusExpectativa;
  motivoBaixa?: MotivoBaixaExpectativa;
  dataCriacao: string;
  dataAtualizacao?: string;
  recebimentoOrigemCodigo?: string;
  compraGeradaCodigo?: string;
}

