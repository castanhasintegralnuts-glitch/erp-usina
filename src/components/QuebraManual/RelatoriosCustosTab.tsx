import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatNumber } from '../../utils/conversions';
import {
  FileText,
  Printer,
  Download,
  Layers,
  Calculator,
  PieChart,
  Table,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const RelatoriosCustosTab: React.FC = () => {
  const { lotes, producoesQuebra, gerarDocumento } = useApp();

  const [selectedLoteId, setSelectedLoteId] = useState<string>(lotes[0]?.id || '');

  // Calculate lot cost details
  const selectedLote = lotes.find((l) => l.id === selectedLoteId) || lotes[0];

  const loteProducoes = producoesQuebra.filter((p) => p.loteId === selectedLote?.id);

  const totalKgQuebradosLote = loteProducoes.reduce((acc, p) => acc + p.totalKg, 0);
  const totalCustoQuebraLote = loteProducoes.reduce((acc, p) => acc + p.valorTotal, 0);

  // Estimativa do custo de aquisição da matéria-prima com casca (exemplo R$ 450,00 por HL)
  const custoAquisicaoMateriaPrima = (selectedLote?.quantidadeAtualHl || 0) * (selectedLote?.precoPorHl || 450);

  // Custo Total Consolidado do Lote = Matéria Prima + Mão de Obra de Quebra
  const custoTotalConsolidadoLote = custoAquisicaoMateriaPrima + totalCustoQuebraLote;

  const impactoMaoDeObraPct =
    custoTotalConsolidadoLote > 0 ? (totalCustoQuebraLote / custoTotalConsolidadoLote) * 100 : 0;

  const custoFinalPorKgBeneficiado =
    totalKgQuebradosLote > 0 ? custoTotalConsolidadoLote / totalKgQuebradosLote : 0;

  const handlePrintPDF = () => {
    gerarDocumento('Relatório de Custo do Lote', selectedLote?.codigo || 'LOTE-N/A', selectedLote?.fornecedorNome || 'N/A', {
      lote: selectedLote,
      loteProducoes,
      totalKgQuebradosLote,
      totalCustoQuebraLote,
      custoAquisicaoMateriaPrima,
      custoTotalConsolidadoLote,
      impactoMaoDeObraPct,
      custoFinalPorKgBeneficiado,
      dataRelatorio: new Date().toISOString().split('T')[0],
    });
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Quebrador', 'Lote', 'Kg Inteira', 'Kg Quebrada', 'Kg Amarela', 'Total Kg', 'Valor R$'];
    const rows = loteProducoes.map((p) => [
      p.data,
      p.quebradorNome,
      p.loteCodigo,
      p.kgInteira,
      p.kgQuebrada,
      p.kgAmarela,
      p.totalKg,
      p.valorTotal,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_quebra_${selectedLote?.codigo || 'lote'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export Actions */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-xl text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-cyan-400" />
            Integração de Custo de Mão de Obra do Lote
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Apuração automatizada do impacto financeiro da quebra manual no custo final por kg beneficiado
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exportar Excel (CSV)</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer border border-cyan-500/40"
          >
            <Printer className="w-4 h-4 text-cyan-200" />
            <span>Gerar PDF / Relatório A4</span>
          </button>
        </div>
      </div>

      {/* Lot Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">Selecione o Lote Beneficiado</label>
            <select
              value={selectedLoteId}
              onChange={(e) => setSelectedLoteId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-cyan-500"
            >
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.codigo} — {l.fornecedorNome} ({l.quantidadeAtualHl} HL)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-500 font-bold">Origem: {selectedLote?.origem}</span>
          <div className="text-xs font-semibold text-emerald-700">Classificação: {selectedLote?.classificacao}</div>
        </div>
      </div>

      {/* Lot Cost Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Matéria-Prima (Com casca) */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-bold text-xs">Aosição Matéria-Prima</div>
          <div className="text-xl font-black text-slate-900">{formatBRL(custoAquisicaoMateriaPrima)}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {selectedLote?.quantidadeAtualHl} HL × {formatBRL(selectedLote?.precoPorHl || 450)}
          </div>
        </div>

        {/* Custo da Mão de Obra de Quebra */}
        <div className="p-4 bg-amber-950 text-white rounded-2xl border border-amber-800 shadow-sm space-y-1">
          <div className="text-amber-200 font-bold text-xs">Mão de Obra da Quebra (MOD)</div>
          <div className="text-xl font-black text-amber-300">{formatBRL(totalCustoQuebraLote)}</div>
          <div className="text-[11px] text-amber-200 font-mono">
            {formatNumber(totalKgQuebradosLote, 1)} kg de amêndoa limpa
          </div>
        </div>

        {/* Custo Total Consolidado */}
        <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-sm space-y-1">
          <div className="text-emerald-200 font-bold text-xs">Custo Consolidado do Lote</div>
          <div className="text-xl font-black text-emerald-300">{formatBRL(custoTotalConsolidadoLote)}</div>
          <div className="text-[11px] text-emerald-200 font-mono">
            Matéria-prima + Mão de obra
          </div>
        </div>

        {/* Custo Final por Kg Beneficiado */}
        <div className="p-4 bg-cyan-950 text-white rounded-2xl border border-cyan-800 shadow-sm space-y-1">
          <div className="text-cyan-200 font-bold text-xs">Custo Final / kg Amêndoa</div>
          <div className="text-2xl font-black text-cyan-300">{formatBRL(custoFinalPorKgBeneficiado)}/kg</div>
          <div className="text-[11px] text-cyan-200 font-semibold">
            Impacto da Quebra: {formatNumber(impactoMaoDeObraPct, 1)}% no custo
          </div>
        </div>

      </div>

      {/* Detail Table of Productions for this Lot */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs flex justify-between">
          <span>Detalhamento dos Diários de Quebra do Lote {selectedLote?.codigo}</span>
          <span className="text-slate-500">{loteProducoes.length} diárias apontadas</span>
        </div>

        {loteProducoes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Nenhum apontamento de quebra vinculado ao lote <strong>{selectedLote?.codigo}</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Quebrador(a)</th>
                  <th className="p-3 text-right">Inteira (kg)</th>
                  <th className="p-3 text-right">Quebrada (kg)</th>
                  <th className="p-3 text-right">Amarela (kg)</th>
                  <th className="p-3 text-right">Total Kg</th>
                  <th className="p-3 text-right">Custo Quebra R$</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loteProducoes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{p.data}</td>
                    <td className="p-3 font-bold text-slate-900">{p.quebradorNome}</td>
                    <td className="p-3 text-right text-emerald-800">{formatNumber(p.kgInteira, 1)} kg</td>
                    <td className="p-3 text-right text-amber-800">{formatNumber(p.kgQuebrada, 1)} kg</td>
                    <td className="p-3 text-right text-amber-900">{formatNumber(p.kgAmarela, 1)} kg</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatNumber(p.totalKg, 1)} kg</td>
                    <td className="p-3 text-right font-black text-emerald-700 text-sm">{formatBRL(p.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-black text-xs">
                <tr>
                  <td colSpan={2} className="p-3 uppercase text-amber-300">Total do Lote:</td>
                  <td className="p-3 text-right text-emerald-300">{formatNumber(loteProducoes.reduce((acc, p) => acc + p.kgInteira, 0), 1)} kg</td>
                  <td className="p-3 text-right text-amber-300">{formatNumber(loteProducoes.reduce((acc, p) => acc + p.kgQuebrada, 0), 1)} kg</td>
                  <td className="p-3 text-right text-amber-300">{formatNumber(loteProducoes.reduce((acc, p) => acc + p.kgAmarela, 0), 1)} kg</td>
                  <td className="p-3 text-right text-amber-400">{formatNumber(totalKgQuebradosLote, 1)} kg</td>
                  <td className="p-3 text-right text-emerald-400 text-sm">{formatBRL(totalCustoQuebraLote)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
