import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatNumber } from '../../utils/conversions';
import {
  Calendar,
  Users,
  Hammer,
  DollarSign,
  Scale,
  Layers,
  Edit2,
  Plus,
  Info,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  ShieldCheck,
  CheckCheck,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { ProducaoQuebraDiaria } from '../../types';

interface ProducaoDiaTabProps {
  onOpenNovoLancamento: () => void;
}

export const ProducaoDiaTab: React.FC<ProducaoDiaTabProps> = ({ onOpenNovoLancamento }) => {
  const {
    producoesQuebra,
    quebradores,
    updateProducaoQuebra,
    autorizarProducaoQuebra,
    autorizarTodasProducoesQuebra,
    activePerfil,
    currentUser,
    lotes,
  } = useApp();

  const activeLoteQuebra = lotes.find((l) => l.situacao === 'Em quebra');

  // Find unique dates from producoes
  const availableDates = Array.from(new Set(producoesQuebra.map((p) => p.data))).sort().reverse();
  const [selectedDate, setSelectedDate] = useState<string>(
    availableDates[0] || new Date().toISOString().split('T')[0]
  );

  // Edit production state
  const [editingItem, setEditingItem] = useState<ProducaoQuebraDiaria | null>(null);
  const [editKgInteira, setEditKgInteira] = useState<string>('0');
  const [editKgQuebrada, setEditKgQuebrada] = useState<string>('0');
  const [editKgAmarela, setEditKgAmarela] = useState<string>('0');
  const [editJustificativa, setEditJustificativa] = useState<string>('');

  // Filter items for selected date
  const dayItems = producoesQuebra.filter((p) => p.data === selectedDate);

  // Consolidated metrics for the selected date
  const totalQuebradoresDia = new Set(dayItems.map((p) => p.quebradorId)).size;
  const totalKgInteira = dayItems.reduce((acc, p) => acc + p.kgInteira, 0);
  const totalKgQuebrada = dayItems.reduce((acc, p) => acc + p.kgQuebrada, 0);
  const totalKgAmarela = dayItems.reduce((acc, p) => acc + p.kgAmarela, 0);
  const totalKgDia = dayItems.reduce((acc, p) => acc + p.totalKg, 0);
  const totalFolhaDia = dayItems.reduce((acc, p) => acc + p.valorTotal, 0);
  const totalLotesAtendidos = new Set(dayItems.map((p) => p.loteId)).size;
  const custoMedioPorKg = totalKgDia > 0 ? totalFolhaDia / totalKgDia : 0;

  const handleStartEdit = (p: ProducaoQuebraDiaria) => {
    setEditingItem(p);
    setEditKgInteira(p.kgInteira.toString());
    setEditKgQuebrada(p.kgQuebrada.toString());
    setEditKgAmarela(p.kgAmarela.toString());
    setEditJustificativa('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editJustificativa.trim()) {
      alert('Por favor informe a justificativa para alterar o lançamento.');
      return;
    }

    updateProducaoQuebra(
      editingItem.id,
      {
        kgInteira: parseFloat(editKgInteira) || 0,
        kgQuebrada: parseFloat(editKgQuebrada) || 0,
        kgAmarela: parseFloat(editKgAmarela) || 0,
      },
      activePerfil,
      editJustificativa
    );

    setEditingItem(null);
  };

  // Filter pending productions for Manager Authorization
  const pendingProds = producoesQuebra.filter((p) => !p.statusAutorizacao || p.statusAutorizacao === 'Pendente');

  return (
    <div className="space-y-6">
      
      {/* Date Filter & Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">Selecione a Data de Produção</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Active Lot Indicator */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
          <Hammer className="w-4 h-4 text-amber-800 shrink-0 animate-pulse" />
          <div className="text-left">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Lote Ativo na Quebra (Exclusivo)</div>
            <div className="text-xs font-black text-amber-950">
              {activeLoteQuebra ? `${activeLoteQuebra.codigo} (${activeLoteQuebra.quantidadeAtualHl} hl)` : 'Nenhum Lote em Quebra'}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenNovoLancamento}
          className="px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-700/50 shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-200" />
          <span>Lançar Produção do Dia</span>
        </button>
      </div>

      {/* Manager Pending Authorization Panel */}
      {pendingProds.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                    Painel de Pendências de Autorização do Gestor
                  </h3>
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    {pendingProds.length} pendente{pendingProds.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Lançamentos realizados pelos quebradores aguardando validação para cálculo de remuneração
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                autorizarTodasProducoesQuebra(
                  pendingProds.map((p) => p.id),
                  currentUser?.nome || activePerfil
                )
              }
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-emerald-600 shrink-0"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Autorizar Todos ({pendingProds.length})</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-amber-100/60 text-amber-950 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Quebrador(a)</th>
                    <th className="p-3">Lote</th>
                    <th className="p-3 text-right">Inteira</th>
                    <th className="p-3 text-right">Quebrada</th>
                    <th className="p-3 text-right">Amarela</th>
                    <th className="p-3 text-right">Total Kg</th>
                    <th className="p-3 text-right">Valor A Pagar</th>
                    <th className="p-3 text-center">Ações de Autorização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/50 font-medium">
                  {pendingProds.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{p.data}</td>
                      <td className="p-3 font-extrabold text-slate-900">{p.quebradorNome}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{p.loteCodigo}</td>
                      <td className="p-3 text-right text-emerald-800 font-bold">{formatNumber(p.kgInteira, 1)} kg</td>
                      <td className="p-3 text-right text-amber-800 font-bold">{formatNumber(p.kgQuebrada, 1)} kg</td>
                      <td className="p-3 text-right text-amber-900 font-bold">{formatNumber(p.kgAmarela, 1)} kg</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatNumber(p.totalKg, 1)} kg</td>
                      <td className="p-3 text-right font-black text-emerald-700">{formatBRL(p.valorTotal)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              autorizarProducaoQuebra(p.id, 'Aprovado', currentUser?.nome || activePerfil)
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => {
                              const motivo = window.prompt('Informe o motivo do indeferimento/rejeição:');
                              if (motivo !== null) {
                                autorizarProducaoQuebra(
                                  p.id,
                                  'Rejeitado',
                                  currentUser?.nome || activePerfil,
                                  motivo || 'Sem justificativa detalhada'
                                );
                              }
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Rejeitar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Main Consolidated Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
        
        {/* Quebradores Ativos */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-semibold text-[11px] flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-700" />
            Quebradores
          </div>
          <div className="text-xl font-black text-slate-900">{totalQuebradoresDia}</div>
          <div className="text-[10px] text-slate-400">Trabalhando hoje</div>
        </div>

        {/* Inteira Total */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-semibold text-[11px]">Cast. Inteira</div>
          <div className="text-xl font-black text-emerald-700">{formatNumber(totalKgInteira, 1)} kg</div>
          <div className="text-[10px] text-emerald-800 font-semibold">R$ 5,00/kg</div>
        </div>

        {/* Quebrada Total */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-semibold text-[11px]">Cast. Quebrada</div>
          <div className="text-xl font-black text-amber-700">{formatNumber(totalKgQuebrada, 1)} kg</div>
          <div className="text-[10px] text-amber-800 font-semibold">R$ 2,50/kg</div>
        </div>

        {/* Amarela Total */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-semibold text-[11px]">Cast. Amarela</div>
          <div className="text-xl font-black text-amber-800">{formatNumber(totalKgAmarela, 1)} kg</div>
          <div className="text-[10px] text-amber-800 font-semibold">R$ 2,50/kg</div>
        </div>

        {/* Produção Total */}
        <div className="p-3 bg-amber-950 text-white rounded-2xl shadow-sm space-y-1 border border-amber-800">
          <div className="text-amber-200 font-semibold text-[11px] flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            Total Dia (kg)
          </div>
          <div className="text-xl font-black text-amber-300">{formatNumber(totalKgDia, 1)} kg</div>
          <div className="text-[10px] text-slate-300">Produção total</div>
        </div>

        {/* Total Folha Dia */}
        <div className="p-3 bg-emerald-950 text-white rounded-2xl shadow-sm space-y-1 border border-emerald-800">
          <div className="text-emerald-200 font-semibold text-[11px] flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Folha do Dia
          </div>
          <div className="text-xl font-black text-emerald-300">{formatBRL(totalFolhaDia)}</div>
          <div className="text-[10px] text-emerald-200">A pagar/pago</div>
        </div>

        {/* Lotes Atendidos */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-semibold text-[11px] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-700" />
            Lotes
          </div>
          <div className="text-xl font-black text-slate-900">{totalLotesAtendidos}</div>
          <div className="text-[10px] text-slate-400">Atendidos</div>
        </div>

        {/* Custo Médio por kg */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-semibold text-[11px]">Custo Mão Obra</div>
          <div className="text-xl font-black text-cyan-900">{formatBRL(custoMedioPorKg)}/kg</div>
          <div className="text-[10px] text-slate-400">Custo médio</div>
        </div>

      </div>

      {/* Individual Production Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-800" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Produção Individual da Equipe — {selectedDate}</h3>
              <p className="text-xs text-slate-500">Listagem de lançamentos diários com apuração automática de remuneração</p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
            {dayItems.length} lançamentos registrados
          </span>
        </div>

        {dayItems.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs space-y-2">
            <Info className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Nenhuma produção de quebra registrada para o dia <strong>{selectedDate}</strong>.</p>
            <button
              onClick={onOpenNovoLancamento}
              className="mt-2 px-4 py-2 bg-amber-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Lançar Produção Agora
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Quebrador(a)</th>
                  <th className="p-3">Lote</th>
                  <th className="p-3 text-right">Inteira (kg)</th>
                  <th className="p-3 text-right">Quebrada (kg)</th>
                  <th className="p-3 text-right">Amarela (kg)</th>
                  <th className="p-3 text-right">Total (kg)</th>
                  <th className="p-3 text-right">Valor A Receber</th>
                  <th className="p-3 text-center">Pagamento</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dayItems.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      {item.quebradorNome}
                      {item.historicoModificacoes && item.historicoModificacoes.length > 0 && (
                        <span className="ml-2 bg-amber-100 text-amber-900 text-[9px] px-1.5 py-0.5 rounded font-semibold border border-amber-200" title="Corrigido pelo Gestor">
                          Editado
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px] font-bold border border-slate-200">
                        {item.loteCodigo}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-800">
                      {formatNumber(item.kgInteira, 1)} kg
                    </td>
                    <td className="p-3 text-right font-semibold text-amber-800">
                      {formatNumber(item.kgQuebrada, 1)} kg
                    </td>
                    <td className="p-3 text-right font-semibold text-amber-900">
                      {formatNumber(item.kgAmarela, 1)} kg
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      {formatNumber(item.totalKg, 1)} kg
                    </td>
                    <td className="p-3 text-right font-black text-emerald-700 text-sm">
                      {formatBRL(item.valorTotal)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.situacaoPagamento === 'Pago'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {item.situacaoPagamento}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-300"
                        title="Corrigir lançamento"
                      >
                        <Edit2 className="w-3 h-3 text-amber-700" />
                        Corrigir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer Totals Row */}
              <tfoot className="bg-slate-900 text-white font-black text-xs border-t-2 border-amber-500">
                <tr>
                  <td className="p-3.5 uppercase tracking-wider text-amber-300">Totais Gerais ({selectedDate}):</td>
                  <td className="p-3.5 text-slate-300 font-mono">{totalLotesAtendidos} Lotes</td>
                  <td className="p-3.5 text-right text-emerald-300">{formatNumber(totalKgInteira, 1)} kg</td>
                  <td className="p-3.5 text-right text-amber-300">{formatNumber(totalKgQuebrada, 1)} kg</td>
                  <td className="p-3.5 text-right text-amber-300">{formatNumber(totalKgAmarela, 1)} kg</td>
                  <td className="p-3.5 text-right text-amber-400 text-sm">{formatNumber(totalKgDia, 1)} kg</td>
                  <td className="p-3.5 text-right text-emerald-400 text-base">{formatBRL(totalFolhaDia)}</td>
                  <td colSpan={2} className="p-3.5 text-center text-slate-400 font-normal text-[11px]">
                    Custo Médio: {formatBRL(custoMedioPorKg)}/kg
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Correcting / Editing Production */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-700" />
                Corrigir Lançamento — {editingItem.quebradorNome}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 font-semibold">
                Lote: {editingItem.loteCodigo} • Data: {editingItem.data}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inteira (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editKgInteira}
                    onChange={(e) => setEditKgInteira(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quebrada (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editKgQuebrada}
                    onChange={(e) => setEditKgQuebrada(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amarela (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editKgAmarela}
                    onChange={(e) => setEditKgAmarela(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Justificativa da Alteração (Obrigatória para Auditoria) *
                </label>
                <textarea
                  value={editJustificativa}
                  onChange={(e) => setEditJustificativa(e.target.value)}
                  placeholder="Ex: Correção na balança da balança 02 após pesagem de conferência..."
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 text-white font-extrabold rounded-xl shadow"
                >
                  Salvar Correção Auditada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
