import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatNumber } from '../../utils/conversions';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  Scale,
  Calendar,
  Zap,
  Target,
  PieChart
} from 'lucide-react';

export const DashboardGestorTab: React.FC = () => {
  const { producoesQuebra, quebradores } = useApp();

  const [filterPeriod, setFilterPeriod] = useState<'dia' | 'semana' | 'mes' | 'todos'>('mes');

  // Date filters
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Total datasets
  const prodsDia = producoesQuebra.filter((p) => p.data === todayStr);
  const prodsSemana = producoesQuebra.filter((p) => p.data >= startOfWeekStr);
  const prodsMes = producoesQuebra.filter((p) => p.data >= startOfMonthStr);

  // Selected period prods
  let filteredProds = producoesQuebra;
  if (filterPeriod === 'dia') filteredProds = prodsDia;
  else if (filterPeriod === 'semana') filteredProds = prodsSemana;
  else if (filterPeriod === 'mes') filteredProds = prodsMes;

  // Key KPI metrics
  const kgDia = prodsDia.reduce((acc, p) => acc + p.totalKg, 0);
  const folhaDia = prodsDia.reduce((acc, p) => acc + p.valorTotal, 0);

  const kgSemana = prodsSemana.reduce((acc, p) => acc + p.totalKg, 0);
  const folhaSemana = prodsSemana.reduce((acc, p) => acc + p.valorTotal, 0);

  const kgMes = prodsMes.reduce((acc, p) => acc + p.totalKg, 0);
  const folhaMes = prodsMes.reduce((acc, p) => acc + p.valorTotal, 0);

  const totalKgPeriodo = filteredProds.reduce((acc, p) => acc + p.totalKg, 0);
  const totalFolhaPeriodo = filteredProds.reduce((acc, p) => acc + p.valorTotal, 0);

  const custoMedioKgPeriodo = totalKgPeriodo > 0 ? totalFolhaPeriodo / totalKgPeriodo : 0;

  // Active workers in period
  const activeWorkersInPeriod = Array.from(new Set(filteredProds.map((p) => p.quebradorId)));
  const mediaProducaoPorColaborador =
    activeWorkersInPeriod.length > 0 ? totalKgPeriodo / activeWorkersInPeriod.length : 0;

  // Aggregation by Quebrador for Top Producer
  const workerTotals: Record<string, { nome: string; totalKg: number; totalR$: number; diasAtivo: number }> = {};

  filteredProds.forEach((p) => {
    if (!workerTotals[p.quebradorId]) {
      workerTotals[p.quebradorId] = {
        nome: p.quebradorNome,
        totalKg: 0,
        totalR$: 0,
        diasAtivo: 0,
      };
    }
    workerTotals[p.quebradorId].totalKg += p.totalKg;
    workerTotals[p.quebradorId].totalR$ += p.valorTotal;
  });

  // Calculate unique active days per worker
  Object.keys(workerTotals).forEach((qId) => {
    const days = new Set(filteredProds.filter((p) => p.quebradorId === qId).map((p) => p.data)).size;
    workerTotals[qId].diasAtivo = days;
  });

  const workerRankingList = Object.values(workerTotals).sort((a, b) => b.totalKg - a.totalKg);
  const topProducer = workerRankingList[0];

  // Quality yield proportions (Inteira vs Quebrada vs Amarela)
  const totalInteira = filteredProds.reduce((acc, p) => acc + p.kgInteira, 0);
  const totalQuebrada = filteredProds.reduce((acc, p) => acc + p.kgQuebrada, 0);
  const totalAmarela = filteredProds.reduce((acc, p) => acc + p.kgAmarela, 0);

  const pctInteira = totalKgPeriodo > 0 ? (totalInteira / totalKgPeriodo) * 100 : 0;
  const pctQuebrada = totalKgPeriodo > 0 ? (totalQuebrada / totalKgPeriodo) * 100 : 0;
  const pctAmarela = totalKgPeriodo > 0 ? (totalAmarela / totalKgPeriodo) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-800" />
          <h2 className="font-extrabold text-slate-900 text-sm">Dashboard de Produtividade & Custo da Quebra</h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterPeriod('dia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === 'dia' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setFilterPeriod('semana')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === 'semana' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setFilterPeriod('mes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === 'mes' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setFilterPeriod('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === 'todos' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Histórico Geral
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Produção Acumulada */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-800" />
              Produção do Período
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono uppercase">
              {filterPeriod}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatNumber(totalKgPeriodo, 1)} <span className="text-sm font-bold text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-500 font-medium flex justify-between">
            <span>Inteira: {formatNumber(totalInteira, 1)} kg</span>
            <span className="text-emerald-700 font-bold">{formatNumber(pctInteira, 1)}%</span>
          </div>
        </div>

        {/* Total da Folha */}
        <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Folha da Quebra
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-300">{formatBRL(totalFolhaPeriodo)}</div>
          <div className="text-xs text-emerald-200/80 font-medium">
            Mão de obra direta total gasta
          </div>
        </div>

        {/* Custo Médio por Kg */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-700" />
              Custo Médio / kg
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-900">{formatBRL(custoMedioKgPeriodo)}/kg</div>
          <div className="text-xs text-slate-500 font-medium">
            Ref. Tabela: Inteira R$5,00 / Pedaço R$2,50
          </div>
        </div>

        {/* Média Por Colaborador & Top Sheller */}
        <div className="p-4 bg-amber-950 text-white rounded-2xl border border-amber-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-200 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Maior Produtor(a)
            </span>
            <span className="text-[10px] bg-amber-800 text-amber-100 px-2 py-0.5 rounded font-mono">1º Lugar</span>
          </div>
          <div className="text-lg font-extrabold text-amber-300 truncate">
            {topProducer ? topProducer.nome : 'Nenhum'}
          </div>
          <div className="text-xs text-amber-200 font-medium flex justify-between">
            <span>{topProducer ? formatNumber(topProducer.totalKg, 1) : 0} kg</span>
            <span className="font-bold text-emerald-400">{topProducer ? formatBRL(topProducer.totalR$) : 'R$ 0'}</span>
          </div>
        </div>

      </div>

      {/* Yield Breakdown & Team Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Yield Proportions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieChart className="w-4 h-4 text-amber-800" />
            Rendimento de Qualidade da Quebra
          </h3>

          <div className="space-y-3 text-xs">
            {/* Inteira */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-emerald-900">Castanha Inteira (Nobre)</span>
                <span>{formatNumber(totalInteira, 1)} kg ({formatNumber(pctInteira, 1)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${pctInteira}%` }} className="h-full bg-emerald-600 rounded-full" />
              </div>
            </div>

            {/* Quebrada */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-amber-900">Castanha Quebrada (Pedaço)</span>
                <span>{formatNumber(totalQuebrada, 1)} kg ({formatNumber(pctQuebrada, 1)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${pctQuebrada}%` }} className="h-full bg-amber-500 rounded-full" />
              </div>
            </div>

            {/* Amarela */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-amber-950">Castanha Amarela</span>
                <span>{formatNumber(totalAmarela, 1)} kg ({formatNumber(pctAmarela, 1)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${pctAmarela}%` }} className="h-full bg-amber-800 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-medium leading-relaxed">
            💡 <strong>Rendimento Ideal da Usina:</strong> Almejar mínimo de 80% em Castanha Inteira para otimizar o valor agregado de vendas.
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-800" />
              Produtividade por Colaborador ({filterPeriod.toUpperCase()})
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              Média da Equipe: {formatNumber(mediaProducaoPorColaborador, 1)} kg/quebrador
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Posição</th>
                  <th className="p-3">Colaborador</th>
                  <th className="p-3 text-center">Dias Trabalhados</th>
                  <th className="p-3 text-right">Média Diária (kg/dia)</th>
                  <th className="p-3 text-right">Total Produzido (kg)</th>
                  <th className="p-3 text-right">Remuneração Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {workerRankingList.map((w, idx) => {
                  const mediaDiaria = w.diasAtivo > 0 ? w.totalKg / w.diasAtivo : 0;
                  return (
                    <tr key={w.nome} className="hover:bg-amber-50/40">
                      <td className="p-3 font-bold text-center">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900'
                              : idx === 2
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}º
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{w.nome}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{w.diasAtivo} dias</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800">
                        {formatNumber(mediaDiaria, 1)} kg/dia
                      </td>
                      <td className="p-3 text-right font-black text-slate-900 text-sm">
                        {formatNumber(w.totalKg, 1)} kg
                      </td>
                      <td className="p-3 text-right font-black text-emerald-700 text-sm">
                        {formatBRL(w.totalR$)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
