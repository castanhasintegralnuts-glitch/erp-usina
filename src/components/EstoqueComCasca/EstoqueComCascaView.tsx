import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DestinoTipo, Recebimento } from '../../types';
import {
  calculateStockSummaries,
  formatBRL,
  formatNumber,
  hlToLatas
} from '../../utils/conversions';
import {
  Boxes,
  ArrowRightLeft,
  Factory,
  ShoppingCart,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  History,
  Tag,
  Scale
} from 'lucide-react';

export const EstoqueComCascaView: React.FC = () => {
  const {
    recebimentos,
    alterarDestinoEstoque,
    transferencias,
    activePerfil,
    gerarDocumento
  } = useApp();

  const [activeTab, setActiveTab] = useState<DestinoTipo>('Beneficiamento');

  // Modal Alterar Destino State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetRec, setTransferTargetRec] = useState<Recebimento | null>(null);
  const [transferOrigem, setTransferOrigem] = useState<DestinoTipo>('Quarentena');
  const [transferNovoDestino, setTransferNovoDestino] = useState<DestinoTipo>('Beneficiamento');
  const [transferQtdHl, setTransferQtdHl] = useState<number>(5);
  const [transferMotivo, setTransferMotivo] = useState<string>('Liberação de lote após aeração e reteste de umidade');
  const [transferAutorizacao, setTransferAutorizacao] = useState<string>('Gerência de Produção / Qualidade');
  const [transferLocalNovo, setTransferLocalNovo] = useState<string>('Silo 01 - Matéria-Prima');

  const stock = calculateStockSummaries(recebimentos);

  // Filter receipt destination items matching active tab
  const activeItems = recebimentos.flatMap((rec) => {
    if (rec.cancelado) return [];
    return rec.destinos
      .filter((d) => d.destino === activeTab && d.quantidadeHectolitros > 0)
      .map((d) => ({
        recebimento: rec,
        destinoItem: d,
      }));
  });

  const handleOpenTransferModal = (rec: Recebimento, origem: DestinoTipo) => {
    setTransferTargetRec(rec);
    setTransferOrigem(origem);
    const itemOrigem = rec.destinos.find((d) => d.destino === origem);
    const qtdDisp = itemOrigem ? itemOrigem.quantidadeHectolitros : 5;
    setTransferQtdHl(Math.min(5, qtdDisp));
    setTransferNovoDestino(origem === 'Quarentena' ? 'Beneficiamento' : 'Venda com Casca');
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetRec) return;

    const ok = alterarDestinoEstoque(
      transferOrigem,
      transferNovoDestino,
      transferQtdHl,
      transferTargetRec.id,
      transferMotivo,
      transferAutorizacao,
      transferTargetRec.destinos.find((d) => d.destino === transferOrigem)?.localArmazenamento || 'Local Origem',
      transferLocalNovo
    );

    if (ok) {
      setIsTransferModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-2 border border-emerald-500/30">
            <Boxes className="w-4 h-4" />
            Separação de Estoque — Integral NUTS
          </div>
          <h2 className="text-xl font-black text-white">Estoque de Castanha com Casca</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Acompanhe e separe o estoque em <strong>Volumes / Hectolitros</strong> (1 vol = 1 hl = 5 latas • 1 Lote = 80 volumes) destinado ao processamento industrial (Beneficiamento) ou comercialização direta.
          </p>
        </div>

        <button
          onClick={() => {
            gerarDocumento('Extrato de Estoque', 'geral', 'Integral NUTS, Monte Dourado', { stock, recebimentos });
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow flex items-center gap-2 cursor-pointer shrink-0"
        >
          Extrato de Estoque A4
        </button>
      </div>

      {/* Stock Category Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Beneficiamento */}
        <div
          onClick={() => setActiveTab('Beneficiamento')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'Beneficiamento'
              ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 shadow'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
            <span className="flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-emerald-700" /> Beneficiamento
            </span>
            <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px]">
              Industrial
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-950">
            {formatNumber(stock.beneficiamentoHl, 1)} <span className="text-sm font-semibold text-emerald-700">hl</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {formatNumber(stock.beneficiamentoLatas, 0)} latas • {formatBRL(stock.custoMedioBeneficiamentoHl)}/hl
          </div>
        </div>

        {/* Venda com Casca */}
        <div
          onClick={() => setActiveTab('Venda com Casca')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'Venda com Casca'
              ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 shadow'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-950">
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-amber-700" /> Venda com Casca
            </span>
            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">
              Comercial
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-950">
            {formatNumber(stock.vendaComCascaHl, 1)} <span className="text-sm font-semibold text-amber-700">hl</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {formatNumber(stock.vendaComCascaLatas, 0)} latas • {formatBRL(stock.custoMedioVendaComCascaHl)}/hl
          </div>
        </div>

        {/* Quarentena */}
        <div
          onClick={() => setActiveTab('Quarentena')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'Quarentena'
              ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-500/20 shadow'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-950">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-700" /> Quarentena
            </span>
            <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded text-[10px]">
              Bloqueado
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-950">
            {formatNumber(stock.quarentenaHl, 1)} <span className="text-sm font-semibold text-rose-700">hl</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {formatNumber(stock.quarentenaLatas, 0)} latas em aeração
          </div>
        </div>

        {/* Devolução / Descarte */}
        <div
          onClick={() => setActiveTab('Devolução')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'Devolução' || activeTab === 'Descarte'
              ? 'bg-slate-100 border-slate-600 shadow'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-slate-600" /> Devolvido / Descarte
            </span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px]">
              Retirado
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatNumber(stock.devolucaoHl + stock.descarteHl, 1)} <span className="text-sm font-semibold text-slate-500">hl</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Indisponível para saldo
          </div>
        </div>

      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>Itens no Estoque: <strong className="text-emerald-800">{activeTab}</strong></span>
            <span className="text-xs text-slate-500 font-normal">({activeItems.length} lotes/entradas)</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {activeItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhum lote ou item registrado para a categoria <strong>{activeTab}</strong> no momento.
            </div>
          ) : (
            activeItems.map(({ recebimento, destinoItem }) => (
              <div
                key={`${recebimento.id}-${destinoItem.destino}`}
                className="p-4 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{recebimento.codigo}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                      Lote: {recebimento.loteCodigo || 'Individuado'}
                    </span>
                    <span className="text-slate-500">• {recebimento.data}</span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    Fornecedor: <strong>{recebimento.fornecedorNome}</strong> • Origem: {recebimento.origemCastanha}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Local de Armazenamento: <strong className="text-slate-800">{destinoItem.localArmazenamento}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">
                      {destinoItem.quantidadeHectolitros} hl
                    </div>
                    <div className="text-[11px] text-emerald-800 font-semibold">
                      {destinoItem.quantidadeLatas} latas equivalentes
                    </div>
                  </div>

                  {/* Transfer Button "Alterar Destino" */}
                  <button
                    onClick={() => handleOpenTransferModal(recebimento, destinoItem.destino)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
                    Alterar Destino
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit Log of Transferencias */}
      {transferencias.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <span>Histórico Permanente de Alterações de Destino</span>
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {transferencias.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{t.dataHora}</span> — Transferido{' '}
                  <strong className="text-emerald-800">{t.quantidadeHl} hl ({t.quantidadeLatas} latas)</strong> de{' '}
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold">{t.origemDestino}</span> para{' '}
                  <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">{t.novoDestino}</span>
                  <p className="text-slate-500 text-[11px]">Motivo: {t.motivo} • Resp: {t.responsavel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Alterar Destino */}
      {isTransferModalOpen && transferTargetRec && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Alterar Destino do Estoque</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>Código: <strong>{transferTargetRec.codigo}</strong></div>
                <div>Fornecedor: {transferTargetRec.fornecedorNome}</div>
                <div>Destino Atual: <strong className="text-slate-900">{transferOrigem}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Novo Destino</label>
                <select
                  value={transferNovoDestino}
                  onChange={(e) => setTransferNovoDestino(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="Beneficiamento">Beneficiamento (Processamento Industrial)</option>
                  <option value="Venda com Casca">Venda com Casca (Comercialização)</option>
                  <option value="Quarentena">Quarentena (Aeração/Bloqueio)</option>
                  <option value="Devolução">Devolução ao Fornecedor</option>
                  <option value="Descarte">Descarte Industrial</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantidade a Transferir (hl)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={transferQtdHl}
                  onChange={(e) => setTransferQtdHl(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 font-bold text-sm rounded-xl"
                />
                <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
                  = {hlToLatas(transferQtdHl)} latas equivalentes
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Novo Local de Armazenamento</label>
                <input
                  type="text"
                  required
                  value={transferLocalNovo}
                  onChange={(e) => setTransferLocalNovo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo da Transferência *</label>
                <input
                  type="text"
                  required
                  value={transferMotivo}
                  onChange={(e) => setTransferMotivo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Autorizado por *</label>
                <input
                  type="text"
                  required
                  value={transferAutorizacao}
                  onChange={(e) => setTransferAutorizacao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
                >
                  Confirmar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
