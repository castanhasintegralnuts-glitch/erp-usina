import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatNumber } from '../../utils/conversions';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  X,
  User,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';
import { FormaPagamento, PagamentoQuebra } from '../../types';

export const PagamentosFolhaTab: React.FC = () => {
  const {
    producoesQuebra,
    pagamentosQuebra,
    quebradores,
    registrarPagamentoQuebra,
    activePerfil,
    gerarDocumento,
  } = useApp();

  // Selected Quebrador for payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [observacoes, setObservacoes] = useState('');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);

  // Aggregate pending items per worker
  const activeQuebradores = quebradores.filter((q) => q.situacao === 'Ativo');

  const workerFinancialSummaries = activeQuebradores.map((q) => {
    const qProds = producoesQuebra.filter((p) => p.quebradorId === q.id);
    const qPgs = pagamentosQuebra.filter((p) => p.quebradorId === q.id);

    const totalProduzidoR$ = qProds.reduce((acc, p) => acc + p.valorTotal, 0);
    const totalPagoR$ = qPgs.reduce((acc, p) => acc + p.valorPago, 0);
    
    const pendingProds = qProds.filter((p) => p.situacaoPagamento === 'Pendente');
    const totalPendenteR$ = pendingProds.reduce((acc, p) => acc + p.valorTotal, 0);

    return {
      quebrador: q,
      totalProduzidoR$,
      totalPagoR$,
      totalPendenteR$,
      pendingProds,
    };
  });

  const totalFolhaGeralProduzida = producoesQuebra.reduce((acc, p) => acc + p.valorTotal, 0);
  const totalGeralPago = pagamentosQuebra.reduce((acc, p) => acc + p.valorPago, 0);
  const totalGeralPendente = totalFolhaGeralProduzida - totalGeralPago;

  const handleOpenPaymentModal = (qId: string) => {
    setSelectedWorkerId(qId);
    setObservacoes('');
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = workerFinancialSummaries.find((s) => s.quebrador.id === selectedWorkerId);
    if (!summary || summary.pendingProds.length === 0) {
      alert('Nenhum lançamento pendente para este colaborador.');
      return;
    }

    const pendingIds = summary.pendingProds.map((p) => p.id);
    const valorPago = summary.totalPendenteR$;

    const dates = summary.pendingProds.map((p) => p.data).sort();
    const inicio = dates[0] || dataPagamento;
    const fim = dates[dates.length - 1] || dataPagamento;

    registrarPagamentoQuebra(
      {
        dataPagamento,
        quebradorId: summary.quebrador.id,
        quebradorNome: summary.quebrador.nome,
        valorPago,
        periodoInicio: inicio,
        periodoFim: fim,
        formaPagamento,
        responsavel: activePerfil,
        observacoes,
        producoesIds: pendingIds,
      },
      activePerfil
    );

    setIsPaymentModalOpen(false);
  };

  const handleImprimirRecibo = (pg: PagamentoQuebra) => {
    gerarDocumento('Recibo de Quebra', pg.id, pg.quebradorNome, pg);
  };

  const handleImprimirFolhaGeral = () => {
    gerarDocumento('Folha de Quebra', `folha-${Date.now()}`, 'Equipe de Quebra Manual', {
      summaries: workerFinancialSummaries,
      totalGeralPendente,
      totalGeralPago,
      totalFolhaGeralProduzida,
      dataImpressao: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Summary */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Folha de Pagamento & Liquidação da Quebra
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            Gestão financeira de remunerações por produção na usina Monte Dourado
          </p>
        </div>

        <button
          onClick={handleImprimirFolhaGeral}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/40"
        >
          <Printer className="w-4 h-4" />
          <span>Emitir Folha A4 Consolidada</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-bold text-xs">Total Produzido Histórico</div>
          <div className="text-2xl font-black text-slate-900">{formatBRL(totalFolhaGeralProduzida)}</div>
          <div className="text-[11px] text-slate-400">Total apurado no sistema</div>
        </div>

        <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-sm space-y-1">
          <div className="text-emerald-200 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Total Já Pago
          </div>
          <div className="text-2xl font-black text-emerald-300">{formatBRL(totalGeralPago)}</div>
          <div className="text-[11px] text-emerald-200">Pagamentos liquidados com recibo</div>
        </div>

        <div className="p-4 bg-amber-950 text-white rounded-2xl border border-amber-800 shadow-sm space-y-1">
          <div className="text-amber-200 font-bold text-xs flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            Total Pendente A Pagar
          </div>
          <div className="text-2xl font-black text-amber-300">{formatBRL(totalGeralPendente)}</div>
          <div className="text-[11px] text-amber-200">Aguardando liquidação financeira</div>
        </div>
      </div>

      {/* Workers Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-amber-800" />
            Saldos Individuais da Equipe
          </h3>
          <span className="text-xs text-slate-500 font-bold">{workerFinancialSummaries.length} colaboradores</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px]">
              <tr>
                <th className="p-3">Matrícula</th>
                <th className="p-3">Quebrador(a)</th>
                <th className="p-3 text-right">Total Acumulado</th>
                <th className="p-3 text-right">Valor PAGO</th>
                <th className="p-3 text-right">PENDENTE (A Pagar)</th>
                <th className="p-3 text-center">Diárias Pendentes</th>
                <th className="p-3 text-center">Ações Financeiras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {workerFinancialSummaries.map((s) => (
                <tr key={s.quebrador.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{s.quebrador.matricula}</td>
                  <td className="p-3 font-bold text-slate-900">{s.quebrador.nome}</td>
                  <td className="p-3 text-right font-semibold text-slate-700">{formatBRL(s.totalProduzidoR$)}</td>
                  <td className="p-3 text-right font-bold text-emerald-700">{formatBRL(s.totalPagoR$)}</td>
                  <td className="p-3 text-right font-black text-amber-700 text-sm">
                    {formatBRL(s.totalPendenteR$)}
                  </td>
                  <td className="p-3 text-center font-bold">
                    {s.pendingProds.length > 0 ? (
                      <span className="bg-amber-100 text-amber-900 text-[11px] px-2 py-0.5 rounded-full font-bold border border-amber-300">
                        {s.pendingProds.length} diárias
                      </span>
                    ) : (
                      <span className="text-emerald-700 text-[11px] font-bold">Quitado</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {s.totalPendenteR$ > 0 ? (
                      <button
                        onClick={() => handleOpenPaymentModal(s.quebrador.id)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Pagar Saldo
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Sem pendências</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Histórico de Pagamentos Liquidados
          </span>
          <span className="text-xs text-slate-500 font-normal">{pagamentosQuebra.length} comprovantes</span>
        </h3>

        {pagamentosQuebra.length === 0 ? (
          <div className="text-slate-400 text-xs text-center py-6">Nenhum pagamento efetuado até o momento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Quebrador(a)</th>
                  <th className="p-3">Forma</th>
                  <th className="p-3 text-right">Valor Pago</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3 text-center">Recibo A4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pagamentosQuebra.map((pg) => (
                  <tr key={pg.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{pg.codigo}</td>
                    <td className="p-3 font-mono">{pg.dataPagamento}</td>
                    <td className="p-3 font-bold text-slate-900">{pg.quebradorNome}</td>
                    <td className="p-3 font-semibold text-emerald-800">{pg.formaPagamento}</td>
                    <td className="p-3 text-right font-black text-emerald-700 text-sm">{formatBRL(pg.valorPago)}</td>
                    <td className="p-3 text-slate-600">{pg.responsavel}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleImprimirRecibo(pg)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-300"
                      >
                        <Printer className="w-3 h-3 text-amber-800" />
                        Recibo A4
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                Registrar Pagamento de Quebra
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const summary = workerFinancialSummaries.find((s) => s.quebrador.id === selectedWorkerId);
              if (!summary) return null;

              return (
                <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                    <div className="text-slate-500 font-bold">Favorecido(a):</div>
                    <div className="text-base font-extrabold text-slate-900">
                      {summary.quebrador.nome} ({summary.quebrador.matricula})
                    </div>
                    <div className="text-amber-900 font-black text-sm pt-1 border-t border-amber-200 flex justify-between">
                      <span>Valor Pendente a Liquidar:</span>
                      <span className="text-emerald-700">{formatBRL(summary.totalPendenteR$)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Data do Pagamento *</label>
                      <input
                        type="date"
                        value={dataPagamento}
                        onChange={(e) => setDataPagamento(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Forma de Pagamento *</label>
                      <select
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      >
                        <option value="PIX">PIX</option>
                        <option value="Dinheiro">Dinheiro em Espécie</option>
                        <option value="Transferência">Transferência Bancária</option>
                        <option value="Depósito">Depósito</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Observações / Comprovante Ref.</label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Ex: Pagamento referente à produção da semana 01 via chave PIX CPF..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl shadow-lg flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar Pagamento de {formatBRL(summary.totalPendenteR$)}
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};
