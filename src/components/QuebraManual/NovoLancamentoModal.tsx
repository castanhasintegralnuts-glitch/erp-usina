import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatNumber } from '../../utils/conversions';
import { X, Hammer, Scale, Calendar, User, Layers, Calculator, CheckCircle2 } from 'lucide-react';

interface NovoLancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuebradorId?: string;
}

export const NovoLancamentoModal: React.FC<NovoLancamentoModalProps> = ({
  isOpen,
  onClose,
  defaultQuebradorId,
}) => {
  const {
    quebradores,
    lotes,
    tabelaPrecoQuebra,
    addProducaoQuebra,
    updateStatusLote,
    activePerfil,
    currentUser,
  } = useApp();

  const isQuebrador = activePerfil === 'Quebrador' || currentUser?.perfil === 'Quebrador';
  const activeQuebradores = quebradores.filter((q) => q.situacao === 'Ativo');

  // Find linked quebrador for logged in user if applicable
  const linkedQuebrador = quebradores.find(
    (q) => q.id === currentUser?.quebradorId || q.nome.toLowerCase() === currentUser?.nome?.toLowerCase()
  );

  // Find single active lot in Quebra or fallback to first available
  const activeLoteEmQuebra = lotes.find((l) => l.situacao === 'Em quebra') || lotes[0];

  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quebradorId, setQuebradorId] = useState<string>(
    isQuebrador
      ? (linkedQuebrador?.id || defaultQuebradorId || activeQuebradores[0]?.id || '')
      : (defaultQuebradorId || activeQuebradores[0]?.id || '')
  );
  const [loteId, setLoteId] = useState<string>(activeLoteEmQuebra?.id || '');

  React.useEffect(() => {
    if (isQuebrador && linkedQuebrador) {
      setQuebradorId(linkedQuebrador.id);
    }
  }, [isQuebrador, linkedQuebrador]);
  
  const [kgInteira, setKgInteira] = useState<string>('0');
  const [kgQuebrada, setKgQuebrada] = useState<string>('0');
  const [kgAmarela, setKgAmarela] = useState<string>('0');

  // Sync default lot if active lot in quebra changes
  React.useEffect(() => {
    if (activeLoteEmQuebra && !loteId) {
      setLoteId(activeLoteEmQuebra.id);
    }
  }, [activeLoteEmQuebra]);

  if (!isOpen) return null;

  const numInteira = parseFloat(kgInteira) || 0;
  const numQuebrada = parseFloat(kgQuebrada) || 0;
  const numAmarela = parseFloat(kgAmarela) || 0;

  const totalKg = Math.round((numInteira + numQuebrada + numAmarela) * 100) / 100;

  const valInteira = Math.round((numInteira * tabelaPrecoQuebra.precoInteiraPerKg) * 100) / 100;
  const valQuebrada = Math.round((numQuebrada * tabelaPrecoQuebra.precoQuebradaPerKg) * 100) / 100;
  const valAmarela = Math.round((numAmarela * tabelaPrecoQuebra.precoAmarelaPerKg) * 100) / 100;

  const totalValor = Math.round((valInteira + valQuebrada + valAmarela) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quebradorId) {
      alert('Selecione um colaborador.');
      return;
    }
    if (!loteId) {
      alert('Selecione um lote.');
      return;
    }
    if (totalKg <= 0) {
      alert('Informe ao menos 0.1 kg de produção.');
      return;
    }

    const qObj = quebradores.find((q) => q.id === quebradorId);
    const lObj = lotes.find((l) => l.id === loteId);

    // Ensure selected lot is set as the single active lot in Quebra
    if (lObj && lObj.situacao !== 'Em quebra') {
      updateStatusLote(loteId, 'Em quebra');
    }

    addProducaoQuebra(
      {
        data,
        quebradorId,
        quebradorNome: qObj?.nome || 'Desconhecido',
        loteId,
        loteCodigo: lObj?.codigo || 'LOTE-N/A',
        kgInteira: numInteira,
        kgQuebrada: numQuebrada,
        kgAmarela: numAmarela,
        criadoPor: activePerfil,
      },
      activePerfil
    );

    // Reset weights
    setKgInteira('0');
    setKgQuebrada('0');
    setKgAmarela('0');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-800 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700/80 border border-amber-600/50 flex items-center justify-center text-amber-200 shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Registrar Produção Diária de Quebra</h3>
              <p className="text-xs text-amber-200/80">Monte Dourado — Cálculo Automático de Remuneração</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Main Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                Data da Quebra
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-700" />
                Quebrador(a)
              </label>
              {isQuebrador ? (
                <div className="w-full px-3 py-2 bg-amber-100/70 border border-amber-300 rounded-xl text-xs font-black text-amber-950 flex items-center justify-between">
                  <span>{linkedQuebrador?.nome || currentUser?.nome || 'Minha Conta'}</span>
                  <span className="text-[10px] bg-amber-800 text-amber-100 font-extrabold px-1.5 py-0.5 rounded">Titular</span>
                </div>
              ) : (
                <select
                  value={quebradorId}
                  onChange={(e) => setQuebradorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                >
                  {activeQuebradores.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.nome} ({q.matricula})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                Lote Em Quebra (Exclusivo)
              </label>
              <select
                value={loteId}
                onChange={(e) => setLoteId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              >
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.codigo} {l.situacao === 'Em quebra' ? ' (🔨 ATIVO NA QUEBRA)' : `(${l.quantidadeAtualHl} hl)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Quebra Lot Banner */}
          <div className="p-2.5 bg-amber-50 border border-amber-300/80 rounded-xl text-[11px] text-amber-950 flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              Regra de Fluxo:
            </span>
            <span className="text-amber-900 font-medium">
              O lançamento é atribuído automaticamente ao lote ativo da etapa de quebra.
            </span>
          </div>

          {/* Quebrador Pending Authorization Warning */}
          {isQuebrador && (
            <div className="p-3 bg-amber-100/80 border border-amber-300 rounded-2xl text-xs flex items-center gap-2.5 text-amber-950">
              <div className="w-7 h-7 rounded-lg bg-amber-200/80 border border-amber-400 flex items-center justify-center shrink-0 text-amber-800 font-black">
                ⏳
              </div>
              <div className="text-[11px]">
                <strong className="block text-amber-900 font-extrabold">Aviso de Workflow de Aprovação:</strong>
                Este lançamento será enviado para o <strong>Painel de Pendências do Gestor</strong> para autorização antes da liberação do pagamento.
              </div>
            </div>
          )}

          {/* Table Price Reference Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs flex items-center justify-between text-amber-950">
            <span className="font-bold flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-700" />
              Tabela Vigente:
            </span>
            <div className="flex gap-2 text-[11px]">
              <span className="bg-white px-2 py-0.5 rounded-md border border-amber-300 font-semibold">
                Inteira: {formatBRL(tabelaPrecoQuebra.precoInteiraPerKg)}/kg
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-amber-300 font-semibold">
                Quebrada: {formatBRL(tabelaPrecoQuebra.precoQuebradaPerKg)}/kg
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-amber-300 font-semibold">
                Amarela: {formatBRL(tabelaPrecoQuebra.precoAmarelaPerKg)}/kg
              </span>
            </div>
          </div>

          {/* Weight Inputs */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-700" />
              Lançamento dos Pesos Produzidos (kg)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Inteira */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">Castanha Inteira</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={kgInteira}
                    onChange={(e) => setKgInteira(e.target.value)}
                    className="w-full pl-2 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-2 top-2 text-xs font-bold text-slate-400">kg</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1 text-right">
                  = {formatBRL(valInteira)}
                </div>
              </div>

              {/* Quebrada (Pedaco) */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">Quebrada (Pedaço)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={kgQuebrada}
                    onChange={(e) => setKgQuebrada(e.target.value)}
                    className="w-full pl-2 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-2 top-2 text-xs font-bold text-slate-400">kg</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1 text-right">
                  = {formatBRL(valQuebrada)}
                </div>
              </div>

              {/* Amarela */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">Castanha Amarela</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={kgAmarela}
                    onChange={(e) => setKgAmarela(e.target.value)}
                    className="w-full pl-2 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-2 top-2 text-xs font-bold text-slate-400">kg</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1 text-right">
                  = {formatBRL(valAmarela)}
                </div>
              </div>
            </div>
          </div>

          {/* Auto Calculated Summary Card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Produzido no Dia:</span>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {formatNumber(totalKg, 1)} kg
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Valor Total A Pagar:</span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {formatBRL(totalValor)}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-200" />
              Confirmar Lançamento
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
