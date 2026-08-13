import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/conversions';
import {
  Calculator,
  ShieldAlert,
  Save,
  Clock,
  CheckCircle2,
  Lock,
  History
} from 'lucide-react';

export const TabelaPrecosTab: React.FC = () => {
  const {
    tabelaPrecoQuebra,
    updateTabelaPrecoQuebra,
    auditoriaQuebra,
    activePerfil,
  } = useApp();

  const isAdmin = activePerfil === 'Administrador';

  const [precoInteira, setPrecoInteira] = useState<string>(
    tabelaPrecoQuebra.precoInteiraPerKg.toString()
  );
  const [precoQuebrada, setPrecoQuebrada] = useState<string>(
    tabelaPrecoQuebra.precoQuebradaPerKg.toString()
  );
  const [precoAmarela, setPrecoAmarela] = useState<string>(
    tabelaPrecoQuebra.precoAmarelaPerKg.toString()
  );

  const [justificativa, setJustificativa] = useState<string>('');

  const handleSaveTabela = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Somente Administradores podem alterar os valores da tabela de pagamento.');
      return;
    }
    if (!justificativa.trim()) {
      alert('Por favor informe a justificativa da alteração de valores.');
      return;
    }

    const pInt = parseFloat(precoInteira);
    const pQbr = parseFloat(precoQuebrada);
    const pAma = parseFloat(precoAmarela);

    if (isNaN(pInt) || isNaN(pQbr) || isNaN(pAma) || pInt <= 0 || pQbr <= 0 || pAma <= 0) {
      alert('Informe valores válidos maiores que zero.');
      return;
    }

    updateTabelaPrecoQuebra(
      {
        precoInteiraPerKg: pInt,
        precoQuebradaPerKg: pQbr,
        precoAmarelaPerKg: pAma,
      },
      activePerfil,
      justificativa
    );

    setJustificativa('');
  };

  const auditHistoryPrices = auditoriaQuebra.filter((a) =>
    a.acao.toLowerCase().includes('tabela')
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white p-6 rounded-3xl border border-amber-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-800/80 border border-amber-600/50 flex items-center justify-center text-amber-200 shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white">Tabela de Pagamento da Quebra Manual</h2>
            <p className="text-xs text-amber-200/80">Valores de remuneração da mão de obra direta por quilograma produzido</p>
          </div>
        </div>

        <div className="bg-amber-950/80 px-3.5 py-1.5 rounded-xl border border-amber-700/50 text-xs text-amber-200 font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Última atualização: {tabelaPrecoQuebra.dataAtualizacao}</span>
        </div>
      </div>

      {/* Permission Restriction Notice if Not Admin */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 text-xs flex items-center gap-3 font-bold shadow-xs">
          <Lock className="w-5 h-5 text-amber-800 shrink-0" />
          <span>
            Atenção: Seu perfil atual é <strong>{activePerfil}</strong>. Somente o perfil <strong>Administrador</strong> tem permissão para alterar os valores pagos por kg.
          </span>
        </div>
      )}

      {/* Active Table Rates Configuration Form */}
      <form onSubmit={handleSaveTabela} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-800" />
          Valores de Remuneração Vigentes (R$ / kg)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Castanha Inteira */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
            <label className="block text-xs font-black text-emerald-900 uppercase">
              Castanha Inteira
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.10"
                value={precoInteira}
                onChange={(e) => setPrecoInteira(e.target.value)}
                disabled={!isAdmin}
                required
                className="w-full pl-9 pr-12 py-2 bg-white border border-emerald-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">/ kg</span>
            </div>
            <p className="text-[10px] text-emerald-800 font-semibold">Preço Padrão Inicial: R$ 5,00/kg</p>
          </div>

          {/* Castanha Quebrada (Pedaco) */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
            <label className="block text-xs font-black text-amber-900 uppercase">
              Castanha Quebrada (Pedaço)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.10"
                value={precoQuebrada}
                onChange={(e) => setPrecoQuebrada(e.target.value)}
                disabled={!isAdmin}
                required
                className="w-full pl-9 pr-12 py-2 bg-white border border-amber-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">/ kg</span>
            </div>
            <p className="text-[10px] text-amber-800 font-semibold">Preço Padrão Inicial: R$ 2,50/kg</p>
          </div>

          {/* Castanha Amarela */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
            <label className="block text-xs font-black text-amber-950 uppercase">
              Castanha Amarela
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.10"
                value={precoAmarela}
                onChange={(e) => setPrecoAmarela(e.target.value)}
                disabled={!isAdmin}
                required
                className="w-full pl-9 pr-12 py-2 bg-white border border-amber-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">/ kg</span>
            </div>
            <p className="text-[10px] text-amber-900 font-semibold">Preço Padrão Inicial: R$ 2,50/kg</p>
          </div>

        </div>

        {/* Justification & Save */}
        {isAdmin && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Justificativa da Alteração (Obrigatória para Rastreabilidade de Auditoria) *
              </label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Ex: Reajuste salarial do acordo coletivo anual da safra de Monte Dourado..."
                rows={2}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-200" />
                Salvar Nova Tabela Auditada
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Historical Audit Trail for Price Table Changes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-slate-700" />
          Histórico de Alterações na Tabela de Preços (Preservação Financeira)
        </h3>

        {auditHistoryPrices.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-4">Nenhuma alteração de preços registrada no histórico.</p>
        ) : (
          <div className="space-y-3">
            {auditHistoryPrices.map((audit) => (
              <div key={audit.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{audit.usuario}</span>
                  <span className="font-mono text-slate-500">{audit.dataHora}</span>
                </div>
                <div className="text-slate-700 font-medium">
                  <strong>Valores Anteriores:</strong> {audit.valorAnterior}
                </div>
                <div className="text-emerald-800 font-bold">
                  <strong>Novos Valores:</strong> {audit.valorNovo}
                </div>
                <div className="text-slate-500 italic text-[11px]">
                  <strong>Justificativa:</strong> "{audit.justificativa}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
