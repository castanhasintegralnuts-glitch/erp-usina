import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, History, Search } from 'lucide-react';

export const AuditoriaTab: React.FC = () => {
  const { auditoriaQuebra } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditoriaQuebra.filter(
    (a) =>
      a.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.justificativa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.registroId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-xl border border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white">Trilha de Auditoria Imutável da Quebra Manual</h2>
            <p className="text-xs text-amber-200/80">
              Rastreabilidade total: nenhum registro é apagado, todas as correções possuem histórico de alterações e justificativas.
            </p>
          </div>
        </div>

        <div className="bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span>Rastreabilidade em Compliance</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filtrar auditoria por usuário, ação, ID ou justificativa..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 shadow-xs"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs flex justify-between">
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-800" />
            Registros Auditados do Sistema
          </span>
          <span className="text-slate-500">{filteredLogs.length} eventos gravados</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">Nenhum evento de auditoria encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Data e Hora</th>
                  <th className="p-3">Ação Realizada</th>
                  <th className="p-3">Usuário</th>
                  <th className="p-3">ID Registro</th>
                  <th className="p-3">Valor Anterior</th>
                  <th className="p-3">Novo Valor</th>
                  <th className="p-3">Justificativa do Gestor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">{log.dataHora}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-300">
                        {log.acao}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{log.usuario}</td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{log.registroId}</td>
                    <td className="p-3 text-slate-600 font-mono text-[11px] max-w-[150px] truncate" title={log.valorAnterior}>
                      {log.valorAnterior}
                    </td>
                    <td className="p-3 text-emerald-800 font-mono font-bold text-[11px] max-w-[150px] truncate" title={log.valorNovo}>
                      {log.valorNovo}
                    </td>
                    <td className="p-3 text-slate-700 italic max-w-[200px]" title={log.justificativa}>
                      "{log.justificativa}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
