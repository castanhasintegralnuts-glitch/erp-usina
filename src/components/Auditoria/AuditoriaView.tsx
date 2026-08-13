import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  Laptop,
  Smartphone,
  ShieldAlert,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Info
} from 'lucide-react';

export const AuditoriaView: React.FC = () => {
  const { logsAuditoriaSistema } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('Todas');

  // Filter logs
  const filteredLogs = logsAuditoriaSistema.filter((log) => {
    const matchesSearch =
      log.usuarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.registroAlterado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.dispositivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'Todas' || log.acao === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logsAuditoriaSistema.map((l) => l.acao)));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black shrink-0 border border-slate-800">
            <History className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Log de Auditoria e Rastreabilidade do Sistema
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                Imutável
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Registro detalhado de todas as ações importantes: usuário, data/hora, dispositivo, ação executada e registro alterado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const str = JSON.stringify(logsAuditoriaSistema, null, 2);
              const blob = new Blob([str], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `log_auditoria_integralnuts_${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all border border-slate-700"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar Trilha de Auditoria</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuário, ação, dispositivo ou detalhes do registro alterado..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900"
          >
            <option value="Todas">Todas as Ações</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-100 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Data & Hora</th>
                <th className="px-4 py-3.5">Usuário Responsável</th>
                <th className="px-4 py-3.5">Perfil</th>
                <th className="px-4 py-3.5">Dispositivo / Origem</th>
                <th className="px-4 py-3.5">Ação Executada</th>
                <th className="px-4 py-3.5">Registro / Detalhes Alterados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 font-medium">
                    Nenhum registro de auditoria encontrado para o filtro aplicado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isMobile = log.dispositivo.toLowerCase().includes('móvel') || log.dispositivo.toLowerCase().includes('mobile');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-extrabold text-slate-900 whitespace-nowrap flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {log.dataHora}
                      </td>

                      <td className="px-4 py-3.5 font-black text-slate-900">{log.usuarioNome}</td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`font-black text-[10px] px-2 py-0.5 rounded ${
                            log.usuarioPerfil === 'Administrador'
                              ? 'bg-purple-100 text-purple-900'
                              : log.usuarioPerfil === 'Gestor'
                              ? 'bg-teal-100 text-teal-900'
                              : log.usuarioPerfil === 'Quebrador'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {log.usuarioPerfil}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {isMobile ? (
                            <Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate max-w-[200px]" title={log.dispositivo}>
                            {log.dispositivo}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-extrabold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {log.acao}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-700 max-w-xs truncate" title={log.registroAlterado}>
                        {log.registroAlterado}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
