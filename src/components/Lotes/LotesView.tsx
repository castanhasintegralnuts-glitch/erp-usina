import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lote, SituacaoLote } from '../../types';
import { formatBRL, formatNumber, calculateLoteMetrics, VOLUMES_PER_LOTE } from '../../utils/conversions';
import {
  Layers,
  Plus,
  Printer,
  X,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Boxes,
  Info
} from 'lucide-react';

export const LotesView: React.FC = () => {
  const {
    lotes,
    addLote,
    updateStatusLote,
    gerarDocumento
  } = useApp();

  const [selectedLote, setSelectedLote] = useState<Lote | null>(lotes[0] || null);

  const [isNewLoteModalOpen, setIsNewLoteModalOpen] = useState(false);
  const [novoLoteForm, setNovoLoteForm] = useState({
    safra: '2026/2027',
    origemDominante: 'Reserva Extrativista do Jari',
    destinoDominante: 'Beneficiamento' as any,
    localArmazenamento: 'Silo 01 - Matéria-Prima',
    observacoes: '',
  });

  const handleCreateLote = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addLote({
      dataAbertura: new Date().toISOString().split('T')[0],
      quantidadeInicialHl: 0,
      quantidadeAtualHl: 0,
      quantidadeLatas: 0,
      fornecedoresNomes: [],
      recebimentosIds: [],
      recebimentosCodigos: [],
      safra: novoLoteForm.safra,
      origemDominante: novoLoteForm.origemDominante,
      destinoDominante: novoLoteForm.destinoDominante,
      localArmazenamento: novoLoteForm.localArmazenamento,
      custoMedioPorHl: 220,
      custoMedioPorLata: 44,
      situacao: 'Em formação',
      observacoes: novoLoteForm.observacoes,
    });
    setSelectedLote(created);
    setIsNewLoteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Formação e Gestão de Lotes</h2>
            <p className="text-xs text-slate-500">
              Padrão Industrial: <strong>{VOLUMES_PER_LOTE} volumes por lote</strong> (1 volume = 1 hl = 5 latas)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewLoteModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-800 hover:bg-cyan-900 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          CRIAR NOVO LOTE
        </button>
      </div>

      {/* Standard Lot Information Banner */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-xs text-cyan-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-cyan-900 text-sm">Regra Industrial de Loteamento — Integral NUTS:</span>
            <p className="text-slate-700 mt-0.5">
              Cada lote padrão é composto por <strong>80 volumes</strong>, correspondendo exatamente a <strong>80 hectolitros (400 latas)</strong>. Lotes com volumes acima ou abaixo de 80 são identificados com seu percentual de ocupação em relação ao lote completo.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Lotes List + Lot Extract */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
          {lotes.map((lote) => {
            const isSelected = selectedLote?.id === lote.id;
            const metrics = calculateLoteMetrics(lote.quantidadeAtualHl);
            return (
              <div
                key={lote.id}
                onClick={() => setSelectedLote(lote)}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                  isSelected ? 'bg-cyan-50/80 border-l-4 border-cyan-700' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{lote.codigo}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      lote.situacao === 'Em quebra'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                        : 'bg-slate-100 text-slate-700 font-semibold'
                    }`}
                  >
                    {lote.situacao === 'Em quebra' ? '🔨 Em Quebra (Ativo)' : lote.situacao}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Origem: {lote.origemDominante}
                </div>
                
                {/* Volume Progress Indicator */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="text-cyan-900">
                      {metrics.volumes} vol ({lote.quantidadeAtualHl} hl)
                    </span>
                    <span className="text-slate-500 font-semibold text-[10px]">
                      {metrics.porcentagemOcupacao}% do Lote ({VOLUMES_PER_LOTE} vol)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        metrics.porcentagemOcupacao >= 100
                          ? 'bg-emerald-600'
                          : metrics.porcentagemOcupacao >= 50
                          ? 'bg-cyan-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, metrics.porcentagemOcupacao)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mt-2 font-semibold text-slate-600">
                  <span>{lote.quantidadeLatas} latas</span>
                  <span className="text-emerald-700 font-bold">{formatBRL(lote.custoMedioPorHl)}/hl</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Lot Extract Drawer */}
        <div className="lg:col-span-2">
          {selectedLote ? (
            (() => {
              const metrics = calculateLoteMetrics(selectedLote.quantidadeAtualHl);
              return (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="bg-cyan-100 text-cyan-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {selectedLote.situacao}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{selectedLote.codigo}</h3>
                      <p className="text-xs text-slate-500">Safra: {selectedLote.safra} • Abertura: {selectedLote.dataAbertura}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          gerarDocumento('Extrato de Lote', selectedLote.id, selectedLote.fornecedoresNomes.join(', '), selectedLote);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-cyan-400" />
                        Extrato de Lote A4
                      </button>
                    </div>
                  </div>

                  {/* Volume Ocupancy Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-cyan-400" />
                        <span className="font-bold text-sm text-white">Volumes do Lote</span>
                      </div>
                      <span className="text-xs text-cyan-300 font-bold bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                        Capacidade Padrão: {VOLUMES_PER_LOTE} Volumes
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                      <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-400 font-medium">Total de Volumes</div>
                        <div className="text-xl font-black text-cyan-300 mt-0.5">{metrics.volumes} vol</div>
                        <div className="text-[10px] text-slate-400">1 vol = 1 hectolitro</div>
                      </div>

                      <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-400 font-medium">Ocupação do Lote</div>
                        <div className="text-xl font-black text-emerald-400 mt-0.5">{metrics.porcentagemOcupacao}%</div>
                        <div className="text-[10px] text-slate-400">Meta: 80 vol</div>
                      </div>

                      <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-400 font-medium">Equivalente em Latas</div>
                        <div className="text-xl font-black text-amber-300 mt-0.5">{selectedLote.quantidadeLatas} latas</div>
                        <div className="text-[10px] text-slate-400">5 latas/volume</div>
                      </div>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, metrics.porcentagemOcupacao)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500">Volume Total (hl):</span>
                      <div className="text-lg font-black text-slate-900 mt-1">
                        {selectedLote.quantidadeAtualHl} hl
                      </div>
                      <div className="text-[10px] text-slate-500">{selectedLote.quantidadeLatas} latas</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500">Custo Médio / hl:</span>
                      <div className="text-lg font-black text-emerald-800 mt-1">
                        {formatBRL(selectedLote.custoMedioPorHl)}
                      </div>
                      <div className="text-[10px] text-slate-500">{formatBRL(selectedLote.custoMedioPorLata)}/lata</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500">Origem Dominante:</span>
                      <div className="font-bold text-slate-900 mt-1 truncate">
                        {selectedLote.origemDominante}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500">Localização:</span>
                      <div className="font-bold text-slate-900 mt-1 truncate">
                        {selectedLote.localArmazenamento}
                      </div>
                    </div>
                  </div>

                  {/* Change Lot Status Buttons */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-800">Alterar Situação do Lote:</span>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          'Em formação',
                          'Disponível para beneficiamento',
                          'Em quebra',
                          'Disponível para venda com casca',
                          'Em quarentena',
                          'Bloqueado',
                          'Encerrado',
                        ] as SituacaoLote[]
                      ).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateStatusLote(selectedLote.id, st)}
                          className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                            selectedLote.situacao === st
                              ? st === 'Em quebra'
                                ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                                : 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                          }`}
                        >
                          {st === 'Em quebra' ? '🔨 Em Quebra (Exclusivo)' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Selecione um lote para visualizar o extrato detalhado.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Novo Lote */}
      {isNewLoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Abrir Novo Lote de Produção</h3>
              <button onClick={() => setIsNewLoteModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-xs text-cyan-900 font-semibold">
              Capacidade do lote padrão: <strong>80 Volumes (80 Hectolitros = 400 Latas)</strong>.
            </div>

            <form onSubmit={handleCreateLote} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Safra</label>
                <input
                  type="text"
                  value={novoLoteForm.safra}
                  onChange={(e) => setNovoLoteForm({ ...novoLoteForm, safra: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Origem Dominante</label>
                <input
                  type="text"
                  value={novoLoteForm.origemDominante}
                  onChange={(e) => setNovoLoteForm({ ...novoLoteForm, origemDominante: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Local de Armazenamento</label>
                <input
                  type="text"
                  value={novoLoteForm.localArmazenamento}
                  onChange={(e) => setNovoLoteForm({ ...novoLoteForm, localArmazenamento: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewLoteModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-800 text-white font-bold rounded-xl text-xs"
                >
                  Criar Lote (80 Volumes Padrão)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

