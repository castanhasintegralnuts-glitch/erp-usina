import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../context/AppContext';
import {
  calculateStockSummaries,
  formatBRL,
  formatNumber,
  LATAS_PER_HL
} from '../utils/conversions';
import {
  PackagePlus,
  ShoppingCart,
  Users,
  Boxes,
  Layers,
  AlertTriangle,
  DollarSign,
  FileText,
  BarChart3,
  TrendingUp,
  Scale,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Hammer,
  Building2,
  ShieldCheck,
  Zap,
  Activity,
  Receipt,
  PieChart
} from 'lucide-react';

export const HomeDashboard: React.FC<{
  onOpenNovoRecebimento: () => void;
  onOpenNovaCompra: () => void;
}> = ({ onOpenNovoRecebimento, onOpenNovaCompra }) => {
  const {
    setActiveTab,
    recebimentos,
    compras,
    lotes,
    fornecedores,
    quebradores,
    producoesQuebra,
    pagamentosQuebra,
    setSelectedFornecedorId,
    setDocPreview,
    documentos,
    transferencias
  } = useApp();

  // Stock Calculations
  const stock = calculateStockSummaries(recebimentos);
  const totalEstoqueComCascaHl = stock.beneficiamentoHl + stock.vendaComCascaHl;
  const totalEstoqueComCascaLatas = totalEstoqueComCascaHl * LATAS_PER_HL;
  const estimativaTonsEstoque = (totalEstoqueComCascaHl * 50) / 1000; // ~50kg/hl

  // Processing Calculations (Quarentena + Lotes em Formação)
  const lotesAbertos = lotes.filter(
    (l) => l.situacao === 'Em formação' || l.situacao === 'Aguardando análise'
  );
  const volumeLotesAbertosHl = lotesAbertos.reduce((acc, l) => acc + l.quantidadeAtualHl, 0);
  const totalCasquinhaProcessamentoHl = stock.quarentenaHl + volumeLotesAbertosHl;
  const lotesBloqueados = lotes.filter(
    (l) => l.situacao === 'Bloqueado' || l.situacao === 'Em quarentena'
  );

  // Quebra Manual Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const availableDatesQuebra = Array.from(new Set(producoesQuebra.map((p) => p.data))).sort().reverse();
  const dataRefQuebra = availableDatesQuebra[0] || todayStr;
  
  const producaoHoje = producoesQuebra.filter((p) => p.data === dataRefQuebra);
  const totalKgQuebradoHoje = producaoHoje.reduce((acc, p) => acc + p.totalKg, 0);
  const totalKgInteiraHoje = producaoHoje.reduce((acc, p) => acc + p.kgInteira, 0);
  const totalKgPedaçoHoje = producaoHoje.reduce((acc, p) => acc + (p.kgQuebrada + p.kgAmarela), 0);
  const totalValorFolhaHoje = producaoHoje.reduce((acc, p) => acc + p.valorTotal, 0);
  const quebradoresAtivosHoje = new Set(producaoHoje.map((p) => p.quebradorId)).size;

  const totalKgQuebradoHistorico = producoesQuebra.reduce((acc, p) => acc + p.totalKg, 0);
  const totalFolhaGeralQuebra = producoesQuebra.reduce((acc, p) => acc + p.valorTotal, 0);

  // Recebimentos e Compras Calculations
  const validRecs = recebimentos.filter((r) => !r.cancelado);
  const compradasVolHl = validRecs.reduce((acc, r) => acc + (r.quantidadeLiquidaHl || 0), 0);
  const totalRecebidoHl = validRecs.reduce((acc, r) => acc + r.quantidadeBrutaHl, 0);
  const totalInvestidoMP = validRecs.reduce((acc, r) => acc + (r.compra?.valorLiquido || 0), 0);

  const pendingCompras = (compras || []).filter((c) => c.status === 'Pendente de Recebimento');
  const aReceberVolHl = pendingCompras.reduce((acc, c) => acc + (c.quantidadeHectolitrosPrevista || 0), 0);
  const valorAdiantadoPAGO = pendingCompras.reduce((acc, c) => acc + (c.adiantamento || 0), 0);
  const valorTotalEstimadoContratos = pendingCompras.reduce((acc, c) => acc + (c.valorTotalEstimado || 0), 0);
  // Regra de Safra: O total estimado não entra em compras a receber, somente a parte adiantada. O estimado entra na estimativa.
  const valorAInvestirMP = valorAdiantadoPAGO;

  const estimativaTotalHl = compradasVolHl + aReceberVolHl;
  const investimentoTotalSafra = totalInvestidoMP + valorTotalEstimadoContratos;

  const comprasAPagar = validRecs.filter((r) => r.compra?.situacao === 'A pagar');
  const comprasParciais = validRecs.filter((r) => r.compra?.situacao === 'Parcialmente paga');
  const comprasPagas = validRecs.filter((r) => r.compra?.situacao === 'Paga');

  const pagamentosPendentesFornecedoresR$ = validRecs.reduce((acc, r) => {
    if (r.compra?.situacao === 'A pagar' || r.compra?.situacao === 'Parcialmente paga') {
      const pagamentosFeitos = (r.compra.pagamentosEfetuados || []).reduce((sum, p) => sum + p.valor, 0);
      return acc + Math.max(0, r.compra.valorLiquido - pagamentosFeitos);
    }
    return acc;
  }, 0);

  // Payments today
  const pagamentosQuebraEfetuadosHojeR$ = pagamentosQuebra
    .filter((p) => p.dataPagamento === dataRefQuebra)
    .reduce((acc, p) => acc + p.valorPago, 0);

  const pagamentosFornecedoresHojeR$ = validRecs.reduce((acc, r) => {
    const pags = r.compra?.pagamentosEfetuados || [];
    const pagsHoje = pags.filter((p) => p.data === dataRefQuebra);
    return acc + pagsHoje.reduce((sum, p) => sum + p.valor, 0);
  }, 0);

  const totalDesembolsadoHojeR$ = pagamentosFornecedoresHojeR$ + pagamentosQuebraEfetuadosHojeR$;

  // Navigation Items
  const navButtons = [
    {
      title: 'Novo Recebimento',
      description: 'Entrada guiada de matéria-prima e pesagem',
      icon: PackagePlus,
      color: 'from-emerald-600 to-emerald-800 text-white shadow-emerald-950/30',
      onClick: onOpenNovoRecebimento,
    },
    {
      title: 'Nova Compra',
      description: 'Lançamento direto de compra de castanha',
      icon: ShoppingCart,
      color: 'from-teal-600 to-teal-800 text-white shadow-teal-950/30',
      onClick: onOpenNovaCompra,
    },
    {
      title: 'Quebra Manual',
      description: 'Apuração diária, folha e custo por lote',
      icon: Hammer,
      color: 'from-amber-800 to-amber-950 text-amber-200 shadow-amber-950/40',
      onClick: () => setActiveTab('quebra-manual'),
    },
    {
      title: 'Fornecedores',
      description: `${fornecedores.length} fornecedores cadastrados`,
      icon: Users,
      color: 'from-slate-700 to-slate-900 text-white shadow-slate-950/30',
      onClick: () => setActiveTab('fornecedores'),
    },
    {
      title: 'Estoque com Casca',
      description: 'Beneficiamento vs Venda com Casca',
      icon: Boxes,
      color: 'from-amber-600 to-amber-800 text-white shadow-amber-950/30',
      onClick: () => setActiveTab('estoque-casca'),
    },
    {
      title: 'Lotes de Produção',
      description: `${lotes.length} lotes em acompanhamento`,
      icon: Layers,
      color: 'from-cyan-700 to-cyan-900 text-white shadow-cyan-950/30',
      onClick: () => setActiveTab('lotes'),
    },
    {
      title: 'Quarentena & Aeração',
      description: `${formatNumber(stock.quarentenaHl, 1)} hl sob análise`,
      icon: AlertTriangle,
      color: 'from-rose-700 to-rose-900 text-white shadow-rose-950/30',
      onClick: () => setActiveTab('quarentena'),
    },
    {
      title: 'Financeiro',
      description: `Pendências: ${formatBRL(pagamentosPendentesFornecedoresR$)}`,
      icon: DollarSign,
      color: 'from-indigo-700 to-indigo-900 text-white shadow-indigo-950/30',
      onClick: () => setActiveTab('financeiro'),
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      
      {/* 4 CORE HIGHLIGHT KPI CARDS (USER DIRECT REQUIREMENT - CLICKABLE BUTTONS) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Indicadores Principais do Dia & Estoques
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Data de Referência: <span className="text-slate-900">{dataRefQuebra}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* KPI 1: QUANTIDADE EM ESTOQUE (COM CASCA) */}
          <div
            onClick={() => setActiveTab('recebimento-compra')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 hover:shadow-md hover:scale-[1.005] transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
                <span className="flex items-center gap-1 text-slate-700 group-hover:text-amber-700 transition-colors">
                  1. Estoque com Casca
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-amber-600" />
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocPreview({
                        tipo: 'Relatório Consolidado',
                        data: {
                          docMeta: {
                            numeroDocumento: 'MD-PDF-ESTOQUE',
                            dataEmissao: new Date().toLocaleDateString('pt-BR'),
                            horarioEmissao: '10:00',
                            codigoRastreabilidade: `MD-EST-${Date.now().toString().slice(-5)}`,
                            responsavel: 'SISTEMA MONTE DOURADO',
                          },
                          extraData: {
                            titulo: 'SÍNTESE CONSOLIDADA DE ESTOQUES COM CASCA',
                            descricao: 'Relatório de volume de matéria-prima estocado para beneficiamento e comercialização com casca.',
                            indicadores: [
                              { label: 'Total com Casca', valor: `${formatNumber(totalEstoqueComCascaHl, 1)} HL`, detalhe: `${formatNumber(totalEstoqueComCascaLatas, 0)} latas` },
                              { label: 'Estimativa Tons', valor: `~${formatNumber(estimativaTonsEstoque, 1)} ton`, detalhe: '50kg/hl' },
                            ],
                            colunas: ['Destinação', 'Volume Hectolitros', 'Equivalência Latas', 'Situação'],
                            itens: [
                              ['Beneficiamento Interno', `${formatNumber(stock.beneficiamentoHl, 1)} HL`, `${formatNumber(stock.beneficiamentoHl * 5, 0)} latas`, 'Em estoque'],
                              ['Venda com Casca', `${formatNumber(stock.vendaComCascaHl, 1)} HL`, `${formatNumber(stock.vendaComCascaHl * 5, 0)} latas`, 'Disponível'],
                              ['TOTAL CONSOLIDADO', `${formatNumber(totalEstoqueComCascaHl, 1)} HL`, `${formatNumber(totalEstoqueComCascaLatas, 0)} latas`, 'Liberado'],
                            ]
                          }
                        }
                      });
                    }}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    title="Gerar PDF Consolidado"
                  >
                    <FileText className="w-3 h-3 text-amber-700" />
                    <span>Gerar PDF</span>
                  </button>
                  <div className="p-2 bg-amber-100 text-amber-900 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Boxes className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatNumber(totalEstoqueComCascaHl, 1)} <span className="text-sm font-bold text-slate-500">HL</span>
                </div>
                <div className="text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg mt-2 inline-block border border-amber-200">
                  {formatNumber(totalEstoqueComCascaLatas, 0)} latas • ~{formatNumber(estimativaTonsEstoque, 1)} ton.
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Beneficiamento: <strong>{formatNumber(stock.beneficiamentoHl, 1)} HL</strong></span>
              <span className="text-amber-800 font-extrabold flex items-center gap-1">Acessar Módulo <ArrowRight className="w-3 h-3" /></span>
            </div>
          </div>

          {/* KPI 2: QUANTIDADE EM PROCESSAMENTO */}
          <div
            onClick={() => setActiveTab('producao')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-400 hover:shadow-md hover:scale-[1.005] transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
                <span className="flex items-center gap-1 text-slate-700 group-hover:text-rose-700 transition-colors">
                  2. Em Processamento
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-rose-600" />
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocPreview({
                        tipo: 'Relatório Consolidado',
                        data: {
                          docMeta: {
                            numeroDocumento: 'MD-PDF-PROC',
                            dataEmissao: new Date().toLocaleDateString('pt-BR'),
                            horarioEmissao: '10:00',
                            codigoRastreabilidade: `MD-PRC-${Date.now().toString().slice(-5)}`,
                            responsavel: 'SISTEMA MONTE DOURADO',
                          },
                          extraData: {
                            titulo: 'RELATÓRIO CONSOLIDADO — EM PROCESSAMENTO',
                            descricao: 'Posição de lotes em formação e bateladas sob aeração/quarentena.',
                            indicadores: [
                              { label: 'Volume em Processamento', valor: `${formatNumber(totalCasquinhaProcessamentoHl, 1)} HL`, detalhe: 'Quarentena + Lotes' },
                              { label: 'Lotes em Formação', valor: `${lotesAbertos.length} Lotes`, detalhe: `${formatNumber(volumeLotesAbertosHl, 1)} HL` },
                            ],
                            colunas: ['Fase / Etapa', 'Volume HL', 'Equiv. Latas', 'Lotes / Bateladas'],
                            itens: [
                              ['Aeração / Quarentena', `${formatNumber(stock.quarentenaHl, 1)} HL`, `${formatNumber(stock.quarentenaHl * 5, 0)} latas`, 'Bateladas sob análise'],
                              ['Lotes em Formação', `${formatNumber(volumeLotesAbertosHl, 1)} HL`, `${formatNumber(volumeLotesAbertosHl * 5, 0)} latas`, `${lotesAbertos.length} lotes`],
                              ['TOTAL EM PROCESSAMENTO', `${formatNumber(totalCasquinhaProcessamentoHl, 1)} HL`, `${formatNumber(totalCasquinhaProcessamentoHl * 5, 0)} latas`, 'Consolidado'],
                            ]
                          }
                        }
                      });
                    }}
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-[10px] font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    title="Gerar PDF Consolidado"
                  >
                    <FileText className="w-3 h-3 text-rose-700" />
                    <span>Gerar PDF</span>
                  </button>
                  <div className="p-2 bg-rose-100 text-rose-900 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatNumber(totalCasquinhaProcessamentoHl, 1)} <span className="text-sm font-bold text-slate-500">HL</span>
                </div>
                <div className="text-xs font-black text-rose-900 bg-rose-50 px-2.5 py-1 rounded-lg mt-2 inline-block border border-rose-200">
                  {lotesAbertos.length} lotes em formação • {lotesBloqueados.length} em quarentena
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Aeração: <strong>{formatNumber(stock.quarentenaHl, 1)} HL</strong></span>
              <span className="text-rose-800 font-extrabold flex items-center gap-1">Acessar Processamento <ArrowRight className="w-3 h-3" /></span>
            </div>
          </div>

          {/* KPI 3: QUANTIDADE QUEBRADA HOJE */}
          <div
            onClick={() => setActiveTab('quebra-manual')}
            className="bg-white p-5 rounded-3xl border border-amber-300 shadow-sm relative overflow-hidden group hover:border-amber-500 hover:shadow-md hover:scale-[1.005] transition-all bg-gradient-to-br from-white via-white to-amber-50/40 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-amber-900 text-xs font-black uppercase tracking-wider">
                <span className="flex items-center gap-1 group-hover:text-amber-950 transition-colors">
                  3. Quebradas Hoje (Módu. Quebra)
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-amber-700" />
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocPreview({
                        tipo: 'Relatório Consolidado',
                        data: {
                          docMeta: {
                            numeroDocumento: 'MD-PDF-QUEBRA',
                            dataEmissao: new Date().toLocaleDateString('pt-BR'),
                            horarioEmissao: '10:00',
                            codigoRastreabilidade: `MD-QBR-${Date.now().toString().slice(-5)}`,
                            responsavel: 'SISTEMA MONTE DOURADO',
                          },
                          extraData: {
                            titulo: 'SÍNTESE DA QUEBRA MANUAL DO DIA',
                            descricao: `Apuração diária de amêndoas produzidas na quebra artesanal referente ao dia ${dataRefQuebra}.`,
                            indicadores: [
                              { label: 'Total KG Quebrados Hoje', valor: `${formatNumber(totalKgQuebradoHoje, 1)} KG`, detalhe: `${quebradoresAtivosHoje} quebradores` },
                              { label: 'Valor da Folha Hoje', valor: `R$ ${formatBRL(totalValorFolhaHoje)}`, detalhe: 'Diárias apuradas' },
                            ],
                            colunas: ['Classificação / Tipo', 'Peso Produzido (KG)', 'Participação', 'Situação'],
                            itens: [
                              ['Amêndoa Inteira', `${formatNumber(totalKgInteiraHoje, 1)} kg`, `${totalKgQuebradoHoje > 0 ? formatNumber((totalKgInteiraHoje/totalKgQuebradoHoje)*100, 1) : 0}%`, 'Primeira'],
                              ['Amêndoa Pedaço / Amarela', `${formatNumber(totalKgPedaçoHoje, 1)} kg`, `${totalKgQuebradoHoje > 0 ? formatNumber((totalKgPedaçoHoje/totalKgQuebradoHoje)*100, 1) : 0}%`, 'Segunda'],
                              ['TOTAL DO DIA', `${formatNumber(totalKgQuebradoHoje, 1)} kg`, '100%', 'Apurado'],
                            ]
                          }
                        }
                      });
                    }}
                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[10px] font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    title="Gerar PDF Consolidado"
                  >
                    <FileText className="w-3 h-3 text-amber-800" />
                    <span>Gerar PDF</span>
                  </button>
                  <div className="p-2 bg-amber-800 text-amber-200 rounded-xl shadow-xs group-hover:bg-amber-600 group-hover:text-amber-950 transition-colors">
                    <Hammer className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-amber-950 tracking-tight">
                  {formatNumber(totalKgQuebradoHoje, 1)} <span className="text-sm font-bold text-amber-800">KG</span>
                </div>
                <div className="text-xs font-black text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg mt-2 inline-block border border-amber-300">
                  R$ {formatBRL(totalValorFolhaHoje)} em mão de obra de quebra
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-slate-700 font-semibold">
              <span>Inteiras: <strong>{formatNumber(totalKgInteiraHoje, 1)} kg</strong></span>
              <span className="text-amber-900 font-extrabold flex items-center gap-1">Acessar Quebra <ArrowRight className="w-3 h-3" /></span>
            </div>
          </div>

          {/* KPI 4: RESULTADOS FINANCEIROS DO DIA */}
          <div
            onClick={() => setActiveTab('financeiro')}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-400 hover:shadow-md hover:scale-[1.005] transition-all flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 text-xs font-black uppercase tracking-wider">
                <span className="flex items-center gap-1 text-slate-700 group-hover:text-indigo-700 transition-colors">
                  4. Financeiro & Caixa do Dia
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-indigo-600" />
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocPreview({
                        tipo: 'Relatório Consolidado',
                        data: {
                          docMeta: {
                            numeroDocumento: 'MD-PDF-FINAN',
                            dataEmissao: new Date().toLocaleDateString('pt-BR'),
                            horarioEmissao: '10:00',
                            codigoRastreabilidade: `MD-FIN-${Date.now().toString().slice(-5)}`,
                            responsavel: 'SISTEMA MONTE DOURADO',
                          },
                          extraData: {
                            titulo: 'POSIÇÃO FINANCEIRA E SAÍDAS DE CAIXA',
                            descricao: 'Resumo de pagamentos efetuados e pendências com fornecedores de matéria-prima e folha de quebra.',
                            indicadores: [
                              { label: 'Desembolsado Hoje', valor: `R$ ${formatBRL(totalDesembolsadoHojeR$)}`, detalhe: 'Fornecedores + Quebra' },
                              { label: 'Pendências Fornecedores', valor: `R$ ${formatBRL(pagamentosPendentesFornecedoresR$)}`, detalhe: 'A pagar' },
                            ],
                            colunas: ['Categoria de Pagamento', 'Mapeado Hoje', 'Situação', 'Total Accum. R$'],
                            itens: [
                              ['Fornecedores de Castanha', `R$ ${formatBRL(pagamentosFornecedoresHojeR$)}`, 'Efetuado hoje', `R$ ${formatBRL(totalInvestidoMP)}`],
                              ['Folha Quebra Manual', `R$ ${formatBRL(pagamentosQuebraEfetuadosHojeR$)}`, 'Efetuado hoje', `R$ ${formatBRL(totalFolhaGeralQuebra)}`],
                              ['Pendência A Pagar MP', 'R$ 0,00', 'Pendente', `R$ ${formatBRL(pagamentosPendentesFornecedoresR$)}`],
                            ]
                          }
                        }
                      });
                    }}
                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    title="Gerar PDF Consolidado"
                  >
                    <FileText className="w-3 h-3 text-indigo-700" />
                    <span>Gerar PDF</span>
                  </button>
                  <div className="p-2 bg-indigo-100 text-indigo-900 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatBRL(totalDesembolsadoHojeR$)}
                </div>
                <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg mt-2 inline-block border border-slate-200">
                  Pagos Hoje (MP: {formatBRL(pagamentosFornecedoresHojeR$)} • Folha: {formatBRL(pagamentosQuebraEfetuadosHojeR$)})
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Pendência MP: <strong className="text-amber-800">{formatBRL(pagamentosPendentesFornecedoresR$)}</strong></span>
              <span className="text-indigo-800 font-extrabold flex items-center gap-1">Acessar Financeiro <ArrowRight className="w-3 h-3" /></span>
            </div>
          </div>

        </div>
      </div>

      {/* PAINÉIS ADMINISTRATIVOS DOS MÓDULOS (SUMMARIZED PANELS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-800" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Resumo Geral do Painel Administrativo por Módulo
            </h2>
          </div>
          <span className="text-xs bg-slate-200 text-slate-800 px-3 py-1 rounded-full font-bold">
            5 Módulos Integrados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* MÓDULO 1: RECEBIMENTO & COMPRAS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black">
                    <PackagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Módulo 1 — Recebimento</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Entrada e Compra de Matéria-Prima</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {validRecs.length} Cargas
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-700 mb-6">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Castanhas Compradas:</span>
                  <strong className="text-slate-900 font-extrabold">{formatNumber(compradasVolHl, 1)} HL</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Castanhas a Receber:</span>
                  <strong className="text-amber-800 font-extrabold">{formatNumber(aReceberVolHl, 1)} HL</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Estimativa de Compra:</span>
                  <strong className="text-blue-900 font-extrabold">{formatNumber(estimativaTotalHl, 1)} HL</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Valores Investidos (Entregues):</span>
                  <strong className="text-emerald-800 font-black">R$ {formatBRL(totalInvestidoMP)}</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Valores a Investir (Contratados):</span>
                  <strong className="text-amber-900 font-black">R$ {formatBRL(valorAInvestirMP)}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('recebimento')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Acessar Recebimentos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MÓDULO 2: QUEBRA MANUAL */}
          <div className="bg-white rounded-3xl border border-amber-300 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/30">
            <div>
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-800 text-amber-200 flex items-center justify-center font-black shadow-xs">
                    <Hammer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Módulo 2 — Quebra Manual</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Produtividade & Mão de Obra</p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                  {quebradores.length} Quebradores
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                <div className="flex justify-between items-center py-1 border-b border-amber-100/50">
                  <span className="text-slate-500">Quebrado Hoje:</span>
                  <strong className="text-amber-950 font-black">{formatNumber(totalKgQuebradoHoje, 1)} kg</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-amber-100/50">
                  <span className="text-slate-500">Produção Histórica:</span>
                  <strong className="text-slate-900">{formatNumber(totalKgQuebradoHistorico, 1)} kg amêndoa</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Folha de Quebra Acumulada:</span>
                  <strong className="text-amber-900 font-black">{formatBRL(totalFolhaGeralQuebra)}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('quebra-manual')}
              className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-amber-100 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Acessar Quebra Manual</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MÓDULO 3: ESTOQUE E QUARENTENA */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Módulo 3 — Estoques</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Casca, Quarentena & Aeração</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {formatNumber(totalEstoqueComCascaHl, 0)} HL
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Destinado a Beneficiamento:</span>
                  <strong className="text-slate-900">{formatNumber(stock.beneficiamentoHl, 1)} HL</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Destinado a Venda com Casca:</span>
                  <strong className="text-slate-900">{formatNumber(stock.vendaComCascaHl, 1)} HL</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Em Quarentena / Aeração:</span>
                  <strong className="text-rose-700 font-black">{formatNumber(stock.quarentenaHl, 1)} HL</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('estoque-casca')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Gerenciar Estoque</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MÓDULO 4: LOTES E RASTREABILIDADE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-900 flex items-center justify-center font-black">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Módulo 4 — Lotes</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Bateladas & Rastreabilidade</p>
                  </div>
                </div>
                <span className="bg-cyan-100 text-cyan-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {lotes.length} Lotes
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Lotes Abertos / Formação:</span>
                  <strong className="text-slate-900">{lotesAbertos.length} lotes</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Volume em Lotes:</span>
                  <strong className="text-slate-900">{formatNumber(volumeLotesAbertosHl, 1)} HL</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Lotes Bloqueados:</span>
                  <strong className="text-slate-900">{lotesBloqueados.length} lotes</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('lotes')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ver Lotes de Produção</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MÓDULO 5: FINANCEIRO, DOCUMENTOS & AUDITORIA */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Módulo 5 — Financeiro</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Contas, Documentos e Auditoria</p>
                  </div>
                </div>
                <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {documentos.length} Documentos
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 mb-6">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Pendências Fornecedores:</span>
                  <strong className="text-amber-800 font-black">{formatBRL(pagamentosPendentesFornecedoresR$)}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Compras Pagas:</span>
                  <strong className="text-emerald-800 font-bold">{comprasPagas.length} quitações</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Documentos PDF Gerados:</span>
                  <strong className="text-slate-900">{documentos.length} arquivos A4</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('financeiro')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Acessar Financeiro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* NAVEGAÇÃO RÁPIDA POR BOTÕES DE MÓDULO */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Acesso Rápido aos Módulos</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
              Atalhos Diretos
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {navButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.title}
                onClick={btn.onClick}
                className="group relative text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 flex items-start gap-4 cursor-pointer overflow-hidden"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${btn.color} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                      {btn.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">
                    {btn.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABELA RESUMIDA DOS ÚLTIMOS RECEBIMENTOS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-base tracking-tight">Últimos Recebimentos de Carga</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Acompanhamento recente das entradas de matéria-prima na usina de Monte Dourado
            </p>
          </div>
          <button
            onClick={() => setActiveTab('recebimento')}
            className="text-xs font-black text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            Ver todos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {validRecs.slice(0, 5).map((rec) => (
            <div
              key={rec.id}
              className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  MD
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">{rec.codigo}</span>
                    <span className="text-xs text-slate-500 font-medium">• {rec.data} às {rec.horario}</span>
                    <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {rec.safra}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-medium">
                    <strong className="text-slate-900">{rec.fornecedorNome}</strong>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rec.destinos.map((d, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200"
                      >
                        {d.destino}: {d.quantidadeHectolitros} hl ({d.quantidadeLatas} latas)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">
                    {formatNumber(rec.quantidadeLiquidaHl, 1)} HL
                  </div>
                  <div className="text-xs font-bold text-emerald-800">
                    {formatBRL(rec.compra?.valorLiquido)}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDocPreview({
                      tipo: 'Romaneio de Entrada',
                      data: {
                        docMeta: documentos.find((d) => d.referenciaId === rec.id && d.tipo === 'Romaneio de Entrada'),
                        extraData: rec,
                      },
                    });
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-950 text-slate-800 text-xs font-black rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Romaneio
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
