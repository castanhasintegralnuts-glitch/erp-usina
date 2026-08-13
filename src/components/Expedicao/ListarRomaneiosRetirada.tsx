import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RomaneioRetirada } from '../../types';
import { formatBRL, formatDateBR, formatNumber } from '../../utils/conversions';
import {
  Search,
  Filter,
  X,
  FileText,
  Printer,
  Eye,
  Edit2,
  Trash2,
  Hash,
  Package,
  Calendar,
  Users,
  DollarSign,
  ChevronRight,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  CreditCard
} from 'lucide-react';

interface Props {
  onEditRomaneio?: (romaneio: RomaneioRetirada) => void;
  onNewRomaneioClick?: () => void;
}

export const ListarRomaneiosRetirada: React.FC<Props> = ({
  onEditRomaneio,
  onNewRomaneioClick
}) => {
  const {
    romaneiosRetirada,
    deleteRomaneioRetirada,
    gerarDocumento,
    activePerfil,
    addToast
  } = useApp();

  const isAuthorized = activePerfil !== 'Consulta' && activePerfil !== 'Quebrador' && activePerfil !== 'Diarista';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNF, setFilterNF] = useState('');
  const [filterProduto, setFilterProduto] = useState('');
  const [filterDataPagamento, setFilterDataPagamento] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // Modal State for viewing details
  const [selectedRomaneioModal, setSelectedRomaneioModal] = useState<RomaneioRetirada | null>(null);

  // Filtered List
  const filteredRomaneios = useMemo(() => {
    return romaneiosRetirada.filter((r) => {
      // General search query (codigo, cliente, transportadora)
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        r.codigo.toLowerCase().includes(q) ||
        r.clienteNome.toLowerCase().includes(q) ||
        (r.clienteCpfCnpj && r.clienteCpfCnpj.toLowerCase().includes(q)) ||
        (r.transportadora && r.transportadora.toLowerCase().includes(q));

      // Filter NF
      const nfQ = filterNF.trim().toLowerCase();
      const matchesNF =
        !nfQ || r.itens.some((item) => item.nf.toLowerCase().includes(nfQ));

      // Filter Produto
      const prodQ = filterProduto.trim().toLowerCase();
      const matchesProduto =
        !prodQ || r.itens.some((item) => item.produto.toLowerCase().includes(prodQ));

      // Filter Data de pagamento
      const matchesDataPagamento =
        !filterDataPagamento ||
        r.itens.some((item) => item.dataPagamento === filterDataPagamento);

      // Filter Period (Data Emissao / Retirada)
      const matchesPeriodoInicio = !filterDataInicio || r.dataEmissao >= filterDataInicio;
      const matchesPeriodoFim = !filterDataFim || r.dataEmissao <= filterDataFim;

      // Filter Status
      const matchesStatus = filterStatus === 'Todos' || r.status === filterStatus;

      return (
        matchesQuery &&
        matchesNF &&
        matchesProduto &&
        matchesDataPagamento &&
        matchesPeriodoInicio &&
        matchesPeriodoFim &&
        matchesStatus
      );
    });
  }, [
    romaneiosRetirada,
    searchQuery,
    filterNF,
    filterProduto,
    filterDataPagamento,
    filterDataInicio,
    filterDataFim,
    filterStatus
  ]);

  // Totals of filtered view
  const totalQuantidade = filteredRomaneios.reduce((acc, r) => acc + (r.quantidadeTotal || 0), 0);
  const totalValor = filteredRomaneios.reduce((acc, r) => acc + (r.valorTotal || 0), 0);
  const totalItensCount = filteredRomaneios.reduce((acc, r) => acc + (r.numItensTotal || 0), 0);

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterNF('');
    setFilterProduto('');
    setFilterDataPagamento('');
    setFilterDataInicio('');
    setFilterDataFim('');
    setFilterStatus('Todos');
  };

  const hasActiveFilters =
    !!searchQuery ||
    !!filterNF ||
    !!filterProduto ||
    !!filterDataPagamento ||
    !!filterDataInicio ||
    !!filterDataFim ||
    filterStatus !== 'Todos';

  // Handle PDF Print
  const handlePrintRomaneio = (r: RomaneioRetirada) => {
    gerarDocumento('Romaneio de Retirada', r.id, r.clienteNome, {
      romaneio: r,
      itens: r.itens,
      clienteNome: r.clienteNome,
      clienteCpfCnpj: r.clienteCpfCnpj,
      motorista: r.motorista,
      placaVeiculo: r.placaVeiculo,
      transportadora: r.transportadora,
      quantidadeTotal: r.quantidadeTotal,
      valorTotal: r.valorTotal,
      numItensTotal: r.numItensTotal
    });
  };

  // Handle Delete
  const handleDelete = (r: RomaneioRetirada) => {
    if (!isAuthorized) {
      addToast(`Seu perfil (${activePerfil}) não tem permissão para excluir romaneios.`, 'error');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o Romaneio de Retirada ${r.codigo} (${r.clienteNome})?`)) {
      deleteRomaneioRetirada(r.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Módulo Expedição — Usina Monte Dourado</span>
          </div>
          <h2 className="font-black text-xl text-slate-900 flex items-center gap-2">
            <span>Listagem de Romaneios de Retirada</span>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full">
              {filteredRomaneios.length} cadastrados
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulte, filtre por NF, Produto, Data de pagamento ou Período, imprima em PDF ou gerencie romaneios.
          </p>
        </div>

        {onNewRomaneioClick && isAuthorized && (
          <button
            onClick={onNewRomaneioClick}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all border border-emerald-700 self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>+ Novo Romaneio de Retirada</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Filtros de Pesquisa e Localização</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* General Search */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
              Buscar Cliente / Código / Veículo
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Ex: Castanha do Brasil, ROM-RET-2026..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Filter NF */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
              Nº da Nota Fiscal (NF)
            </label>
            <input
              type="text"
              placeholder="Ex: 000123"
              value={filterNF}
              onChange={(e) => setFilterNF(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Produto */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
              Produto
            </label>
            <input
              type="text"
              placeholder="Ex: Broken-D"
              value={filterProduto}
              onChange={(e) => setFilterProduto(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Data Pagamento */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
              Data de Pagamento
            </label>
            <input
              type="date"
              value={filterDataPagamento}
              onChange={(e) => setFilterDataPagamento(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Concluído">Concluído</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Filter Período Início */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
              Data Emissão (Início)
            </label>
            <input
              type="date"
              value={filterDataInicio}
              onChange={(e) => setFilterDataInicio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Período Fim */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
              Data Emissão (Fim)
            </label>
            <input
              type="date"
              value={filterDataFim}
              onChange={(e) => setFilterDataFim(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Table of Romaneios */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRomaneios.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">
              Nenhum romaneio de retirada encontrado
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nenhum registro corresponde aos filtros selecionados ou ainda não há romaneios cadastrados.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs cursor-pointer transition-all"
              >
                Limpar Filtros de Busca
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Emissão</th>
                  <th className="py-3.5 px-4">Cliente / Destinatário</th>
                  <th className="py-3.5 px-4">Notas Fiscais (NFs)</th>
                  <th className="py-3.5 px-4 text-center">Itens</th>
                  <th className="py-3.5 px-4 text-center">Qtd Total</th>
                  <th className="py-3.5 px-4 text-right">Valor Total (R$)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRomaneios.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Código */}
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-950">
                      {r.codigo}
                    </td>

                    {/* Emissão */}
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {formatDateBR(r.dataEmissao)}
                    </td>

                    {/* Cliente */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{r.clienteNome}</div>
                      {r.clienteCpfCnpj && (
                        <div className="text-[10px] font-mono text-slate-400">{r.clienteCpfCnpj}</div>
                      )}
                    </td>

                    {/* NFs badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {r.itens.map((it, idx) => (
                          <span
                            key={it.id || idx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono font-extrabold rounded-md text-[10px] border border-slate-200"
                            title={`${it.produto} - Qtd: ${it.quantidade}`}
                          >
                            NF {it.nf}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Nº de Itens */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {r.numItensTotal || r.itens.length}
                    </td>

                    {/* Quantidade Total */}
                    <td className="py-3.5 px-4 text-center font-black text-slate-900">
                      {formatNumber(r.quantidadeTotal, 0)}
                    </td>

                    {/* Valor Total */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-900 text-sm">
                      {formatBRL(r.valorTotal)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          r.status === 'Concluído'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Pendente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status === 'Concluído' && <CheckCircle className="w-3 h-3" />}
                        {r.status === 'Pendente' && <Clock className="w-3 h-3" />}
                        {r.status === 'Cancelado' && <AlertTriangle className="w-3 h-3" />}
                        <span>{r.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Visualizar Detalhes */}
                        <button
                          onClick={() => setSelectedRomaneioModal(r)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Visualizar Detalhes do Romaneio"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Imprimir PDF */}
                        <button
                          onClick={() => handlePrintRomaneio(r)}
                          className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Imprimir / Gerar PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        {onEditRomaneio && isAuthorized && (
                          <button
                            onClick={() => onEditRomaneio(r)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Romaneio"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Excluir */}
                        {isAuthorized && (
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Romaneio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary Bar */}
        {filteredRomaneios.length > 0 && (
          <div className="bg-slate-900 text-white p-4 px-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 font-medium">
              Exibindo <strong className="text-white">{filteredRomaneios.length}</strong> de <strong className="text-white">{romaneiosRetirada.length}</strong> romaneios cadastrados
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total de Itens</span>
                <span className="font-extrabold text-white">{totalItensCount} itens</span>
              </div>
              <div className="h-6 w-px bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Qtd Acumulada</span>
                <span className="font-extrabold text-white">{formatNumber(totalQuantidade, 0)}</span>
              </div>
              <div className="h-6 w-px bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Valor Total Acumulado</span>
                <span className="text-base font-black text-amber-400">{formatBRL(totalValor)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Visualizing Romaneio Details */}
      {selectedRomaneioModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase">
                  <FileText className="w-4 h-4" />
                  <span>Romaneio de Retirada • Monte Dourado</span>
                </div>
                <h2 className="font-black text-2xl text-slate-900 flex items-center gap-2 mt-0.5">
                  <span>{selectedRomaneioModal.codigo}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                      selectedRomaneioModal.status === 'Concluído'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedRomaneioModal.status === 'Pendente'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedRomaneioModal.status}
                  </span>
                </h2>
              </div>

              <button
                onClick={() => setSelectedRomaneioModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <span className="font-extrabold text-slate-500 uppercase text-[10px] block border-b border-slate-200 pb-1">
                  Cliente & Identificação
                </span>
                <div><strong>Cliente:</strong> <span className="font-bold text-slate-900">{selectedRomaneioModal.clienteNome}</span></div>
                <div><strong>CPF/CNPJ:</strong> <span className="font-mono">{selectedRomaneioModal.clienteCpfCnpj || '-'}</span></div>
                <div><strong>Data de Emissão:</strong> <span>{formatDateBR(selectedRomaneioModal.dataEmissao)}</span></div>
                <div><strong>Emitido Por:</strong> <span>{selectedRomaneioModal.responsavelEmissao || 'Sistema'}</span></div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <span className="font-extrabold text-slate-500 uppercase text-[10px] block border-b border-slate-200 pb-1">
                  Transporte & Condições do Pedido
                </span>
                <div><strong>Transportadora:</strong> <span className="font-bold text-slate-800">{selectedRomaneioModal.transportadora || 'Retirada na Usina / Não informada'}</span></div>
                <div><strong>Data de Retirada:</strong> <span>{formatDateBR(selectedRomaneioModal.dataRetirada || selectedRomaneioModal.dataEmissao)}</span></div>
                <div><strong>Condição de Pagamento:</strong> <span className="font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">{selectedRomaneioModal.condicaoPagamento || 'À Vista'}</span></div>
              </div>
            </div>

            {/* Table of Items inside Modal */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase">
                Tabela de Itens Retirados
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[10.5px] uppercase">
                      <th className="p-2.5">NF-e</th>
                      <th className="p-2.5">Produto</th>
                      <th className="p-2.5 text-center">Quantidade</th>
                      <th className="p-2.5 text-right">Valor Unit. (R$)</th>
                      <th className="p-2.5 text-right">Valor Total Item (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRomaneioModal.itens.map((item, idx) => {
                      const q = Number(item.quantidade) || 0;
                      const vu = item.valorUnitario !== undefined ? Number(item.valorUnitario) : (q > 0 ? Number(item.valor) / q : Number(item.valor));
                      const totalItem = Math.round(q * vu * 100) / 100 || Number(item.valor) || 0;

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-slate-900">NF {item.nf}</td>
                          <td className="p-2.5 font-medium text-slate-800">{item.produto}</td>
                          <td className="p-2.5 text-center font-bold">{formatNumber(q, 0)}</td>
                          <td className="p-2.5 text-right font-medium text-slate-700">{formatBRL(vu)}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-900">{formatBRL(totalItem)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={2} className="p-3 text-right uppercase">
                        Totais do Romaneio / Pedido:
                      </td>
                      <td className="p-3 text-center text-sm font-black text-slate-900">
                        {formatNumber(selectedRomaneioModal.quantidadeTotal, 0)}
                      </td>
                      <td className="p-3 text-right text-xs font-bold text-slate-700">
                        Preço Médio: {formatBRL(selectedRomaneioModal.quantidadeTotal > 0 ? selectedRomaneioModal.valorTotal / selectedRomaneioModal.quantidadeTotal : 0)}
                      </td>
                      <td className="p-3 text-right text-base font-black text-emerald-900">
                        {formatBRL(selectedRomaneioModal.valorTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Table of Installments (Parcelas do Pedido) */}
            {selectedRomaneioModal.parcelas && selectedRomaneioModal.parcelas.length > 0 && (
              <div className="space-y-2 pt-1">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-800" />
                  <span>Parcelas / Cronograma de Pagamento ({selectedRomaneioModal.parcelas.length})</span>
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold text-[10.5px] uppercase">
                        <th className="p-2.5 text-center w-20">Parcela</th>
                        <th className="p-2.5 text-center w-32">Vencimento</th>
                        <th className="p-2.5 text-right w-36">Valor (R$)</th>
                        <th className="p-2.5">Forma Pagamento</th>
                        <th className="p-2.5 text-center w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRomaneioModal.parcelas.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-bold bg-slate-50">{p.numero}ª Parcela</td>
                          <td className="p-2.5 text-center font-bold text-slate-800">{formatDateBR(p.dataVencimento)}</td>
                          <td className="p-2.5 text-right font-black text-emerald-900">{formatBRL(p.valor)}</td>
                          <td className="p-2.5 font-medium text-slate-700">{p.formaPagamento || 'PIX/Boleto'}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              p.status === 'Pago' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {p.status || 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedRomaneioModal.observacoes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Observações:</strong> {selectedRomaneioModal.observacoes}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedRomaneioModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Fechar
              </button>

              <button
                onClick={() => {
                  handlePrintRomaneio(selectedRomaneioModal);
                  setSelectedRomaneioModal(null);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Gerar PDF A4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
