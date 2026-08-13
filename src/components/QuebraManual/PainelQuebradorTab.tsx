import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatNumber } from '../../utils/conversions';
import { NovoLancamentoModal } from './NovoLancamentoModal';
import {
  User,
  Scale,
  DollarSign,
  Calendar,
  History,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  ShieldAlert,
  BarChart2,
  Plus,
  AlertTriangle
} from 'lucide-react';

export const PainelQuebradorTab: React.FC = () => {
  const {
    producoesQuebra,
    pagamentosQuebra,
    quebradores,
    activePerfil,
    currentUser,
    selectedQuebradorId,
    setSelectedQuebradorId,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isQuebradorPerfil = activePerfil === 'Quebrador' || currentUser?.perfil === 'Quebrador';

  const defaultQ = quebradores.find((q) => q.situacao === 'Ativo') || quebradores[0];

  // Find linked quebrador for current logged user if applicable
  const linkedQuebrador = quebradores.find(
    (q) => q.id === currentUser?.quebradorId || q.nome.toLowerCase() === currentUser?.nome?.toLowerCase()
  );

  const currentQuebradorId = isQuebradorPerfil
    ? (linkedQuebrador?.id || defaultQ?.id)
    : (selectedQuebradorId || defaultQ?.id);

  const currentQuebrador = quebradores.find((q) => q.id === currentQuebradorId);

  // Filter ONLY productions for this currentQuebradorId
  const myProducoes = producoesQuebra.filter((p) => p.quebradorId === currentQuebradorId);
  const myPagamentos = pagamentosQuebra.filter((p) => p.quebradorId === currentQuebradorId);

  // Dates logic
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  
  // Calculate start of week (Monday)
  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  // Calculate start of month
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Production and Earnings Today
  const todayProds = myProducoes.filter((p) => p.data === todayStr);
  const prodDiaKg = todayProds.reduce((acc, p) => acc + p.totalKg, 0);
  const valorDiaR$ = todayProds.reduce((acc, p) => acc + p.valorTotal, 0);

  // Production and Earnings Week
  const weekProds = myProducoes.filter((p) => p.data >= startOfWeekStr);
  const prodSemanaKg = weekProds.reduce((acc, p) => acc + p.totalKg, 0);
  const valorSemanaR$ = weekProds.reduce((acc, p) => acc + p.valorTotal, 0);

  // Production and Earnings Month
  const monthProds = myProducoes.filter((p) => p.data >= startOfMonthStr);
  const prodMesKg = monthProds.reduce((acc, p) => acc + p.totalKg, 0);
  const valorMesR$ = monthProds.reduce((acc, p) => acc + p.valorTotal, 0);

  // Total Payments & Pendings
  const totalPagamentosRealizados = myPagamentos.reduce((acc, p) => acc + p.valorPago, 0);
  const pendentesProds = myProducoes.filter((p) => p.situacaoPagamento === 'Pendente');
  const valorPendenteR$ = pendentesProds.reduce((acc, p) => acc + p.valorTotal, 0);

  // Simple Chart Data (Last 7 entries)
  const chartEntries = [...myProducoes]
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(-7);

  const maxKgInChart = Math.max(...chartEntries.map((e) => e.totalKg), 30);

  return (
    <div className="space-y-6">
      
      {/* Header & Worker Switcher (Only visible to Admin/Gestor; Quebrador sees their own badge) */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-xl border border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xl shrink-0 shadow-inner">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-xl text-white tracking-tight">
                {currentQuebrador?.nome || 'Painel do Colaborador'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                {currentQuebrador?.matricula || 'QBR-000'}
              </span>
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5 flex items-center gap-2">
              <span>Admissão: {currentQuebrador?.dataAdmissao || 'N/A'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Acesso Individual Transparente</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-amber-300 shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>Lançar Minha Produção Hoje</span>
          </button>

          {!isQuebradorPerfil && (
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-amber-800/40 space-y-1">
              <label className="block text-[10px] font-bold text-amber-300 uppercase">
                Simular Visualização de Quebrador:
              </label>
              <select
                value={currentQuebradorId}
                onChange={(e) => setSelectedQuebradorId(e.target.value)}
                className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-700/50 focus:ring-2 focus:ring-amber-500"
              >
                {quebradores.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.nome} ({q.matricula})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Produção Hoje */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              Produção Hoje
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">Hoje</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatNumber(prodDiaKg, 1)} <span className="text-sm font-bold text-slate-500">kg</span></div>
          <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 text-center">
            {formatBRL(valorDiaR$)} a receber
          </div>
        </div>

        {/* Produção Semana */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-700" />
              Produção Semana
            </span>
            <span className="text-[10px] bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded font-mono">Esta Semana</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatNumber(prodSemanaKg, 1)} <span className="text-sm font-bold text-slate-500">kg</span></div>
          <div className="text-xs font-extrabold text-cyan-800 bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-200 text-center">
            {formatBRL(valorSemanaR$)} produzido
          </div>
        </div>

        {/* Produção Mês */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-800" />
              Produção Mês
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">Este Mês</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatNumber(prodMesKg, 1)} <span className="text-sm font-bold text-slate-500">kg</span></div>
          <div className="text-xs font-extrabold text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-center">
            {formatBRL(valorMesR$)} acumulado
          </div>
        </div>

        {/* Valores Pendentes */}
        <div className="p-4 bg-amber-950 text-white rounded-2xl border border-amber-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-200 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              A Receber (Pendente)
            </span>
          </div>
          <div className="text-2xl font-black text-amber-300">{formatBRL(valorPendenteR$)}</div>
          <div className="text-[11px] text-amber-200 font-medium">
            {pendentesProds.length} diárias aguardando repasse
          </div>
        </div>

        {/* Pagamentos Realizados */}
        <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Já Recebido
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-300">{formatBRL(totalPagamentosRealizados)}</div>
          <div className="text-[11px] text-emerald-200 font-medium">
            {myPagamentos.length} pagamentos liquidados
          </div>
        </div>

      </div>

      {/* Simple Productivity Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-800" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Evolução da Produtividade Individual (Últimos Dias Lançados)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">Meta Diária Sugerida: 20,0 kg</span>
        </div>

        {chartEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">Nenhum histórico recente para exibir no gráfico.</div>
        ) : (
          <div className="pt-4 pb-2 px-2 border-t border-slate-100 flex items-end justify-between gap-3 h-48">
            {chartEntries.map((item) => {
              const heightPercent = Math.min(100, Math.max(15, (item.totalKg / maxKgInChart) * 100));
              return (
                <div key={item.id} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-black text-slate-800 opacity-80 group-hover:opacity-100">
                    {formatNumber(item.totalKg, 1)} kg
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-amber-800 to-amber-500 rounded-t-xl group-hover:brightness-110 transition-all shadow-md relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                      {formatBRL(item.valorTotal)}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 font-mono">
                    {item.data.split('-').slice(1).reverse().join('/')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Production History & Payments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Production History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-amber-800" />
              Histórico Completo de Produção
            </h3>
            <span className="text-xs text-slate-500 font-bold">{myProducoes.length} lançamentos</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Lote</th>
                  <th className="p-3 text-right">Inteira</th>
                  <th className="p-3 text-right">Quebrada</th>
                  <th className="p-3 text-right">Amarela</th>
                  <th className="p-3 text-right">Total Kg</th>
                  <th className="p-3 text-right">Valor A Receber</th>
                  <th className="p-3 text-center">Autorização Gestor</th>
                  <th className="p-3 text-center">Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {myProducoes.map((p) => {
                  const isAprovado = p.statusAutorizacao === 'Aprovado';
                  const isRejeitado = p.statusAutorizacao === 'Rejeitado';
                  const isPendente = !p.statusAutorizacao || p.statusAutorizacao === 'Pendente';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold font-mono">{p.data}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{p.loteCodigo}</td>
                      <td className="p-3 text-right text-emerald-800">{formatNumber(p.kgInteira, 1)} kg</td>
                      <td className="p-3 text-right text-amber-800">{formatNumber(p.kgQuebrada, 1)} kg</td>
                      <td className="p-3 text-right text-amber-900">{formatNumber(p.kgAmarela, 1)} kg</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatNumber(p.totalKg, 1)} kg</td>
                      <td className="p-3 text-right font-black text-emerald-700">{formatBRL(p.valorTotal)}</td>
                      <td className="p-3 text-center">
                        {isAprovado && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Aprovado
                          </span>
                        )}
                        {isPendente && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Aguardando Gestor
                          </span>
                        )}
                        {isRejeitado && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300" title={p.motivoRejeicao}>
                            <AlertTriangle className="w-3 h-3 text-rose-700" />
                            Rejeitado
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.situacaoPagamento === 'Pago'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {p.situacaoPagamento}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Received History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Comprovantes de Pagamentos Efetuados
          </h3>

          {myPagamentos.length === 0 ? (
            <div className="text-slate-400 text-xs text-center py-6">
              Nenhum registro de pagamento liquidado até o momento.
            </div>
          ) : (
            <div className="space-y-3">
              {myPagamentos.map((pg) => (
                <div key={pg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-slate-900">{pg.codigo}</span>
                    <span className="text-xs font-black text-emerald-700">{formatBRL(pg.valorPago)}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between">
                    <span>Data: {pg.dataPagamento}</span>
                    <span className="font-semibold bg-emerald-100 text-emerald-900 px-1.5 rounded">{pg.formaPagamento}</span>
                  </div>
                  {pg.observacoes && (
                    <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      "{pg.observacoes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Production Launch Modal */}
      <NovoLancamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultQuebradorId={currentQuebradorId}
      />

    </div>
  );
};
