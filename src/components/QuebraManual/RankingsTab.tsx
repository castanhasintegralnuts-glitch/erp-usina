import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatNumber } from '../../utils/conversions';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  TrendingUp,
  Scale,
  Calendar
} from 'lucide-react';

export const RankingsTab: React.FC = () => {
  const { producoesQuebra } = useApp();

  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensal'>('diario');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  let currentProds = producoesQuebra;
  if (period === 'diario') {
    currentProds = producoesQuebra.filter((p) => p.data === todayStr);
  } else if (period === 'semanal') {
    currentProds = producoesQuebra.filter((p) => p.data >= startOfWeekStr);
  } else if (period === 'mensal') {
    currentProds = producoesQuebra.filter((p) => p.data >= startOfMonthStr);
  }

  // Record calculation across ALL time
  let allTimeRecord = { nome: 'N/A', totalKg: 0, data: 'N/A', valor: 0 };
  producoesQuebra.forEach((p) => {
    if (p.totalKg > allTimeRecord.totalKg) {
      allTimeRecord = {
        nome: p.quebradorNome,
        totalKg: p.totalKg,
        data: p.data,
        valor: p.valorTotal,
      };
    }
  });

  // Calculate ranking for selected period
  const rankingMap: Record<
    string,
    { nome: string; totalKg: number; totalR$: number; inteiraKg: number; quebradaKg: number; amarelaKg: number }
  > = {};

  currentProds.forEach((p) => {
    if (!rankingMap[p.quebradorId]) {
      rankingMap[p.quebradorId] = {
        nome: p.quebradorNome,
        totalKg: 0,
        totalR$: 0,
        inteiraKg: 0,
        quebradaKg: 0,
        amarelaKg: 0,
      };
    }
    rankingMap[p.quebradorId].totalKg += p.totalKg;
    rankingMap[p.quebradorId].totalR$ += p.valorTotal;
    rankingMap[p.quebradorId].inteiraKg += p.kgInteira;
    rankingMap[p.quebradorId].quebradaKg += p.kgQuebrada;
    rankingMap[p.quebradorId].amarelaKg += p.kgAmarela;
  });

  const rankingList = Object.values(rankingMap).sort((a, b) => b.totalKg - a.totalKg);

  // Average daily production per worker in the plant
  const totalDaysInProds = new Set(producoesQuebra.map((p) => p.data)).size || 1;
  const totalKgAllTime = producoesQuebra.reduce((acc, p) => acc + p.totalKg, 0);
  const mediaDiariaUsina = totalKgAllTime / totalDaysInProds;

  return (
    <div className="space-y-6">
      
      {/* All Time Record Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 text-white rounded-3xl p-6 shadow-xl border border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-300 font-black shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase bg-amber-800 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-600">
              Recorde Histórico Absoluto
            </span>
            <h2 className="font-extrabold text-xl text-white mt-1">
              {allTimeRecord.nome} — {formatNumber(allTimeRecord.totalKg, 1)} kg em um único dia
            </h2>
            <p className="text-xs text-amber-200/80">
              Registrado em {allTimeRecord.data} • Remuneração recorde: {formatBRL(allTimeRecord.valor)}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 px-4 py-3 rounded-2xl border border-amber-700/50 space-y-1 text-right">
          <div className="text-[10px] text-amber-300 uppercase font-bold">Média Diária Global da Usina:</div>
          <div className="text-xl font-black text-white">{formatNumber(mediaDiariaUsina, 1)} kg / dia</div>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-800" />
          <h3 className="font-extrabold text-slate-900 text-sm">Rankings de Produtividade da Fábrica</h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setPeriod('diario')}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              period === 'diario' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diário ({todayStr})
          </button>
          <button
            onClick={() => setPeriod('semanal')}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              period === 'semanal' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriod('mensal')}
            className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              period === 'mensal' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensal
          </button>
        </div>
      </div>

      {/* Top 3 Podium Display */}
      {rankingList.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* 2nd Place */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm text-center space-y-2 order-2 sm:order-1 flex flex-col justify-between">
            <div className="w-12 h-12 bg-slate-200 text-slate-800 rounded-full flex items-center justify-center font-black mx-auto text-lg border-2 border-slate-300">
              2º
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">{rankingList[1].nome}</h4>
              <p className="text-xl font-black text-slate-800 mt-1">{formatNumber(rankingList[1].totalKg, 1)} kg</p>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 py-1 rounded-xl">
              {formatBRL(rankingList[1].totalR$)}
            </div>
          </div>

          {/* 1st Place */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl border-2 border-amber-400 p-6 shadow-md text-center space-y-3 order-1 sm:order-2 relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Campeão
            </div>
            <div className="w-16 h-16 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center font-black mx-auto text-2xl border-4 border-amber-300 shadow-lg">
              1º
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg">{rankingList[0].nome}</h4>
              <p className="text-2xl font-black text-amber-900 mt-1">{formatNumber(rankingList[0].totalKg, 1)} kg</p>
            </div>
            <div className="text-sm font-extrabold text-emerald-800 bg-emerald-100 py-1.5 rounded-xl border border-emerald-300">
              {formatBRL(rankingList[0].totalR$)}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm text-center space-y-2 order-3 flex flex-col justify-between">
            <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center font-black mx-auto text-lg border-2 border-amber-300">
              3º
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">{rankingList[2].nome}</h4>
              <p className="text-xl font-black text-slate-800 mt-1">{formatNumber(rankingList[2].totalKg, 1)} kg</p>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 py-1 rounded-xl">
              {formatBRL(rankingList[2].totalR$)}
            </div>
          </div>

        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs">
          Tabela Completa de Classificação — {period.toUpperCase()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px]">
              <tr>
                <th className="p-3 text-center">Posição</th>
                <th className="p-3">Quebrador(a)</th>
                <th className="p-3 text-right">Inteira (kg)</th>
                <th className="p-3 text-right">Quebrada (kg)</th>
                <th className="p-3 text-right">Amarela (kg)</th>
                <th className="p-3 text-right">Total Produzido</th>
                <th className="p-3 text-right">Valor Produzido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rankingList.map((item, idx) => (
                <tr key={item.nome} className="hover:bg-amber-50/50">
                  <td className="p-3 text-center font-black">
                    <span
                      className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 font-black'
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
                  <td className="p-3 font-bold text-slate-900">{item.nome}</td>
                  <td className="p-3 text-right text-emerald-800">{formatNumber(item.inteiraKg, 1)} kg</td>
                  <td className="p-3 text-right text-amber-800">{formatNumber(item.quebradaKg, 1)} kg</td>
                  <td className="p-3 text-right text-amber-900">{formatNumber(item.amarelaKg, 1)} kg</td>
                  <td className="p-3 text-right font-black text-slate-900 text-sm">
                    {formatNumber(item.totalKg, 1)} kg
                  </td>
                  <td className="p-3 text-right font-black text-emerald-700 text-sm">
                    {formatBRL(item.totalR$)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
