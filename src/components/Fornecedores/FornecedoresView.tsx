import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Fornecedor, TipoFornecedor } from '../../types';
import { formatBRL, formatNumber } from '../../utils/conversions';
import {
  Users,
  Plus,
  Search,
  Building,
  Phone,
  MapPin,
  CreditCard,
  History,
  FileText,
  DollarSign,
  Printer,
  X
} from 'lucide-react';

export const FornecedoresView: React.FC = () => {
  const {
    fornecedores,
    addFornecedor,
    recebimentos,
    gerarDocumento
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(
    fornecedores[0] || null
  );

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    razaoSocial: '',
    cpfCnpj: '',
    tipo: 'Extrativista' as TipoFornecedor,
    telefone: '',
    endereco: '',
    municipio: 'Almeirim',
    estado: 'PA',
    comunidade: 'Arumanduba',
    colocacao: '',
    propriedade: '',
    localOrigemCastanha: 'Reserva Extrativista do Jari',
    banco: 'Banpará',
    agencia: '',
    conta: '',
    chavePix: '',
    observacoes: '',
  });

  const filteredFornecedores = fornecedores.filter(
    (f) =>
      f.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cpfCnpj.includes(searchTerm) ||
      f.comunidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeCompleto || !formData.cpfCnpj) {
      alert('Nome Completo e CPF/CNPJ são obrigatórios.');
      return;
    }

    const created = addFornecedor({
      nomeCompleto: formData.nomeCompleto,
      razaoSocial: formData.razaoSocial,
      cpfCnpj: formData.cpfCnpj,
      tipo: formData.tipo,
      telefone: formData.telefone,
      endereco: formData.endereco,
      municipio: formData.municipio,
      estado: formData.estado,
      comunidade: formData.comunidade,
      colocacao: formData.colocacao,
      propriedade: formData.propriedade,
      localOrigemCastanha: formData.localOrigemCastanha,
      dadosBancarios: {
        banco: formData.banco,
        agencia: formData.agencia,
        conta: formData.conta,
        tipoConta: 'Corrente',
      },
      chavePix: formData.chavePix,
      observacoes: formData.observacoes,
    });

    setSelectedFornecedor(created);
    setIsNewModalOpen(false);
    setFormData({
      nomeCompleto: '',
      razaoSocial: '',
      cpfCnpj: '',
      tipo: 'Extrativista',
      telefone: '',
      endereco: '',
      municipio: 'Almeirim',
      estado: 'PA',
      comunidade: 'Arumanduba',
      colocacao: '',
      propriedade: '',
      localOrigemCastanha: 'Reserva Extrativista do Jari',
      banco: 'Banpará',
      agencia: '',
      conta: '',
      chavePix: '',
      observacoes: '',
    });
  };

  // Supplier History Calculations
  const fornRecs = selectedFornecedor
    ? recebimentos.filter((r) => r.fornecedorId === selectedFornecedor.id && !r.cancelado)
    : [];

  const totalHlEntregue = fornRecs.reduce((acc, r) => acc + r.quantidadeLiquidaHl, 0);
  const totalLatasEntregue = totalHlEntregue * 5;

  const totalNegociado = fornRecs.reduce((acc, r) => acc + r.compra.valorBruto, 0);
  const totalDescontos = fornRecs.reduce((acc, r) => acc + r.compra.descontosFinanceiros, 0);
  const totalLiquido = fornRecs.reduce((acc, r) => acc + r.compra.valorLiquido, 0);

  const totalPago = fornRecs.reduce((acc, r) => {
    const pags = r.compra.pagamentosEfetuados || [];
    return acc + pags.reduce((sum, p) => sum + p.valor, 0);
  }, 0);

  const saldoPendente = Math.max(0, totalLiquido - totalPago);

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Cadastro e Extrato de Fornecedores</h2>
            <p className="text-xs text-slate-500">Extrativistas, Cooperativas, Produtores e Associações do Rio Jari</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          NOVO FORNECEDOR
        </button>
      </div>

      {/* Main Grid: List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Fornecedores List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou comunidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredFornecedores.map((f) => {
              const isSelected = selectedFornecedor?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFornecedor(f)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFornecedor(f);
                      }}
                      className="font-black text-slate-900 hover:text-emerald-700 hover:underline text-xs text-left cursor-pointer"
                    >
                      {f.nomeCompleto}
                    </button>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {f.tipo}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Comunidade: {f.comunidade} ({f.municipio})
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    CPF/CNPJ: {f.cpfCnpj}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Complete Supplier Detail & History */}
        <div className="lg:col-span-2 space-y-6">
          {selectedFornecedor ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              {/* Supplier Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                    Código: {selectedFornecedor.codigo} • {selectedFornecedor.tipo}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedFornecedor.nomeCompleto}</h3>
                  {selectedFornecedor.razaoSocial && (
                    <p className="text-xs text-slate-500">{selectedFornecedor.razaoSocial}</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    gerarDocumento('Extrato de Fornecedor', selectedFornecedor.id, selectedFornecedor.nomeCompleto, {
                      fornecedor: selectedFornecedor,
                      recebimentos: fornRecs,
                      totais: {
                        totalHlEntregue,
                        totalLatasEntregue,
                        totalLiquido,
                        totalPago,
                        saldoPendente,
                      },
                    });
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  Imprimir Extrato A4
                </button>
              </div>

              {/* Data Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Localização & Origem
                  </div>
                  <div>Comunidade: <strong>{selectedFornecedor.comunidade}</strong></div>
                  <div>Município: {selectedFornecedor.municipio} - {selectedFornecedor.estado}</div>
                  <div>Origem da Castanha: {selectedFornecedor.localOrigemCastanha}</div>
                  {selectedFornecedor.colocacao && <div>Colocação: {selectedFornecedor.colocacao}</div>}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-700 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Dados Bancários e PIX
                  </div>
                  <div>Banco: {selectedFornecedor.dadosBancarios?.banco || 'Não informado'}</div>
                  <div>Ag/Conta: {selectedFornecedor.dadosBancarios?.agencia || '-'} / {selectedFornecedor.dadosBancarios?.conta || '-'}</div>
                  <div>Chave PIX: <strong className="text-emerald-800">{selectedFornecedor.chavePix || '-'}</strong></div>
                  <div>Telefone: {selectedFornecedor.telefone || '-'}</div>
                </div>
              </div>

              {/* Financial History Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-800 font-semibold">Total Entregue:</span>
                  <div className="text-lg font-black text-emerald-950 mt-1">
                    {formatNumber(totalHlEntregue, 1)} hl
                  </div>
                  <div className="text-[10px] text-emerald-700">{totalLatasEntregue} latas</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600 font-semibold">Valor Negociado:</span>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {formatBRL(totalLiquido)}
                  </div>
                  <div className="text-[10px] text-slate-500">Líquido de compras</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600 font-semibold">Total Pago:</span>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {formatBRL(totalPago)}
                  </div>
                  <div className="text-[10px] text-slate-500">Comprovantes emitidos</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-800 font-semibold">Saldo Pendente:</span>
                  <div className="text-lg font-black text-amber-950 mt-1">
                    {formatBRL(saldoPendente)}
                  </div>
                  <div className="text-[10px] text-amber-800">A pagar na fábrica</div>
                </div>
              </div>

              {/* Complete Receipts Feed */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Histórico de Entregas e Recebimentos</h4>
                <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden text-xs">
                  {fornRecs.length === 0 ? (
                    <div className="p-4 text-slate-500 text-center">Nenhum recebimento registrado para este fornecedor.</div>
                  ) : (
                    fornRecs.map((rec) => (
                      <div key={rec.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-900">{rec.codigo}</span> ({rec.data})
                          <div className="text-[11px] text-slate-500">
                            {rec.quantidadeLiquidaHl} hl ({rec.quantidadeLiquidaLatas} latas) • {formatBRL(rec.compra.valorLiquido)}
                          </div>
                        </div>
                        <span className="bg-slate-100 font-semibold text-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {rec.compra.situacao}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Selecione um fornecedor para visualizar o cadastro completo e extrato financeiro.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Novo Fornecedor */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">Novo Fornecedor de Matéria-Prima</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomeCompleto}
                    onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF / CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Fornecedor</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Extrativista">Extrativista</option>
                    <option value="Produtor">Produtor</option>
                    <option value="Cooperativa">Cooperativa</option>
                    <option value="Associação">Associação</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Empresa">Empresa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Comunidade</label>
                  <input
                    type="text"
                    value={formData.comunidade}
                    onChange={(e) => setFormData({ ...formData, comunidade: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Município / Estado</label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Chave PIX</label>
                  <input
                    type="text"
                    value={formData.chavePix}
                    onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
                >
                  Cadastrar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
