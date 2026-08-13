import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const AccessDeniedView: React.FC = () => {
  const { setActiveTab, currentUser } = useApp();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-slate-200 shadow-xs my-8 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 shadow-md">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Acesso Restrito ao Perfil
        </h2>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Sua conta atual <strong className="text-slate-900">({currentUser?.nome} - Perfil: {currentUser?.perfil})</strong> não possui permissão para acessar esta tela ou relatório do sistema.
        </p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-md text-left text-xs text-amber-950 space-y-1">
        <span className="font-extrabold flex items-center gap-1.5 text-amber-900">
          <Lock className="w-4 h-4 text-amber-700" />
          Regra de Proteção Ativa:
        </span>
        <p className="text-[11px] text-amber-900 font-medium">
          Caso precise de acesso a este módulo, solicite ao Administrador do Sistema para habilitar a tela na Matriz de Permissões.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setActiveTab(currentUser?.perfil === 'Quebrador' ? 'quebra-manual' : 'dashboard')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Voltar à Tela Permitida</span>
        </button>
      </div>
    </div>
  );
};
