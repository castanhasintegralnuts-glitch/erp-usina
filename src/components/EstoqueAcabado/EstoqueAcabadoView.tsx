import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TipoCastanhaBeneficiadaSubtipo } from '../../types';
import { formatBRL, formatNumber } from '../../utils/conversions';
import {
  PackageCheck,
  Box,
  DollarSign,
  TrendingUp,
  Scale,
  Edit,
  Plus,
  X,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Layers,
  Building2,
  RefreshCw,
  Clock
} from 'lucide-react';

export const EstoqueAcabadoView: React.FC = () => {
  const { estoqueBeneficiada, ajustarEstoqueBeneficiada, adicionarEstoqueBeneficiada, addToast } = useApp();

  const [isModalAjusteOpen, setIsModalAjusteOpen] = useState(false);
  const [selectedTipoAjuste, setSelectedTipoAjuste] = useState<TipoCastanhaBeneficiadaSubtipo>('Extra Large');
  const [modoAjuste, setModoAjuste] = useState<'definir' | 'adicionar'>('definir');
  const [qtdCaixasAjuste, setQtdCaixasAjuste] = useState<string>('100');
  const [precoAjuste, setPrecoAjuste] = useState<string>('48.00');

  // Total Calculations
  const totalCaixas = estoqueBeneficiada.reduce((acc, item) => acc + item.caixas, 0);
  const totalPesoKg = estoqueBeneficiada.reduce((acc, item) => acc + item.pesoKg, 0);

  // Financial Valuations
  const totalValorUltimoPreco = estoqueBeneficiada.reduce(
    (acc, item) => acc + item.pesoKg * item.ultimoPrecoVenda,
    0
  );

  const totalValorPrecoMedio = estoqueBeneficiada.reduce(
    (acc, item) => acc + item.pesoKg * item.precoMedioVenda,
    0
  );

  const diferencaValracao = totalValorUltimoPreco - totalValorPrecoMedio;

  const handleOpenAjusteModal = (tipo: TipoCastanhaBeneficiadaSubtipo) => {
    setSelectedTipoAjuste(tipo);
    const item = estoqueBeneficiada.find((e) => e.tipo === tipo);
    if (item) {
      setQtdCaixasAjuste(item.caixas.toString());
      setPrecoAjuste(item.ultimoPrecoVenda.toString());
    }
    setIsModalAjusteOpen(true);
  };

  const handleSaveAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    const cx = parseInt(qtdCaixasAjuste) || 0;
    const pr = parseFloat(precoAjuste) || 0;

    if (modoAjuste === 'definir') {
      ajustarEstoqueBeneficiada(selectedTipoAjuste, cx, pr);
    } else {
      adicionarEstoqueBeneficiada(selectedTipoAjuste, cx);
    }
    setIsModalAjusteOpen(false);
  };

  const iconsByTipo: Record<TipoCastanhaBeneficiadaSubtipo, string> = {
    'Extra Large': '👑',
    'Large': '✨',
    'Média': '⭐',
    'Miúda': '🔹',
    'Pedaço': '🧩',
    'Pedacinho': '░',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <PackageCheck className="w-4 h-4" />
            <span>Usina Monte Dourado — Gestão de Castanhas Beneficiadas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Controle de Estoque de Castanha Beneficiada
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Saldos físicos e valoração financeira atrelada ao histórico de vendas por classificação (Extra Large, Large, Média, Miúda, Pedaço e Pedacinho).
          </p>
        </div>

        <button
          onClick={() => handleOpenAjusteModal('Extra Large')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all border border-emerald-500 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Lançar Entrada / Ajustar Estoque</span>
        </button>
      </div>

      {/* Financial Valuation KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-950 text-white p-5 rounded-3xl border border-emerald-900 shadow-md space-y-2 relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 bg-emerald-800/50 rounded-xl text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider block">
            Valor do Estoque (Último Preço)
          </span>
          <span className="text-2xl font-black text-amber-400 block tracking-tight">
            {formatBRL(totalValorUltimoPreco)}
          </span>
          <span className="text-[11px] font-bold text-emerald-200 block">
            Baseado no valor de mercado mais recente
          </span>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-md space-y-2 relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 bg-slate-800 rounded-xl text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
            Valor do Estoque (Preço Médio)
          </span>
          <span className="text-2xl font-black text-emerald-400 block tracking-tight">
            {formatBRL(totalValorPrecoMedio)}
          </span>
          <span className="text-[11px] font-bold text-slate-300 block">
            Média histórica ponderada das vendas
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Total em Caixas Padronizadas
          </span>
          <span className="text-2xl font-black text-slate-900 block tracking-tight">
            {formatNumber(totalCaixas, 0)} caixas
          </span>
          <span className="text-[11px] font-bold text-emerald-700 block">
            Volume pronto para embalagem/expedição
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Peso Total de Amêndoas (Kg)
          </span>
          <span className="text-2xl font-black text-emerald-800 block tracking-tight">
            {formatNumber(totalPesoKg, 0)} kg
          </span>
          <span className="text-[11px] font-bold text-slate-600 block">
            Diferença Patrimonial: {formatBRL(diferencaValracao)}
          </span>
        </div>
      </div>

      {/* Grid: 6 Castanha Beneficiada Subtypes Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Castanhas Beneficiadas por Tipo Comercial (6 Padrões)</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Caixas de 20kg a vácuo com selo de qualidade Monte Dourado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estoqueBeneficiada.map((item) => {
            const valorUltimoTipo = item.pesoKg * item.ultimoPrecoVenda;
            const valorMedioTipo = item.pesoKg * item.precoMedioVenda;

            return (
              <div
                key={item.tipo}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-emerald-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 bg-amber-50 rounded-2xl border border-amber-200">
                        {iconsByTipo[item.tipo] || '📦'}
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Embalagem 20kg Vácuo
                        </span>
                        <h3 className="font-black text-slate-900 text-base leading-snug">
                          {item.tipo}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAjusteModal(item.tipo)}
                      className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      title="Editar saldo de estoque / preço"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {item.descricao}
                  </p>

                  {/* Stock volume pill */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Estoque Caixas</span>
                      <span className="text-lg font-black text-slate-900">{formatNumber(item.caixas, 0)} cx</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Peso em Kg</span>
                      <span className="text-lg font-black text-emerald-800">{formatNumber(item.pesoKg, 0)} kg</span>
                    </div>
                  </div>

                  {/* Financial valuation breakdown */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Último Preço Venda:</span>
                      <span className="font-extrabold text-slate-900">
                        R$ {formatBRL(item.ultimoPrecoVenda)}/kg <span className="text-[10px] text-slate-500 font-normal">(R$ {formatBRL(item.ultimoPrecoVenda * 20)}/cx)</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Preço Médio de Venda:</span>
                      <span className="font-extrabold text-emerald-800">
                        R$ {formatBRL(item.precoMedioVenda)}/kg
                      </span>
                    </div>

                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex justify-between items-center">
                      <span className="font-bold text-emerald-950 text-[11px]">Valoração Patrimonial:</span>
                      <span className="font-black text-emerald-900 text-sm">{formatBRL(valorUltimoTipo)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-semibold border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Atualizado: {item.dataUltimaAtualizacao || '2026-08-05'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAjusteModal(item.tipo)}
                    className="text-emerald-800 font-extrabold hover:underline cursor-pointer"
                  >
                    + Lançar / Ajustar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Financial Valuation Comparative Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" />
              <span>Demonstrativo Financeiro do Estoque de Castanha Beneficiada</span>
            </h3>
            <p className="text-slate-500 text-xs font-medium">
              Comparativo detalhado entre valoração por último preço praticado e média ponderada de vendas.
            </p>
          </div>

          <div className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">
            6 Padrões Comerciais Monte Dourado
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
              <tr>
                <th className="p-3">Tipo comercial</th>
                <th className="p-3">Descrição Comercial</th>
                <th className="p-3 text-right">Caixas (cx)</th>
                <th className="p-3 text-right">Peso (Kg)</th>
                <th className="p-3 text-right">Último Preço (R$/kg)</th>
                <th className="p-3 text-right">Preço Médio (R$/kg)</th>
                <th className="p-3 text-right">Valor Último Preço</th>
                <th className="p-3 text-right">Valor Preço Médio</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {estoqueBeneficiada.map((item) => {
                const valUlt = item.pesoKg * item.ultimoPrecoVenda;
                const valMed = item.pesoKg * item.precoMedioVenda;

                return (
                  <tr key={item.tipo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>{iconsByTipo[item.tipo]}</span>
                      <span>{item.tipo}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{item.descricao}</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatNumber(item.caixas, 0)} cx</td>
                    <td className="p-3 text-right font-black text-emerald-800">{formatNumber(item.pesoKg, 0)} kg</td>
                    <td className="p-3 text-right font-bold text-slate-800">R$ {formatBRL(item.ultimoPrecoVenda)}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">R$ {formatBRL(item.precoMedioVenda)}</td>
                    <td className="p-3 text-right font-black text-amber-900">R$ {formatBRL(valUlt)}</td>
                    <td className="p-3 text-right font-black text-emerald-900">R$ {formatBRL(valMed)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenAjusteModal(item.tipo)}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-extrabold text-[11px] cursor-pointer transition-colors border border-emerald-300"
                      >
                        Ajustar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black">
              <tr>
                <td colSpan={2} className="p-3 uppercase text-[11px]">Total Geral em Estoque</td>
                <td className="p-3 text-right text-amber-400">{formatNumber(totalCaixas, 0)} cx</td>
                <td className="p-3 text-right text-amber-400">{formatNumber(totalPesoKg, 0)} kg</td>
                <td colSpan={2} className="p-3 text-right text-slate-400 uppercase text-[10px]">Valoração Geral:</td>
                <td className="p-3 text-right text-amber-400 font-black">{formatBRL(totalValorUltimoPreco)}</td>
                <td className="p-3 text-right text-emerald-400 font-black">{formatBRL(totalValorPrecoMedio)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal: Ajustar Estoque ou Lançar Entrada */}
      {isModalAjusteOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Ajuste de Estoque de Beneficiada</h3>
                  <p className="text-slate-500 text-xs">Ajuste de saldo físico e preço de venda</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalAjusteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAjuste} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo Comercial de Castanha Beneficiada
                </label>
                <select
                  value={selectedTipoAjuste}
                  onChange={(e) => {
                    const tipo = e.target.value as TipoCastanhaBeneficiadaSubtipo;
                    setSelectedTipoAjuste(tipo);
                    const item = estoqueBeneficiada.find((itm) => itm.tipo === tipo);
                    if (item) {
                      setQtdCaixasAjuste(item.caixas.toString());
                      setPrecoAjuste(item.ultimoPrecoVenda.toString());
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                >
                  {estoqueBeneficiada.map((i) => (
                    <option key={i.tipo} value={i.tipo}>
                      {i.tipo} ({i.caixas} cx em estoque)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setModoAjuste('definir')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    modoAjuste === 'definir'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Definir Saldo Total
                </button>
                <button
                  type="button"
                  onClick={() => setModoAjuste('adicionar')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    modoAjuste === 'adicionar'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  + Adicionar Caixas
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {modoAjuste === 'definir' ? 'Novo Saldo Total em Caixas (cx - 20kg)' : 'Quantidade de Caixas a Adicionar (+cx)'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={qtdCaixasAjuste}
                  onChange={(e) => setQtdCaixasAjuste(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                  Equivalente em Kg: {(parseInt(qtdCaixasAjuste) || 0) * 20} kg
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Último Preço de Venda Registrado (R$/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={precoAjuste}
                  onChange={(e) => setPrecoAjuste(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-800"
                />
                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                  Preço por Caixa: R$ {formatBRL((parseFloat(precoAjuste) || 0) * 20)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalAjusteOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Atualizar Estoque</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
