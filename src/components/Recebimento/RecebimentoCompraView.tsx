import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FornecedoresView } from '../Fornecedores/FornecedoresView';
import { EstoqueComCascaView } from '../EstoqueComCasca/EstoqueComCascaView';
import { LotesView } from '../Lotes/LotesView';
import { QuarentenaView } from '../Quarentena/QuarentenaView';
import { ExpectativasCompraView } from './ExpectativasCompraView';
import { formatBRL, formatNumber, LATAS_PER_HL, hlToLatas, latasToHl } from '../../utils/conversions';
import {
  Truck,
  PlusCircle,
  Users,
  History,
  Boxes,
  Layers,
  ShieldAlert,
  Calculator,
  Search,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Coins,
  DollarSign,
  ShoppingBag,
  Printer
} from 'lucide-react';

interface RecebimentoCompraViewProps {
  onOpenNovoRecebimento?: () => void;
  onOpenNovaCompra?: () => void;
}

export const RecebimentoCompraView: React.FC<RecebimentoCompraViewProps> = ({
  onOpenNovoRecebimento,
  onOpenNovaCompra,
}) => {
  const { recebimentos, fornecedores, compras = [], lotes, setDocPreview, gerarDocumento, expectativasCompra = [] } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'novo' | 'expectativas' | 'contratos' | 'fornecedores' | 'historico' | 'estoque' | 'lotes' | 'quarentena'
  >('novo');

  // Calculator State for Quilos / Latas / Hectolitros (1 hl = 5 latas)
  const [calcHl, setCalcHl] = useState<string>('10');
  const [calcLatas, setCalcLatas] = useState<string>('50');
  const [calcKg, setCalcKg] = useState<string>('500');
  const [fatorEstimadoKgHl, setFatorEstimadoKgHl] = useState<string>('50');

  const handleHlChange = (val: string) => {
    setCalcHl(val);
    const numHl = parseFloat(val) || 0;
    const numLatas = hlToLatas(numHl);
    setCalcLatas(String(numLatas));

    const fator = parseFloat(fatorEstimadoKgHl) || 50;
    setCalcKg(String(Math.round(numHl * fator)));
  };

  const handleLatasChange = (val: string) => {
    setCalcLatas(val);
    const numLatas = parseFloat(val) || 0;
    const numHl = latasToHl(numLatas);
    setCalcHl(String(numHl));

    const fator = parseFloat(fatorEstimadoKgHl) || 50;
    setCalcKg(String(Math.round(numHl * fator)));
  };

  const handleKgChange = (val: string) => {
    setCalcKg(val);
    const numKg = parseFloat(val) || 0;
    const fator = parseFloat(fatorEstimadoKgHl) || 50;
    const numHl = Math.round((numKg / fator) * 100) / 100;
    setCalcHl(String(numHl));
    setCalcLatas(String(hlToLatas(numHl)));
  };

  const handleFatorChange = (val: string) => {
    setFatorEstimadoKgHl(val);
    const numFator = parseFloat(val) || 50;
    const numHl = parseFloat(calcHl) || 0;
    setCalcKg(String(Math.round(numHl * numFator)));
  };

  const subNavItems = [
    { id: 'novo', label: 'Lançar Recebimento / Compra', icon: PlusCircle },
    { id: 'expectativas', label: 'Expectativas de Compra', icon: TrendingUp },
    { id: 'contratos', label: 'Contratos (Compra Futura)', icon: FileText },
    { id: 'fornecedores', label: 'Fornecedores', icon: Users },
    { id: 'historico', label: 'Histórico de Compras', icon: History },
    { id: 'estoque', label: 'Estoque Matéria-Prima', icon: Boxes },
    { id: 'lotes', label: 'Formação de Lotes', icon: Layers },
    { id: 'quarentena', label: 'Quarentena APPCC', icon: ShieldAlert },
  ];

  // 1. Castanhas Compradas (Entregues e Recebidas na Fábrica)
  const validRecs = recebimentos.filter((r) => !r.cancelado);
  const compradasVolHl = validRecs.reduce((acc, r) => acc + (r.quantidadeLiquidaHl || 0), 0);
  const compradasLatas = validRecs.reduce((acc, r) => acc + (r.quantidadeLiquidaLatas || 0), 0);
  const compradasKg = validRecs.reduce((acc, r) => acc + (r.pesoLiquidoKg || 0), 0);
  const valorInvestidoMP = validRecs.reduce((acc, r) => acc + (r.compra?.valorLiquido || 0), 0);

  // 2. Castanhas a Receber (Contratadas em Aberto / Pagas / Pendentes)
  const pendingCompras = (compras || []).filter((c) => c.status === 'Pendente de Recebimento');
  const aReceberVolHl = pendingCompras.reduce((acc, c) => acc + (c.quantidadeHectolitrosPrevista || 0), 0);
  const aReceberLatas = pendingCompras.reduce((acc, c) => acc + (c.quantidadeLatasPrevista || 0), 0);
  const aReceberKgEstimado = Math.round(aReceberVolHl * 50); // Fator base 50kg/HL
  const valorAdiantadoPAGO = pendingCompras.reduce((acc, c) => acc + (c.adiantamento || 0), 0);
  const valorTotalEstimadoContratos = pendingCompras.reduce((acc, c) => acc + (c.valorTotalEstimado || 0), 0);

  // Regra solicitada: "O total estimado não entra em compras a receber, somente entra em compras a receber a parte adiantada. O estimado entra em estimativa"
  const valorAInvestirMP = valorAdiantadoPAGO;

  // 3. Estimativa de Compra (Consolidado Safra: Compradas + A Receber + Expectativas Ativas)
  const totalVolumeExpectativasHl = (expectativasCompra || [])
    .filter((e) => e.status === 'Ativa')
    .reduce((acc, e) => {
      let hl = e.quantidadeEstimada;
      if (e.unidadeMedida === 'latas') hl /= 5;
      if (e.unidadeMedida === 'kg') hl /= 50;
      return acc + hl;
    }, 0);

  const estimativaTotalHl = compradasVolHl + aReceberVolHl + totalVolumeExpectativasHl;
  const estimativaTotalLatas = hlToLatas(estimativaTotalHl);
  const estimativaTotalKg = Math.round(estimativaTotalHl * 50);

  // 4. Consolidação de Valores
  // O valor total estimado entra na Estimativa da Safra
  const investimentoTotalSafra = valorInvestidoMP + valorTotalEstimadoContratos;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Recebimento e Compra</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Acompanhamento de castanhas compradas, volumes a receber (pagas/contratadas), estimativa de compra e valores investidos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setDocPreview({
                tipo: 'Relatório Consolidado',
                data: {
                  docMeta: {
                    numeroDocumento: 'MD-PDF-RECEB-GERAL',
                    dataEmissao: new Date().toLocaleDateString('pt-BR'),
                    horarioEmissao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    codigoRastreabilidade: `MD-REC-${Date.now().toString().slice(-5)}`,
                    responsavel: 'FÁBRICA INTEGRAL NUTS',
                  },
                  extraData: {
                    titulo: 'RELATÓRIO CONSOLIDADO — COMPRAS, RECEBIMENTO E INVESTIMENTOS',
                    descricao: 'Resumo das castanhas compradas (entregues), castanhas a receber (contratadas/pagas), estimativa de compra e visão de investimentos.',
                    indicadores: [
                      { label: 'Castanhas Compradas (Entregues)', valor: `${formatNumber(compradasVolHl, 1)} Hl (${formatNumber(compradasLatas, 0)} latas)`, detalhe: `${validRecs.length} cargas registradas` },
                      { label: 'Castanhas a Receber', valor: `${formatNumber(aReceberVolHl, 1)} Hl (${formatNumber(aReceberLatas, 0)} latas)`, detalhe: `${pendingCompras.length} ordens pendentes` },
                      { label: 'Estimativa de Compra Total', valor: `${formatNumber(estimativaTotalHl, 1)} Hl (${formatNumber(estimativaTotalLatas, 0)} latas)`, detalhe: `~${formatNumber(estimativaTotalKg, 0)} kg projetados` },
                      { label: 'Valores Investidos (Entregues)', valor: `R$ ${formatBRL(valorInvestidoMP)}`, detalhe: 'Total realizado' },
                      { label: 'Valores a Investir (A Receber)', valor: `R$ ${formatBRL(valorAInvestirMP)}`, detalhe: 'Compromissos em aberto' },
                      { label: 'Investimento Total Safra', valor: `R$ ${formatBRL(investimentoTotalSafra)}`, detalhe: 'Realizado + Contratado' },
                    ],
                    colunas: ['Código', 'Data', 'Fornecedor', 'Volume Hl', 'Latas', 'Peso Kg', 'Valor Total R$', 'Status'],
                    itens: validRecs.map((r) => [r.codigo, r.data, r.fornecedorNome, `${formatNumber(r.quantidadeLiquidaHl, 1)} hl`, `${formatNumber(r.quantidadeLiquidaLatas, 0)} latas`, `${formatNumber(r.pesoLiquidoKg, 0)} kg`, `R$ ${formatBRL(r.compra.valorLiquido)}`, r.compra.situacao])
                  }
                }
              });
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-amber-300"
          >
            <FileText className="w-4 h-4 text-slate-950" />
            <span>Gerar PDF Consolidado</span>
          </button>

          <button
            onClick={() => onOpenNovoRecebimento && onOpenNovoRecebimento()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Recebimento / Compra</span>
          </button>
        </div>
      </div>

      {/* Cards KPI: Castanhas Compradas, A Receber e Estimativa de Compra (Alinhados Lado a Lado - 3 Colunas) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Card 1: Castanhas Compradas */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-200 shadow-2xs hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Compradas</span>
              </span>
              <span className="text-[8px] sm:text-[9px] bg-emerald-100 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                {validRecs.length} Entregues
              </span>
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                {formatNumber(compradasVolHl, 1)} <span className="text-[10px] sm:text-xs text-slate-500 font-bold">HL</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold block mt-0.5 truncate">
                {formatNumber(compradasLatas, 0)} latas • {formatNumber(compradasKg, 0)} kg
              </span>
            </div>
          </div>
          <div className="pt-1.5 mt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-[10px] gap-1">
            <span className="text-slate-500 font-medium truncate">Investido:</span>
            <strong className="text-emerald-800 font-black shrink-0">{formatBRL(valorInvestidoMP)}</strong>
          </div>
        </div>

        {/* Card 2: Castanhas a Receber (Pagas/Contratadas) */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-amber-200 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">A Receber</span>
              </span>
              <span className="text-[8px] sm:text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                {pendingCompras.length} Pendentes
              </span>
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                {formatNumber(aReceberVolHl, 1)} <span className="text-[10px] sm:text-xs text-slate-500 font-bold">HL</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold block mt-0.5 truncate">
                {formatNumber(aReceberLatas, 0)} latas (~{formatNumber(aReceberKgEstimado, 0)} kg)
              </span>
            </div>
          </div>
          <div className="pt-1.5 mt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-[10px] gap-1">
            <span className="text-slate-500 font-medium truncate">Adiantado Pago:</span>
            <strong className="text-amber-800 font-black shrink-0">{formatBRL(valorAInvestirMP)}</strong>
          </div>
        </div>

        {/* Card 3: Estimativa de Compra */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-blue-200 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1 truncate">
                <TrendingUp className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">Estimativa</span>
              </span>
              <span className="text-[8px] sm:text-[9px] bg-blue-100 text-blue-900 font-extrabold px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                Safra Total
              </span>
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                {formatNumber(estimativaTotalHl, 1)} <span className="text-[10px] sm:text-xs text-slate-500 font-bold">HL</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold block mt-0.5 truncate">
                {formatNumber(estimativaTotalLatas, 0)} latas (~{formatNumber(estimativaTotalKg, 0)} kg)
              </span>
            </div>
          </div>
          <div className="pt-1.5 mt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-[10px] gap-1">
            <span className="text-slate-500 font-medium truncate">Total Safra:</span>
            <strong className="text-blue-900 font-black shrink-0">{formatBRL(investimentoTotalSafra)}</strong>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Tab View Rendering */}
      {activeSubTab === 'novo' && (
        <div className="space-y-6">
          {/* Unit Calculator & Fast Launch Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Launch Buttons */}
            <div className="lg:col-span-2 bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800/50 shadow-md space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
                  <span>Operação de Entrada</span>
                </div>
                <h2 className="text-2xl font-black">Registrar Nova Compra de Castanha</h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">
                  Registre a pesagem, medição em latas ou hectolitros, avaliação de umidade/impurezas, preço por lata/hl e formas de pagamento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => onOpenNovoRecebimento && onOpenNovoRecebimento()}
                  className="p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-lg flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="text-left">
                    <span className="block text-xs uppercase opacity-80">Iniciar Cadastro</span>
                    <span className="text-sm">Novo Recebimento de Carga</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveSubTab('fornecedores')}
                  className="p-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="text-left">
                    <span className="block text-xs uppercase text-amber-400">Diretório Extrativista</span>
                    <span className="text-sm">Cadastrar / Consultar Fornecedor</span>
                  </div>
                  <Users className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Interactive Conversor Box: Latas, Hectolitros */}
            <div className="bg-amber-500/10 border-2 border-amber-500/30 p-5 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase">
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>Calculadora de Conversão Unificada</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-amber-200 text-xs space-y-1">
                <span className="font-extrabold text-amber-900 block">Regra Padrão Monte Dourado:</span>
                <p className="text-slate-700 font-medium">
                  <strong>1 Hectolitro (Hl) = 5 Latas</strong>. Cada volume equivale a 1 Hl.
                </p>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    Hectolitros (Hl)
                  </label>
                  <input
                    type="number"
                    value={calcHl}
                    onChange={(e) => handleHlChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 uppercase mb-1">
                    Latas (1 Hl = 5 Latas)
                  </label>
                  <input
                    type="number"
                    value={calcLatas}
                    onChange={(e) => handleLatasChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Recent Purchases Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-700" />
                <span>Últimos Recebimentos de Castanha</span>
              </h3>
              <button
                onClick={() => setActiveSubTab('historico')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Ver Histórico Completo →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Fornecedor</th>
                    <th className="p-3 text-right">Volume (Hl)</th>
                    <th className="p-3 text-right">Latas</th>
                    <th className="p-3 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {validRecs.slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-emerald-800">{r.codigo}</td>
                      <td className="p-3 font-bold">{r.data}</td>
                      <td className="p-3 font-extrabold text-slate-900">{r.fornecedorNome}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatNumber(r.quantidadeLiquidaHl, 1)} hl</td>
                      <td className="p-3 text-right font-bold text-slate-800">{formatNumber(r.quantidadeLiquidaLatas, 0)} latas</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatBRL(r.compra.valorLiquido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab Views Integration */}
      {activeSubTab === 'contratos' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span>Gestão de Contratos de Compra Futura</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualização de ordens de compra negociadas a termo, adiantamentos e impressão de contratos para assinatura física em folha A4.
                </p>
              </div>
              <button
                onClick={() => onOpenNovaCompra && onOpenNovaCompra()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer border border-amber-300 self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Nova Compra Futura</span>
              </button>
            </div>

            {compras.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-extrabold text-sm text-slate-700">Nenhum Contrato Registrado</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Utilize o botão "Nova Compra Futura" para formalizar acordos de compra a termo com adiantamentos e preço negociado por hectolitro.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-900 text-amber-300 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Código Contrato</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Fornecedor / Origem</th>
                      <th className="p-3 text-center">Tipo Preço</th>
                      <th className="p-3 text-right">Volume (Hl / Latas)</th>
                      <th className="p-3 text-right">Preço Acordado</th>
                      <th className="p-3 text-right">Adiantamento</th>
                      <th className="p-3 text-right">Total Estimado</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {compras.map((c) => (
                      <tr key={c.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="p-3 font-mono font-black text-amber-950">{c.codigo}</td>
                        <td className="p-3 font-bold text-slate-800">{c.dataCompra}</td>
                        <td className="p-3">
                          <strong className="text-slate-900 block font-extrabold">{c.fornecedorNome}</strong>
                          <span className="text-[10px] text-slate-500">{c.comunidade || 'Monte Dourado'}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            c.tipoPreco === 'ABERTO' ? 'bg-blue-100 text-blue-950 border-blue-200' : 'bg-amber-100 text-amber-950 border-amber-200'
                          }`}>
                            {c.tipoPreco === 'ABERTO' ? '🔓 Preço Aberto' : '🔒 Preço Fechado'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <strong className="text-slate-900 block">{c.quantidadeHectolitrosPrevista} HL</strong>
                          <span className="text-[10px] text-slate-500">{c.quantidadeLatasPrevista} latas</span>
                        </td>
                        <td className="p-3 text-right font-extrabold text-emerald-800">
                          {formatBRL(c.valorPorHectolitro)}/HL
                        </td>
                        <td className="p-3 text-right font-black text-amber-800">
                          {formatBRL(c.adiantamento || 0)}
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">
                          {formatBRL(c.valorTotalEstimado)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'Recebido' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => gerarDocumento('Contrato de Compra Futura', c.id, c.fornecedorNome, { compra: c })}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[10px] shadow-2xs flex items-center gap-1.5 mx-auto cursor-pointer border border-amber-300 transition-all hover:scale-105"
                            title="Imprimir Contrato A4"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                            <span>Imprimir A4</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab Views Integration */}
      {activeSubTab === 'expectativas' && (
        <ExpectativasCompraView onOpenNovaCompra={onOpenNovaCompra} />
      )}
      {activeSubTab === 'fornecedores' && <FornecedoresView />}
      {activeSubTab === 'historico' && <FornecedoresView />}
      {activeSubTab === 'estoque' && <EstoqueComCascaView />}
      {activeSubTab === 'lotes' && <LotesView />}
      {activeSubTab === 'quarentena' && <QuarentenaView />}
    </div>
  );
};
