import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatNumber } from '../../utils/conversions';
import { BarChart3, Download, Filter, Printer } from 'lucide-react';

export const RelatoriosView: React.FC = () => {
  const { recebimentos, fornecedores, gerarDocumento } = useApp();

  const [filtroComunidade, setFiltroComunidade] = useState('todas');
  const [filtroDestino, setFiltroDestino] = useState('todos');

  const validRecs = recebimentos.filter((r) => {
    if (r.cancelado) return false;
    if (filtroComunidade !== 'todas' && r.comunidade !== filtroComunidade) return false;
    if (filtroDestino !== 'todos' && !r.destinos.some((d) => d.destino === filtroDestino)) return false;
    return true;
  });

  const totalHl = validRecs.reduce((acc, r) => acc + r.quantidadeLiquidaHl, 0);
  const totalLatas = totalHl * 5;
  const totalInvestido = validRecs.reduce((acc, r) => acc + r.compra.valorLiquido, 0);
  const precoMedioHl = totalHl > 0 ? totalInvestido / totalHl : 0;

  const handleExportCSV = () => {
    const headers = [
      'Código,Data,Fornecedor,Comunidade,Qtd_Hl,Qtd_Latas,Valor_Liquido,Situacao_Financeira',
    ];
    const rows = validRecs.map(
      (r) =>
        `${r.codigo},${r.data},"${r.fornecedorNome}","${r.comunidade}",${r.quantidadeLiquidaHl},${r.quantidadeLiquidaLatas},${r.compra.valorLiquido},"${r.compra.situacao}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_monte_dourado_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Relatórios Gerenciais de Matéria-Prima</h2>
            <p className="text-xs text-slate-500">Consolidado de compras, médias de preço por comunidade e estatísticas</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={() => {
              gerarDocumento('Relatório Gerencial', 'geral', 'Monte Dourado', { validRecs, totalHl, totalInvestido });
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Gerar PDF A4
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700">Filtros:</span>
        </div>

        <div>
          <label className="text-slate-500 mr-2">Comunidade:</label>
          <select
            value={filtroComunidade}
            onChange={(e) => setFiltroComunidade(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium"
          >
            <option value="todas">Todas as Comunidades</option>
            <option value="Arumanduba">Arumanduba</option>
            <option value="Braço">Braço do Jari</option>
            <option value="São José">São José</option>
            <option value="Monte Dourado / Laranjal">Monte Dourado / Laranjal</option>
          </select>
        </div>

        <div>
          <label className="text-slate-500 mr-2">Destino:</label>
          <select
            value={filtroDestino}
            onChange={(e) => setFiltroDestino(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium"
          >
            <option value="todos">Todos os Destinos</option>
            <option value="Beneficiamento">Beneficiamento</option>
            <option value="Venda com Casca">Venda com Casca</option>
            <option value="Quarentena">Quarentena</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-slate-500 font-semibold">Volume Filtrado:</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatNumber(totalHl, 1)} hl</div>
          <div className="text-slate-500 mt-1">{formatNumber(totalLatas, 0)} latas</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-slate-500 font-semibold">Valor Total Investido:</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{formatBRL(totalInvestido)}</div>
          <div className="text-slate-500 mt-1">Soma das aquisições</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-slate-500 font-semibold">Preço Médio / Hl:</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatBRL(precoMedioHl)}</div>
          <div className="text-slate-500 mt-1">{formatBRL(precoMedioHl / 5)}/lata</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-slate-500 font-semibold">Total de Cargas:</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{validRecs.length}</div>
          <div className="text-slate-500 mt-1">Recebimentos válidos</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 text-xs">
        {validRecs.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900">{r.codigo}</span> — {r.data} • <strong>{r.fornecedorNome}</strong> ({r.comunidade})
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900">{r.quantidadeLiquidaHl} hl</span> ({r.quantidadeLiquidaLatas} latas) • <span className="text-emerald-800 font-bold">{formatBRL(r.compra.valorLiquido)}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
