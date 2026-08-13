import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cpu, Gauge, Clock, Plus, AlertTriangle, CheckCircle2, Sliders, Zap, FileSpreadsheet, BarChart2 } from 'lucide-react';

interface RegistroMecanico {
  id: string;
  loteCodigo: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoCastanha: 'Graúda (Tamanho G)' | 'Média (Tamanho M)' | 'Miúda (Tamanho P)' | 'Mista (Sem Classificar)';
  kgAlimentados: number;
  horasOperacao: number;
  taxaKgHora: number;
  taxaRecomendadaMin: number;
  taxaRecomendadaMax: number;
  percentualInteiras: number;
  percentualPedacos: number;
  operador: string;
  statusAlimentacao: 'Ideal' | 'Abaixo da Faixa' | 'Acima da Faixa (Risco de Esmagamento)';
  observacoes: string;
}

export const QuebradorMecanicoTab: React.FC = () => {
  const { lotes, currentUser, addToast } = useApp();

  // Initial Mock Data for Mechanical Breaking Operations
  const [registros, setRegistros] = useState<RegistroMecanico[]>([
    {
      id: 'qm-1',
      loteCodigo: 'MD-LOT-2026-0001',
      data: '2026-08-11',
      horaInicio: '08:00',
      horaFim: '12:00',
      tipoCastanha: 'Graúda (Tamanho G)',
      kgAlimentados: 520,
      horasOperacao: 4,
      taxaKgHora: 130,
      taxaRecomendadaMin: 120,
      taxaRecomendadaMax: 150,
      percentualInteiras: 78.5,
      percentualPedacos: 21.5,
      operador: 'Carlos Oliveira (Operador Mecânico)',
      statusAlimentacao: 'Ideal',
      observacoes: 'Abertura de lâmina ajustada para 22mm. Baixo índice de esmagamento.',
    },
    {
      id: 'qm-2',
      loteCodigo: 'MD-LOT-2026-0002',
      data: '2026-08-12',
      horaInicio: '07:30',
      horaFim: '11:30',
      tipoCastanha: 'Média (Tamanho M)',
      kgAlimentados: 480,
      horasOperacao: 4,
      taxaKgHora: 120,
      taxaRecomendadaMin: 90,
      taxaRecomendadaMax: 110,
      percentualInteiras: 68.0,
      percentualPedacos: 32.0,
      operador: 'Manoel Santos',
      statusAlimentacao: 'Acima da Faixa (Risco de Esmagamento)',
      observacoes: 'Sobrecarga de alimentação gerou mais bandas do que o esperado. Reduzir esteira.',
    },
  ]);

  // Form State
  const [form, setForm] = useState({
    loteId: lotes[0]?.id || '',
    data: new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    horaFim: '12:00',
    tipoCastanha: 'Graúda (Tamanho G)' as 'Graúda (Tamanho G)' | 'Média (Tamanho M)' | 'Miúda (Tamanho P)' | 'Mista (Sem Classificar)',
    kgAlimentados: 400,
    kgInteirasObtidas: 310,
    operador: currentUser?.nome || 'Operador Técnico Mecânico',
    observacoes: '',
  });

  // Ideal Feed Rates (kg/h) configuration based on Nut Type
  const tabelaConfiguracaoMaquina = {
    'Graúda (Tamanho G)': { minKgH: 120, maxKgH: 150, aberturaMm: '22 - 24 mm', rotacaoRpm: '350 RPM' },
    'Média (Tamanho M)': { minKgH: 90, maxKgH: 110, aberturaMm: '18 - 20 mm', rotacaoRpm: '400 RPM' },
    'Miúda (Tamanho P)': { minKgH: 60, maxKgH: 80, aberturaMm: '14 - 16 mm', rotacaoRpm: '450 RPM' },
    'Mista (Sem Classificar)': { minKgH: 80, maxKgH: 100, aberturaMm: '17 - 19 mm', rotacaoRpm: '380 RPM' },
  };

  const currentConfig = tabelaConfiguracaoMaquina[form.tipoCastanha];

  // Calculate hours worked
  const calcularHoras = (inicio: string, fim: string) => {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fim.split(':').map(Number);
    const totalM1 = h1 * 60 + m1;
    const totalM2 = h2 * 60 + m2;
    const diffMin = totalM2 - totalM1;
    return diffMin > 0 ? diffMin / 60 : 1;
  };

  const horasTrabalhadas = calcularHoras(form.horaInicio, form.horaFim);
  const taxaAlcançadaKgH = form.kgAlimentados > 0 && horasTrabalhadas > 0 ? Math.round(form.kgAlimentados / horasTrabalhadas) : 0;

  // Determine machine feeding status
  const getStatusAlimentacao = (taxa: number, min: number, max: number): 'Ideal' | 'Abaixo da Faixa' | 'Acima da Faixa (Risco de Esmagamento)' => {
    if (taxa >= min && taxa <= max) return 'Ideal';
    if (taxa < min) return 'Abaixo da Faixa';
    return 'Acima da Faixa (Risco de Esmagamento)';
  };

  const statusCalculado = getStatusAlimentacao(taxaAlcançadaKgH, currentConfig.minKgH, currentConfig.maxKgH);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loteTarget = lotes.find((l) => l.id === form.loteId) || lotes[0];

    const pctInteiras = form.kgAlimentados > 0 ? Math.round((form.kgInteirasObtidas / form.kgAlimentados) * 1000) / 10 : 0;
    const pctPedacos = Math.max(0, 100 - pctInteiras);

    const novoRegistro: RegistroMecanico = {
      id: `qm-${Date.now()}`,
      loteCodigo: loteTarget?.codigo || 'MD-LOT-2026-0001',
      data: form.data,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      tipoCastanha: form.tipoCastanha,
      kgAlimentados: Number(form.kgAlimentados),
      horasOperacao: horasTrabalhadas,
      taxaKgHora: taxaAlcançadaKgH,
      taxaRecomendadaMin: currentConfig.minKgH,
      taxaRecomendadaMax: currentConfig.maxKgH,
      percentualInteiras: pctInteiras,
      percentualPedacos: pctPedacos,
      operador: form.operador,
      statusAlimentacao: statusCalculado,
      observacoes: form.observacoes || `Ajuste recomendado: Abertura ${currentConfig.aberturaMm}, Rotação ${currentConfig.rotacaoRpm}`,
    };

    setRegistros([novoRegistro, ...registros]);
    addToast(`Registro de Quebra Mecânica adicionado! Taxa: ${taxaAlcançadaKgH} kg/h (${statusCalculado})`, statusCalculado === 'Ideal' ? 'success' : 'warning');
  };

  // General Aggregations
  const totalKgAlimentadosGeral = registros.reduce((acc, r) => acc + r.kgAlimentados, 0);
  const mediaTaxaKgHora = registros.length > 0 ? Math.round(registros.reduce((acc, r) => acc + r.taxaKgHora, 0) / registros.length) : 0;
  const mediaInteiras = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.percentualInteiras, 0) / registros.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                Módulo Industrial Automático
              </span>
              <span className="text-xs text-slate-300">• Controle por Alimentação (kg/hora)</span>
            </div>
            <h2 className="text-2xl font-bold mt-1">Quebrador Mecânico Industrial</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Diferente da quebra manual, o quebrador mecânico opera com regulagem de fluxo constante de alimentador em <strong>kg/hora</strong>.
              Ajuste os parâmetros da esteira conforme o calibre da castanha para evitar perda por esmagamento.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 min-w-[220px]">
            <span className="text-xs text-slate-400 block font-semibold">Regra Operacional</span>
            <span className="text-sm font-bold text-amber-300 block mt-0.5">Sem Produção x Valor</span>
            <span className="text-[11px] text-slate-300">Controle de Vazão e Amêndoa Inteira %</span>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-700/50">
            <span className="text-xs text-slate-400 block">Total Processado Mecânico</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">{totalKgAlimentadosGeral.toLocaleString('pt-BR')} Kg</span>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-700/50">
            <span className="text-xs text-slate-400 block">Vazão Média Alcançada</span>
            <span className="text-xl font-bold font-mono text-indigo-300 mt-1 block">{mediaTaxaKgHora} kg/h</span>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-700/50">
            <span className="text-xs text-slate-400 block">Aproveitamento Amêndoas Inteiras</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{mediaInteiras}%</span>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-700/50">
            <span className="text-xs text-slate-400 block">Status Geral Operação</span>
            <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">Regularizado</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Config Machine Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Calibration Matrix */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Matriz de Regulagem da Máquina</h3>
              <p className="text-[11px] text-gray-500">Fluxo ideal em kg/h para evitar danos à amêndoa.</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(tabelaConfiguracaoMaquina).map(([tipo, cfg]) => {
              const isSelected = form.tipoCastanha === tipo;
              return (
                <div
                  key={tipo}
                  onClick={() => setForm({ ...form, tipoCastanha: tipo as any })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                      : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{tipo}</span>
                    <span className="font-mono text-xs font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-100">
                      {cfg.minKgH} - {cfg.maxKgH} kg/h
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200/60 text-[11px] text-gray-600">
                    <div>
                      <span className="text-gray-400 block">Abertura Lâmina:</span>
                      <span className="font-semibold text-gray-800">{cfg.aberturaMm}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Rotação Recomendada:</span>
                      <span className="font-semibold text-gray-800">{cfg.rotacaoRpm}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form: Register Mechanical Breaking */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                Registrar Processamento em Quebrador Mecânico
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Informe os kg alimentados no lote e o tempo de esteira para cálculo do kg/hora.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lote de Castanhas *</label>
                <select
                  value={form.loteId}
                  onChange={(e) => setForm({ ...form, loteId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.codigo} — {l.origemDominante}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Calibre / Tipo de Castanha *</label>
                <select
                  value={form.tipoCastanha}
                  onChange={(e) => setForm({ ...form, tipoCastanha: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Graúda (Tamanho G)">Graúda (Tamanho G)</option>
                  <option value="Média (Tamanho M)">Média (Tamanho M)</option>
                  <option value="Miúda (Tamanho P)">Miúda (Tamanho P)</option>
                  <option value="Mista (Sem Classificar)">Mista (Sem Classificar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Data da Operação</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Horário Início</label>
                <input
                  type="time"
                  value={form.horaInicio}
                  onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Horário Término</label>
                <input
                  type="time"
                  value={form.horaFim}
                  onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Total Kg Alimentados na Máquina *</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={form.kgAlimentados}
                  onChange={(e) => setForm({ ...form, kgAlimentados: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-base font-mono font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kg de Amêndoas Inteiras Obtidas</label>
                <input
                  type="number"
                  min="0"
                  max={form.kgAlimentados}
                  value={form.kgInteirasObtidas}
                  onChange={(e) => setForm({ ...form, kgInteirasObtidas: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono font-semibold text-emerald-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Operador / Técnico Responsável</label>
                <input
                  type="text"
                  value={form.operador}
                  onChange={(e) => setForm({ ...form, operador: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Throughput Gauge Indicator */}
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Cálculo de Vazão em Tempo Real</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-indigo-950">{taxaAlcançadaKgH} kg/h</span>
                  <span className="text-xs text-indigo-700 font-medium">
                    (Faixa Recomendada: {currentConfig.minKgH} - {currentConfig.maxKgH} kg/h)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-2xs ${
                    statusCalculado === 'Ideal'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : statusCalculado === 'Abaixo da Faixa'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {statusCalculado === 'Ideal' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {statusCalculado}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-2.5 rounded-lg text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Registrar Operação Mecânica
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Registros de Quebra Mecânica */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Histórico de Quebra Mecânica</h3>
            <p className="text-xs text-gray-500">Monitoramento da taxa de alimentação por hora e aproveitamento de amêndoa inteira.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">Lote</th>
                <th className="p-3">Data & Período</th>
                <th className="p-3">Calibre / Tipo</th>
                <th className="p-3 text-right">Kg Alimentados</th>
                <th className="p-3 text-right">Vazão (Kg/Hora)</th>
                <th className="p-3 text-right">% Inteiras</th>
                <th className="p-3">Status Alimentação</th>
                <th className="p-3">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {registros.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono font-bold text-gray-900">{r.loteCodigo}</td>
                  <td className="p-3 text-xs text-gray-600">
                    <div>{new Date(r.data).toLocaleDateString('pt-BR')}</div>
                    <div className="font-mono text-gray-400">{r.horaInicio} - {r.horaFim} ({r.horasOperacao}h)</div>
                  </td>
                  <td className="p-3 font-medium text-gray-800">{r.tipoCastanha}</td>
                  <td className="p-3 text-right font-mono font-bold">{r.kgAlimentados} kg</td>
                  <td className="p-3 text-right font-mono font-bold text-indigo-700">{r.taxaKgHora} kg/h</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">{r.percentualInteiras}%</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.statusAlimentacao === 'Ideal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.statusAlimentacao === 'Abaixo da Faixa'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.statusAlimentacao}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-600">{r.operador}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
