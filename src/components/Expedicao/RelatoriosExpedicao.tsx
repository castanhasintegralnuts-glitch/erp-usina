import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatDateBR, formatNumber } from '../../utils/conversions';
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Printer,
  FileText,
  Truck,
  Award,
  Calendar
} from 'lucide-react';

export const RelatoriosExpedicao: React.FC = () => {
  const {
    romaneiosRetirada,
    expedicoes,
    gerarDocumento
  } = useApp();

  // Calculate Metrics from Romaneios de Retirada
  const totalRomaneios = romaneiosRetirada.length;
  const totalVolumeCaixasKg = romaneiosRetirada.reduce((acc, r) => acc + (r.quantidadeTotal || 0), 0);
  const totalFaturamento = romaneiosRetirada.reduce((acc, r) => acc + (r.valorTotal || 0), 0);
  const ticketMedio = totalRomaneios > 0 ? totalFaturamento / totalRomaneios : 0;

  // Breakdown by Product
  const produtosRanking = useMemo(() => {
    const map: Record<string, { produto: string; qtd: number; valor: number; count: number }> = {};

    romaneiosRetirada.forEach((r) => {
      r.itens.forEach((it) => {
        const key = it.produto.trim();
        if (!map[key]) {
          map[key] = { produto: key, qtd: 0, valor: 0, count: 0 };
        }
        map[key].qtd += Number(it.quantidade) || 0;
        map[key].valor += Number(it.valor) || 0;
        map[key].count += 1;
      });
    });

    return Object.values(map).sort((a, b) => b.valor - a.valor);
  }, [romaneiosRetirada]);

  // Breakdown by Client
  const clientesRanking = useMemo(() => {
    const map: Record<string, { cliente: string; romaneiosCount: number; qtdTotal: number; valorTotal: number }> = {};

    romaneiosRetirada.forEach((r) => {
      const key = r.clienteNome.trim();
      if (!map[key]) {
        map[key] = { cliente: key, romaneiosCount: 0, qtdTotal: 0, valorTotal: 0 };
      }
      map[key].romaneiosCount += 1;
      map[key].qtdTotal += Number(r.quantidadeTotal) || 0;
      map[key].valorTotal += Number(r.valorTotal) || 0;
    });

    return Object.values(map).sort((a, b) => b.valorTotal - a.valorTotal);
  }, [romaneiosRetirada]);

  // Handle PDF Export of Expedition Summary
  const handleExportPDF = () => {
    gerarDocumento('Relatório Gerencial', 'rel-expedicao-' + Date.now(), 'Consolidado da Expedição', {
      titulo: 'SÍNTESE EXECUTIVA DE EXPEDIÇÃO E ROMANEIOS DE RETIRADA',
      descricao: 'Relatório gerencial de saídas, volume movimentado e faturamento de romaneios em Monte Dourado.',
      indicadores: [
        { label: 'Total de Romaneios Emitidos', valor: `${totalRomaneios} romaneios`, detalhe: 'Saídas autorizadas' },
        { label: 'Volume Total Retirado', valor: `${formatNumber(totalVolumeCaixasKg, 0)} cx/kg`, detalhe: 'Métricas de expedição' },
        { label: 'Faturamento de Retiradas', valor: formatBRL(totalFaturamento), detalhe: 'Valor bruto acumulado' },
        { label: 'Ticket Médio / Romaneio', valor: formatBRL(ticketMedio), detalhe: 'Média por saída' },
      ],
      itens: produtosRanking.map((p) => ({
        nf: 'PROD',
        produto: p.produto,
        quantidade: p.qtd,
        valor: p.valor,
        dataPagamento: `${p.count} lançamentos`
      }))
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Módulo Expedição — Relatórios Gerenciais</span>
          </div>
          <h2 className="font-black text-xl text-slate-900">
            Relatório de Expedição e Romaneios de Retirada
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise consolidada de saídas, volumes expedidos por produto e ranking de clientes.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all border border-amber-400 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Relatório Executivo A4</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Romaneios */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Romaneios de Retirada
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalRomaneios}</div>
          <p className="text-[11px] font-bold text-emerald-700">
            Romaneios de retirada emitidos
          </p>
        </div>

        {/* Card 2: Volume Total */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Volume Total Retirado
            </span>
            <div className="p-2 bg-blue-50 text-blue-800 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {formatNumber(totalVolumeCaixasKg, 0)}
          </div>
          <p className="text-[11px] font-bold text-blue-700">
            Soma total de unidades/caixas expedidas
          </p>
        </div>

        {/* Card 3: Faturamento Total */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Valor Total Expedido
            </span>
            <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {formatBRL(totalFaturamento)}
          </div>
          <p className="text-[11px] font-bold text-slate-600">
            Faturamento líquido de saídas
          </p>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Ticket Médio / Romaneio
            </span>
            <div className="p-2 bg-purple-50 text-purple-800 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatBRL(ticketMedio)}
          </div>
          <p className="text-[11px] font-bold text-purple-700">
            Média financeira por autorização de saída
          </p>
        </div>
      </div>

      {/* Two Column Section: Products Ranking & Clients Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Ranking */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                Ranking de Produtos Retirados
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">{produtosRanking.length} produtos</span>
          </div>

          {produtosRanking.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">Nenhum produto movimentado até o momento.</p>
          ) : (
            <div className="space-y-3">
              {produtosRanking.map((p, idx) => {
                const percentage = totalFaturamento > 0 ? (p.valor / totalFaturamento) * 100 : 0;
                return (
                  <div key={p.produto} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">
                        {idx + 1}. {p.produto}
                      </span>
                      <span className="font-black text-emerald-900">{formatBRL(p.valor)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                      <span>Quantidade: <strong className="text-slate-800">{formatNumber(p.qtd, 0)}</strong></span>
                      <span>{p.count} lançamentos ({percentage.toFixed(1)}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-800 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clients Ranking */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-800" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                Principais Clientes / Destinatários
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">{clientesRanking.length} clientes</span>
          </div>

          {clientesRanking.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">Nenhum cliente registrado em romaneios.</p>
          ) : (
            <div className="space-y-3">
              {clientesRanking.map((c, idx) => (
                <div key={c.cliente} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900 block">
                      {idx + 1}. {c.cliente}
                    </span>
                    <span className="text-[10.5px] text-slate-500">
                      {c.romaneiosCount} romaneio(s) • Qtd: <strong className="text-slate-800">{formatNumber(c.qtdTotal, 0)}</strong>
                    </span>
                  </div>
                  <div className="text-right font-black text-amber-600 text-sm">
                    {formatBRL(c.valorTotal)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
