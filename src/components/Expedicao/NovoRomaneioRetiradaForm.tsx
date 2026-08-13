import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ItemRomaneioRetirada, RomaneioRetirada, ParcelaPagamento } from '../../types';
import { formatBRL, formatNumber } from '../../utils/conversions';
import {
  Plus,
  Trash2,
  FileText,
  Printer,
  CheckCircle2,
  Users,
  Calendar,
  Truck,
  Hash,
  DollarSign,
  Package,
  Search,
  X,
  CreditCard,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';

interface Props {
  onSaved?: () => void;
  editingRomaneio?: RomaneioRetirada | null;
  onCancelEdit?: () => void;
}

// Produtos pré-cadastrados no sistema Monte Dourado
const PRODUTOS_PADRAO = [
  'Castanha do Pará Broken-D CX 20 kg',
  'Castanha do Pará Broken-A CX 20 kg',
  'Castanha-do-Pará Beneficiada Extra Large CX 20 kg',
  'Castanha-do-Pará Beneficiada Large CX 20 kg',
  'Castanha-do-Pará Beneficiada Média CX 20 kg',
  'Castanha-do-Pará Beneficiada Miúda CX 20 kg',
  'Castanha-do-Pará Beneficiada Pedaço CX 20 kg',
  'Castanha-do-Pará Beneficiada Pedacinho CX 20 kg',
  'Castanha em Casca Seca (In Natura) - kg',
  'Castanha em Casca Seca (In Natura) - Hectolitros',
];

// Transportadoras sugestões
const TRANSPORTADORAS_PADRAO = [
  'Transportes Fluviais Jari',
  'Bertolini Transportes LTDA',
  'Navegação Rio Jari S/A',
  'Expresso Amapá Transportes',
  'Transportes Monte Dourado',
  'Retirada pelo Cliente (Frota Própria)'
];

// Opções de Condição de Pagamento do Pedido
const CONDICOES_PAGAMENTO = [
  'À Vista',
  '15 Dias',
  '30 Dias',
  '30/60 Dias (2x)',
  '30/60/90 Dias (3x)',
  '30/60/90/120 Dias (4x)',
  '60 Dias',
  'Parcelado (Personalizado)'
];

const FORMAS_PAGAMENTO = [
  'PIX',
  'Boleto Bancário',
  'Transferência (TED/DOC)',
  'Dinheiro',
  'Cartão de Crédito',
  'Cheque'
];

export const NovoRomaneioRetiradaForm: React.FC<Props> = ({
  onSaved,
  editingRomaneio,
  onCancelEdit
}) => {
  const {
    clientes,
    addRomaneioRetirada,
    updateRomaneioRetirada,
    gerarDocumento,
    addToast,
    activePerfil
  } = useApp();

  const isAuthorized = activePerfil !== 'Consulta' && activePerfil !== 'Quebrador' && activePerfil !== 'Diarista';

  // --- CLIENT SEARCH / AUTOCOMPLETE STATE ---
  const [clienteNome, setClienteNome] = useState(editingRomaneio?.clienteNome || '');
  const [clienteCpfCnpj, setClienteCpfCnpj] = useState(editingRomaneio?.clienteCpfCnpj || '');
  const [clienteTelefone, setClienteTelefone] = useState(editingRomaneio?.clienteTelefone || '');
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  const clienteSearchRef = useRef<HTMLDivElement>(null);

  // --- TRANSPORTADORA SEARCH / AUTOCOMPLETE STATE ---
  const [transportadora, setTransportadora] = useState(editingRomaneio?.transportadora || '');
  const [showTranspSuggestions, setShowTranspSuggestions] = useState(false);
  const transpSearchRef = useRef<HTMLDivElement>(null);

  // --- GENERAL FORM HEADER FIELDS ---
  const [numeroNf, setNumeroNf] = useState(editingRomaneio?.numeroNf || editingRomaneio?.itens?.[0]?.nf || '000123');
  const [dataEmissao, setDataEmissao] = useState(editingRomaneio?.dataEmissao || new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState(editingRomaneio?.observacoes || '');
  const [status, setStatus] = useState<'Concluído' | 'Pendente' | 'Cancelado'>(editingRomaneio?.status || 'Concluído');

  // --- PAYMENT CONDITION & PARCELAS STATE ---
  const [condicaoPagamento, setCondicaoPagamento] = useState(
    editingRomaneio?.condicaoPagamento || 'À Vista'
  );

  // --- ITENS STATE ---
  const [itens, setItens] = useState<ItemRomaneioRetirada[]>(() => {
    if (editingRomaneio && editingRomaneio.itens?.length > 0) {
      return editingRomaneio.itens.map((it) => {
        const q = Number(it.quantidade) || 0;
        const vu =
          it.valorUnitario !== undefined && it.valorUnitario !== null
            ? Number(it.valorUnitario)
            : q > 0
            ? (Number(it.valor) || 0) / q
            : Number(it.valor) || 0;
        const total = Math.round(q * vu * 100) / 100;
        return {
          ...it,
          quantidade: q,
          valorUnitario: vu,
          valor: total
        };
      });
    }
    return [
      {
        id: 'item-' + Date.now() + '-1',
        nf: '000123',
        produto: 'Castanha do Pará Broken-D CX 20 kg',
        quantidade: 10,
        valorUnitario: 800.00,
        valor: 8000.00
      },
      {
        id: 'item-' + Date.now() + '-2',
        nf: '000124',
        produto: 'Castanha do Pará Broken-A CX 20 kg',
        quantidade: 10,
        valorUnitario: 860.00,
        valor: 8600.00
      }
    ];
  });

  // --- CALCULATE TOTALS ---
  const numItensTotal = itens.length;
  const quantidadeTotal = itens.reduce((acc, i) => acc + (Number(i.quantidade) || 0), 0);
  const valorTotal = itens.reduce((acc, i) => {
    const q = Number(i.quantidade) || 0;
    const vu = Number(i.valorUnitario) || 0;
    return acc + Math.round(q * vu * 100) / 100;
  }, 0);

  // --- PARCELAS STATE ---
  const [parcelas, setParcelas] = useState<ParcelaPagamento[]>(() => {
    if (editingRomaneio?.parcelas && editingRomaneio.parcelas.length > 0) {
      return editingRomaneio.parcelas;
    }
    return [
      {
        id: 'parc-' + Date.now() + '-1',
        numero: 1,
        valor: 16600.00,
        dataVencimento: new Date().toISOString().split('T')[0],
        formaPagamento: 'PIX',
        status: 'Pendente'
      }
    ];
  });

  // Helper to generate automatic installments based on condition and total
  const calcularParcelasAutomaticas = (cond: string, total: number, dataBase: string): ParcelaPagamento[] | null => {
    if (cond === 'Parcelado (Personalizado)') return null;

    let numParcelas = 1;
    if (cond === 'À Vista' || cond === '15 Dias' || cond === '30 Dias' || cond === '60 Dias') {
      numParcelas = 1;
    } else if (cond === '30/60 Dias (2x)') {
      numParcelas = 2;
    } else if (cond === '30/60/90 Dias (3x)') {
      numParcelas = 3;
    } else if (cond === '30/60/90/120 Dias (4x)') {
      numParcelas = 4;
    }

    const baseDate = new Date((dataBase || new Date().toISOString().split('T')[0]) + 'T12:00:00');
    const valorUnitario = Math.floor((total / numParcelas) * 100) / 100;
    const sobra = Math.round((total - valorUnitario * numParcelas) * 100) / 100;

    const novasParcelas: ParcelaPagamento[] = [];

    for (let i = 1; i <= numParcelas; i++) {
      const vnc = new Date(baseDate);
      if (cond === 'À Vista') {
        // Vencimento no mesmo dia
      } else if (cond === '15 Dias') {
        vnc.setDate(vnc.getDate() + 15);
      } else if (cond === '30 Dias') {
        vnc.setDate(vnc.getDate() + 30);
      } else if (cond === '60 Dias') {
        vnc.setDate(vnc.getDate() + 60);
      } else {
        // Multi-parcelas (30, 60, 90, 120)
        vnc.setDate(vnc.getDate() + i * 30);
      }

      const val = i === numParcelas ? Math.round((valorUnitario + sobra) * 100) / 100 : valorUnitario;

      novasParcelas.push({
        id: 'parc-' + Date.now() + '-' + i,
        numero: i,
        valor: val,
        dataVencimento: vnc.toISOString().split('T')[0],
        formaPagamento: cond === 'À Vista' ? 'PIX' : 'Boleto Bancário',
        status: 'Pendente'
      });
    }

    return novasParcelas;
  };

  // Recalculate installments in real time when valorTotal or condicaoPagamento or dataEmissao changes
  useEffect(() => {
    if (condicaoPagamento !== 'Parcelado (Personalizado)') {
      const geradas = calcularParcelasAutomaticas(condicaoPagamento, valorTotal, dataEmissao);
      if (geradas) {
        setParcelas(geradas);
      }
    } else {
      // If personalized and only 1 parcela exists, sync its value with total if unchanged
      if (parcelas.length === 1 && parcelas[0].valor !== valorTotal) {
        setParcelas([{ ...parcelas[0], valor: valorTotal }]);
      }
    }
  }, [valorTotal, condicaoPagamento, dataEmissao]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clienteSearchRef.current && !clienteSearchRef.current.contains(event.target as Node)) {
        setShowClienteSuggestions(false);
      }
      if (transpSearchRef.current && !transpSearchRef.current.contains(event.target as Node)) {
        setShowTranspSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter clients based on user input
  const filteredClientes = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(clienteNome.toLowerCase()) ||
      (c.cpfCnpj && c.cpfCnpj.toLowerCase().includes(clienteNome.toLowerCase()))
  );

  // Filter transportadoras based on user input
  const filteredTransportadoras = TRANSPORTADORAS_PADRAO.filter((t) =>
    t.toLowerCase().includes(transportadora.toLowerCase())
  );

  const handleSelectClienteObj = (c: typeof clientes[0]) => {
    setClienteNome(c.nome);
    setClienteCpfCnpj(c.cpfCnpj || '');
    setClienteTelefone(c.telefone || '');
    setShowClienteSuggestions(false);
    addToast(`Cliente "${c.nome}" selecionado!`, 'info');
  };

  const valorTotalParcelas = parcelas.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
  const diferencaValorParcelas = Math.abs(valorTotal - valorTotalParcelas);

  // --- PAYMENT CONDITION BUTTON HANDLER ---
  const handleSelectCondicao = (cond: string) => {
    setCondicaoPagamento(cond);
    if (cond === 'Parcelado (Personalizado)') {
      if (parcelas.length === 0) {
        setParcelas([
          {
            id: 'parc-' + Date.now() + '-1',
            numero: 1,
            valor: valorTotal,
            dataVencimento: dataEmissao,
            formaPagamento: 'Boleto Bancário',
            status: 'Pendente'
          }
        ]);
      }
      addToast('Modo Parcelado (Personalizado) ativado. Você pode incluir ou remover parcelas livremente.', 'info');
    } else {
      const geradas = calcularParcelasAutomaticas(cond, valorTotal, dataEmissao);
      if (geradas) {
        setParcelas(geradas);
        addToast(`Cronograma ajustado automaticamente para "${cond}" (${geradas.length} parcela(s)).`, 'info');
      }
    }
  };

  const handleAddParcelaManual = () => {
    if (condicaoPagamento !== 'Parcelado (Personalizado)') {
      addToast('Selecione "Parcelado (Personalizado)" para adicionar parcelas manualmente.', 'warning');
      return;
    }
    const nextNum = parcelas.length + 1;
    const baseDate = new Date(dataEmissao + 'T12:00:00');
    baseDate.setDate(baseDate.getDate() + nextNum * 30);

    const saldoRemanescente = Math.max(0, Math.round((valorTotal - valorTotalParcelas) * 100) / 100);

    setParcelas([
      ...parcelas,
      {
        id: 'parc-' + Date.now() + '-' + nextNum,
        numero: nextNum,
        valor: saldoRemanescente,
        dataVencimento: baseDate.toISOString().split('T')[0],
        formaPagamento: 'Boleto Bancário',
        status: 'Pendente'
      }
    ]);
  };

  const handleRemoveParcela = (id: string) => {
    if (condicaoPagamento !== 'Parcelado (Personalizado)') {
      addToast('Remoção manual de parcelas é permitida apenas na condição "Parcelado (Personalizado)".', 'warning');
      return;
    }
    if (parcelas.length <= 1) {
      addToast('O pedido deve conter pelo menos 1 parcela de pagamento.', 'warning');
      return;
    }
    const filtered = parcelas.filter((p) => p.id !== id);
    const renumbered = filtered.map((p, idx) => ({ ...p, numero: idx + 1 }));
    setParcelas(renumbered);
  };

  const handleParcelaChange = (id: string, field: keyof ParcelaPagamento, val: any) => {
    setParcelas(
      parcelas.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            [field]: field === 'valor' ? (parseFloat(val) || 0) : val
          };
        }
        return p;
      })
    );
  };

  const handleAjustarDiferencaUltimaParcela = () => {
    if (parcelas.length === 0) return;
    const lastIdx = parcelas.length - 1;
    const sumOthers = parcelas.reduce((acc, p, idx) => (idx === lastIdx ? acc : acc + p.valor), 0);
    const novoValorUltima = Math.max(0, Math.round((valorTotal - sumOthers) * 100) / 100);

    setParcelas(
      parcelas.map((p, idx) => (idx === lastIdx ? { ...p, valor: novoValorUltima } : p))
    );
    addToast('Saldo da última parcela ajustado para bater com o valor total!', 'success');
  };

  // --- ITEM HANDLERS ---
  const handleAddItem = () => {
    const lastItem = itens[itens.length - 1];
    let nextNF = numeroNf || '000125';
    if (lastItem && lastItem.nf) {
      const num = parseInt(lastItem.nf.replace(/\D/g, ''), 10);
      if (!isNaN(num)) {
        nextNF = String(num + 1).padStart(6, '0');
      }
    }

    const newItem: ItemRomaneioRetirada = {
      id: 'item-' + Date.now() + '-' + (itens.length + 1),
      nf: nextNF,
      produto: 'Castanha do Pará Broken-D CX 20 kg',
      quantidade: 10,
      valorUnitario: 800.00,
      valor: 8000.00
    };
    setItens([...itens, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (itens.length <= 1) {
      addToast('O romaneio precisa ter pelo menos 1 item.', 'warning');
      return;
    }
    setItens(itens.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ItemRomaneioRetirada, val: any) => {
    setItens(
      itens.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            [field]: field === 'quantidade' || field === 'valorUnitario' ? (parseFloat(val) || 0) : val
          };
          const q = Number(updated.quantidade) || 0;
          const vu = Number(updated.valorUnitario) || 0;
          updated.valor = Math.round(q * vu * 100) / 100;
          return updated;
        }
        return item;
      })
    );
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = (e: React.FormEvent, printPdfAfter = false) => {
    e.preventDefault();

    if (!isAuthorized) {
      addToast(`Seu perfil atual (${activePerfil}) não tem permissão para cadastrar ou editar romaneios.`, 'error');
      return;
    }

    if (!clienteNome.trim()) {
      addToast('Por favor, informe ou selecione o Cliente / Destinatário.', 'error');
      return;
    }

    if (itens.length === 0) {
      addToast('Adicione pelo menos um item ao romaneio.', 'error');
      return;
    }

    // Validate items
    for (let idx = 0; idx < itens.length; idx++) {
      const it = itens[idx];
      if (!it.nf.trim()) {
        addToast(`Informe o número da NF no item ${idx + 1}.`, 'error');
        return;
      }
      if (!it.produto.trim()) {
        addToast(`Selecione ou informe o produto no item ${idx + 1}.`, 'error');
        return;
      }
      if (!it.quantidade || it.quantidade <= 0) {
        addToast(`A quantidade no item ${idx + 1} deve ser maior que zero.`, 'error');
        return;
      }
      if (!it.valorUnitario || it.valorUnitario <= 0) {
        addToast(`Informe o valor unitário no item ${idx + 1}.`, 'error');
        return;
      }
    }

    // Validate parcelas
    if (parcelas.length === 0) {
      addToast('Defina pelo menos 1 parcela de pagamento no cronograma.', 'error');
      return;
    }

    for (let pIdx = 0; pIdx < parcelas.length; pIdx++) {
      const p = parcelas[pIdx];
      if (!p.valor || p.valor <= 0) {
        addToast(`Informe o valor correto para a parcela ${p.numero}.`, 'error');
        return;
      }
      if (!p.dataVencimento) {
        addToast(`Informe a data de vencimento da parcela ${p.numero}.`, 'error');
        return;
      }
      if (!p.formaPagamento) {
        addToast(`Selecione a forma de pagamento da parcela ${p.numero}.`, 'error');
        return;
      }
    }

    if (diferencaValorParcelas >= 0.02) {
      addToast(
        `A soma das parcelas (${formatBRL(valorTotalParcelas)}) deve corresponder exatamente ao total do pedido (${formatBRL(
          valorTotal
        )}). Clique em "Ajustar Diferença".`,
        'error'
      );
      return;
    }

    let resultRomaneio: RomaneioRetirada;

    const payloadData = {
      numeroNf: numeroNf.trim() || itens[0]?.nf || '000123',
      clienteNome: clienteNome.trim(),
      clienteCpfCnpj: clienteCpfCnpj.trim(),
      clienteTelefone: clienteTelefone.trim(),
      dataEmissao,
      dataRetirada: dataEmissao,
      transportadora: transportadora.trim(),
      condicaoPagamento,
      parcelas,
      observacoes: observacoes.trim(),
      status,
      itens,
      numItensTotal,
      quantidadeTotal,
      valorTotal
    };

    if (editingRomaneio) {
      updateRomaneioRetirada(editingRomaneio.id, payloadData);
      resultRomaneio = {
        ...editingRomaneio,
        ...payloadData
      };
    } else {
      resultRomaneio = addRomaneioRetirada(payloadData);
    }

    addToast(
      editingRomaneio
        ? `Romaneio ${resultRomaneio.codigo} atualizado com sucesso!`
        : `Romaneio ${resultRomaneio.codigo} criado com sucesso! Total: ${formatBRL(valorTotal)}`,
      'success'
    );

    if (printPdfAfter) {
      gerarDocumento('Romaneio de Retirada', resultRomaneio.id, resultRomaneio.clienteNome, {
        romaneio: resultRomaneio,
        itens: resultRomaneio.itens,
        clienteNome: resultRomaneio.clienteNome,
        clienteCpfCnpj: resultRomaneio.clienteCpfCnpj,
        transportadora: resultRomaneio.transportadora,
        condicaoPagamento: resultRomaneio.condicaoPagamento,
        parcelas: resultRomaneio.parcelas,
        quantidadeTotal: resultRomaneio.quantidadeTotal,
        valorTotal: resultRomaneio.valorTotal,
        numItensTotal: resultRomaneio.numItensTotal
      });
    }

    if (!editingRomaneio) {
      // Reset form
      setClienteNome('');
      setClienteCpfCnpj('');
      setClienteTelefone('');
      setTransportadora('');
      setObservacoes('');
      setNumeroNf('000125');
      setCondicaoPagamento('À Vista');
      setItens([
        {
          id: 'item-' + Date.now() + '-1',
          nf: '000125',
          produto: 'Castanha do Pará Broken-D CX 20 kg',
          quantidade: 10,
          valorUnitario: 800.00,
          valor: 8000.00
        }
      ]);
      setParcelas([
        {
          id: 'parc-' + Date.now() + '-1',
          numero: 1,
          valor: 8000.00,
          dataVencimento: new Date().toISOString().split('T')[0],
          formaPagamento: 'PIX',
          status: 'Pendente'
        }
      ]);
    }

    if (onSaved) onSaved();
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Módulo Expedição — Usina Monte Dourado</span>
          </div>
          <h2 className="font-black text-xl text-slate-900 flex items-center gap-2">
            <span>{editingRomaneio ? `Editar Romaneio (${editingRomaneio.codigo})` : 'Novo Romaneio / Pedido de Venda'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lançamento automatizado com cálculo em tempo real de quantidade × valor unitário, NFs e cronograma financeiro.
          </p>
        </div>

        {editingRomaneio && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer transition-all border border-slate-200"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* SECTION 1: HEADER & IDENTIFICATION */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Users className="w-4 h-4 text-emerald-800" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              1. Identificação do Cliente, NF-e & Transportadora
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* CLIENT SEARCH COMBOBOX */}
            <div className="sm:col-span-2 relative" ref={clienteSearchRef}>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Cliente / Destinatário *
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquise o nome ou CPF/CNPJ do cliente cadastrado..."
                  value={clienteNome}
                  onChange={(e) => {
                    setClienteNome(e.target.value);
                    setShowClienteSuggestions(true);
                  }}
                  onFocus={() => setShowClienteSuggestions(true)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

                {clienteNome && (
                  <button
                    type="button"
                    onClick={() => {
                      setClienteNome('');
                      setClienteCpfCnpj('');
                      setClienteTelefone('');
                    }}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showClienteSuggestions && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                  <div className="p-2 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Clientes Cadastrados ({filteredClientes.length})
                  </div>
                  {filteredClientes.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 italic">
                      Nenhum cliente encontrado. Digite o nome acima para cadastrar personalizado.
                    </div>
                  ) : (
                    filteredClientes.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClienteObj(c)}
                        className="w-full text-left p-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-extrabold text-slate-900">{c.nome}</div>
                          <div className="text-[10.5px] text-slate-500 font-mono">
                            {c.cpfCnpj ? `CNPJ/CPF: ${c.cpfCnpj}` : 'Sem documento cadastrado'}
                          </div>
                        </div>
                        <Check className={`w-4 h-4 text-emerald-700 ${clienteNome === c.nome ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* CPF / CNPJ */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                CPF / CNPJ
              </label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={clienteCpfCnpj}
                onChange={(e) => setClienteCpfCnpj(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            {/* Data de Emissão */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Data de Emissão *</span>
              </label>
              <input
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            {/* NUMERO DA NOTA FISCAL (NF-e GERAL) */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-amber-600" />
                <span>Nº da Nota Fiscal (NF-e Geral) *</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 000123"
                value={numeroNf}
                onChange={(e) => {
                  const val = e.target.value;
                  setNumeroNf(val);
                  // Sync with items if user edits header NF
                  if (val.trim()) {
                    setItens(itens.map((it) => ({ ...it, nf: val })));
                  }
                }}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-xs font-mono font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>

            {/* TRANSPORTADORA SEARCH COMBOBOX */}
            <div className="relative" ref={transpSearchRef}>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-600" />
                <span>Transportadora</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquise ou digite a transportadora..."
                  value={transportadora}
                  onChange={(e) => {
                    setTransportadora(e.target.value);
                    setShowTranspSuggestions(true);
                  }}
                  onFocus={() => setShowTranspSuggestions(true)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

                {transportadora && (
                  <button
                    type="button"
                    onClick={() => setTransportadora('')}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showTranspSuggestions && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                  <div className="p-2 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Transportadoras Frequentes
                  </div>
                  {filteredTransportadoras.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTransportadora(t);
                        setShowTranspSuggestions(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-emerald-50 transition-colors text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span>{t}</span>
                      <Check className={`w-3.5 h-3.5 text-emerald-700 ${transportadora === t ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Status do Romaneio
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="Concluído">Concluído (Liberado)</option>
                <option value="Pendente">Pendente (Aguardando liberação)</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: ITENS DO ROMANEIO (COM CÁLCULO QTD × VALOR UNITÁRIO) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                2. Itens do Pedido (Quantidade × Valor Unitário = Valor Total Item)
              </h3>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all border border-emerald-700 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Adicionar Produto</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-28">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-amber-400" />
                      Nº NF-e *
                    </span>
                  </th>
                  <th className="py-3 px-3 min-w-[240px]">Produto / Especificação *</th>
                  <th className="py-3 px-3 w-28 text-center">Quantidade *</th>
                  <th className="py-3 px-3 w-36 text-right">Valor Unitário (R$) *</th>
                  <th className="py-3 px-3 w-40 text-right bg-slate-800 text-emerald-400">
                    <span className="flex items-center justify-end gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Valor Total Item (R$)
                    </span>
                  </th>
                  <th className="py-3 px-3 w-12 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {itens.map((item, index) => {
                  const valorTotalCalculadoItem = (Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* NF Field */}
                      <td className="p-2.5">
                        <input
                          type="text"
                          placeholder="000123"
                          value={item.nf}
                          onChange={(e) => handleItemChange(item.id, 'nf', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Produto Field */}
                      <td className="p-2.5">
                        <div className="space-y-1">
                          <select
                            value={PRODUTOS_PADRAO.includes(item.produto) ? item.produto : 'OUTRO'}
                            onChange={(e) => {
                              if (e.target.value !== 'OUTRO') {
                                handleItemChange(item.id, 'produto', e.target.value);
                              } else {
                                handleItemChange(item.id, 'produto', 'Novo Produto Personalizado');
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {PRODUTOS_PADRAO.map((prod) => (
                              <option key={prod} value={prod}>
                                {prod}
                              </option>
                            ))}
                            <option value="OUTRO">-- Outro Produto (digitar abaixo) --</option>
                          </select>

                          {(!PRODUTOS_PADRAO.includes(item.produto) || item.produto === 'Novo Produto Personalizado') && (
                            <input
                              type="text"
                              placeholder="Informe a descrição completa do produto..."
                              value={item.produto}
                              onChange={(e) => handleItemChange(item.id, 'produto', e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          )}
                        </div>
                      </td>

                      {/* Quantidade Field */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          placeholder="10"
                          value={item.quantidade || ''}
                          onChange={(e) => handleItemChange(item.id, 'quantidade', e.target.value)}
                          className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Valor Unitário Field */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="800,00"
                          value={item.valorUnitario || ''}
                          onChange={(e) => handleItemChange(item.id, 'valorUnitario', e.target.value)}
                          className="w-full text-right bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Valor Total Item Field (Somente Leitura / Calculado Automático) */}
                      <td className="p-2.5 text-right font-black text-emerald-900 bg-emerald-50/50">
                        <div className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs text-right font-black text-emerald-900">
                          {formatBRL(valorTotalCalculadoItem)}
                        </div>
                      </td>

                      {/* Remove Action */}
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: CONDIÇÃO DE PAGAMENTO E PARCELAS DO PEDIDO */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                3. Condição de Pagamento e Parcelas do Pedido
              </h3>
            </div>

            <div className="text-xs text-slate-600">
              Valor Total do Pedido: <strong className="text-emerald-900 text-base font-black ml-1">{formatBRL(valorTotal)}</strong>
            </div>
          </div>

          {/* Preset Buttons for Payment Condition */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700">
              Selecione a Condição de Pagamento do Pedido:
            </label>

            <div className="flex flex-wrap gap-2">
              {CONDICOES_PAGAMENTO.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => handleSelectCondicao(cond)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    condicaoPagamento === cond
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-600/30'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Installment Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>
                  CRONOGRAMA DE PAGAMENTO ({parcelas.length} {parcelas.length === 1 ? 'PARCELA' : 'PARCELAS'})
                </span>
              </span>

              {condicaoPagamento === 'Parcelado (Personalizado)' && (
                <button
                  type="button"
                  onClick={handleAddParcelaManual}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Adicionar Parcela</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white font-extrabold text-[10.5px] uppercase">
                    <th className="p-2.5 w-24 text-center">Parcela</th>
                    <th className="p-2.5 w-36 text-center">Data Vencimento *</th>
                    <th className="p-2.5 w-40 text-right">Valor (R$) *</th>
                    <th className="p-2.5 min-w-[160px]">Forma de Pagamento</th>
                    <th className="p-2.5 w-32 text-center">Status</th>
                    <th className="p-2.5 w-12 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parcelas.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-black text-slate-900 bg-slate-50">
                        {p.numero}ª Parcela
                      </td>

                      <td className="p-2.5 text-center">
                        <input
                          type="date"
                          value={p.dataVencimento}
                          onChange={(e) => handleParcelaChange(p.id, 'dataVencimento', e.target.value)}
                          className="w-full text-center bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={p.valor || ''}
                          disabled={condicaoPagamento !== 'Parcelado (Personalizado)' && parcelas.length === 1}
                          onChange={(e) => handleParcelaChange(p.id, 'valor', e.target.value)}
                          className="w-full text-right bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-black text-emerald-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-80"
                        />
                      </td>

                      <td className="p-2.5">
                        <select
                          value={p.formaPagamento || 'PIX'}
                          onChange={(e) => handleParcelaChange(p.id, 'formaPagamento', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {FORMAS_PAGAMENTO.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-2.5 text-center">
                        <select
                          value={p.status || 'Pendente'}
                          onChange={(e) => handleParcelaChange(p.id, 'status', e.target.value)}
                          className={`w-full text-center border rounded-lg px-2 py-1 text-xs font-black focus:outline-none ${
                            p.status === 'Pago'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Pago">Pago</option>
                        </select>
                      </td>

                      <td className="p-2.5 text-center">
                        {condicaoPagamento === 'Parcelado (Personalizado)' ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveParcela(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Remover Parcela"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[10px]" title="Condição automática">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Validation Banner for Installments Sum */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border text-xs bg-white">
              <div className="flex items-center gap-2">
                {diferencaValorParcelas < 0.02 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  Soma das Parcelas: <strong className="font-bold text-slate-900">{formatBRL(valorTotalParcelas)}</strong> de{' '}
                  <strong className="font-bold text-slate-900">{formatBRL(valorTotal)}</strong>
                </span>
              </div>

              {diferencaValorParcelas >= 0.02 && (
                <button
                  type="button"
                  onClick={handleAjustarDiferencaUltimaParcela}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-all border border-amber-400"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ajustar Diferença ({formatBRL(valorTotal - valorTotalParcelas)}) na Última Parcela</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Summary Box */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
              Resumo do Romaneio / Pedido de Venda
            </span>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-slate-300">
                Nº de itens: <strong className="text-white text-sm">{numItensTotal} itens</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">
                Quantidade total: <strong className="text-white text-sm">{formatNumber(quantidadeTotal, 0)}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">
                Condição: <strong className="text-amber-300 font-bold">{condicaoPagamento}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/90 px-5 py-3 rounded-xl border border-slate-700 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                Valor Total do Pedido (R$)
              </span>
              <span className="text-2xl font-black text-amber-400 block">
                {formatBRL(valorTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Observações adicionais */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1">
            Observações Gerais do Romaneio
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Carga conferida no pátio e liberada para saída na transportadora..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all border border-amber-400"
          >
            <Printer className="w-4 h-4" />
            <span>Salvar e Imprimir / Gerar PDF</span>
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all border border-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{editingRomaneio ? 'Salvar Alterações' : 'Salvar Romaneio / Pedido de Venda'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
