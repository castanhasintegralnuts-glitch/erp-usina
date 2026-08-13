import React, { useState } from 'react';
import { Flame, Thermometer, Droplets, Clock, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SecagemView: React.FC = () => {
  const { addToast } = useApp();
  const [temperatura, setTemperatura] = useState('65');
  const [umidadeTarget, setUmidadeTarget] = useState('3.5');
  const [tempoHoras, setTempoHoras] = useState('12');

  const handleSalvarBatelada = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(`Batelada de estufagem registrada: ${temperatura}°C por ${tempoHoras}h (Target Umidade ${umidadeTarget}%).`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-amber-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            <span>Controle Térmico de Estufa</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Secagem, Desidratação e Estufagem</h1>
          <p className="text-amber-100/80 text-sm mt-1 max-w-2xl">
            Monitoramento de curvas de temperatura e redução de umidade para eliminação de fungos e preservação da crocância da castanha.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Temperatura Média Estufa</div>
            <div className="text-xl font-extrabold text-slate-900">62°C a 68°C</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Umidade Residual Alvo</div>
            <div className="text-xl font-extrabold text-slate-900">3,0% - 4,0%</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tempo Médio Batelada</div>
            <div className="text-xl font-extrabold text-slate-900">10 a 14 horas</div>
          </div>
        </div>
      </div>

      {/* Register Batch Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-amber-600" />
          <span>Registrar Controle de Ciclo de Estufagem</span>
        </h2>

        <form onSubmit={handleSalvarBatelada} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Temperatura Setpoint (°C)</label>
            <input
              type="number"
              value={temperatura}
              onChange={(e) => setTemperatura(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Duração do Ciclo (Horas)</label>
            <input
              type="number"
              value={tempoHoras}
              onChange={(e) => setTempoHoras(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Umidade Alvo (%)</label>
            <input
              type="number"
              step="0.1"
              value={umidadeTarget}
              onChange={(e) => setUmidadeTarget(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Iniciar Ciclo</span>
          </button>
        </form>
      </div>
    </div>
  );
};
