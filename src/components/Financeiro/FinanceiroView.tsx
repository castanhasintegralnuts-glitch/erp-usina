import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContaPagar, ContaReceber, FormaPagamento, Recebimento, TipoCastanhaExpedicao } from '../../types';
import { formatBRL, formatDateBR } from '../../utils/conversions';
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  X,
  FileCheck2,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  BarChart3,
  FileText,
  Repeat,
  Receipt,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Filter
} from 'lucide-react';

export const FinanceiroView: React.FC = () => {
  const {
    recebimentos,
    contasPagar,
    contasReceber,
    addContaPagar,
    registrarPagamentoContaPagar,
    addContaReceber,
    registrarRecebimentoContaReceber,
    registrarPagamento,
    gerarDocumento,
    setDocPreview,
    addToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'contas-pagar' | 'contas-receber' | 'fluxo-caixa' | 'relatorios'
  >('contas-pagar');

  // Subfilters for Contas a Pagar
  const [filterCP, setFilterCP] = useState<'todas' | 'agendadas' | 'materia-prima'>('todas');

  // Subfilters for Contas a Receber
  const [filterCR, setFilterCR] = useState<'todas' | 'beneficiada' | 'in-natura'>('todas');

  // Modal State: Nova Conta a Pagar
  const [showModalNewCP, setShowModalNewCP] = useState(false);
  const [formCP, setFormCP] = useState({
    descricao: '',
    fornecedorNome: '',
    categoria: 'Insumos & Operacional',
    tipo: 'Agendada' as 'Agendada' | 'Recorrente',
    frequenciaRecorrencia: 'Mensal' as 'Mensal' | 'Semanal' | 'Quinzenal' | 'Anual',
    valorTotal: '',
    dataVencimento: new Date().toISOString().split('T')[0],
    dataAgendamento: new Date().toISOString().split('T')[0],
    formaPagamentoPreferida: 'PIX' as FormaPagamento,
    banco: 'Banpará',
    observacoes: '',
  });

  // Modal State: Nova Conta a Receber Avulsa
  const [showModalNewCR, setShowModalNewCR] = useState(false);
  const [formCR, setFormCR] = useState({
    clienteNome: '',
    tipoCastanha: 'Castanha Beneficiada' as TipoCastanhaExpedicao,
    descricao: 'Venda de Amêndoas Faturamento Direto',
    valorTotal: '',
    dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observacoes: '',
  });

  // Modal State: Baixar Pagamento em Contas a Pagar (Agendada / MP)
  const [selectedCPForPay, setSelectedCPForPay] = useState<ContaPagar | null>(null);
  const [selectedMPForPay, setSelectedMPForPay] = useState<Recebimento | null>(null);
  const [valorPayCP, setValorPayCP] = useState<number>(0);
  const [formaPayCP, setFormaPayCP] = useState<FormaPagamento>('PIX');
  const [bancoPayCP, setBancoPayCP] = useState<string>('Banpará');
  const [obsPayCP, setObsPayCP] = useState<string>('');

  // Modal State: Baixar Recebimento em Contas a Receber
  const [selectedCRForReceive, setSelectedCRForReceive] = useState<ContaReceber | null>(null);
  const [valorReceiveCR, setValorReceiveCR] = useState<number>(0);
  const [formaReceiveCR, setFormaReceiveCR] = useState<FormaPagamento>('PIX');
  const [bancoReceiveCR, setBancoReceiveCR] = useState<string>('Banpará');
  const [obsReceiveCR, setObsReceiveCR] = useState<string>('');

  // Totals for Contas a Pagar
  const validRecs = recebimentos.filter((r) => !r.cancelado);
  const totalMPLiquido = validRecs.reduce((acc, r) => acc + r.compra.valorLiquido, 0);
  const totalMPPago = validRecs.reduce((acc, r) => {
    const pags = r.compra.pagamentosEfetuados || [];
    return acc + pags.reduce((sum, p) => sum + p.valor, 0);
  }, 0);
  const totalMPPendente = Math.max(0, totalMPLiquido - totalMPPago);

  const totalCPAgendadas = contasPagar.reduce((acc, c) => acc + c.valorTotal, 0);
  const totalCPPagoAgendadas = contasPagar.reduce((acc, c) => acc + c.valorPago, 0);
  const totalCPPendenteAgendadas = contasPagar.reduce((acc, c) => acc + c.saldoDevedor, 0);

  const totalGeralPagarPendente = totalMPPendente + totalCPPendenteAgendadas;

  // Totals for Contas a Receber
  const totalCRGeral = contasReceber.reduce((acc, c) => acc + c.valorTotal, 0);
  const totalCRRecebido = contasReceber.reduce((acc, c) => acc + c.valorRecebido, 0);
  const totalCRPendente = contasReceber.reduce((acc, c) => acc + c.saldoAReceber, 0);

  const totalCRBeneficiada = contasReceber
    .filter((c) => c.tipoCastanha === 'Castanha Beneficiada')
    .reduce((acc, c) => acc + c.saldoAReceber, 0);

  const totalCRInNatura = contasReceber
    .filter((c) => c.tipoCastanha === 'Castanha In Natura / Com Casca')
    .reduce((acc, c) => acc + c.saldoAReceber, 0);

  // Handlers for CP
  const handleOpenPayCPModal = (cp: ContaPagar) => {
    setSelectedCPForPay(cp);
    setSelectedMPForPay(null);
    setValorPayCP(cp.saldoDevedor);
    setObsPayCP(`Baixa de pagamento - ${cp.descricao}`);
  };

  const handleOpenPayMPModal = (rec: Recebimento) => {
    setSelectedMPForPay(rec);
    setSelectedCPForPay(null);
    const pags = rec.compra.pagamentosEfetuados || [];
    const pagoAteAgora = pags.reduce((sum, p) => sum + p.valor, 0);
    const rest = Math.max(0, rec.compra.valorLiquido - pagoAteAgora);
    setValorPayCP(rest);
    setObsPayCP('Pagamento a extrativista/fornecedor de matéria-prima');
  };

  const handleConfirmPayCP = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCPForPay) {
      if (valorPayCP <= 0) return;
      registrarPagamentoContaPagar(
        selectedCPForPay.id,
        valorPayCP,
        formaPayCP,
        bancoPayCP,
        obsPayCP
      );
      setSelectedCPForPay(null);
    } else if (selectedMPForPay) {
      if (valorPayCP <= 0) return;
      registrarPagamento(
        selectedMPForPay.id,
        valorPayCP,
        formaPayCP,
        bancoPayCP,
        obsPayCP,
        'Parcial'
      );
      setSelectedMPForPay(null);
    }
  };

  const handleCreateCP = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(formCP.valorTotal);
    if (!formCP.descricao || isNaN(val) || val <= 0) {
      addToast('Informe a Descrição e o Valor Total da conta.', 'error');
      return;
    }

    addContaPagar({
      descricao: formCP.descricao,
      fornecedorNome: formCP.fornecedorNome || 'Fornecedor Diversos',
      categoria: formCP.categoria,
      tipo: formCP.tipo,
      frequenciaRecorrencia: formCP.tipo === 'Recorrente' ? formCP.frequenciaRecorrencia : undefined,
      valorTotal: val,
      dataVencimento: formCP.dataVencimento,
      dataAgendamento: formCP.dataAgendamento,
      formaPagamentoPreferida: formCP.formaPagamentoPreferida,
      banco: formCP.banco,
      observacoes: formCP.observacoes,
    });

    setShowModalNewCP(false);
    setFormCP({
      descricao: '',
      fornecedorNome: '',
      categoria: 'Insumos & Operacional',
      tipo: 'Agendada',
      frequenciaRecorrencia: 'Mensal',
      valorTotal: '',
      dataVencimento: new Date().toISOString().split('T')[0],
      dataAgendamento: new Date().toISOString().split('T')[0],
      formaPagamentoPreferida: 'PIX',
      banco: 'Banpará',
      observacoes: '',
    });
  };

  // Handlers for CR
  const handleOpenReceiveCRModal = (cr: ContaReceber) => {
    setSelectedCRForReceive(cr);
    setValorReceiveCR(cr.saldoAReceber);
    setObsReceiveCR(`Recebimento ref. ${cr.codigo} - ${cr.clienteNome}`);
  };

  const handleConfirmReceiveCR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCRForReceive || valorReceiveCR <= 0) return;

    registrarRecebimentoContaReceber(
      selectedCRForReceive.id,
      valorReceiveCR,
      formaReceiveCR,
      bancoReceiveCR,
      obsReceiveCR
    );

    setSelectedCRForReceive(null);
  };

  const handleCreateCR = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(formCR.valorTotal);
    if (!formCR.clienteNome || isNaN(val) || val <= 0) {
      addToast('Informe o Nome do Cliente e Valor Total a receber.', 'error');
      return;
    }

    addContaReceber({
      clienteNome: formCR.clienteNome,
      tipoCastanha: formCR.tipoCastanha,
      descricao: formCR.descricao,
      valorTotal: val,
      dataVencimento: formCR.dataVencimento,
      observacoes: formCR.observacoes,
    });

    setShowModalNewCR(false);
    setFormCR({
      clienteNome: '',
      tipoCastanha: 'Castanha Beneficiada',
      descricao: 'Venda de Amêndoas Faturamento Direto',
      valorTotal: '',
      dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      observacoes: '',
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Usina Monte Dourado — Módulo Financeiro Integrado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Contas a Pagar & Receber</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Agendamentos recorrentes, contas a pagar operacionais, liquidação de matéria-prima e faturamento a receber atrelado a expedições de castanha beneficiada e in natura.
          </p>
        </div>

        <button
          onClick={() => setDocPreview({
            tipo: 'Relatório Consolidado',
            data: {
              docMeta: {
                numeroDocumento: 'MD-FIN-CONSOLIDADO',
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                horarioEmissao: '10:00',
                codigoRastreabilidade: `MD-FIN-${Date.now().toString().slice(-5)}`,
                responsavel: 'FÁBRICA INTEGRAL NUTS',
              },
              extraData: {
                titulo: 'EXTRATO CONSOLIDADO FINANCEIRO — USINA MONTE DOURADO',
                descricao: 'Demonstrativo sintético de obrigações a pagar e haveres a receber.',
                indicadores: [
                  { label: 'Total A Pagar Pendente', valor: formatBRL(totalGeralPagarPendente), detalhe: 'Insumos + MP' },
                  { label: 'Total A Receber Pendente', valor: formatBRL(totalCRPendente), detalhe: 'Beneficiada + In Natura' },
                  { label: 'Contas a Receber (Beneficiada)', valor: formatBRL(totalCRBeneficiada), detalhe: 'Faturamento Amêndoas' },
                  { label: 'Contas a Receber (In Natura)', valor: formatBRL(totalCRInNatura), detalhe: 'Faturamento Casca' },
                ]
              }
            }
          })}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Extrato Financeiro PDF</span>
        </button>
      </div>

      {/* USER REQUEST COMPACT INFO PANELS (Sleek, low height, 3 parallel cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Panel 1: Contas a Pagar (Total Devedor) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-[11px] uppercase tracking-wider">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Contas a Pagar Pendentes</span>
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{formatBRL(totalGeralPagarPendente)}</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
              MP: {formatBRL(totalMPPendente)} • Agendadas: {formatBRL(totalCPPendenteAgendadas)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Panel 2: Contas a Receber (A Haver) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Contas a Receber (Expedições)</span>
            </div>
            <div className="text-xl font-black text-emerald-700 mt-1">{formatBRL(totalCRPendente)}</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Beneficiada: {formatBRL(totalCRBeneficiada)} • In Natura: {formatBRL(totalCRInNatura)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Panel 3: Saldo Projetado / Previsão */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-[11px] uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Saldo Operacional Projetado</span>
            </div>
            <div className={`text-xl font-black mt-1 ${
              (totalCRPendente - totalGeralPagarPendente) >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {formatBRL(totalCRPendente - totalGeralPagarPendente)}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
              A Receber - A Pagar (Geral)
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Sub-Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'contas-pagar', label: 'Contas a Pagar (Agendadas / MP)', icon: Clock, count: contasPagar.filter(c => c.situacao !== 'Paga').length + validRecs.filter(r => r.compra.situacao !== 'Paga').length },
            { id: 'contas-receber', label: 'Contas a Receber (Expedições)', icon: CheckCircle2, count: contasReceber.filter(c => c.situacao !== 'Recebida').length },
            { id: 'fluxo-caixa', label: 'Fluxo de Caixa Consolidado', icon: Scale },
            { id: 'relatorios', label: 'Relatórios Financeiros', icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Tab 1: Contas a Pagar */}
      {activeSubTab === 'contas-pagar' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-700" />
                <span>Contas a Pagar — Agendamentos, Recorrentes & Matéria-Prima</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Gestão de contas agendadas (energia, frete, manutenção) e faturas de fornecedores/extrativistas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModalNewCP(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar / Criar Conta a Pagar</span>
              </button>
            </div>
          </div>

          {/* Sub-filters */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500 flex items-center gap-1 font-bold">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </span>
            <button
              onClick={() => setFilterCP('todas')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterCP === 'todas'
                  ? 'bg-slate-900 text-amber-400 font-extrabold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas as Contas ({contasPagar.length + validRecs.length})
            </button>
            <button
              onClick={() => setFilterCP('agendadas')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterCP === 'agendadas'
                  ? 'bg-slate-900 text-amber-400 font-extrabold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📅 Agendadas & Recorrentes ({contasPagar.length})
            </button>
            <button
              onClick={() => setFilterCP('materia-prima')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterCP === 'materia-prima'
                  ? 'bg-slate-900 text-amber-400 font-extrabold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🌱 Matéria-Prima & Fornecedores ({validRecs.length})
            </button>
          </div>

          {/* Table Contas a Pagar */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-3">Código / Origem</th>
                  <th className="p-3">Descrição / Credor</th>
                  <th className="p-3">Categoria / Tipo</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3 text-right">Valor Total</th>
                  <th className="p-3 text-right">Pago</th>
                  <th className="p-3 text-right">Saldo Devedor</th>
                  <th className="p-3 text-center">Situação</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {/* 1. Agendadas e Recorrentes */}
                {(filterCP === 'todas' || filterCP === 'agendadas') &&
                  contasPagar.map((cp) => (
                    <tr key={cp.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{cp.codigo}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {cp.descricao}
                        <span className="block text-[10px] text-slate-500 font-normal">{cp.fornecedorNome}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[10px] font-bold border border-slate-200 inline-flex items-center gap-1">
                          {cp.tipo === 'Recorrente' && <Repeat className="w-3 h-3 text-amber-600" />}
                          {cp.tipo} • {cp.categoria}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{formatDateBR(cp.dataVencimento)}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatBRL(cp.valorTotal)}</td>
                      <td className="p-3 text-right font-bold text-emerald-700">{formatBRL(cp.valorPago)}</td>
                      <td className="p-3 text-right font-black text-rose-700">{formatBRL(cp.saldoDevedor)}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            cp.situacao === 'Paga'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : cp.situacao === 'Parcial'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {cp.situacao}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {cp.saldoDevedor > 0 && (
                          <button
                            onClick={() => handleOpenPayCPModal(cp)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-xs"
                          >
                            Baixar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                {/* 2. Matéria Prima (Recebimentos) */}
                {(filterCP === 'todas' || filterCP === 'materia-prima') &&
                  validRecs.map((r) => {
                    const pags = r.compra.pagamentosEfetuados || [];
                    const pago = pags.reduce((sum, p) => sum + p.valor, 0);
                    const dev = Math.max(0, r.compra.valorLiquido - pago);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-emerald-800">{r.codigo}</td>
                        <td className="p-3 font-extrabold text-slate-900">
                          {r.fornecedorNome}
                          <span className="block text-[10px] text-slate-500 font-normal">Aquisição Matéria-Prima (Comunidade)</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded-md text-[10px] font-bold border border-emerald-200">
                            Matéria-Prima
                          </span>
                        </td>
                        <td className="p-3 font-bold">{r.data}</td>
                        <td className="p-3 text-right font-black text-slate-900">{formatBRL(r.compra.valorLiquido)}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{formatBRL(pago)}</td>
                        <td className="p-3 text-right font-black text-rose-700">{formatBRL(dev)}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              r.compra.situacao === 'Paga'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {r.compra.situacao}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {dev > 0 && (
                            <button
                              onClick={() => handleOpenPayMPModal(r)}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-xs"
                            >
                              Baixar MP
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Contas a Receber (atreladas a expedicoes) */}
      {activeSubTab === 'contas-receber' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Contas a Receber — Vendas e Expedições de Castanha</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Títulos gerados automaticamente a partir das saídas e embarques de Castanha Beneficiada (Amêndoas) e Castanha In Natura.
              </p>
            </div>

            <button
              onClick={() => setShowModalNewCR(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Conta a Receber Avulsa</span>
            </button>
          </div>

          {/* Sub-filters for Castanha Type */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500 flex items-center gap-1 font-bold">
              <Filter className="w-3.5 h-3.5" /> Tipo de Castanha:
            </span>
            <button
              onClick={() => setFilterCR('todas')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterCR === 'todas'
                  ? 'bg-slate-900 text-amber-400 font-extrabold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas ({contasReceber.length})
            </button>
            <button
              onClick={() => setFilterCR('beneficiada')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterCR === 'beneficiada'
                  ? 'bg-slate-900 text-amber-400 font-extrabold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✨ Castanha Beneficiada ({contasReceber.filter(c => c.tipoCastanha === 'Castanha Beneficiada').length})
            </button>
            <button
              onClick={() => setFilterCR('in-natura')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterCR === 'in-natura'
                  ? 'bg-slate-900 text-amber-400 font-extrabold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🌿 Castanha In Natura ({contasReceber.filter(c => c.tipoCastanha === 'Castanha In Natura / Com Casca').length})
            </button>
          </div>

          {/* Table Contas a Receber */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-3">Código CR</th>
                  <th className="p-3">Expedição</th>
                  <th className="p-3">Cliente / Comprador</th>
                  <th className="p-3">Tipo Castanha</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3 text-right">Valor Total</th>
                  <th className="p-3 text-right">Valor Recebido</th>
                  <th className="p-3 text-right">Saldo a Receber</th>
                  <th className="p-3 text-center">Situação</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {contasReceber
                  .filter((cr) => {
                    if (filterCR === 'beneficiada') return cr.tipoCastanha === 'Castanha Beneficiada';
                    if (filterCR === 'in-natura') return cr.tipoCastanha === 'Castanha In Natura / Com Casca';
                    return true;
                  })
                  .map((cr) => (
                    <tr key={cr.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-emerald-800">{cr.codigo}</td>
                      <td className="p-3 font-mono font-bold">
                        {cr.expedicaoCodigo ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-900 rounded-md text-[10px] font-mono border border-slate-300 inline-flex items-center gap-1">
                            <Truck className="w-3 h-3 text-emerald-600" />
                            {cr.expedicaoCodigo}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Avulsa</span>
                        )}
                      </td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {cr.clienteNome}
                        <span className="block text-[10px] text-slate-500 font-normal">{cr.descricao}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            cr.tipoCastanha === 'Castanha Beneficiada'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {cr.tipoCastanha}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{formatDateBR(cr.dataVencimento)}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatBRL(cr.valorTotal)}</td>
                      <td className="p-3 text-right font-bold text-emerald-700">{formatBRL(cr.valorRecebido)}</td>
                      <td className="p-3 text-right font-black text-amber-700">{formatBRL(cr.saldoAReceber)}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            cr.situacao === 'Recebida'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : cr.situacao === 'Parcial'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          {cr.situacao}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {cr.saldoAReceber > 0 && (
                          <button
                            onClick={() => handleOpenReceiveCRModal(cr)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] cursor-pointer shadow-xs"
                          >
                            Baixar Recebimento
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Fluxo de Caixa Consolidado */}
      {activeSubTab === 'fluxo-caixa' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Fluxo de Caixa Consolidado — Usina Monte Dourado</h3>
          <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs uppercase text-slate-400 font-bold block">Saldo Líquido Operacional Projetado</span>
              <span className="text-3xl font-black text-emerald-400 mt-1 block">
                {formatBRL(totalCRGeral - totalMPLiquido - totalCPAgendadas)}
              </span>
              <span className="text-xs text-slate-300 block mt-1 font-medium">
                Total de Receitas a Receber ({formatBRL(totalCRGeral)}) menos Obrigações Totais ({formatBRL(totalMPLiquido + totalCPAgendadas)})
              </span>
            </div>
            <Scale className="w-10 h-10 text-amber-400 shrink-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="font-extrabold text-xs text-emerald-950 uppercase block">Total de Entradas Previstas (Receitas)</span>
              <span className="text-xl font-black text-emerald-800 block mt-1">{formatBRL(totalCRGeral)}</span>
              <span className="text-[11px] text-emerald-700 block mt-1">Faturamento de vendas de castanha beneficiada e in natura</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
              <span className="font-extrabold text-xs text-rose-950 uppercase block">Total de Saídas Previstas (Despesas & MP)</span>
              <span className="text-xl font-black text-rose-800 block mt-1">{formatBRL(totalMPLiquido + totalCPAgendadas)}</span>
              <span className="text-[11px] text-rose-700 block mt-1">Pagamentos de matéria prima + contas operacionais agendadas</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Relatórios Financeiros */}
      {activeSubTab === 'relatorios' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Relatórios e Demonstrativos Financeiros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="font-extrabold text-sm block">Demonstrativo DRE por Lote de Beneficiamento</span>
              <span className="text-xs text-slate-500 block mt-1">Custo de aquisição da matéria prima x receita de venda de amêndoa beneficiada</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="font-extrabold text-sm block">Extrato de Pagamentos a Extrativistas & Comunidades</span>
              <span className="text-xs text-slate-500 block mt-1">Comprovantes de quitação por associação e fornecedor regional</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Nova Conta a Pagar */}
      {showModalNewCP && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Agendar / Cadastrar Conta a Pagar</h3>
              <button onClick={() => setShowModalNewCP(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCP} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Compromisso</label>
                <input
                  type="text"
                  placeholder="Ex: Energia Elétrica do Secador / Frete Balsa"
                  value={formCP.descricao}
                  onChange={(e) => setFormCP({ ...formCP, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fornecedor / Credor</label>
                  <input
                    type="text"
                    placeholder="Ex: Equatorial Energia / Transportes Jari"
                    value={formCP.fornecedorNome}
                    onChange={(e) => setFormCP({ ...formCP, fornecedorNome: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={formCP.categoria}
                    onChange={(e) => setFormCP({ ...formCP, categoria: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Insumos & Operacional">Insumos & Operacional</option>
                    <option value="Energia & Utilidades">Energia & Utilidades</option>
                    <option value="Frete & Logística">Frete & Logística</option>
                    <option value="Manutenção de Maquinário">Manutenção de Maquinário</option>
                    <option value="Folha de Pagamento">Folha de Pagamento</option>
                    <option value="Impostos & Taxas">Impostos & Taxas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Pagamento</label>
                  <select
                    value={formCP.tipo}
                    onChange={(e) => setFormCP({ ...formCP, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Agendada">Agendada (Única)</option>
                    <option value="Recorrente">Recorrente (Periódica)</option>
                  </select>
                </div>

                {formCP.tipo === 'Recorrente' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Frequência</label>
                    <select
                      value={formCP.frequenciaRecorrencia}
                      onChange={(e) => setFormCP({ ...formCP, frequenciaRecorrencia: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    >
                      <option value="Semanal">Semanal</option>
                      <option value="Quinzenal">Quinzenal</option>
                      <option value="Mensal">Mensal</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formCP.valorTotal}
                    onChange={(e) => setFormCP({ ...formCP, valorTotal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={formCP.dataVencimento}
                    onChange={(e) => setFormCP({ ...formCP, dataVencimento: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Informações adicionais para controle fiscal/bancário"
                  value={formCP.observacoes}
                  onChange={(e) => setFormCP({ ...formCP, observacoes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs cursor-pointer mt-2 shadow-xs"
              >
                Confirmar Agendamento de Conta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Nova Conta a Receber Avulsa */}
      {showModalNewCR && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Cadastrar Nova Conta a Receber Avulsa</h3>
              <button onClick={() => setShowModalNewCR(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCR} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cliente / Comprador</label>
                <input
                  type="text"
                  placeholder="Ex: Nutry Alimentos Ltda"
                  value={formCR.clienteNome}
                  onChange={(e) => setFormCR({ ...formCR, clienteNome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Castanha</label>
                <select
                  value={formCR.tipoCastanha}
                  onChange={(e) => setFormCR({ ...formCR, tipoCastanha: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="Castanha Beneficiada">Castanha Beneficiada (Amêndoa)</option>
                  <option value="Castanha In Natura / Com Casca">Castanha In Natura / Com Casca</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição da Venda</label>
                <input
                  type="text"
                  value={formCR.descricao}
                  onChange={(e) => setFormCR({ ...formCR, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formCR.valorTotal}
                    onChange={(e) => setFormCR({ ...formCR, valorTotal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={formCR.dataVencimento}
                    onChange={(e) => setFormCR({ ...formCR, dataVencimento: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs cursor-pointer mt-2 shadow-xs"
              >
                Cadastrar Título a Receber
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Baixa de Pagamento (Contas a Pagar / MP) */}
      {(selectedCPForPay || selectedMPForPay) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Registrar Baixa de Pagamento (Saída)</h3>
              <button
                onClick={() => {
                  setSelectedCPForPay(null);
                  setSelectedMPForPay(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayCP} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor do Pagamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorPayCP}
                  onChange={(e) => setValorPayCP(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Forma de Pagamento</label>
                <select
                  value={formaPayCP}
                  onChange={(e) => setFormaPayCP(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="PIX">PIX</option>
                  <option value="Dinheiro Em Espécie">Dinheiro em Espécie</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banco Origem</label>
                <input
                  type="text"
                  value={bancoPayCP}
                  onChange={(e) => setBancoPayCP(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observação</label>
                <input
                  type="text"
                  value={obsPayCP}
                  onChange={(e) => setObsPayCP(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs cursor-pointer mt-2 shadow-xs"
              >
                Confirmar Pagamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Baixa de Recebimento (Contas a Receber) */}
      {selectedCRForReceive && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Registrar Baixa de Recebimento (Entrada)</h3>
              <button onClick={() => setSelectedCRForReceive(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceiveCR} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor Recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorReceiveCR}
                  onChange={(e) => setValorReceiveCR(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Forma de Recebimento</label>
                <select
                  value={formaReceiveCR}
                  onChange={(e) => setFormaReceiveCR(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="PIX">PIX</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Dinheiro Em Espécie">Dinheiro em Espécie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banco Destino</label>
                <input
                  type="text"
                  value={bancoReceiveCR}
                  onChange={(e) => setBancoReceiveCR(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observação</label>
                <input
                  type="text"
                  value={obsReceiveCR}
                  onChange={(e) => setObsReceiveCR(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs cursor-pointer mt-2 shadow-xs"
              >
                Confirmar Recebimento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
