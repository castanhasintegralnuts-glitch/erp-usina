import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TipoContratoCompra } from '../../types';
import {
  TrendingUp,
  PackageCheck,
  Clock,
  DollarSign,
  Plus,
  FileText,
  UserCheck,
  XCircle,
  BarChart,
  Sparkles,
  ShoppingBag,
  Building,
  Users
} from 'lucide-react';

interface CompradorViewProps {
  onOpenNovaCompra?: () => void;
}

export const CompradorView: React.FC<CompradorViewProps> = ({ onOpenNovaCompra }) => {
  const {
    currentUser,
    usuarios,
    compras,
    recebimentos,
  } = useApp();

  // Get all buyers from users list
  const compradores = usuarios.filter(
    (u) => u.perfil === 'Comprador' || u.perfil === 'Gestor' || u.perfil === 'Administrador' || u.perfil === 'SuperAdministrador'
  );

  // Active selected buyer ID
  const isUserComprador = currentUser?.perfil === 'Comprador';
  const defaultCompradorId = isUserComprador ? currentUser.id : (compradores[0]?.id || 'usr-comprador-1');
  const [selectedCompradorId, setSelectedCompradorId] = useState<string>(defaultCompradorId);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'contratos' | 'entregas'>('dashboard');

  // Current selected buyer object
  const selectedComprador = usuarios.find((u) => u.id === selectedCompradorId) || currentUser;
  const compradorNome = selectedComprador?.nome || 'Comprador';
  const tipoFinanciador = selectedComprador?.tipoVinculoComprador || 'Usina';
  const proprietarioNome =
    tipoFinanciador === 'ProprietarioTerceiro'
      ? selectedComprador?.proprietarioTerceiroNome || 'Proprietário Terceiro'
      : selectedComprador?.unidadeNome || 'Usina Monte Dourado';

  // Filter purchases for selected buyer
  const comprasDoComprador = compras.filter((c) => {
    if (c.compradorId) return c.compradorId === selectedCompradorId;
    return c.compradorNome === compradorNome || c.criadoPor === compradorNome;
  });

  // Filter receipts linked to these purchases or buyer
  const recebimentosDoComprador = recebimentos.filter((r) => {
    if (r.compradorId) return r.compradorId === selectedCompradorId;
    return comprasDoComprador.some((c) => c.recebimentoId === r.id || c.id === r.compraIdVinculada);
  });

  // KEY METRICS CALCULATION
  // 1. Volume Purchased (Contratado)
  const volumeCompradoHl = comprasDoComprador.reduce((acc, c) => acc + (c.quantidadeHectolitrosPrevista || 0), 0);
  const volumeCompradoLatas = volumeCompradoHl * 5;
  const valorTotalCompradoR$ = comprasDoComprador.reduce((acc, c) => acc + (c.valorTotalEstimado || 0), 0);

  // 2. Volume Delivered (Recebido na usina)
  const volumeEntregueHl = recebimentosDoComprador.reduce((acc, r) => acc + (r.quantidadeBrutaHl || 0), 0);
  const volumeEntregueLatas = volumeEntregueHl * 5;
  const valorTotalEntregueR$ = recebimentosDoComprador.reduce((acc, r) => acc + (r.compra?.valorBruto || 0), 0);

  // 3. Pending Deliveries (Falta entregar)
  const volumeFaltaEntregarHl = Math.max(0, volumeCompradoHl - volumeEntregueHl);
  const volumeFaltaEntregarLatas = volumeFaltaEntregarHl * 5;
  const valorFaltaEntregarR$ = Math.max(0, valorTotalCompradoR$ - valorTotalEntregueR$);
  const percentualEntregue = volumeCompradoHl > 0 ? Math.min(100, Math.round((volumeEntregueHl / volumeCompradoHl) * 100)) : 0;

  // 4. Average Price Comparisons
  const precoMedioCompradorHl = volumeCompradoHl > 0 ? valorTotalCompradoR$ / volumeCompradoHl : 0;
  const precoMedioCompradorLata = precoMedioCompradorHl / 5;

  const totalVolumeGeralUsinaHl = compras.reduce((acc, c) => acc + (c.quantidadeHectolitrosPrevista || 0), 0);
  const totalValorGeralUsinaR$ = compras.reduce((acc, c) => acc + (c.valorTotalEstimado || 0), 0);
  const precoMedioGeralUsinaHl = totalVolumeGeralUsinaHl > 0 ? totalValorGeralUsinaR$ / totalVolumeGeralUsinaHl : 0;

  const diferencaPrecoHl = precoMedioCompradorHl - precoMedioGeralUsinaHl;
  const percentualDiferenca = precoMedioGeralUsinaHl > 0 ? (diferencaPrecoHl / precoMedioGeralUsinaHl) * 100 : 0;
  const isPrecoEconomico = diferencaPrecoHl <= 0;

  return (
    <div className="space-y-6">
      {/* Header & Buyer Switcher */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
                Módulo do Comprador
              </span>
              <span className="text-xs text-gray-500">• Metas, Ordens de Compra e Entregas</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Dashboard do Comprador & Safra</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Acompanhamento detalhado do volume comprado, entregas efetuadas na balança, saldo pendente e preço médio comparado com a fábrica.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Action Button: Nova Compra */}
            <button
              id="btn-portal-nova-compra"
              onClick={onOpenNovaCompra}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-5 py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer border border-emerald-600"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Nova Compra</span>
            </button>

            {/* Selector de Comprador */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 min-w-[260px]">
              <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Selecione o Comprador
              </label>
              <select
                value={selectedCompradorId}
                onChange={(e) => setSelectedCompradorId(e.target.value)}
                disabled={isUserComprador}
                className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {compradores.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.nome} ({comp.tipoVinculoComprador === 'ProprietarioTerceiro' ? `Terceiro: ${comp.proprietarioTerceiroNome}` : 'Usina'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subordination Badge Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-700">Comprador Ativo: <strong className="text-gray-900">{compradorNome}</strong></span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 font-bold">
              Subordinação:
              <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-[11px] ${
                tipoFinanciador === 'ProprietarioTerceiro'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {tipoFinanciador === 'ProprietarioTerceiro' ? `Financiador Terceiro: ${proprietarioNome}` : `Usina: ${proprietarioNome}`}
              </span>
            </span>
          </div>

          <div className="text-gray-500 font-medium">
            Total de {comprasDoComprador.length} ordens de compra emitidas
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Volume Comprado */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Volume Total Comprado</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 font-mono">
              {volumeCompradoHl.toLocaleString('pt-BR')} <span className="text-sm font-normal text-gray-500">HL</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
              <span className="font-semibold">{volumeCompradoLatas.toLocaleString('pt-BR')} latas</span>
              <span>•</span>
              <span className="font-bold text-gray-900">R$ {valorTotalCompradoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
            Baseado em {comprasDoComprador.length} ordens de compra emitidas
          </div>
        </div>

        {/* Card 2: Volume Entregue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Entregas Realizadas</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {volumeEntregueHl.toLocaleString('pt-BR')} <span className="text-sm font-normal text-emerald-600">HL</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-800">
              <span className="font-semibold">{volumeEntregueLatas.toLocaleString('pt-BR')} latas</span>
              <span>•</span>
              <span className="font-bold">R$ {valorTotalEntregueR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">Cumprimento Físico</span>
            <span className="font-bold text-emerald-700">{percentualEntregue}% da meta</span>
          </div>
        </div>

        {/* Card 3: Falta Entregar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">O que Falta Entregar</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700 font-mono">
              {volumeFaltaEntregarHl.toLocaleString('pt-BR')} <span className="text-sm font-normal text-amber-600">HL</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-amber-900">
              <span className="font-semibold">{volumeFaltaEntregarLatas.toLocaleString('pt-BR')} latas</span>
              <span>•</span>
              <span className="font-bold">R$ {valorFaltaEntregarR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            Saldo pendente nas comunidades/porto
          </div>
        </div>

        {/* Card 4: Preço Médio Comparativo */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Preço Médio vs. Usina</span>
            <div className={`p-2 rounded-lg ${isPrecoEconomico ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 font-mono">
                R$ {precoMedioCompradorHl.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">/ HL</span>
            </div>

            <div className="text-xs text-gray-600 mt-0.5">
              (R$ {precoMedioCompradorLata.toFixed(2)} / lata)
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="text-gray-500">Média Geral Usina: R$ {precoMedioGeralUsinaHl.toFixed(2)}</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                isPrecoEconomico ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {percentualDiferenca <= 0 ? `${percentualDiferenca.toFixed(1)}% (Mais econômico)` : `+${percentualDiferenca.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          id="tab-comprador-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <BarChart className="w-4 h-4" />
          Dashboard Comparativo
        </button>

        <button
          id="tab-comprador-contratos"
          onClick={() => setActiveTab('contratos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'contratos' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Ordens de Compra ({comprasDoComprador.length})
        </button>

        <button
          id="tab-comprador-entregas"
          onClick={() => setActiveTab('entregas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'entregas' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Entregas na Balança ({recebimentosDoComprador.length})
        </button>
      </div>

      {/* Tab 1: Dashboard Comparativo Visual */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box 1: Preço Médio em Detalhes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              Análise do Preço Médio Negociado
            </h3>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Média do Comprador ({compradorNome})</span>
                <span className="font-bold text-emerald-900 font-mono text-base">R$ {precoMedioCompradorHl.toFixed(2)} / HL</span>
              </div>

              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (precoMedioCompradorHl / (precoMedioGeralUsinaHl * 1.3 || 1)) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-gray-600 font-medium">Média Geral da Usina</span>
                <span className="font-bold text-gray-800 font-mono text-base">R$ {precoMedioGeralUsinaHl.toFixed(2)} / HL</span>
              </div>

              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gray-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (precoMedioGeralUsinaHl / (precoMedioGeralUsinaHl * 1.3 || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isPrecoEconomico ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {isPrecoEconomico ? 'Negociação Altamente Eficiente' : 'Atenção aos Custos de Aquisição'}
              </div>
              {isPrecoEconomico
                ? `O comprador ${compradorNome} está comprando com preço médio R$ ${Math.abs(diferencaPrecoHl).toFixed(2)}/HL abaixo da média geral da fábrica, gerando economia para a operação.`
                : `O preço médio atual está R$ ${diferencaPrecoHl.toFixed(2)}/HL acima da média geral da usina. Avaliar fretes de origem ou renegociar lotes.`}
            </div>
          </div>

          {/* Box 2: Progresso Físico de Entregas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-700" />
              Progresso Físico do Contrato
            </h3>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-900 font-medium">Volume Já Entregue na Usina</span>
                <span className="font-bold text-emerald-800 font-mono text-base">{volumeEntregueHl.toLocaleString('pt-BR')} HL</span>
              </div>

              <div className="w-full bg-emerald-200 h-4 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentualEntregue}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-emerald-800 pt-1">
                <span>Total Contratado: {volumeCompradoHl.toLocaleString('pt-BR')} HL</span>
                <span className="font-bold">{percentualEntregue}% Concluído</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 block">Falta Entregar (HL)</span>
                <span className="text-lg font-bold text-gray-900 font-mono">{volumeFaltaEntregarHl.toLocaleString('pt-BR')} HL</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 block">Falta Entregar (R$)</span>
                <span className="text-lg font-bold text-gray-900 font-mono">R$ {valorFaltaEntregarR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contratos por Tipo */}
      {activeTab === 'contratos' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ordens de Compra & Tipos de Contrato</h3>
              <p className="text-xs text-gray-500">Contratos firmados com produtores, cooperativas e intermediários.</p>
            </div>
            <button
              onClick={onOpenNovaCompra}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Emitir Nova Compra
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Fornecedor</th>
                  <th className="p-3">Tipo de Contrato</th>
                  <th className="p-3 text-right">Vol. Contratado</th>
                  <th className="p-3 text-right">Preço / HL</th>
                  <th className="p-3 text-right">Total (R$)</th>
                  <th className="p-3">Progresso Entrega</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {comprasDoComprador.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      Nenhuma compra associada a este comprador.
                    </td>
                  </tr>
                ) : (
                  comprasDoComprador.map((c) => {
                    const tipoContrato: TipoContratoCompra = c.tipoContrato || 'A Termo';
                    const entregueHL = c.quantidadeHectolitrosEntregue || (c.status === 'Recebido' ? c.quantidadeHectolitrosPrevista : 0);
                    const percent = c.quantidadeHectolitrosPrevista > 0 ? Math.min(100, Math.round((entregueHL / c.quantidadeHectolitrosPrevista) * 100)) : 0;

                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-gray-900">{c.codigo}</td>
                        <td className="p-3 text-gray-600">{new Date(c.dataCompra).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3 font-medium text-gray-900">{c.fornecedorNome}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                            {tipoContrato}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold">{c.quantidadeHectolitrosPrevista} HL</td>
                        <td className="p-3 text-right font-mono">R$ {c.valorPorHectolitro.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-bold">R$ {c.valorTotalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">{percent}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              c.status === 'Recebido'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'Pendente de Recebimento'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Entregas Realizadas */}
      {activeTab === 'entregas' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50/70">
            <h3 className="text-lg font-bold text-gray-900">Histórico de Recebimentos na Balança</h3>
            <p className="text-xs text-gray-500">Romaneios e pesagens físicas vinculadas às compras do comprador.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Romaneio</th>
                  <th className="p-3">Data & Hora</th>
                  <th className="p-3">Fornecedor</th>
                  <th className="p-3">Origem</th>
                  <th className="p-3 text-right">Vol. Bruto</th>
                  <th className="p-3 text-right">Vol. Líquido</th>
                  <th className="p-3 text-right">Valor Pago (R$)</th>
                  <th className="p-3">Qualidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {recebimentosDoComprador.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Nenhum recebimento físico registrado ainda.
                    </td>
                  </tr>
                ) : (
                  recebimentosDoComprador.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-gray-900">{r.codigo}</td>
                      <td className="p-3 text-gray-600">{new Date(r.data).toLocaleDateString('pt-BR')} {r.horario}</td>
                      <td className="p-3 font-medium text-gray-900">{r.fornecedorNome}</td>
                      <td className="p-3 text-gray-600">{r.comunidade || r.origemCastanha}</td>
                      <td className="p-3 text-right font-mono">{r.quantidadeBrutaHl} HL</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">{r.quantidadeLiquidaHl} HL</td>
                      <td className="p-3 text-right font-mono font-bold">R$ {(r.compra?.valorLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-medium">
                          {r.avaliacao?.resultado || 'Aprovado'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
