import React from 'react';
import { Database, Users, Hammer, DollarSign, MapPin, Building2, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CadastrosGeraisView: React.FC = () => {
  const { setActiveTab, fornecedores, quebradores } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" />
          <span>Central de Cadastros do Sistema</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">Módulos de Cadastros Operacionais</h1>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          Acesso unificado a fornecedores extrativistas, colaboradores quebradores, tabelas de preço e locais de origem no Vale do Jari.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fornecedores Card */}
        <div 
          onClick={() => setActiveTab('fornecedores')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 font-black">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Fornecedores Extrativistas & Cooperativas
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Gerenciar castanheiros cadastrados, dados bancários e históricos de entrega.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>{fornecedores.length} Cadastrados</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Quebradores Card */}
        <div 
          onClick={() => setActiveTab('quebra-manual')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 font-black">
              <Hammer className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
              Quebradores & Colaboradores Usina
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Gestão de colaboradores da área de quebra, matrículas e tabelas de produtividade.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>{quebradores.length} Cadastrados</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Tabela de Preço Card */}
        <div 
          onClick={() => setActiveTab('quebra-manual')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 font-black">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-800 transition-colors">
              Tabelas de Preços e Valores por Kg
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Definição de preço por kg para amêndoa inteira, pedaços e bonificações.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Acessar Tabela</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
