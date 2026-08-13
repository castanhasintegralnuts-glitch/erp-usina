import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpectativaCompra, MotivoBaixaExpectativa } from '../../types';
import {
  TrendingUp,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  ShoppingCart,
  Trash2,
  Info,
  Calendar,
  Layers,
  Filter,
  Search,
  AlertTriangle,
  Users
} from 'lucide-react';

interface ExpectativasCompraViewProps {
  onOpenNovaCompra?: (fornecedorId?: string, quantidadeEstimada?: number, unidadeMedida?: string) => void;
}

export const ExpectativasCompraView: React.FC<ExpectativasCompraViewProps> = ({ onOpenNovaCompra }) => {
  const {
    expectativasCompra,
    fornecedores,
    addExpectativaCompra,
    updateQuantidadeExpectativa,
    darBaixaExpectativa,
    converterExpectativaEmCompra,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todas' | 'Ativa' | 'Convertida em Compra' | 'Baixada'>('Ativa');

  // Modal States
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);
  const [editingExpectativa, setEditingExpectativa] = useState<ExpectativaCompra | null>(null);
  const [baixaExpectativa, setBaixaExpectativa] = useState<ExpectativaCompra | null>(null);

  // Form State for Nova Expectativa (Strictly 4 fields)
  const [newFornecedorId, setNewFornecedorId] = useState('');
  const [newQuantidade, setNewQuantidade] = useState<string>('');
  const [newUnidade, setNewUnidade] = useState<'hectolitros' | 'latas' | 'kg'>('hectolitros');
  const [newPeriodo, setNewPeriodo] = useState('Próximas 2 semanas');

  // Edit Quantity State
  const [editQuantidade, setEditQuantidade] = useState<string>('');

  // Baixa Motivo State (Strictly 4 options)
  const [selectedMotivoBaixa, setSelectedMotivoBaixa] = useState<MotivoBaixaExpectativa>(
    'Mercadoria negociada com terceiros'
  );

  const motivosBaixaList: MotivoBaixaExpectativa[] = [
    'Mercadoria negociada com terceiros',
    'Fornecedor não possui mais a mercadoria',
    'Estimativa cancelada',
    'Outro motivo'
  ];

  // Filtered List
  const filteredList = expectativasCompra.filter((exp) => {
    const matchesSearch = exp.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) || exp.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todas' || exp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAtivas = expectativasCompra.filter((e) => e.status === 'Ativa').length;
  const totalVolumeHlAtivo = expectativasCompra
    .filter((e) => e.status === 'Ativa')
    .reduce((acc, e) => {
      let hl = e.quantidadeEstimada;
      if (e.unidadeMedida === 'latas') hl = e.quantidadeEstimada / 5;
      if (e.unidadeMedida === 'kg') hl = e.quantidadeEstimada / 50;
      return acc + hl;
    }, 0);

  const handleSaveNova = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFornecedorId) {
      addToast('Por favor, selecione um fornecedor.', 'error');
      return;
    }
    const qtdNum = Number(newQuantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      addToast('Informe uma quantidade estimada válida.', 'error');
      return;
    }

    const forn = fornecedores.find((f) => f.id === newFornecedorId);
    if (!forn) return;

    addExpectativaCompra({
      fornecedorId: forn.id,
      fornecedorNome: forn.nomeCompleto,
      quantidadeEstimada: qtdNum,
      unidadeMedida: newUnidade,
      periodoDisponibilidade: newPeriodo || 'A definir',
    });

    setIsNovoModalOpen(false);
    setNewFornecedorId('');
    setNewQuantidade('');
    setNewPeriodo('Próximas 2 semanas');
  };

  const handleConfirmEditQuantidade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpectativa) return;
    const qtdNum = Number(editQuantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      addToast('Informe uma quantidade válida.', 'error');
      return;
    }

    updateQuantidadeExpectativa(editingExpectativa.id, qtdNum);
    setEditingExpectativa(null);
  };

  const handleConfirmBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baixaExpectativa) return;
    darBaixaExpectativa(baixaExpectativa.id, selectedMotivoBaixa);
    setBaixaExpectativa(null);
  };

  const handleConverterEmCompra = (exp: ExpectativaCompra) => {
    converterExpectativaEmCompra(exp.id);
    if (onOpenNovaCompra) {
      onOpenNovaCompra(exp.fornecedorId, exp.quantidadeEstimada, exp.unidadeMedida);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Informativo sobre Regras de Funcionamento */}
      <div className="bg-emerald-900 text-amber-50 p-4 sm:p-5 rounded-2xl shadow-md border border-emerald-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              📊
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Expectativas de Compra de Matéria-Prima
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                Registro enxuto da safra estimada com fornecedores para planejamento futuro
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNovoModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar Nova Expectativa</span>
          </button>
        </div>

        {/* Regras de Funcionamento Visíveis */}
        <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/80 text-[11px] text-amber-100/90 flex flex-wrap items-center justify-between gap-2">
          <span className="font-extrabold uppercase text-amber-300 tracking-wider text-[10px]">
            Regras de Funcionamento (Safra):
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1">❌ Não movimenta caixa</span>
            <span className="flex items-center gap-1">❌ Não reserva capital</span>
            <span className="flex items-center gap-1">❌ Não gera conta a pagar</span>
            <span className="flex items-center gap-1">❌ Não entra no estoque</span>
            <span className="flex items-center gap-1">❌ Não representa compra confirmada</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Expectativas Ativas</span>
            <span className="text-2xl font-black text-slate-900">{totalAtivas}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Volume Estimado Ativo</span>
            <span className="text-2xl font-black text-slate-900">
              {totalVolumeHlAtivo.toFixed(1)} <span className="text-xs font-bold text-slate-500">HL (aprox.)</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total no Histórico</span>
            <span className="text-2xl font-black text-slate-900">{expectativasCompra.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
          {(['Ativa', 'Todas', 'Convertida em Compra', 'Baixada'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Info className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">Nenhuma expectativa de compra encontrada.</p>
            <p className="text-xs text-slate-400">Use o botão acima para registrar uma estimativa rápida de safra.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código / Registro</th>
                  <th className="py-3 px-4">1. Fornecedor</th>
                  <th className="py-3 px-4">2. Quantidade Estimada</th>
                  <th className="py-3 px-4">3. Unidade de Medida</th>
                  <th className="py-3 px-4">4. Período Provável</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Comandos Rápidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-black text-slate-900">
                      {exp.codigo}
                      {exp.recebimentoOrigemCodigo && (
                        <span className="block text-[10px] text-emerald-700 font-bold">
                          Origem: {exp.recebimentoOrigemCodigo}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-800">{exp.fornecedorNome}</td>
                    <td className="py-3 px-4 font-black text-emerald-800 text-sm">{exp.quantidadeEstimada}</td>
                    <td className="py-3 px-4 font-bold text-slate-600 capitalize">{exp.unidadeMedida}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exp.periodoDisponibilidade}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {exp.status === 'Ativa' && (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" /> Ativa
                        </span>
                      )}
                      {exp.status === 'Convertida em Compra' && (
                        <span className="bg-blue-100 text-blue-900 border border-blue-300 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" /> Convertida
                        </span>
                      )}
                      {exp.status === 'Baixada' && (
                        <div className="inline-block text-center">
                          <span className="bg-slate-100 text-slate-700 border border-slate-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-slate-500" /> Baixada
                          </span>
                          {exp.motivoBaixa && (
                            <span className="block text-[9px] text-slate-500 font-medium max-w-[140px] truncate mt-0.5">
                              {exp.motivoBaixa}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {exp.status === 'Ativa' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Comando 1: Atualizar quantidade */}
                          <button
                            onClick={() => {
                              setEditingExpectativa(exp);
                              setEditQuantidade(String(exp.quantidadeEstimada));
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Atualizar quantidade estimada"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden lg:inline">Atualizar qtd</span>
                          </button>

                          {/* Comando 2: Converter em compra */}
                          <button
                            onClick={() => handleConverterEmCompra(exp)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Converter em compra no fluxo normal"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-emerald-100" />
                            <span>Converter em compra</span>
                          </button>

                          {/* Comando 3: Dar baixa na expectativa */}
                          <button
                            onClick={() => {
                              setBaixaExpectativa(exp);
                              setSelectedMotivoBaixa('Mercadoria negociada com terceiros');
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Dar baixa na expectativa"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span className="hidden lg:inline">Dar baixa</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Concluída</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: REGISTRAR NOVA EXPECTATIVA MANUAL (ESTRITAMENTE OS 4 CAMPOS SOLICITADOS) */}
      {isNovoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                  📝
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Nova Expectativa de Compra</h3>
                  <p className="text-[11px] text-slate-300">Registro enxuto da estimativa de safra</p>
                </div>
              </div>
              <button
                onClick={() => setIsNovoModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNova} className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                <strong>Pergunta da Safra:</strong> “Qual quantidade este fornecedor estima que ainda terá disponível?”
              </div>

              {/* 1. FORNECEDOR */}
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  1. Fornecedor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newFornecedorId}
                  onChange={(e) => setNewFornecedorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">-- Selecione o Fornecedor --</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nomeCompleto} ({f.tipo})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. QUANTIDADE ESTIMADA & 3. UNIDADE DE MEDIDA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1">
                    2. Quantidade Estimada <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={newQuantidade}
                    onChange={(e) => setNewQuantidade(e.target.value)}
                    placeholder="Ex: 50"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1">
                    3. Unidade de Medida <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUnidade}
                    onChange={(e) => setNewUnidade(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="hectolitros">Hectolitros (HL)</option>
                    <option value="latas">Latas (60L)</option>
                    <option value="kg">Quilogramas (kg)</option>
                  </select>
                </div>
              </div>

              {/* 4. PERÍODO PROVÁVEL DE DISPONIBILIDADE */}
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  4. Período Provável de Disponibilidade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPeriodo}
                  onChange={(e) => setNewPeriodo(e.target.value)}
                  placeholder="Ex: Mês de Setembro, Próximas 2 semanas, 15/10/2026..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNovoModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Expectativa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMANDO RÁPIDO — ATUALIZAR QUANTIDADE */}
      {editingExpectativa && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider">Atualizar Quantidade Estimada</h3>
              <button onClick={() => setEditingExpectativa(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmEditQuantidade} className="p-5 space-y-4">
              <div className="text-xs text-slate-600">
                Fornecedor: <strong className="text-slate-900 font-bold">{editingExpectativa.fornecedorNome}</strong>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nova Quantidade Estimada ({editingExpectativa.unidadeMedida})
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={editQuantidade}
                  onChange={(e) => setEditQuantidade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpectativa(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs cursor-pointer"
                >
                  Confirmar Atualização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COMANDO RÁPIDO — DAR BAIXA NA EXPECTATIVA (ESTRITAMENTE APENAS OS 4 MOTIVOS SOLICITADOS) */}
      {baixaExpectativa && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-rose-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <h3 className="text-xs font-black uppercase tracking-wider">Dar Baixa na Expectativa de Compra</h3>
              </div>
              <button onClick={() => setBaixaExpectativa(null)} className="text-rose-200 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBaixa} className="p-5 space-y-4">
              <div className="text-xs text-slate-700">
                Você está dando baixa na expectativa <strong className="font-black text-slate-900">{baixaExpectativa.codigo}</strong> ({baixaExpectativa.quantidadeEstimada} {baixaExpectativa.unidadeMedida}) do fornecedor <strong className="font-black text-slate-900">{baixaExpectativa.fornecedorNome}</strong>.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 block">
                  Selecione o motivo da baixa: <span className="text-rose-600">*</span>
                </label>

                {motivosBaixaList.map((m) => (
                  <label
                    key={m}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      selectedMotivoBaixa === m
                        ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="motivoBaixa"
                      checked={selectedMotivoBaixa === m}
                      onChange={() => setSelectedMotivoBaixa(m)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBaixaExpectativa(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
