import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RelatoriosView } from '../Relatorios/RelatoriosView';
import { formatDateBR } from '../../utils/conversions';
import {
  FileText,
  Printer,
  FileCheck,
  ShieldCheck,
  Search,
  BarChart3,
  Receipt,
  Download,
  Eye,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export const DocumentosView: React.FC = () => {
  const { documentos, setDocPreview, recebimentos, fornecedores, lotes } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'documentos' | 'appcc' | 'relatorios'>('documentos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleOpenDoc = (doc: any) => {
    let extraData: any = null;
    if (doc.tipo === 'Romaneio de Entrada' || doc.tipo === 'Recibo') {
      extraData = recebimentos.find((r) => r.id === doc.referenciaId) || recebimentos[0];
    } else if (doc.tipo === 'Extrato de Fornecedor') {
      extraData = {
        fornecedor: fornecedores[0],
        recebimentos: recebimentos.filter((r) => r.fornecedorId === fornecedores[0]?.id),
      };
    } else if (doc.tipo === 'Extrato de Lote') {
      extraData = lotes[0];
    }

    setDocPreview({
      tipo: doc.tipo as any,
      data: extraData || doc,
    });
  };

  const filteredDocs = documentos.filter((d) => {
    if (filterTipo !== 'todos' && d.tipo !== filterTipo) return false;
    if (searchTerm) {
      return (
        d.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.beneficiarioNome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Usina Monte Dourado — Central de Documentos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Documentos e Relatórios Gerenciais</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Emissão centralizada de Recibos, Romaneios de Entrada e Saída, Extratos A4, Documentos APPCC e Relatórios Oficiais.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {[
          { id: 'documentos', label: 'Central de Documentos A4', icon: FileText },
          { id: 'appcc', label: 'Documentos APPCC & Qualidade', icon: ShieldCheck },
          { id: 'relatorios', label: 'Relatórios Gerenciais', icon: BarChart3 },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Central de Documentos */}
      {activeSubTab === 'documentos' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por número, título ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="Recibo">Recibos de Compra</option>
                <option value="Romaneio de Entrada">Romaneios de Entrada</option>
                <option value="Romaneio de Saída">Romaneios de Saída</option>
                <option value="Extrato de Fornecedor">Extratos de Fornecedor</option>
                <option value="Folha de Quebra">Folhas de Quebra</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">N° Documento</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Beneficiário / Cliente</th>
                    <th className="p-3">Data Emissão</th>
                    <th className="p-3">Emissor</th>
                    <th className="p-3 text-center">Visualizar / Imprimir A4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-emerald-800">{doc.numeroDocumento}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {doc.tipo}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-slate-900">{doc.beneficiarioNome}</td>
                      <td className="p-3">{formatDateBR(doc.dataEmissao)}</td>
                      <td className="p-3 text-slate-600">{doc.emissorNome}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleOpenDoc(doc)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Abrir PDF A4</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Documentos APPCC */}
      {activeSubTab === 'appcc' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Documentos e Controles Sanitários APPCC / BPF</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-sm block text-slate-900">Manual de Boas Práticas de Fabricação</span>
              <span className="text-xs text-slate-500 block">Requisitos sanitários para beneficiamento em Monte Dourado.</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-sm block text-slate-900">Laudos de Umidade & Infestação</span>
              <span className="text-xs text-slate-500 block">Registros laboratoriais de controle de qualidade por lote.</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-sm block text-slate-900">Fichas de Sanitização e Higienização</span>
              <span className="text-xs text-slate-500 block">Registro diário de limpeza de estufas, secadores e mesas.</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Relatórios Gerenciais */}
      {activeSubTab === 'relatorios' && <RelatoriosView />}
    </div>
  );
};
