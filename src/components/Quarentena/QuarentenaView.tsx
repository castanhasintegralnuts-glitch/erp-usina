import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNumber } from '../../utils/conversions';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export const QuarentenaView: React.FC = () => {
  const { recebimentos, alterarDestinoEstoque, activePerfil } = useApp();

  const quarentenaItems = recebimentos.flatMap((rec) => {
    if (rec.cancelado) return [];
    return rec.destinos
      .filter((d) => d.destino === 'Quarentena' && d.quantidadeHectolitros > 0)
      .map((d) => ({
        recebimento: rec,
        destinoItem: d,
      }));
  });

  const totalQuarentenaHl = quarentenaItems.reduce(
    (acc, item) => acc + item.destinoItem.quantidadeHectolitros,
    0
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-rose-950 text-rose-50 p-6 rounded-2xl border border-rose-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-200 px-3 py-1 rounded-full text-xs font-bold mb-2 border border-rose-500/30">
            <ShieldAlert className="w-4 h-4" />
            Baia de Aeração e Reteste de Umidade
          </div>
          <h2 className="text-xl font-black text-white">Controle de Quarentena</h2>
          <p className="text-xs text-rose-200/80 mt-1 max-w-xl">
            Cargas e lotes bloqueados aguardando aeração, estabilização de umidade ou reavaliação do Controle de Qualidade.
          </p>
        </div>

        <div className="bg-rose-900/80 p-4 rounded-xl border border-rose-700/50 text-right">
          <div className="text-xs text-rose-300 font-semibold">TOTAL BLOQUEADO</div>
          <div className="text-2xl font-black text-white">
            {formatNumber(totalQuarentenaHl, 1)} <span className="text-xs font-semibold">hl</span>
          </div>
          <div className="text-[11px] text-rose-200">{formatNumber(totalQuarentenaHl * 5, 0)} latas</div>
        </div>
      </div>

      {/* Quarentena Items */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden text-xs">
        {quarentenaItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Nenhuma carga em quarentena no momento. Todo o estoque da Integral NUTS, Monte Dourado está liberado.
          </div>
        ) : (
          quarentenaItems.map(({ recebimento, destinoItem }) => (
            <div key={recebimento.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{recebimento.codigo}</span>
                  <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-bold text-[10px]">
                    Quarentena
                  </span>
                </div>
                <div className="text-slate-600 mt-1">
                  Fornecedor: <strong>{recebimento.fornecedorNome}</strong> • Origem: {recebimento.origemCastanha}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Umidade na entrada: <strong>{recebimento.avaliacao.umidadePorcentagem}%</strong> • Local: {destinoItem.localArmazenamento}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-base font-black text-rose-950">{destinoItem.quantidadeHectolitros} hl</div>
                  <div className="text-[10px] text-slate-500">{destinoItem.quantidadeLatas} latas</div>
                </div>

                <button
                  onClick={() => {
                    const ok = window.confirm(
                      `Deseja liberar ${destinoItem.quantidadeHectolitros} hl para Beneficiamento?`
                    );
                    if (ok) {
                      alterarDestinoEstoque(
                        'Quarentena',
                        'Beneficiamento',
                        destinoItem.quantidadeHectolitros,
                        recebimento.id,
                        'Liberação após reteste de umidade ok',
                        activePerfil,
                        destinoItem.localArmazenamento,
                        'Silo 01 - Beneficiamento'
                      );
                    }
                  }}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Liberar P/ Beneficiamento
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
