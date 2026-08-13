import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Fornecedor,
  ItemDestino,
  DescontoItem,
  ResultadoAvaliacao,
  FormaPagamento,
  Recebimento,
  CompraOrdem
} from '../../types';
import {
  LATAS_PER_HL,
  hlToLatas,
  formatBRL,
  formatNumber
} from '../../utils/conversions';
import {
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Users,
  Scale,
  DollarSign,
  Plus,
  Printer,
  Share2,
  Search,
  Check,
  AlertTriangle,
  Boxes,
  Layers,
  FileCheck2,
  MapPin,
  Building2,
  Sparkles,
  ShoppingBag,
  PackageCheck,
  Ban,
  Calendar,
  FileText,
  Zap,
  Info,
  Lock,
  Unlock,
  Bell,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'recebimento' | 'compra';
}

export const RecebimentoWizardModal: React.FC<Props> = ({ isOpen, onClose, initialMode }) => {
  const {
    fornecedores,
    addFornecedor,
    addRecebimento,
    compras,
    addCompra,
    getCompraPendenteFornecedor,
    lotes,
    addLote,
    activePerfil,
    currentUser,
    usuarios,
    proprietariosTerceiros,
    gerarDocumento,
    addToast,
    registrarLogAuditoria,
    registrarPagamento,
    addExpectativaCompra,
  } = useApp();

  const userRole = currentUser?.perfil || activePerfil;
  const isAdminOrGestor = userRole === 'Administrador' || userRole === 'Gestor';
  const isOperator = userRole === 'Operador';

  // Buyer Selection & Subordination
  const compradores = usuarios.filter(
    (u) => u.perfil === 'Comprador' || u.perfil === 'Gestor' || u.perfil === 'Administrador' || u.perfil === 'SuperAdministrador'
  );
  const defaultCompradorId = currentUser?.perfil === 'Comprador' ? currentUser.id : (compradores[0]?.id || 'usr-comprador-1');
  const [selectedCompradorId, setSelectedCompradorId] = useState<string>(defaultCompradorId);

  const selectedComprador = usuarios.find((u) => u.id === selectedCompradorId) || currentUser;
  const compradorNome = selectedComprador?.nome || 'Comprador Responsável';
  const tipoFinanciador = selectedComprador?.tipoVinculoComprador || 'Usina';
  const proprietarioNome =
    tipoFinanciador === 'ProprietarioTerceiro'
      ? selectedComprador?.proprietarioTerceiroNome || 'Proprietário Terceiro (Investidor)'
      : selectedComprador?.unidadeNome || 'Usina Monte Dourado';

  const [adminFormaPagamento, setAdminFormaPagamento] = useState<FormaPagamento>('PIX');
  const [adminBanco, setAdminBanco] = useState<string>('Banpará');
  const [paymentConfirmedByAdmin, setPaymentConfirmedByAdmin] = useState<boolean>(false);

  // Operation mode: 'recebimento' (physical entry) or 'compra' (negotiation / contract)
  const [operacaoTipo, setOperacaoTipo] = useState<'recebimento' | 'compra' | null>(null);

  // Link to open purchase if receiving a pending purchase order
  const [selectedCompraId, setSelectedCompraId] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Search supplier filter (filters starting from 1 character)
  const [searchFornecedor, setSearchFornecedor] = useState<string>('');

  // Quick Supplier inline creation toggle
  const [isCreatingFornecedorInline, setIsCreatingFornecedorInline] = useState(false);
  const [newFornData, setNewFornData] = useState({
    nomeCompleto: '',
    cpfCnpj: '',
    tipo: 'Extrativista' as any,
    telefone: '',
    endereco: '',
    municipio: 'Almeirim',
    estado: 'PA',
    comunidade: 'Arumanduba',
    localOrigemCastanha: 'Reserva Extrativista do Jari',
    chavePix: '',
  });

  // Selected supplier
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<string>(
    fornecedores[0]?.id || ''
  );
  const selectedFornecedor = fornecedores.find((f) => f.id === selectedFornecedorId);

  const handlePrintContrato = (compra: CompraOrdem) => {
    gerarDocumento('Contrato de Compra Futura', compra.id, compra.fornecedorNome, { compra });
  };

  // Check if selected supplier has an open pending purchase
  const pendingCompra = selectedFornecedorId
    ? getCompraPendenteFornecedor(selectedFornecedorId)
    : undefined;

  // Negotiated financial terms
  const [valorPorHectolitro, setValorPorHectolitro] = useState<number>(220);
  const [frete, setFrete] = useState<number>(0);
  const [adiantamento, setAdiantamento] = useState<number>(0);
  const [documentoFiscal, setDocumentoFiscal] = useState<string>('');
  const [formaPagamentoPrevista, setFormaPagamentoPrevista] = useState<FormaPagamento>('PIX');
  const [dataPrevistaPagamento, setDataPrevistaPagamento] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [situacaoFinanceira, setSituacaoFinanceira] = useState<any>('A pagar');

  // Fields specific to Nova Compra
  const [isCompraImediata, setIsCompraImediata] = useState<boolean>(true);
  const [tipoPreco, setTipoPreco] = useState<'FECHADO' | 'ABERTO'>('FECHADO');
  const [quantidadeHectolitrosPrevista, setQuantidadeHectolitrosPrevista] = useState<number>(100);
  const [dataPrevistaEntrega, setDataPrevistaEntrega] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [observacoesCompra, setObservacoesCompra] = useState<string>('');

  // Step 2: Medição + Avaliação de Qualidade (Amostra de 100 Castanhas)
  const [quantidadeBrutaHl, setQuantidadeBrutaHl] = useState<number>(100);
  const quantidadeBrutaLatas = hlToLatas(quantidadeBrutaHl);

  // Sample evaluation (out of 100 nuts)
  const [xoxasAmostra, setXoxasAmostra] = useState<number>(3);
  const [podresAmostra, setPodresAmostra] = useState<number>(2);
  const [brocadasAmostra, setBrocadasAmostra] = useState<number>(1);
  const [impurezasAmostra, setImpurezasAmostra] = useState<number>(1);
  const [aparencia, setAparencia] = useState<'Excelente' | 'Boa' | 'Regular' | 'Ruim'>('Boa');
  const [odor, setOdor] = useState<'Característico (Normal)' | 'Anormal (Mofo/Azedo)'>('Característico (Normal)');

  // Calculate non-conformity & auto discount
  const totalNaoConformidadePct = Math.min(100, xoxasAmostra + podresAmostra + brocadasAmostra + impurezasAmostra);
  const excedenteDescontoPct = Math.max(0, totalNaoConformidadePct - 10);
  const descontoAutomaticoHl = Math.round(((quantidadeBrutaHl * excedenteDescontoPct) / 100) * 10) / 10;
  const quantidadeLiquidaHl = Math.max(0, Math.round((quantidadeBrutaHl - descontoAutomaticoHl) * 10) / 10);
  const quantidadeLiquidaLatas = hlToLatas(quantidadeLiquidaHl);

  // Financial calculations for Receipt are declared below after linkedCompra and quality sample calculations

  // Step 3: Lote
  const [opcaoLote, setOpcaoLote] = useState<'novo' | 'existente' | 'sem_lote'>('novo');
  const [loteExistenteId, setLoteExistenteId] = useState<string>(lotes[0]?.id || '');
  const [nomeNovoLoteObs, setNomeNovoLoteObs] = useState<string>('Lote gerado automaticamente no recebimento');

  // Completion states
  const [completedReceipt, setCompletedReceipt] = useState<Recebimento | null>(null);
  const [completedCompra, setCompletedCompra] = useState<CompraOrdem | null>(null);

  // Expectativa de Compra state in wizard
  const [recExpectativaQtd, setRecExpectativaQtd] = useState<string>('');
  const [recExpectativaUnidade, setRecExpectativaUnidade] = useState<'hectolitros' | 'latas' | 'kg'>('hectolitros');
  const [recExpectativaPeriodo, setRecExpectativaPeriodo] = useState<string>('Próximas 2 semanas');
  const [recExpectativaRegistrada, setRecExpectativaRegistrada] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setOperacaoTipo(initialMode || null);
      setCurrentStep(1);
      setCompletedReceipt(null);
      setCompletedCompra(null);
      setSelectedCompraId(null);
      setSearchFornecedor('');
      setIsCompraImediata(true);
      setTipoPreco('FECHADO');
      setRecExpectativaQtd('');
      setRecExpectativaUnidade('hectolitros');
      setRecExpectativaPeriodo('Próximas 2 semanas');
      setRecExpectativaRegistrada(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Filtered suppliers based on search (from 1 character)
  const filteredFornecedores = fornecedores.filter((f) => {
    if (!searchFornecedor.trim()) return true;
    const term = searchFornecedor.toLowerCase();
    return (
      f.nomeCompleto.toLowerCase().includes(term) ||
      f.cpfCnpj.toLowerCase().includes(term) ||
      (f.comunidade && f.comunidade.toLowerCase().includes(term)) ||
      (f.municipio && f.municipio.toLowerCase().includes(term))
    );
  });

  // Open pending purchases and search filter
  const comprasPendentes = compras.filter((c) => c.status === 'Pendente de Recebimento');
  const filteredComprasPendentes = comprasPendentes.filter((c) => {
    if (!searchFornecedor.trim()) return true;
    const term = searchFornecedor.toLowerCase();
    return (
      c.codigo.toLowerCase().includes(term) ||
      c.fornecedorNome.toLowerCase().includes(term) ||
      (c.comunidade && c.comunidade.toLowerCase().includes(term))
    );
  });

  // Linked contract calculation helpers based on exact user rule:
  // "a vinculação de preço é feita somente sobre o valor adiantado, saldo na medição é a preço aberto."
  const linkedCompra = selectedCompraId ? compras.find((c) => c.id === selectedCompraId) : null;
  const precoContrato = linkedCompra
    ? ((linkedCompra.valorPorHectolitro && linkedCompra.valorPorHectolitro > 0) ? linkedCompra.valorPorHectolitro : (valorPorHectolitro || 220))
    : (valorPorHectolitro || 220);
  const adiantamentoContrato = linkedCompra ? (linkedCompra.adiantamento || 0) : adiantamento;

  // Volume coberto pelo adiantamento no preço do contrato (em HL)
  const volumeCobertoAdiantamentoHl = (precoContrato > 0 && adiantamentoContrato > 0)
    ? adiantamentoContrato / precoContrato
    : 0;
  const volumeCobertoAdiantamentoLatas = hlToLatas(volumeCobertoAdiantamentoHl);

  // Volume efetivamente entregue no recebimento que fica coberto pelo adiantamento
  const volumeCobertoEfetivoHl = Math.min(quantidadeLiquidaHl, volumeCobertoAdiantamentoHl);
  const valorVolumeCoberto = volumeCobertoEfetivoHl * precoContrato;

  // Saldo da medição entregue além do adiantamento, precificado a PREÇO ABERTO (valorPorHectolitro digitado na medição)
  const volumeSaldoMedicaoHl = Math.max(0, quantidadeLiquidaHl - volumeCobertoEfetivoHl);
  const volumeSaldoMedicaoLatas = hlToLatas(volumeSaldoMedicaoHl);
  const valorVolumeSaldoMedicao = volumeSaldoMedicaoHl * valorPorHectolitro;

  // Financial totals for the receipt
  const valorBrutoCompra = (precoContrato > 0 && adiantamentoContrato > 0)
    ? (valorVolumeCoberto + valorVolumeSaldoMedicao)
    : (quantidadeLiquidaHl * valorPorHectolitro);

  const valorLiquidoCompra = Math.max(0, valorBrutoCompra - frete);
  const saldoAPagarFornecedor = Math.max(0, valorLiquidoCompra - adiantamentoContrato);
  const saldoAdiantamentoRestante = Math.max(0, adiantamentoContrato - valorLiquidoCompra);

  // Handle selecting an open purchase order to load its data into the receipt
  const handleSelectOpenCompra = (compra: CompraOrdem) => {
    setOperacaoTipo('recebimento');
    setSelectedCompraId(compra.id);
    setSelectedFornecedorId(compra.fornecedorId);
    setValorPorHectolitro(compra.valorPorHectolitro || 220);
    setQuantidadeBrutaHl(compra.quantidadeHectolitrosPrevista || 100);
    setFrete(compra.freteEstimado || 0);
    setAdiantamento(compra.adiantamento || 0);
    setDocumentoFiscal(compra.documentoFiscal || '');
    setFormaPagamentoPrevista(compra.formaPagamentoPrevista);
    setTipoPreco(compra.tipoPreco || 'FECHADO');
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedFornecedorId) {
        alert('Selecione um fornecedor para continuar.');
        return;
      }
    } else if (currentStep === 2) {
      if (quantidadeBrutaHl <= 0) {
        alert('Informe uma quantidade em hectolitros maior que zero.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(3, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Submit Nova Compra (Contract / Purchase Order)
  const handleConcluirNovaCompra = () => {
    if (!selectedFornecedor) {
      alert('Selecione um fornecedor para registrar a compra.');
      return;
    }

    const numHl = quantidadeHectolitrosPrevista || 0;
    const numLatas = hlToLatas(numHl);
    const modoPreco = isCompraImediata ? 'FECHADO' : tipoPreco;
    const precoFinal = modoPreco === 'ABERTO' ? 0 : valorPorHectolitro;
    const valTotal = modoPreco === 'ABERTO' ? 0 : numHl * precoFinal;

    // Check blocking rule ONLY if NOT Compra Imediata
    if (!isCompraImediata) {
      const existingPending = getCompraPendenteFornecedor(selectedFornecedor.id);
      if (existingPending) {
        alert(`Bloqueio de Regra de Negócio: O fornecedor ${selectedFornecedor.nomeCompleto} já possui a Compra ${existingPending.codigo} em aberto pendente de recebimento.`);
        return;
      }
    }

    const novaCompra = addCompra({
      dataCompra: new Date().toISOString().split('T')[0],
      fornecedorId: selectedFornecedor.id,
      fornecedorNome: selectedFornecedor.nomeCompleto,
      compradorId: selectedCompradorId,
      compradorNome: compradorNome,
      tipoFinanciador: tipoFinanciador as any,
      proprietarioNome: proprietarioNome,
      tipoPreco: modoPreco,
      quantidadeHectolitrosPrevista: numHl,
      quantidadeLatasPrevista: numLatas,
      valorPorHectolitro: precoFinal,
      valorEquivalentePorLata: modoPreco === 'ABERTO' ? 0 : precoFinal / LATAS_PER_HL,
      valorTotalEstimado: valTotal,
      freteEstimado: frete,
      adiantamento: isCompraImediata ? 0 : adiantamento,
      formaPagamentoPrevista,
      dataPrevistaEntrega: isCompraImediata ? new Date().toISOString().split('T')[0] : dataPrevistaEntrega,
      localOrigemCastanha: selectedFornecedor.localOrigemCastanha || 'Monte Dourado',
      comunidade: selectedFornecedor.comunidade,
      municipio: selectedFornecedor.municipio,
      documentoFiscal,
      observacoes: isCompraImediata
        ? `${observacoesCompra ? observacoesCompra + ' - ' : ''}[Compra Imediata - Entrada Direta no Estoque]`
        : `${observacoesCompra ? observacoesCompra + ' - ' : ''}[Contrato Futuro - Preço ${modoPreco === 'ABERTO' ? 'Aberto (A Definir no Recebimento)' : 'Fechado'}]`,
    });

    if (isCompraImediata) {
      let finalLoteId = undefined;
      let finalLoteCodigo = undefined;

      if (opcaoLote === 'novo') {
        const newLote = addLote({
          fornecedoresNomes: [selectedFornecedor.nomeCompleto],
          origemDominante: selectedFornecedor.comunidade || selectedFornecedor.localOrigemCastanha || 'Monte Dourado',
          dataAbertura: new Date().toISOString().split('T')[0],
          quantidadeOriginalHl: numHl,
          quantidadeAtualHl: numHl,
          quantidadeLatas: numLatas,
          fatorKgPorHlMedio: 50,
          situacao: 'Em Formação',
          recebimentosIds: [],
          recebimentosCodigos: [],
        });
        finalLoteId = newLote.id;
        finalLoteCodigo = newLote.codigo;
      } else if (opcaoLote === 'existente') {
        const existing = lotes.find((l) => l.id === loteExistenteId);
        if (existing) {
          finalLoteId = existing.id;
          finalLoteCodigo = existing.codigo;
        }
      }

      const valLiquido = Math.max(0, valTotal - frete);
      const defaultDestinos: ItemDestino[] = [
        {
          destino: 'Beneficiamento',
          localArmazenamento: 'Galpão Principal de Castanha em Casca - Monte Dourado',
          quantidadeHectolitros: numHl,
          quantidadeLatas: numLatas,
          responsavel: activePerfil,
          data: new Date().toISOString().split('T')[0],
          observacoes: 'Entrada Direta no Estoque por Compra Imediata',
        }
      ];

      const valorPag = isCompraImediata ? valLiquido : (adiantamento > 0 ? adiantamento : 0);
      const pagamentosEfetuados: any[] = [];
      if (valorPag > 0) {
        pagamentosEfetuados.push({
          id: `pag-${Date.now()}`,
          data: new Date().toISOString().split('T')[0],
          valor: valorPag,
          formaPagamento: formaPagamentoPrevista,
          banco: 'Banpará',
          responsavel: activePerfil,
          tipo: (valorPag >= valLiquido ? 'Integral' : 'Adiantamento') as any,
          observacoes: 'Pagamento de Compra Imediata com entrada direta no estoque',
        });
      }

      const createdRec = addRecebimento({
        data: new Date().toISOString().split('T')[0],
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        unidade: 'Monte Dourado - PA',
        responsavelRecebimento: activePerfil,
        fornecedorId: selectedFornecedor.id,
        fornecedorNome: selectedFornecedor.nomeCompleto,
        origemCastanha: selectedFornecedor.localOrigemCastanha || 'Reserva Extrativista do Jari',
        comunidade: selectedFornecedor.comunidade || 'Arumanduba',
        municipio: selectedFornecedor.municipio || 'Almeirim',
        safra: '2026/2027',
        documentoFiscal,
        veiculo: 'Compra Imediata (Entrada Direta)',
        placa: '',
        motorista: '',
        quantidadeBrutaHl: numHl,
        quantidadeBrutaLatas: numLatas,
        pesoBrutoKg: numHl * 50,
        taraKg: 0,
        pesoLiquidoKg: numHl * 50,
        descontos: [],
        quantidadeDescontadaHl: 0,
        quantidadeDescontadaLatas: 0,
        quantidadeRejeitadaHl: 0,
        quantidadeAprovadaHl: numHl,
        quantidadeLiquidaHl: numHl,
        quantidadeLiquidaLatas: numLatas,
        avaliacao: {
          umidadePorcentagem: 11,
          impurezasPorcentagem: 0,
          podresPorcentagem: 0,
          mofadasPorcentagem: 0,
          brocadasPorcentagem: 0,
          xoxasPorcentagem: 0,
          aparenciaGeral: 'Excelente',
          odor: 'Característico (Normal)',
          presencaPragas: false,
          estadoCarga: 'Seca',
          resultado: 'Aprovada (Compra Imediata)',
          responsavelAvaliacao: activePerfil,
        },
        destinos: defaultDestinos,
        compra: {
          quantidadePagoHectolitros: numHl,
          quantidadePagoLatas: numLatas,
          valorPorHectolitro,
          valorEquivalentePorLata: valorPorHectolitro / LATAS_PER_HL,
          valorBruto: valTotal,
          descontosFinanceiros: 0,
          acrescimos: 0,
          frete,
          comissao: 0,
          adiantamento: isCompraImediata ? 0 : adiantamento,
          outrosCustos: 0,
          valorLiquido: valLiquido,
          formaPagamentoPrevista,
          situacao: (valorPag >= valLiquido ? 'Paga' : 'Parcialmente paga') as any,
          pagamentosEfetuados,
        },
        loteId: finalLoteId,
        loteCodigo: finalLoteCodigo,
        compraOrdemId: novaCompra.id,
        compraOrdemCodigo: novaCompra.codigo,
      });

      const totalPagoRec = (createdRec.compra.pagamentosEfetuados || []).reduce((sum, p) => sum + p.valor, 0);
      const saldoPagarFornecedor = Math.max(0, createdRec.compra.valorLiquido - totalPagoRec);

      if (saldoPagarFornecedor > 0) {
        if (isOperator) {
          addToast(`📢 Recebimento ${createdRec.codigo} gerou saldo de R$ ${formatBRL(saldoPagarFornecedor)}. Notificação enviada ao Administrador!`, 'info');
          registrarLogAuditoria(
            'NOTIFICACAO_PAGAMENTO_ADMIN',
            `OPERADOR (${currentUser?.nome || activePerfil}) finalizou recebimento ${createdRec.codigo} do fornecedor ${createdRec.fornecedorNome}. Saldo pendente: R$ ${formatBRL(saldoPagarFornecedor)}. Notificação enviada ao Administrador.`,
            currentUser || undefined
          );
        } else if (isAdminOrGestor) {
          addToast(`💡 Recebimento gerou saldo a pagar de R$ ${formatBRL(saldoPagarFornecedor)}. Como Administrador, você pode confirmar o pagamento na tela de resumo.`, 'info');
        }
      }

      setCompletedReceipt(createdRec);
    }

    setCompletedCompra(novaCompra);
  };

  const handleAdminConfirmPayment = (receipt: Recebimento, valorSaldo: number) => {
    registrarPagamento(
      receipt.id,
      valorSaldo,
      adminFormaPagamento,
      adminBanco || 'Banpará',
      'Pagamento verificado e confirmado pelo Administrador no ato do recebimento',
      'Integral'
    );
    setPaymentConfirmedByAdmin(true);

    setCompletedReceipt((prev) => {
      if (!prev) return null;
      const novoPag = {
        id: `pag-admin-${Date.now()}`,
        data: new Date().toISOString().split('T')[0],
        valor: valorSaldo,
        formaPagamento: adminFormaPagamento,
        banco: adminBanco || 'Banpará',
        responsavel: currentUser?.nome || activePerfil,
        tipo: 'Integral' as any,
        observacoes: 'Pagamento verificado e confirmado pelo Administrador no ato do recebimento',
      };
      return {
        ...prev,
        compra: {
          ...prev.compra,
          situacao: 'Paga',
          pagamentosEfetuados: [...(prev.compra.pagamentosEfetuados || []), novoPag],
        },
      };
    });

    addToast(`✅ Pagamento de R$ ${formatBRL(valorSaldo)} confirmado pelo Administrador e quitado com sucesso!`, 'success');
  };

  // Submit Novo Recebimento (Physical Warehouse Receipt)
  const handleConcluirRecebimento = () => {
    if (!selectedFornecedor) return;

    let finalLoteId = undefined;
    let finalLoteCodigo = undefined;

    if (opcaoLote === 'novo') {
      const newLote = addLote({
        fornecedoresNomes: [selectedFornecedor.nomeCompleto],
        origemDominante: selectedFornecedor.comunidade || selectedFornecedor.localOrigemCastanha || 'Arumanduba',
        dataAbertura: new Date().toISOString().split('T')[0],
        quantidadeOriginalHl: quantidadeLiquidaHl,
        quantidadeAtualHl: quantidadeLiquidaHl,
        quantidadeLatas: quantidadeLiquidaLatas,
        fatorKgPorHlMedio: 50,
        situacao: 'Em Formação',
        recebimentosIds: [],
        recebimentosCodigos: [],
      });
      finalLoteId = newLote.id;
      finalLoteCodigo = newLote.codigo;
    } else if (opcaoLote === 'existente') {
      const existing = lotes.find((l) => l.id === loteExistenteId);
      if (existing) {
        finalLoteId = existing.id;
        finalLoteCodigo = existing.codigo;
      }
    }

    const defaultDestinos: ItemDestino[] = [
      {
        destino: 'Beneficiamento',
        localArmazenamento: 'Galpão Principal de Castanha em Casca - Monte Dourado',
        quantidadeHectolitros: quantidadeLiquidaHl,
        quantidadeLatas: quantidadeLiquidaLatas,
        responsavel: activePerfil,
        data: new Date().toISOString().split('T')[0],
        observacoes: 'Armazenado no Estoque Geral',
      }
    ];

    const descontosList: DescontoItem[] = [];
    if (descontoAutomaticoHl > 0) {
      descontosList.push({
        id: `desc-auto-${Date.now()}`,
        tipo: 'Castanhas Avariadas',
        motivo: `Desconto de ${excedenteDescontoPct}% por Não Conformidade (${totalNaoConformidadePct}% em amostra de 100 - Isenção de 10%)`,
        percentual: excedenteDescontoPct,
        quantidadeHectolitros: descontoAutomaticoHl,
        quantidadeLatas: hlToLatas(descontoAutomaticoHl),
        valorR$: descontoAutomaticoHl * valorPorHectolitro,
        responsavel: activePerfil,
      });
    }

    const valAdiantamento = selectedCompraId ? adiantamentoContrato : adiantamento;
    const pagamentosEfetuados: any[] = [];
    if (valAdiantamento > 0) {
      pagamentosEfetuados.push({
        id: `pag-${Date.now()}`,
        data: new Date().toISOString().split('T')[0],
        valor: valAdiantamento,
        formaPagamento: formaPagamentoPrevista,
        banco: 'Banpará',
        responsavel: activePerfil,
        tipo: (valAdiantamento >= valorLiquidoCompra ? 'Integral' : 'Adiantamento') as any,
        observacoes: 'Adiantamento do contrato/recebimento abatido na operação',
      });
    }

    const createdRec = addRecebimento({
      data: new Date().toISOString().split('T')[0],
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      unidade: 'Monte Dourado - PA',
      compradorId: selectedCompradorId,
      compradorNome: compradorNome,
      tipoFinanciador: tipoFinanciador as any,
      proprietarioNome: proprietarioNome,
      responsavelRecebimento: activePerfil,
      fornecedorId: selectedFornecedor.id,
      fornecedorNome: selectedFornecedor.nomeCompleto,
      origemCastanha: selectedFornecedor.localOrigemCastanha || 'Reserva Extrativista do Jari',
      comunidade: selectedFornecedor.comunidade || 'Arumanduba',
      municipio: selectedFornecedor.municipio || 'Almeirim',
      safra: '2026/2027',
      documentoFiscal,
      veiculo: 'Embarcação Regional',
      placa: '',
      motorista: '',
      quantidadeBrutaHl,
      quantidadeBrutaLatas,
      pesoBrutoKg: quantidadeBrutaHl * 50,
      taraKg: 0,
      pesoLiquidoKg: quantidadeLiquidaHl * 50,
      descontos: descontosList,
      quantidadeDescontadaHl: descontoAutomaticoHl,
      quantidadeDescontadaLatas: hlToLatas(descontoAutomaticoHl),
      quantidadeRejeitadaHl: 0,
      quantidadeAprovadaHl: quantidadeLiquidaHl,
      quantidadeLiquidaHl,
      quantidadeLiquidaLatas,
      avaliacao: {
        umidadePorcentagem: 11,
        impurezasPorcentagem: impurezasAmostra,
        podresPorcentagem: podresAmostra,
        mofadasPorcentagem: 0,
        brocadasPorcentagem: brocadasAmostra,
        xoxasPorcentagem: xoxasAmostra,
        aparenciaGeral: aparencia,
        odor,
        presencaPragas: false,
        estadoCarga: 'Seca',
        resultado: totalNaoConformidadePct > 10 ? 'Aprovada com desconto' : 'Aprovada',
        responsavelAvaliacao: activePerfil,
      },
      destinos: defaultDestinos,
      compra: {
        quantidadePagoHectolitros: quantidadeLiquidaHl,
        quantidadePagoLatas: quantidadeLiquidaLatas,
        valorPorHectolitro,
        valorEquivalentePorLata: valorPorHectolitro / LATAS_PER_HL,
        valorBruto: valorBrutoCompra,
        descontosFinanceiros: 0,
        acrescimos: 0,
        frete,
        comissao: 0,
        adiantamento: valAdiantamento,
        outrosCustos: 0,
        valorLiquido: valorLiquidoCompra,
        formaPagamentoPrevista,
        dataPrevistaPagamento,
        situacao: (valorLiquidoCompra <= valAdiantamento ? 'Paga' : 'A pagar') as any,
        pagamentosEfetuados,
      },
      loteId: finalLoteId,
      loteCodigo: finalLoteCodigo,
      compraOrdemId: selectedCompraId || undefined,
    });

    const totalPagoRec = (createdRec.compra.pagamentosEfetuados || []).reduce((sum, p) => sum + p.valor, 0);
    const saldoPagarFornecedor = Math.max(0, createdRec.compra.valorLiquido - totalPagoRec);

    if (saldoPagarFornecedor > 0) {
      if (isOperator) {
        addToast(`📢 Recebimento ${createdRec.codigo} gerou saldo de R$ ${formatBRL(saldoPagarFornecedor)}. Notificação enviada ao Administrador!`, 'info');
        registrarLogAuditoria(
          'NOTIFICACAO_PAGAMENTO_ADMIN',
          `OPERADOR (${currentUser?.nome || activePerfil}) finalizou recebimento ${createdRec.codigo} do fornecedor ${createdRec.fornecedorNome}. Saldo pendente: R$ ${formatBRL(saldoPagarFornecedor)}. Notificação de pagamento enviada ao Administrador.`,
          currentUser || undefined
        );
      } else if (isAdminOrGestor) {
        addToast(`💡 Recebimento gerou saldo a pagar de R$ ${formatBRL(saldoPagarFornecedor)}. Como Administrador, você pode confirmar o pagamento na tela de resumo.`, 'info');
      }
    }

    setCompletedReceipt(createdRec);
  };

  const handleInlineSaveFornecedor = () => {
    if (!newFornData.nomeCompleto || !newFornData.cpfCnpj) {
      alert('Preencha o nome completo e o CPF/CNPJ.');
      return;
    }
    const created = addFornecedor({
      ...newFornData,
      localOrigemCastanha: newFornData.localOrigemCastanha || 'Monte Dourado',
    });
    setSelectedFornecedorId(created.id);
    setIsCreatingFornecedorInline(false);
  };

  const stepsList = [
    { num: 1, label: operacaoTipo === 'compra' ? 'Fornecedor e Contrato' : 'Fornecedor e Negociação', icon: Users },
    { num: 2, label: 'Medição & Qualidade (Amostra 100)', icon: Scale },
    { num: 3, label: 'Lote e Confirmação', icon: FileCheck2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Wizard Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-base shrink-0">
              {operacaoTipo === 'compra' ? '📝' : '📦'}
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                {operacaoTipo === 'compra'
                  ? 'Nova Compra de Matéria-Prima (Contrato)'
                  : operacaoTipo === 'recebimento'
                  ? 'Novo Recebimento de Matéria-Prima (Galpão)'
                  : 'Lançamento de Matéria-Prima'}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Usina Monte Dourado • Operação de Aquisição e Recebimento de Castanha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OPERATION TYPE SELECTOR BUTTONS (IF NOT SELECTED YET) */}
        {operacaoTipo === null && !completedReceipt && !completedCompra && (
          <div className="p-6 sm:p-10 space-y-6 text-center overflow-y-auto">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Seleção de Fluxo
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                O que você deseja registrar agora?
              </h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1">
                Escolha se você quer fechar um contrato/pedido de compra ou efetuar o recebimento físico e pesagem do lote no galpão.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto pt-2">
              {/* Button 1: Recebimento Físico */}
              <button
                onClick={() => setOperacaoTipo('recebimento')}
                className="p-6 rounded-3xl border-2 border-emerald-500 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all hover:shadow-xl group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-emerald-950">📦 Novo Recebimento Físico</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Efetuar a entrada e medição física de castanha recebida no galpão de Monte Dourado. Permite vincular a uma compra pendente ou registrar uma entrega direta.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-emerald-200/60 text-xs font-extrabold text-emerald-700 flex items-center justify-between">
                  <span>Iniciar Recebimento</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Button 2: Nova Compra */}
              <button
                onClick={() => setOperacaoTipo('compra')}
                className="p-6 rounded-3xl border-2 border-amber-500 hover:border-amber-600 bg-amber-50/50 hover:bg-amber-50 text-left transition-all hover:shadow-xl group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-amber-950">📝 Nova Compra (Contrato)</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Registrar uma nova negociação comercial com o fornecedor (volume estimado em HL, preço por HL, adiantamento) antes da chegada da carga ao galpão.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-amber-200/60 text-xs font-extrabold text-amber-800 flex items-center justify-between">
                  <span>Registrar Nova Compra</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {comprasPendentes.length > 0 && (
              <div className="pt-6 border-t border-slate-200 text-left max-w-3xl mx-auto space-y-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  💡 Compras em Aberto Pendentes de Recebimento ({comprasPendentes.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {comprasPendentes.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleSelectOpenCompra(c)}
                              className="p-3 bg-white border border-amber-300 hover:border-amber-500 rounded-2xl cursor-pointer hover:shadow-sm transition-all flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-extrabold text-slate-900">{c.codigo}</span>
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                    c.tipoPreco === 'ABERTO' ? 'bg-blue-100 text-blue-950 border border-blue-200' : 'bg-amber-100 text-amber-950 border border-amber-200'
                                  }`}>
                                    {c.tipoPreco === 'ABERTO' ? '🔓 Preço Aberto' : '🔒 Preço Fechado'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectOpenCompra(c);
                                  }}
                                  className="text-[11px] font-medium text-slate-700 hover:text-emerald-800 text-left cursor-pointer group mt-0.5 block"
                                >
                                  Fornecedor: <strong className="text-emerald-900 font-extrabold group-hover:underline">{c.fornecedorNome}</strong> • {c.tipoPreco === 'ABERTO' ? 'Vol. Est. ' : ''}{c.quantidadeHectolitrosPrevista} HL
                                </button>
                              </div>
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-1 rounded-lg shrink-0">
                                Receber Castanha
                              </span>
                            </div>
                          ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WIZARD STEPS BAR IF RECEIBIMENTO MODE */}
        {operacaoTipo === 'recebimento' && !completedReceipt && (
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3">
              {stepsList.map((step) => {
                const Icon = step.icon;
                const isCompleted = step.num < currentStep;
                const isCurrent = step.num === currentStep;

                return (
                  <button
                    key={step.num}
                    onClick={() => {
                      if (step.num < currentStep) setCurrentStep(step.num);
                    }}
                    disabled={step.num > currentStep && !completedReceipt}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-700 text-white shadow'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-950 hover:bg-emerald-200'
                        : 'bg-slate-200/80 text-slate-500 opacity-70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{step.num}. {step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode Switcher */}
            <button
              onClick={() => setOperacaoTipo(null)}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Trocar Fluxo
            </button>
          </div>
        )}

        {/* Wizard Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* SUCCESS OVERLAY FOR RECEIPT (OU COMPRA IMEDIATA) */}
          {completedReceipt && (
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                {completedReceipt.compraOrdemCodigo ? (
                  <Zap className="w-10 h-10 text-emerald-600" />
                ) : (
                  <CheckCircle2 className="w-10 h-10" />
                )}
              </div>
              <div>
                <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {completedReceipt.compraOrdemCodigo ? '⚡ Compra Imediata & Entrada no Estoque' : 'Recebimento Registrado'}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Recebimento: {completedReceipt.codigo}
                  {completedReceipt.compraOrdemCodigo && (
                    <span className="block text-sm font-bold text-slate-500 mt-0.5">
                      Ordem de Compra: {completedReceipt.compraOrdemCodigo}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  {completedReceipt.compraOrdemCodigo
                    ? `Compra concluída com sucesso! Todo dinheiro aplicado (${formatBRL(completedReceipt.compra.valorLiquido)}) já deu entrada direta de ${completedReceipt.quantidadeLiquidaHl} HL (${completedReceipt.quantidadeLiquidaLatas} latas) no Estoque de Matéria-Prima.`
                    : `Entrada de ${completedReceipt.quantidadeLiquidaHl} HL (${completedReceipt.quantidadeLiquidaLatas} latas) confirmada para o fornecedor ${completedReceipt.fornecedorNome}.`}
                </p>
              </div>

              {/* PAINEL DE STATUS FINANCEIRO / NOTIFICAÇÃO AO ADMINISTRADOR */}
              {(() => {
                const totalPagoRec = (completedReceipt.compra.pagamentosEfetuados || []).reduce((sum, p) => sum + p.valor, 0);
                const saldoPagarRec = Math.max(0, (completedReceipt.compra.valorLiquido || 0) - totalPagoRec);

                if (saldoPagarRec <= 0 && !paymentConfirmedByAdmin) return null;

                if (isOperator && saldoPagarRec > 0) {
                  return (
                    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left space-y-2 max-w-lg mx-auto shadow-xs">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-tight">
                        <Bell className="w-4 h-4 text-amber-700 animate-bounce" />
                        <span>Notificação de Pagamento Encaminhada ao Administrador</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        Esta operação gerou um saldo a favor do fornecedor de <strong className="text-amber-950 font-black">R$ {formatBRL(saldoPagarRec)}</strong>.
                        Como você está conectado como <strong className="font-extrabold">{currentUser?.nome || 'Operador'} ({userRole})</strong>, uma notificação formal foi enviada à Administração para autorização e liberação do pagamento.
                      </p>
                    </div>
                  );
                }

                if (isAdminOrGestor) {
                  return (
                    <div className="p-5 bg-slate-900 text-white border-2 border-emerald-500 rounded-2xl text-left space-y-4 max-w-xl mx-auto shadow-xl animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          <span className="font-black text-xs text-amber-300 uppercase tracking-wider">
                            Controle Financeiro — Acesso Administrador
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                          {saldoPagarRec > 0 ? `Saldo Fornecedor: R$ ${formatBRL(saldoPagarRec)}` : 'SITUAÇÃO: QUITADO'}
                        </span>
                      </div>

                      {paymentConfirmedByAdmin || saldoPagarRec <= 0 ? (
                        <div className="p-3.5 bg-emerald-900/90 border border-emerald-500 rounded-xl space-y-1 text-center">
                          <div className="flex items-center justify-center gap-2 text-emerald-300 font-extrabold text-xs">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span>Pagamento Confirmado pelo Administrador e Quitado!</span>
                          </div>
                          <p className="text-[11px] text-slate-200">
                            O valor foi quitado e registrado com sucesso nos extratos do Módulo Financeiro.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-200 leading-relaxed">
                            O recebimento <strong className="text-white font-extrabold">{completedReceipt.codigo}</strong> do fornecedor <strong className="text-white font-extrabold">{completedReceipt.fornecedorNome}</strong> gerou um saldo a favor do fornecedor no valor de <strong className="text-amber-300 font-black">R$ {formatBRL(saldoPagarRec)}</strong>.
                            <br />
                            <span className="text-emerald-300 font-bold">Você é Administrador:</span> deseja confirmar que o pagamento já foi realizado ao fornecedor?
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            <div>
                              <label className="text-[10px] text-slate-300 font-bold block mb-1">Forma de Pagamento Utilizada</label>
                              <select
                                value={adminFormaPagamento}
                                onChange={(e) => setAdminFormaPagamento(e.target.value as any)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-2 focus:ring-emerald-400"
                              >
                                <option value="PIX">PIX</option>
                                <option value="Transferência Bancária">Transferência Bancária</option>
                                <option value="Dinheiro">Dinheiro em Espécie</option>
                                <option value="Cheque">Cheque</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-300 font-bold block mb-1">Banco / Conta Origem</label>
                              <input
                                type="text"
                                value={adminBanco}
                                onChange={(e) => setAdminBanco(e.target.value)}
                                placeholder="Ex: Banpará / Caixa"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-2 focus:ring-emerald-400"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                            <button
                              onClick={() => handleAdminConfirmPayment(completedReceipt, saldoPagarRec)}
                              className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02] border border-amber-300"
                            >
                              <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                              <span>Confirmar que o Pagamento JÁ Foi Realizado</span>
                            </button>

                            <button
                              onClick={() => {
                                addToast(`Operação mantida com saldo de R$ ${formatBRL(saldoPagarRec)} A PAGAR no Financeiro.`, 'info');
                              }}
                              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                            >
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>Manter "A Pagar"</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              })()}

              {/* REGISTRO ENXUTO DA EXPECTATIVA DE COMPRA */}
              <div className="max-w-xl mx-auto p-5 bg-slate-900 text-white rounded-2xl border border-emerald-500/50 shadow-xl space-y-4 text-left my-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                      🔮
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white tracking-tight">Expectativa de Compra Futura</h4>
                      <p className="text-[10px] text-amber-300 font-medium">Acompanhamento da disponibilidade da safra</p>
                    </div>
                  </div>
                  {recExpectativaRegistrada && (
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Expectativa Salva
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-black text-amber-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    “Qual quantidade este fornecedor estima que ainda terá disponível?”
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* 1. FORNECEDOR (Preenchido automaticamente) */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-300 font-bold block mb-1">
                        1. Fornecedor (Preenchido automaticamente)
                      </label>
                      <input
                        type="text"
                        value={completedReceipt.fornecedorNome}
                        disabled
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 font-extrabold cursor-not-allowed opacity-90"
                      />
                    </div>

                    {/* 2. QUANTIDADE ESTIMADA */}
                    <div>
                      <label className="text-[10px] text-slate-300 font-bold block mb-1">
                        2. Quantidade Estimada
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={recExpectativaQtd}
                        onChange={(e) => setRecExpectativaQtd(e.target.value)}
                        placeholder="Ex: 50"
                        disabled={recExpectativaRegistrada}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-black text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                      />
                    </div>

                    {/* 3. UNIDADE DE MEDIDA */}
                    <div>
                      <label className="text-[10px] text-slate-300 font-bold block mb-1">
                        3. Unidade de Medida
                      </label>
                      <select
                        value={recExpectativaUnidade}
                        onChange={(e) => setRecExpectativaUnidade(e.target.value as any)}
                        disabled={recExpectativaRegistrada}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-2 focus:ring-emerald-400 outline-none"
                      >
                        <option value="hectolitros">Hectolitros (HL)</option>
                        <option value="latas">Latas (60L)</option>
                        <option value="kg">Quilogramas (kg)</option>
                      </select>
                    </div>

                    {/* 4. PERÍODO PROVÁVEL DE DISPONIBILIDADE */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-300 font-bold block mb-1">
                        4. Período Provável de Disponibilidade
                      </label>
                      <input
                        type="text"
                        value={recExpectativaPeriodo}
                        onChange={(e) => setRecExpectativaPeriodo(e.target.value)}
                        placeholder="Ex: Mês de Setembro, Próximas 2 semanas, 20/10/2026..."
                        disabled={recExpectativaRegistrada}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:ring-2 focus:ring-emerald-400 outline-none"
                      />
                    </div>
                  </div>

                  {!recExpectativaRegistrada && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
                      <p className="text-[10px] text-slate-400 italic">
                        * Não movimenta caixa, não gera financeiro, não altera estoque.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const qtdNum = Number(recExpectativaQtd);
                          if (!qtdNum || qtdNum <= 0) {
                            addToast('Por favor, informe a quantidade estimada.', 'error');
                            return;
                          }
                          addExpectativaCompra({
                            fornecedorId: completedReceipt.fornecedorId,
                            fornecedorNome: completedReceipt.fornecedorNome,
                            quantidadeEstimada: qtdNum,
                            unidadeMedida: recExpectativaUnidade,
                            periodoDisponibilidade: recExpectativaPeriodo || 'A definir',
                            recebimentoOrigemCodigo: completedReceipt.codigo,
                          });
                          setRecExpectativaRegistrada(true);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.02] shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                        <span>Salvar Expectativa de Compra</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    gerarDocumento('Romaneio de Entrada', completedReceipt.id, completedReceipt.fornecedorNome, completedReceipt);
                  }}
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Romaneio de Entrada (PDF A4)
                </button>

                <button
                  onClick={() => {
                    gerarDocumento('Recibo', completedReceipt.id, completedReceipt.fornecedorNome, {
                      recebimento: completedReceipt,
                      pagamento: completedReceipt.compra.pagamentosEfetuados[0],
                    });
                  }}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Recibo de Compra
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`*USINA MONTE DOURADO - COMPRA IMEDIATA*\nRecebimento: ${completedReceipt.codigo}\nFornecedor: ${completedReceipt.fornecedorNome}\nQtd Entrada Estoque: ${completedReceipt.quantidadeLiquidaHl} hl (${completedReceipt.quantidadeLiquidaLatas} latas)\nValor Total Investido: ${formatBRL(completedReceipt.compra.valorLiquido)}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Enviar via WhatsApp
                </a>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-sm cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS OVERLAY FOR NOVA COMPRA (CONTRATO FUTURO) */}
          {completedCompra && !completedReceipt && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Contrato de Compra Registrado
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Código: {completedCompra.codigo}
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Compra de {completedCompra.quantidadeHectolitrosPrevista} HL ({completedCompra.quantidadeLatasPrevista} latas) registrada com sucesso para {completedCompra.fornecedorNome}.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => handlePrintContrato(completedCompra)}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow flex items-center gap-2 text-sm cursor-pointer border border-amber-300"
                >
                  <Printer className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  Imprimir Contrato (Folha A4)
                </button>

                <button
                  onClick={() => {
                    handleSelectOpenCompra(completedCompra);
                    setCompletedCompra(null);
                  }}
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  Efetuar Recebimento Físico Desta Carga Agora
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`*USINA MONTE DOURADO - ORDEM DE COMPRA*\nCódigo: ${completedCompra.codigo}\nFornecedor: ${completedCompra.fornecedorNome}\nVolume Negociado: ${completedCompra.quantidadeHectolitrosPrevista} HL\nValor Negociado: R$ ${completedCompra.valorPorHectolitro}/HL\nValor Total Estimado: ${formatBRL(completedCompra.valorTotalEstimado)}\nData Prevista de Entrega: ${completedCompra.dataPrevistaEntrega}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Enviar Contrato via WhatsApp
                </a>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-sm cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          )}

          {/* FLUXO NOVA COMPRA (CONTRATO) */}
          {operacaoTipo === 'compra' && !completedCompra && (
            <div className="space-y-6">
              {/* Header & Mode Switcher */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Passo 1: Seleção de Fornecedor & Termos da Compra
                  </h3>
                  <p className="text-xs text-slate-500">
                    Negociação prévia de volume e preço por HL com o produtor/extrativista
                  </p>
                </div>
                <button
                  onClick={() => setOperacaoTipo('recebimento')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Mudar para Recebimento Físico
                </button>
              </div>

              {/* Supplier Search Bar (filtering from 1 character) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Selecionar Fornecedor *
                  </label>
                  <button
                    onClick={() => setIsCreatingFornecedorInline(!isCreatingFornecedorInline)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isCreatingFornecedorInline ? 'Cancelar Cadastro' : 'Cadastrar Novo Fornecedor'}
                  </button>
                </div>

                {/* Inline Supplier Form */}
                {isCreatingFornecedorInline && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3">
                    <span className="text-xs font-black text-emerald-900 block">Novo Cadastramento Rápido de Fornecedor</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Nome Completo *"
                        value={newFornData.nomeCompleto}
                        onChange={(e) => setNewFornData({ ...newFornData, nomeCompleto: e.target.value })}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="CPF/CNPJ *"
                        value={newFornData.cpfCnpj}
                        onChange={(e) => setNewFornData({ ...newFornData, cpfCnpj: e.target.value })}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Comunidade (Ex: Arumanduba)"
                        value={newFornData.comunidade}
                        onChange={(e) => setNewFornData({ ...newFornData, comunidade: e.target.value })}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handleInlineSaveFornecedor}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
                      >
                        Salvar Fornecedor
                      </button>
                    </div>
                  </div>
                )}

                {/* Supplier Selection Logic: Only show the selected supplier once selected to eliminate doubt */}
                {selectedFornecedor ? (
                  <div className="p-4 bg-emerald-50/90 border-2 border-emerald-600 rounded-2xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <Check className="w-3 h-3" />
                          Fornecedor Selecionado
                        </span>
                        <span className="bg-white border border-emerald-300 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                          {selectedFornecedor.tipo}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFornecedorId('')}
                        className="text-xs font-bold text-slate-700 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all border border-slate-300 hover:border-rose-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Clique para trocar de fornecedor"
                      >
                        <X className="w-3.5 h-3.5 text-rose-500" />
                        Trocar / Alterar Fornecedor
                      </button>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {selectedFornecedor.nomeCompleto}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        CPF/CNPJ: <strong>{selectedFornecedor.cpfCnpj}</strong> • Comunidade: <strong>{selectedFornecedor.comunidade || 'N/I'}</strong> ({selectedFornecedor.municipio || 'PA'})
                      </p>
                      {selectedFornecedor.localOrigemCastanha && (
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          Origem cadastrada: <strong className="text-slate-700">{selectedFornecedor.localOrigemCastanha}</strong>
                        </p>
                      )}
                    </div>

                    {/* Pending Purchase alert for selected supplier */}
                    {!!getCompraPendenteFornecedor(selectedFornecedor.id) && (
                      <div className="mt-1 text-[11px] bg-rose-100 text-rose-900 font-extrabold px-2.5 py-1 rounded-md inline-flex items-center gap-1 border border-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        Possui Compra em Aberto no Sistema
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar fornecedor por nome, CPF/CNPJ, comunidade ou município (digite a partir de 1 caractere)..."
                        value={searchFornecedor}
                        onChange={(e) => setSearchFornecedor(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                      />
                      {searchFornecedor && (
                        <button
                          type="button"
                          onClick={() => setSearchFornecedor('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    {/* Suppliers List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                      {filteredFornecedores.map((f) => {
                        const hasPending = !!getCompraPendenteFornecedor(f.id);
                        return (
                          <div
                            key={f.id}
                            onClick={() => setSelectedFornecedorId(f.id)}
                            className="p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xs group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 group-hover:text-emerald-800 text-xs sm:text-sm text-left">
                                {f.nomeCompleto}
                              </span>
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                                {f.tipo}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1">
                              CPF/CNPJ: <strong>{f.cpfCnpj}</strong> • Comunidade: <strong>{f.comunidade || 'N/I'}</strong>
                            </div>
                            {hasPending && (
                              <span className="mt-2 text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-md self-start flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Possui Compra em Aberto
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {filteredFornecedores.length === 0 && (
                        <div className="col-span-2 p-4 text-center text-xs text-slate-500 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          Nenhum fornecedor encontrado para esta busca.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* STRICT MANDATORY BLOCKING RULE FOR PENDING PURCHASES */}
              {pendingCompra ? (
                <div className="p-5 bg-rose-50/90 border-2 border-rose-500 rounded-3xl space-y-4 shadow-lg animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0">
                      <Ban className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="bg-rose-200 text-rose-900 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        Bloqueio de Regra de Negócio
                      </span>
                      <h4 className="text-base font-black text-rose-950 mt-1">
                        Impedido de Gerar Nova Compra para {selectedFornecedor?.nomeCompleto}
                      </h4>
                      <p className="text-xs text-rose-800 mt-1">
                        Este fornecedor já possui uma compra em aberto pendente de recebimento físico no galpão. Não é permitido criar uma nova compra para o mesmo fornecedor enquanto houver uma pendente.
                      </p>
                    </div>
                  </div>

                  {/* Details of the pending purchase order */}
                  <div className="p-4 bg-white/90 rounded-2xl border border-rose-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                      <span className="font-black text-slate-900">Compra em Aberto: {pendingCompra.codigo}</span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {pendingCompra.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Data do Contrato</span>
                        <strong>{pendingCompra.dataCompra}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Volume Previsto</span>
                        <strong>{pendingCompra.quantidadeHectolitrosPrevista} HL</strong> ({pendingCompra.quantidadeLatasPrevista} latas)
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Preço Acordado</span>
                        <strong className="text-emerald-700">{formatBRL(pendingCompra.valorPorHectolitro)}/HL</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Data Prevista Entrega</span>
                        <strong>{pendingCompra.dataPrevistaEntrega}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions inside blocking card */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handlePrintContrato(pendingCompra)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer border border-amber-300"
                    >
                      <Printer className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                      Imprimir Contrato A4
                    </button>
                    <button
                      onClick={() => handleSelectOpenCompra(pendingCompra)}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Efetuar Recebimento Físico Desta Compra ({pendingCompra.codigo})
                    </button>
                    <button
                      onClick={() => setSelectedFornecedorId('')}
                      className="px-4 py-2.5 bg-white border border-rose-300 text-rose-800 font-bold hover:bg-rose-100 rounded-xl text-xs cursor-pointer"
                    >
                      Selecionar Outro Fornecedor
                    </button>
                  </div>
                </div>
              ) : (
                /* NOVA COMPRA FORM FIELDS */
                selectedFornecedor && (
                  <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                        <ShoppingBag className="w-4 h-4 text-amber-600" />
                        Dados do Contrato / Ordem de Compra
                      </div>
                      <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full uppercase">
                        Fornecedor: {selectedFornecedor.nomeCompleto}
                      </span>
                    </div>

                    {/* Comprador Responsável & Financiador */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-700" />
                          <span>Comprador Responsável pela Operação *</span>
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tipoFinanciador === 'ProprietarioTerceiro' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {tipoFinanciador === 'ProprietarioTerceiro' ? 'Financiador Externo' : 'Usina Monte Dourado'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Selecione o Comprador Vinculado:
                          </label>
                          <select
                            value={selectedCompradorId}
                            onChange={(e) => setSelectedCompradorId(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            {compradores.map((comp) => (
                              <option key={comp.id} value={comp.id}>
                                {comp.nome} ({comp.perfil}) — {comp.tipoVinculoComprador === 'ProprietarioTerceiro' ? `Terceiro: ${comp.proprietarioTerceiroNome}` : `Usina: ${comp.unidadeNome || 'Monte Dourado'}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            tipoFinanciador === 'ProprietarioTerceiro' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {tipoFinanciador === 'ProprietarioTerceiro' ? 'TERC' : 'USIN'}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight block">
                              Subordinação / Financiador:
                            </span>
                            <strong className="text-xs font-black text-slate-900 block">
                              {proprietarioNome}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modalidade de Compra: Compra Imediata x Contrato Futuro */}
                    <div className="p-4 bg-white border-2 border-emerald-500/80 rounded-2xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Modalidade da Compra *</span>
                        </label>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          isCompraImediata ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isCompraImediata ? '⚡ Entrada Direta no Estoque' : '📅 Contrato Futuro (A Receber)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option 1: Compra Imediata */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsCompraImediata(true);
                            setAdiantamento(0);
                            setTipoPreco('FECHADO');
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                            isCompraImediata
                              ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/30'
                              : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${isCompraImediata ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <strong className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                              Compra Imediata
                              <span className="text-[9px] bg-emerald-200 text-emerald-950 px-1.5 py-0.2 rounded font-black">Reflete no Estoque</span>
                            </strong>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              Todo dinheiro aplicado <strong>já reflete como entrada imediata de matéria-prima no estoque</strong> e gera recebimento automático.
                            </p>
                          </div>
                        </button>

                        {/* Option 2: Contrato Futuro */}
                        <button
                          type="button"
                          onClick={() => setIsCompraImediata(false)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                            !isCompraImediata
                              ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/30'
                              : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${!isCompraImediata ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                              Contrato Futuro (A Receber)
                            </strong>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              Firma o compromisso financeiro com entrega futura. A entrada no estoque será feita posteriormente no descarregamento.
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Extra options for Compra Imediata */}
                      {isCompraImediata && (
                        <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-emerald-50/60 p-2.5 rounded-xl">
                          <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Entrada Direta: {quantidadeHectolitrosPrevista || 0} HL ({hlToLatas(quantidadeHectolitrosPrevista || 0)} latas / ~{(quantidadeHectolitrosPrevista || 0) * 50} kg)
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 text-[11px] font-medium">Lote de Destino:</span>
                            <select
                              value={opcaoLote}
                              onChange={(e) => setOpcaoLote(e.target.value as any)}
                              className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-extrabold text-slate-800"
                            >
                              <option value="novo">⚡ Novo Lote Automático</option>
                              <option value="existente">Vincular a Lote Existente</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MODALIDADE DE PREÇO DO CONTRATO FUTURO (Preço Fechado x Preço Aberto) */}
                    {!isCompraImediata && (
                      <div className="p-4 bg-amber-50/80 border-2 border-amber-400/80 rounded-2xl space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Scale className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Modalidade de Preço do Contrato Futuro *</span>
                          </label>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            tipoPreco === 'FECHADO' ? 'bg-amber-200 text-amber-950 border border-amber-300' : 'bg-blue-100 text-blue-950 border border-blue-300'
                          }`}>
                            {tipoPreco === 'FECHADO' ? '🔒 Preço Fechado' : '🔓 Preço Aberto'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Option A: Preço Fechado */}
                          <button
                            type="button"
                            onClick={() => setTipoPreco('FECHADO')}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                              tipoPreco === 'FECHADO'
                                ? 'bg-white border-amber-600 ring-2 ring-amber-500/30 shadow-xs'
                                : 'bg-slate-50/80 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 ${tipoPreco === 'FECHADO' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              <Lock className="w-4 h-4" />
                            </div>
                            <div>
                              <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                                Preço Fechado (Valor/Volume Definidos)
                              </strong>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                Preço por HL e volume travados na contratação. O valor adiantado <strong>corresponde a uma quantidade definida de castanhas</strong>.
                              </p>
                            </div>
                          </button>

                          {/* Option B: Preço Aberto */}
                          <button
                            type="button"
                            onClick={() => {
                              setTipoPreco('ABERTO');
                              setValorPorHectolitro(0);
                            }}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                              tipoPreco === 'ABERTO'
                                ? 'bg-white border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                                : 'bg-slate-50/80 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 ${tipoPreco === 'ABERTO' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              <Unlock className="w-4 h-4" />
                            </div>
                            <div>
                              <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                                Preço Aberto (A Definir na Entrega)
                              </strong>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                O adiantamento é concedido em dinheiro. <strong>Não há quantidade de castanhas nem preço travados</strong>; o acerto será feito ao receber a castanha.
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Expected Volume (HL) */}
                      <div className={`p-3 bg-white rounded-2xl border-2 ${!isCompraImediata && tipoPreco === 'ABERTO' ? 'border-blue-400' : 'border-amber-500'}`}>
                        <label className="block text-[11px] font-black text-slate-900 mb-1">
                          {!isCompraImediata && tipoPreco === 'ABERTO' ? 'Volume Estimado (HL)' : 'Volume Negociado (HL) *'}
                        </label>
                        <input
                          type="number"
                          value={quantidadeHectolitrosPrevista}
                          onChange={(e) => setQuantidadeHectolitrosPrevista(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-amber-50/50 border border-amber-300 font-black text-lg text-amber-950 rounded-xl focus:outline-none"
                        />
                        <span className="text-[10px] text-amber-800 font-bold mt-1 block">
                          = {hlToLatas(quantidadeHectolitrosPrevista)} latas {!isCompraImediata && tipoPreco === 'ABERTO' ? '(Estimativa)' : ''}
                        </span>
                      </div>

                      {/* Price per HL */}
                      <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500">
                        <label className="block text-[11px] font-black text-emerald-950 mb-1">
                          {!isCompraImediata && tipoPreco === 'ABERTO' ? 'Preço do Contrato' : 'Preço Negociado (R$/HL) *'}
                        </label>
                        {!isCompraImediata && tipoPreco === 'ABERTO' ? (
                          <div className="px-3 py-2 bg-blue-50 border border-blue-300 text-blue-900 font-black text-xs rounded-xl flex items-center gap-1.5">
                            <Unlock className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Preço Aberto (A Definir)</span>
                          </div>
                        ) : (
                          <>
                            <input
                              type="number"
                              value={valorPorHectolitro}
                              onChange={(e) => setValorPorHectolitro(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-1.5 bg-emerald-50/50 border border-emerald-300 font-black text-lg text-emerald-950 rounded-xl focus:outline-none"
                            />
                            <span className="text-[10px] text-emerald-800 font-bold mt-1 block">
                              = {formatBRL(valorPorHectolitro / LATAS_PER_HL)} / lata
                            </span>
                          </>
                        )}
                      </div>

                      {/* Freight Estimate */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Frete Estimado (R$)
                        </label>
                        <input
                          type="number"
                          value={frete}
                          onChange={(e) => setFrete(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold rounded-xl"
                        />
                      </div>

                      {/* Advance Payment - Only for Contrato Futuro */}
                      {!isCompraImediata ? (
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Adiantamento Concedido (R$)
                          </label>
                          <input
                            type="number"
                            value={adiantamento}
                            onChange={(e) => setAdiantamento(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold rounded-xl"
                            placeholder="Ex: 500.00"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">
                            Adiantamento Concedido
                          </label>
                          <div className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-not-allowed">
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Sem adiantamento na Compra Imediata</span>
                          </div>
                        </div>
                      )}

                      {/* Payment Method */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Forma de Pagamento
                        </label>
                        <select
                          value={formaPagamentoPrevista}
                          onChange={(e) => setFormaPagamentoPrevista(e.target.value as FormaPagamento)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold rounded-xl"
                        >
                          <option value="PIX">PIX</option>
                          <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
                          <option value="Transferência Bancária (TED/DOC)">Transferência (TED)</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      {/* Delivery Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Previsão de Entrega
                        </label>
                        <input
                          type="date"
                          value={dataPrevistaEntrega}
                          onChange={(e) => setDataPrevistaEntrega(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold rounded-xl"
                        />
                      </div>

                      {/* Documento Fiscal / NFP */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nota Fiscal / NFP (Se houver)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: NFP 004281"
                          value={documentoFiscal}
                          onChange={(e) => setDocumentoFiscal(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold rounded-xl"
                        />
                      </div>

                      {/* Observações */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Observações da Negociação
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Entrega na rampa do galpão"
                          value={observacoesCompra}
                          onChange={(e) => setObservacoesCompra(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Explanatory badge about adiantamento according to price modality */}
                    {!isCompraImediata && (
                      <div className="pt-1">
                        {tipoPreco === 'FECHADO' ? (
                          <div className="p-3 bg-amber-100/90 border border-amber-300 rounded-2xl text-xs text-amber-950 font-medium flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <strong>Preço Fechado:</strong> O adiantamento de <strong>{formatBRL(adiantamento)}</strong> no preço fixado de <strong>{formatBRL(valorPorHectolitro)}/HL</strong> corresponde e trava{' '}
                              <strong className="text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">
                                {valorPorHectolitro > 0 ? (adiantamento / valorPorHectolitro).toFixed(1) : 0} HL ({valorPorHectolitro > 0 ? ((adiantamento / valorPorHectolitro) * LATAS_PER_HL).toFixed(0) : 0} latas)
                              </strong>{' '}
                              de castanhas a serem entregues futuramente.
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-blue-100/90 border border-blue-300 rounded-2xl text-xs text-blue-950 font-medium flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                            <div>
                              <strong>Preço Aberto:</strong> O adiantamento de <strong>{formatBRL(adiantamento)}</strong> é um adiantamento financeiro em dinheiro. <strong>Não há quantidade de castanhas definida antecipadamente</strong>. A quantidade equivalente de castanhas e o acerto de contas serão apurados somente no momento do recebimento no galpão.
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary Total Box */}
                    <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">
                          Valor Total Estimado da Compra
                        </span>
                        <span className="text-xl font-black text-white">
                          {!isCompraImediata && tipoPreco === 'ABERTO'
                            ? 'A Definir no Recebimento'
                            : formatBRL(quantidadeHectolitrosPrevista * valorPorHectolitro)}
                        </span>
                      </div>
                      <div className="text-right text-xs text-slate-300">
                        <span>
                          Volume: <strong>{quantidadeHectolitrosPrevista} HL</strong> ({hlToLatas(quantidadeHectolitrosPrevista)} latas)
                          {!isCompraImediata && tipoPreco === 'ABERTO' && ' [Estimativa]'}
                        </span>
                        {!isCompraImediata && adiantamento > 0 && (
                          <span className="block text-emerald-400 font-bold">Adiantamento em dinheiro: {formatBRL(adiantamento)}</span>
                        )}
                      </div>
                    </div>

                    {/* Submit Purchase Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleConcluirNovaCompra}
                        className={`px-6 py-3 text-white font-extrabold rounded-2xl text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                          isCompraImediata
                            ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-900/20'
                            : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
                        }`}
                      >
                        {isCompraImediata ? (
                          <>
                            <Zap className="w-5 h-5" />
                            CONCLUIR COMPRA IMEDIATA (ENTRADA NO ESTOQUE)
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            REGISTRAR CONTRATO DE COMPRA FUTURA
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* FLUXO NOVO RECEBIMENTO (FÍSICO NO GALPÃO) */}
          {operacaoTipo === 'recebimento' && !completedReceipt && (
            <>
              {/* PASSO 1: SELEÇÃO DE FORNECEDOR E VINCULO DE COMPRA */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Banner showing if linked to an open purchase */}
                  {selectedCompraId ? (
                    <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-950 rounded-2xl flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Recebimento conectado à Compra em Aberto #{compras.find(c => c.id === selectedCompraId)?.codigo}</span>
                      </div>
                      <button
                        onClick={() => setSelectedCompraId(null)}
                        className="text-[10px] bg-emerald-200 hover:bg-emerald-300 text-emerald-950 px-2 py-1 rounded-md cursor-pointer"
                      >
                        Desvincular Compra
                      </button>
                    </div>
                  ) : (
                    comprasPendentes.length > 0 && (
                      <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Existem compras em aberto pendentes de recebimento no sistema:
                          </span>
                          {searchFornecedor && (
                            <span className="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-2 py-0.5 rounded-full">
                              Filtro: "{searchFornecedor}" ({filteredComprasPendentes.length} de {comprasPendentes.length})
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {filteredComprasPendentes.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleSelectOpenCompra(c)}
                              className="p-2.5 bg-white border border-amber-300 hover:border-amber-600 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-all hover:shadow-xs"
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-slate-900">{c.codigo}</strong>
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                    c.tipoPreco === 'ABERTO' ? 'bg-blue-100 text-blue-950 border border-blue-200' : 'bg-amber-100 text-amber-950 border border-amber-200'
                                  }`}>
                                    {c.tipoPreco === 'ABERTO' ? '🔓 Preço Aberto' : '🔒 Preço Fechado'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectOpenCompra(c);
                                  }}
                                  className="text-slate-700 text-[11px] font-medium hover:text-emerald-800 text-left cursor-pointer group mt-0.5 block"
                                >
                                  Fornecedor: <strong className="text-emerald-900 font-extrabold group-hover:underline">{c.fornecedorNome}</strong> ({c.tipoPreco === 'ABERTO' ? 'Vol. Est. ' : ''}{c.quantidadeHectolitrosPrevista} HL)
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintContrato(c);
                                  }}
                                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-1 rounded flex items-center gap-1 cursor-pointer border border-amber-300"
                                  title="Imprimir Contrato A4"
                                >
                                  <Printer className="w-3 h-3 text-slate-950 stroke-[2.5]" />
                                  <span>Contrato</span>
                                </button>
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-1 rounded">
                                  Carregar Dados
                                </span>
                              </div>
                            </div>
                          ))}
                          {filteredComprasPendentes.length === 0 && (
                            <div className="col-span-2 p-3 text-center text-xs text-amber-900 italic bg-amber-100/50 rounded-xl">
                              Nenhuma compra em aberto atende ao termo "{searchFornecedor}".
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}

                  {/* Supplier Search Bar (filtering from 1 character) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Selecionar Fornecedor da Castanha *
                      </label>
                      <button
                        onClick={() => setIsCreatingFornecedorInline(!isCreatingFornecedorInline)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isCreatingFornecedorInline ? 'Cancelar Cadastro' : 'Cadastrar Novo Fornecedor'}
                      </button>
                    </div>

                    {/* Inline Supplier Form */}
                    {isCreatingFornecedorInline && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3">
                        <span className="text-xs font-black text-emerald-900 block">Cadastrar Novo Fornecedor</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Nome Completo *"
                            value={newFornData.nomeCompleto}
                            onChange={(e) => setNewFornData({ ...newFornData, nomeCompleto: e.target.value })}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          />
                          <input
                            type="text"
                            placeholder="CPF/CNPJ *"
                            value={newFornData.cpfCnpj}
                            onChange={(e) => setNewFornData({ ...newFornData, cpfCnpj: e.target.value })}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Comunidade (Ex: Arumanduba)"
                            value={newFornData.comunidade}
                            onChange={(e) => setNewFornData({ ...newFornData, comunidade: e.target.value })}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={handleInlineSaveFornecedor}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
                          >
                            Salvar Fornecedor
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Supplier Selection Logic: Only show selected supplier once selected */}
                    {selectedFornecedor ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-emerald-50/90 border-2 border-emerald-600 rounded-2xl shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                <Check className="w-3 h-3" />
                                Fornecedor Selecionado
                              </span>
                              <span className="bg-white border border-emerald-300 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                                {selectedFornecedor.tipo}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedFornecedorId('')}
                              className="text-xs font-bold text-slate-700 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all border border-slate-300 hover:border-rose-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Clique para trocar de fornecedor"
                            >
                              <X className="w-3.5 h-3.5 text-rose-500" />
                              Trocar / Alterar Fornecedor
                            </button>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                              {selectedFornecedor.nomeCompleto}
                            </h3>
                            <p className="text-xs text-slate-600 mt-0.5">
                              CPF/CNPJ: <strong>{selectedFornecedor.cpfCnpj}</strong> • Comunidade: <strong>{selectedFornecedor.comunidade || 'N/I'}</strong> ({selectedFornecedor.municipio || 'PA'})
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              Origem cadastrada: <strong className="text-slate-700">{selectedFornecedor.localOrigemCastanha || 'Monte Dourado'}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Comprador Responsável pela Operação */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-emerald-700" />
                              <span>Comprador Responsável *</span>
                            </label>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              tipoFinanciador === 'ProprietarioTerceiro' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {tipoFinanciador === 'ProprietarioTerceiro' ? 'Financiador Externo' : 'Usina Monte Dourado'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <select
                                value={selectedCompradorId}
                                onChange={(e) => setSelectedCompradorId(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                              >
                                {compradores.map((comp) => (
                                  <option key={comp.id} value={comp.id}>
                                    {comp.nome} ({comp.perfil}) — {comp.tipoVinculoComprador === 'ProprietarioTerceiro' ? `Terceiro: ${comp.proprietarioTerceiroNome}` : `Usina: ${comp.unidadeNome || 'Monte Dourado'}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="p-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                                tipoFinanciador === 'ProprietarioTerceiro' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}>
                                {tipoFinanciador === 'ProprietarioTerceiro' ? 'TERC' : 'USIN'}
                              </div>
                              <div className="overflow-hidden">
                                <span className="text-[9px] font-extrabold text-slate-500 uppercase block truncate">
                                  Subordinação:
                                </span>
                                <strong className="text-xs font-black text-slate-900 block truncate">
                                  {proprietarioNome}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Buscar fornecedor por nome, CPF/CNPJ, comunidade ou município (digite a partir de 1 caractere)..."
                            value={searchFornecedor}
                            onChange={(e) => setSearchFornecedor(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                          />
                          {searchFornecedor && (
                            <button
                              type="button"
                              onClick={() => setSearchFornecedor('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                            >
                              Limpar
                            </button>
                          )}
                        </div>

                        {/* Supplier Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                          {filteredFornecedores.map((f) => {
                            return (
                              <div
                                key={f.id}
                                onClick={() => setSelectedFornecedorId(f.id)}
                                className="p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xs group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-slate-900 group-hover:text-emerald-800 text-xs sm:text-sm text-left">
                                    {f.nomeCompleto}
                                  </span>
                                  <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                                    {f.tipo}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 mt-1">
                                  CPF/CNPJ: <strong>{f.cpfCnpj}</strong> • Comunidade: <strong>{f.comunidade || 'N/I'}</strong> ({f.municipio || 'PA'})
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  Origem cadastrada: <strong className="text-slate-700">{f.localOrigemCastanha || 'Monte Dourado'}</strong>
                                </div>
                              </div>
                            );
                          })}
                          {filteredFornecedores.length === 0 && (
                            <div className="col-span-2 p-4 text-center text-xs text-slate-500 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              Nenhum fornecedor encontrado para esta busca.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Financial Negotiation & Expenses */}
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                      <DollarSign className="w-4 h-4 text-emerald-700" />
                      Negociação Financeira, Preço e Custos
                    </div>

                    {selectedCompraId && (() => {
                      const linkedCompra = compras.find(c => c.id === selectedCompraId);
                      if (!linkedCompra) return null;
                      if (linkedCompra.tipoPreco === 'ABERTO') {
                        return (
                          <div className="p-3 bg-blue-50 border border-blue-300 rounded-2xl text-xs text-blue-950 font-medium flex items-start gap-2">
                            <Unlock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-black text-blue-900">
                                Contrato Conectado em Preço Aberto (Adiantamento: {formatBRL(linkedCompra.adiantamento)})
                              </strong>
                              <p className="text-[11px] text-blue-800 leading-tight mt-0.5">
                                Defina abaixo o Preço Negociado por HL para esta carga. Com base no preço de {formatBRL(valorPorHectolitro)}/HL, o adiantamento em dinheiro de {formatBRL(linkedCompra.adiantamento)} abaterá do valor final e corresponderá a{' '}
                                <strong className="text-blue-950 bg-blue-100 px-1 py-0.2 rounded font-bold">
                                  {valorPorHectolitro > 0 ? (linkedCompra.adiantamento / valorPorHectolitro).toFixed(1) : 0} HL ({valorPorHectolitro > 0 ? ((linkedCompra.adiantamento / valorPorHectolitro) * LATAS_PER_HL).toFixed(0) : 0} latas)
                                </strong>.
                              </p>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 font-medium space-y-1">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                              <strong className="font-extrabold text-amber-900">
                                Contrato Conectado: #{linkedCompra.codigo} (Preço Contratado do Adiantamento: {formatBRL(linkedCompra.valorPorHectolitro)}/HL)
                              </strong>
                            </div>
                            <p className="text-[11px] text-amber-900 leading-relaxed">
                              📌 <strong>Regra de Preço:</strong> O preço de {formatBRL(linkedCompra.valorPorHectolitro)}/HL do contrato vincula <strong>exclusivamente o volume relativo ao adiantamento ({formatBRL(linkedCompra.adiantamento)})</strong>, cobrindo <strong>{volumeCobertoAdiantamentoHl.toFixed(1)} HL ({volumeCobertoAdiantamentoLatas} latas)</strong>.
                            </p>
                            <p className="text-[11px] text-emerald-900 bg-emerald-100/80 p-2 rounded-xl font-bold">
                              💡 O saldo na medição entregue além de {volumeCobertoAdiantamentoHl.toFixed(1)} HL é calculado pelo <strong>Preço Aberto da Medição ({formatBRL(valorPorHectolitro)}/HL)</strong>.
                            </p>
                          </div>
                        );
                      }
                    })()}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Price per HL / Saldo price */}
                      <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500">
                        <label className="block text-[11px] font-black text-emerald-950 mb-1">
                          {linkedCompra ? 'Preço do Saldo da Medição (R$/HL) *' : 'Preço Negociado (R$/HL) *'}
                        </label>
                        <input
                          type="number"
                          value={valorPorHectolitro}
                          onChange={(e) => setValorPorHectolitro(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-emerald-50/50 border border-emerald-300 font-black text-lg text-emerald-950 rounded-xl focus:outline-none"
                        />
                        <span className="text-[10px] text-emerald-800 font-bold mt-1 block">
                          = {formatBRL(valorPorHectolitro / LATAS_PER_HL)} / lata
                          {linkedCompra && (
                            <span className="text-amber-900 block font-normal text-[9px] mt-0.5">
                              (Aplica-se ao saldo que exceder o adiantamento)
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Freight */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Despesas Fluviais / Frete (R$)
                        </label>
                        <input
                          type="number"
                          value={frete}
                          onChange={(e) => setFrete(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold rounded-xl"
                          placeholder="Ex: 200"
                        />
                      </div>

                      {/* Advance - Only if linked to an open purchase contract */}
                      {selectedCompraId ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Adiantamento do Contrato (R$)
                          </label>
                          <input
                            type="number"
                            value={adiantamento}
                            onChange={(e) => setAdiantamento(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold rounded-xl"
                            placeholder="Ex: 500"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">
                            Adiantamento / Adiantado
                          </label>
                          <div className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-not-allowed">
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Sem adiantamento na Compra Imediata</span>
                          </div>
                        </div>
                      )}

                      {/* Fiscal Doc */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nota Fiscal / NFP
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: NFP 004281"
                          value={documentoFiscal}
                          onChange={(e) => setDocumentoFiscal(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-bold rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASSO 2: MEDIÇÃO E AVALIAÇÃO DE QUALIDADE (AMOSTRA 100 CASTANHAS) */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Volume measurement in HL */}
                  <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                        Medição e Quantidade Entregue
                      </span>
                      <span className="text-xs text-slate-600 font-semibold">
                        Sem equivalência em KG • Medição direta em Hectolitros
                      </span>
                    </div>

                    {linkedCompra && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 font-medium flex items-center justify-between">
                        <div>
                          <strong className="text-amber-900 font-extrabold">Contrato Vinculado: #{linkedCompra.codigo}</strong>
                          <span className="text-amber-800 ml-2">
                            • Adiantamento: <strong>{formatBRL(adiantamentoContrato)}</strong> ({volumeCobertoAdiantamentoHl.toFixed(1)} HL a {formatBRL(precoContrato || valorPorHectolitro)}/HL)
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded-md">
                          Preço Fixado no Adiantamento
                        </span>
                      </div>
                    )}

                    {linkedCompra && volumeSaldoMedicaoHl > 0 && (
                      <div className="p-4 bg-gradient-to-r from-emerald-100 to-amber-50 border-2 border-emerald-500 rounded-2xl space-y-2 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-300/60 pb-2">
                          <div className="flex items-center gap-2 text-emerald-950 font-black text-xs sm:text-sm">
                            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
                            <span>⚡ Saldo na Medição: +{volumeSaldoMedicaoHl.toFixed(1)} HL (+{volumeSaldoMedicaoLatas} latas)</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-400">
                            <label className="text-[11px] font-black text-emerald-950 whitespace-nowrap">
                              Precificar Saldo (R$/HL):
                            </label>
                            <input
                              type="number"
                              value={valorPorHectolitro}
                              onChange={(e) => setValorPorHectolitro(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-0.5 bg-emerald-50 border border-emerald-300 font-black text-sm text-emerald-950 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          A entrega líquida atual de <strong className="text-emerald-900 font-extrabold">{quantidadeLiquidaHl} HL</strong> supera o volume coberto pelo adiantamento (<strong>{volumeCobertoAdiantamentoHl.toFixed(1)} HL</strong> a {formatBRL(precoContrato)}/HL). O saldo excedente de <strong className="text-emerald-900 font-bold">{volumeSaldoMedicaoHl.toFixed(1)} HL</strong> é precificado a <strong className="text-emerald-950 font-black">{formatBRL(valorPorHectolitro)}/HL</strong> = <strong className="text-emerald-950 bg-emerald-200 px-1.5 py-0.5 rounded font-black">{formatBRL(valorVolumeSaldoMedicao)}</strong>.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-sm">
                        <label className="block text-xs font-black text-emerald-950 mb-1">
                          Volume Bruto Recebido (Hectolitros / HL) *
                        </label>
                        <input
                          type="number"
                          value={quantidadeBrutaHl}
                          onChange={(e) => setQuantidadeBrutaHl(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 bg-emerald-50 border border-emerald-300 font-black text-2xl text-emerald-950 rounded-xl focus:outline-none"
                        />
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">
                          Equivalência Automática em Latas (1 HL = 5 Latas)
                        </span>
                        <span className="text-3xl font-black text-slate-900 block mt-1">
                          {quantidadeBrutaLatas} <span className="text-xs font-bold text-slate-500">latas</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sample evaluation out of 100 nuts */}
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-700" />
                          Avaliação de Qualidade (Amostra de 100 Castanhas)
                        </h4>
                        <p className="text-xs text-slate-500">
                          Contagem para cada 100 castanhas amostradas. Isenção até 10% de não conformidades.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Total Defeitos:</span>
                        <span className={`text-sm font-black px-3 py-1 rounded-full ${
                          totalNaoConformidadePct > 10 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {totalNaoConformidadePct}% ({totalNaoConformidadePct}/100)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-white rounded-2xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Xoxas / Vazias</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={xoxasAmostra}
                          onChange={(e) => setXoxasAmostra(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-bold text-sm text-slate-900 rounded-xl"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-2xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Podres / Mofadas</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={podresAmostra}
                          onChange={(e) => setPodresAmostra(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-bold text-sm text-slate-900 rounded-xl"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-2xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Brocadas / Furadas</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={brocadasAmostra}
                          onChange={(e) => setBrocadasAmostra(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-bold text-sm text-slate-900 rounded-xl"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-2xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Impurezas / Cascas</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={impurezasAmostra}
                          onChange={(e) => setImpurezasAmostra(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-bold text-sm text-slate-900 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Result calculation display */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Percentual Total de Não Conformidade:</span>
                        <span className="font-extrabold text-white">{totalNaoConformidadePct}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Tolerância Isenta de Desconto:</span>
                        <span className="font-bold text-emerald-400">Até 10% (Isento)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2 font-bold">
                        <span className="text-amber-400">Desconto Aplicado (Excedente &gt; 10%):</span>
                        <span className="text-amber-400 font-black">
                          {excedenteDescontoPct}% (-{descontoAutomaticoHl} HL / -{hlToLatas(descontoAutomaticoHl)} latas)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-2 font-black">
                        <span className="text-emerald-400">Volume Líquido Aprovado:</span>
                        <span className="text-emerald-400 text-base">
                          {quantidadeLiquidaHl} HL ({quantidadeLiquidaLatas} latas)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASSO 3: LOTE INDUSTRIAL E CONFIRMAÇÃO */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Passo 3: Lote Industrial e Armazenamento
                    </h3>
                    <p className="text-xs text-slate-500">
                      Entrada direta no Estoque Geral • Defina a associação do Lote Industrial (Padrão 80 HL)
                    </p>
                  </div>

                  {/* Lote Choice */}
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                      Associação de Lote Industrial
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setOpcaoLote('novo')}
                        className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          opcaoLote === 'novo' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200'
                        }`}
                      >
                        <input type="radio" checked={opcaoLote === 'novo'} onChange={() => {}} />
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">Criar Novo Lote Automático</span>
                          <span className="text-[11px] text-slate-500">Gera um código de lote exclusivo para este recebimento</span>
                        </div>
                      </label>

                      <label
                        onClick={() => setOpcaoLote('existente')}
                        className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          opcaoLote === 'existente' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200'
                        }`}
                      >
                        <input type="radio" checked={opcaoLote === 'existente'} onChange={() => {}} />
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">Vincular a Lote Existente</span>
                          <span className="text-[11px] text-slate-500">Agrupa a carga em um lote já em formação no estoque</span>
                        </div>
                      </label>
                    </div>

                    {opcaoLote === 'existente' && (
                      <div className="pt-2">
                        <select
                          value={loteExistenteId}
                          onChange={(e) => setLoteExistenteId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                        >
                          {lotes.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.codigo} — {l.origemDominante} ({l.quantidadeAtualHl} HL disponíveis)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          Resumo do Recebimento {linkedCompra ? `(Contrato #${linkedCompra.codigo})` : ''}
                        </span>
                        <h4 className="text-base font-black text-white">{selectedFornecedor?.nomeCompleto}</h4>
                      </div>
                      <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">
                        {selectedFornecedor?.comunidade || 'Arumanduba'} ({selectedFornecedor?.municipio || 'Almeirim'})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Volume Bruto Entregue</span>
                        <strong className="text-white text-sm">{quantidadeBrutaHl} HL</strong> ({quantidadeBrutaLatas} latas)
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Não Conformidade</span>
                        <strong className={excedenteDescontoPct > 0 ? 'text-rose-400 text-sm' : 'text-emerald-400 text-sm'}>
                          {totalNaoConformidadePct}%
                        </strong> {excedenteDescontoPct > 0 ? `(-${descontoAutomaticoHl} HL)` : ''}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Volume Líquido Aprovado</span>
                        <strong className="text-emerald-400 text-sm">{quantidadeLiquidaHl} HL</strong> ({quantidadeLiquidaLatas} latas)
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Valor Bruto da Carga</span>
                        <strong className="text-amber-400 text-sm">{formatBRL(valorBrutoCompra)}</strong>
                      </div>
                    </div>

                    {linkedCompra && (
                      <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
                        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                              📌 1. Adiantamento Concedido no Contrato #{linkedCompra.codigo}
                            </span>
                            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-md font-bold border border-amber-500/30">
                              {formatBRL(adiantamentoContrato)} Adiantados
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-200 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Preço Unit. no Adiantamento</span>
                              <strong className="text-amber-300 font-extrabold text-xs">{formatBRL(precoContrato)}/HL</strong>
                              <span className="text-[9px] text-slate-400 block">({formatBRL(precoContrato / LATAS_PER_HL)}/lata)</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Qtd. Representada no Adiant.</span>
                              <strong className="text-white font-extrabold text-xs">{volumeCobertoAdiantamentoHl.toFixed(1)} HL</strong>
                              <span className="text-[9px] text-slate-400 block">({volumeCobertoAdiantamentoLatas} latas)</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Amortização nesta Medição</span>
                              <strong className="text-amber-300 font-extrabold text-xs">{formatBRL(valorVolumeCoberto)}</strong>
                              <span className="text-[9px] text-amber-400/80 block">({volumeCobertoEfetivoHl.toFixed(1)} HL amortizados)</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                            <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                              ⚡ 2. Saldo na Medição (Preço Aberto)
                            </span>
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-500/30">
                              {volumeSaldoMedicaoHl.toFixed(1)} HL Excedentes
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-200 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Preço Unit. no Saldo</span>
                              <strong className="text-emerald-300 font-extrabold text-xs">{formatBRL(valorPorHectolitro)}/HL</strong>
                              <span className="text-[9px] text-slate-400 block">({formatBRL(valorPorHectolitro / LATAS_PER_HL)}/lata)</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Qtd. no Saldo da Medição</span>
                              <strong className="text-white font-extrabold text-xs">{volumeSaldoMedicaoHl.toFixed(1)} HL</strong>
                              <span className="text-[9px] text-slate-400 block">({volumeSaldoMedicaoLatas} latas)</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Valor Bruto do Saldo</span>
                              <strong className="text-emerald-400 font-extrabold text-xs">{formatBRL(valorVolumeSaldoMedicao)}</strong>
                              <span className="text-[9px] text-emerald-400/80 block">({volumeSaldoMedicaoHl.toFixed(1)} HL × {formatBRL(valorPorHectolitro)})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-slate-300 pt-1 px-1">
                          <span>(-) Abatimento do Adiantamento no Recebimento:</span>
                          <span className="font-bold text-rose-300">-{formatBRL(adiantamentoContrato)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm font-black pt-2 border-t border-slate-800 px-1">
                          <span className="text-emerald-400">
                            {saldoAPagarFornecedor > 0 ? 'Saldo Financeiro Final a Pagar ao Fornecedor:' : 'Crédito de Adiantamento Restante:'}
                          </span>
                          <span className="text-emerald-400 text-base bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-500/30">
                            {formatBRL(saldoAPagarFornecedor > 0 ? saldoAPagarFornecedor : saldoAdiantamentoRestante)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                      <span>Origem: {selectedFornecedor?.localOrigemCastanha || 'Monte Dourado'}</span>
                      <span>Destino: Armazenado no Estoque Geral</span>
                      <span>Preço/HL: {formatBRL(valorPorHectolitro)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Wizard Footer Controls */}
        {operacaoTipo === 'recebimento' && !completedReceipt && (
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-sm flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 shadow cursor-pointer"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConcluirRecebimento}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-lg hover:shadow-emerald-600/30 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                CONCLUIR RECEBIMENTO
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
