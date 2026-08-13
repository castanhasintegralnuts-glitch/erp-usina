import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TipoCastanhaExpedicao, Cliente, TipoCastanhaBeneficiadaSubtipo, RomaneioRetirada } from '../../types';
import { formatBRL, formatNumber } from '../../utils/conversions';
import { NovoRomaneioRetiradaForm } from './NovoRomaneioRetiradaForm';
import { ListarRomaneiosRetirada } from './ListarRomaneiosRetirada';
import { RelatoriosExpedicao } from './RelatoriosExpedicao';
import {
  Send,
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  BarChart3,
  PackageCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  DollarSign,
  Receipt,
  UserPlus,
  UserCheck,
  Check,
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Trash2,
  Edit,
  ChevronRight,
  ListFilter,
  PieChart
} from 'lucide-react';

export const ExpedicaoView: React.FC = () => {
  const {
    lotes,
    expedicoes,
    clientes,
    romaneiosRetirada,
    estoqueBeneficiada,
    addExpedicao,
    addCliente,
    updateCliente,
    deleteCliente,
    addToast,
    gerarDocumento,
    setDocPreview
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'novo_romaneio' | 'romaneios' | 'relatorios' | 'nova' | 'andamento' | 'clientes'
  >('novo_romaneio');

  const [editingRomaneio, setEditingRomaneio] = useState<RomaneioRetirada | null>(null);

  // Subtipo Beneficiada Selection State (Extra Large, Large, Média, Miúda, Pedaço, Pedacinho)
  const [subtipoBeneficiada, setSubtipoBeneficiada] = useState<TipoCastanhaBeneficiadaSubtipo>('Large');
  const [precoModo, setPrecoModo] = useState<'por_kg' | 'por_caixa'>('por_kg');
  const [valorPorCaixa, setValorPorCaixa] = useState<string>('850.00');

  // New Expedition Form State
  const [formExpedicao, setFormExpedicao] = useState({
    cliente: '',
    cpfCnpj: '',
    endereco: '',
    tipoCastanha: 'Castanha Beneficiada' as TipoCastanhaExpedicao,
    produto: 'Amêndoa Beneficiada Large',
    classificacao: 'Large',
    loteId: lotes[0]?.id || '',
    quantidadeUnidades: '50',
    pesoTotalKg: '1000',
    caixas: '50',
    precoUnitarioKg: '42.50',
    condicaoPagamento: '30 dias',
    dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    motorista: 'Manoel do Batelão / Transportes Jari',
    veiculo: 'Caminhão Muck / Balsa Hidroviária',
    transportadora: 'Navegação Rio Jari S/A',
    dataExpedicao: new Date().toISOString().split('T')[0],
    observações: 'Carga lacrada com selo de garantia de Monte Dourado',
  });

  // Selected Client State
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);

  // Client Modal & Search State
  const [isModalNovoClienteOpen, setIsModalNovoClienteOpen] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');

  const [formNovoCliente, setFormNovoCliente] = useState({
    nome: '',
    cpfCnpj: '',
    endereco: '',
    cidade: '',
    telefone: '',
    email: '',
    inscricaoEstadual: '',
    observacoes: '',
  });

  const subtiposDisponiveis: { tipo: TipoCastanhaBeneficiadaSubtipo; desc: string; icon: string }[] = [
    { tipo: 'Extra Large', desc: 'Amêndoa Inteira Extra Large', icon: '👑' },
    { tipo: 'Large', desc: 'Amêndoa Inteira Large', icon: '✨' },
    { tipo: 'Média', desc: 'Amêndoa Inteira Média', icon: '⭐' },
    { tipo: 'Miúda', desc: 'Amêndoa Inteira Miúda', icon: '🔹' },
    { tipo: 'Pedaço', desc: 'Amêndoa Pedaços Grandes', icon: '🧩' },
    { tipo: 'Pedacinho', desc: 'Amêndoa Pedacinhos', icon: '░' },
  ];

  // Helper when user selects a subtipo button with 1-click
  const handleSelectSubtipo = (sub: TipoCastanhaBeneficiadaSubtipo) => {
    setSubtipoBeneficiada(sub);
    const itemEstoque = estoqueBeneficiada.find((e) => e.tipo === sub);
    const precoSugestao = itemEstoque ? itemEstoque.ultimoPrecoVenda : 42.50;
    const precoCaixas = (precoSugestao * 20).toFixed(2);

    setFormExpedicao((prev) => ({
      ...prev,
      produto: `Amêndoa Beneficiada ${sub}`,
      classificacao: sub,
      precoUnitarioKg: precoSugestao.toFixed(2),
    }));
    setValorPorCaixa(precoCaixas);
    addToast(`Castanha Beneficiada "${sub}" selecionada com 1-click! Preço sugerido: R$ ${formatBRL(precoSugestao)}/kg`, 'info');
  };

  // Caixas change handler
  const handleCaixasChange = (caixasVal: string) => {
    const cx = parseInt(caixasVal) || 0;
    const kg = cx * 20;
    setFormExpedicao((prev) => ({
      ...prev,
      caixas: caixasVal,
      pesoTotalKg: kg.toString(),
      quantidadeUnidades: caixasVal,
    }));
  };

  // Peso Kg change handler
  const handlePesoKgChange = (pesoVal: string) => {
    const kg = parseFloat(pesoVal) || 0;
    const cx = Math.round(kg / 20);
    setFormExpedicao((prev) => ({
      ...prev,
      pesoTotalKg: pesoVal,
      caixas: cx.toString(),
      quantidadeUnidades: cx.toString(),
    }));
  };

  // Preço por Kg change handler
  const handlePrecoKgChange = (val: string) => {
    const pKg = parseFloat(val) || 0;
    const pCx = (pKg * 20).toFixed(2);
    setFormExpedicao((prev) => ({
      ...prev,
      precoUnitarioKg: val,
    }));
    setValorPorCaixa(pCx);
  };

  // Preço por Caixa change handler
  const handlePrecoCaixaChange = (val: string) => {
    setValorPorCaixa(val);
    const pCx = parseFloat(val) || 0;
    const pKg = (pCx / 20).toFixed(2);
    setFormExpedicao((prev) => ({
      ...prev,
      precoUnitarioKg: pKg,
    }));
  };

  // Handle Quick Client Selection with 1-Click
  const handleSelectCliente = (cli: Cliente) => {
    setSelectedClienteId(cli.id);
    setFormExpedicao((prev) => ({
      ...prev,
      cliente: cli.nome,
      cpfCnpj: cli.cpfCnpj,
      endereco: `${cli.endereco}${cli.cidade ? ' - ' + cli.cidade : ''}`,
    }));
    addToast(`Cliente "${cli.nome}" selecionado com sucesso!`, 'info');
  };

  const handleClearSelectedCliente = () => {
    setSelectedClienteId(null);
    setFormExpedicao((prev) => ({
      ...prev,
      cliente: '',
      cpfCnpj: '',
      endereco: '',
    }));
  };

  // Handle Register New Client Submit
  const handleCadastrarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNovoCliente.nome.trim() || !formNovoCliente.cpfCnpj.trim()) {
      addToast('Informe o Nome/Razão Social e CPF/CNPJ do cliente.', 'error');
      return;
    }

    const novo = addCliente({
      nome: formNovoCliente.nome.trim(),
      cpfCnpj: formNovoCliente.cpfCnpj.trim(),
      endereco: formNovoCliente.endereco.trim() || 'Monte Dourado/PA',
      cidade: formNovoCliente.cidade.trim() || 'Belém/PA',
      telefone: formNovoCliente.telefone.trim(),
      email: formNovoCliente.email.trim(),
      inscricaoEstadual: formNovoCliente.inscricaoEstadual.trim(),
      observacoes: formNovoCliente.observacoes.trim(),
      comprasCount: 0,
      totalKgComprado: 0,
    });

    handleSelectCliente(novo);
    setIsModalNovoClienteOpen(false);
    setFormNovoCliente({
      nome: '',
      cpfCnpj: '',
      endereco: '',
      cidade: '',
      telefone: '',
      email: '',
      inscricaoEstadual: '',
      observacoes: '',
    });
  };

  // Handle Tipo Castanha change
  const handleTipoCastanhaChange = (novoTipo: TipoCastanhaExpedicao) => {
    if (novoTipo === 'Castanha Beneficiada') {
      const itemEstoque = estoqueBeneficiada.find((e) => e.tipo === subtipoBeneficiada);
      const precoSugestao = itemEstoque ? itemEstoque.ultimoPrecoVenda : 42.50;
      setFormExpedicao((prev) => ({
        ...prev,
        tipoCastanha: novoTipo,
        produto: `Amêndoa Beneficiada ${subtipoBeneficiada}`,
        classificacao: subtipoBeneficiada,
        precoUnitarioKg: precoSugestao.toFixed(2),
      }));
      setValorPorCaixa((precoSugestao * 20).toFixed(2));
    } else {
      setFormExpedicao((prev) => ({
        ...prev,
        tipoCastanha: novoTipo,
        produto: 'Castanha em Casca Seca (In Natura)',
        classificacao: 'Lote Padronizado Seco (11% Umidade)',
        precoUnitarioKg: '10.50',
      }));
    }
  };

  const peso = parseFloat(formExpedicao.pesoTotalKg) || 0;
  const preco = parseFloat(formExpedicao.precoUnitarioKg) || 0;
  const valorTotalCalculado = peso * preco;

  // Submit Handler
  const handleCreateExpedicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExpedicao.cliente || !formExpedicao.cpfCnpj) {
      addToast('Informe o Nome do Cliente e CPF/CNPJ.', 'error');
      return;
    }

    const loteTarget = lotes.find((l) => l.id === formExpedicao.loteId) || lotes[0];

    const result = addExpedicao({
      cliente: formExpedicao.cliente,
      cpfCnpj: formExpedicao.cpfCnpj,
      endereco: formExpedicao.endereco,
      tipoCastanha: formExpedicao.tipoCastanha,
      subtipoBeneficiada: formExpedicao.tipoCastanha === 'Castanha Beneficiada' ? subtipoBeneficiada : undefined,
      produto: formExpedicao.produto,
      classificacao: formExpedicao.classificacao,
      loteCodigo: loteTarget?.codigo || 'MD-LOT-2026-0001',
      loteId: loteTarget?.id,
      quantidade: parseInt(formExpedicao.caixas) || 0,
      pesoKg: peso,
      caixas: parseInt(formExpedicao.caixas) || 0,
      precoUnitarioKg: preco,
      valorPorCaixa: parseFloat(valorPorCaixa) || preco * 20,
      valorTotal: valorTotalCalculado,
      condicaoPagamento: formExpedicao.condicaoPagamento,
      dataVencimento: formExpedicao.dataVencimento,
      motorista: formExpedicao.motorista,
      veiculo: formExpedicao.veiculo,
      transportadora: formExpedicao.transportadora,
      data: formExpedicao.dataExpedicao,
      status: 'Em andamento',
      observacoes: formExpedicao.observações,
    });

    // Generate Romaneio de Saída document automatically
    gerarDocumento('Romaneio de Saída', result.expedicao.codigo, formExpedicao.cliente);

    setFormExpedicao({
      ...formExpedicao,
      cliente: '',
      cpfCnpj: '',
      endereco: '',
    });
    setSelectedClienteId(null);
  };

  // KPIs
  const expedidoDia = expedicoes.filter((e) => e.data === new Date().toISOString().split('T')[0]).reduce((acc, e) => acc + e.pesoKg, 0);
  const expedidoMes = expedicoes.reduce((acc, e) => acc + e.pesoKg, 0);
  const pendentes = expedicoes.filter((e) => e.status === 'Em andamento' || e.status === 'Pendente').length;

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
      c.cpfCnpj.includes(searchCliente) ||
      (c.cidade && c.cidade.toLowerCase().includes(searchCliente.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Send className="w-4 h-4" />
            <span>Usina Monte Dourado — Expedição & Logística</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Expedição e Romaneios de Saída</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Gestão completa de carregamentos, saída de produtos acabados, logística fluvial/terrestre e cadastro de clientes com seleção em 1-clique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModalNovoClienteOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all border border-emerald-500"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cadastrar Cliente</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Expedido Hoje</span>
          <span className="text-xl font-black text-slate-900 block">{formatNumber(expedidoDia, 0)} kg</span>
          <span className="text-[10px] font-semibold text-emerald-600">Carregamentos do Dia</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Romaneios de Retirada</span>
          <span className="text-xl font-black text-amber-600 block">{romaneiosRetirada.length} romaneios</span>
          <span className="text-[10px] font-semibold text-emerald-600">Saídas e Retiradas Liberadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Expedido no Mês</span>
          <span className="text-xl font-black text-emerald-800 block">{formatNumber(expedidoMes, 0)} kg</span>
          <span className="text-[10px] font-semibold text-slate-500">Total Geral de Saídas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Cargas em Andamento</span>
          <span className="text-xl font-black text-slate-700 block">{pendentes} cargas</span>
          <span className="text-[10px] font-semibold text-amber-600">Em trânsito / Pendentes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Clientes Cadastrados</span>
          <span className="text-xl font-black text-slate-900 block">{clientes.length} clientes</span>
          <span className="text-[10px] font-semibold text-emerald-600">Prontos p/ Seleção em 1-Click</span>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setEditingRomaneio(null);
            setActiveSubTab('novo_romaneio');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'novo_romaneio'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Novo Romaneio de Retirada</span>
        </button>

        <button
          onClick={() => setActiveSubTab('romaneios')}
          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'romaneios'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Listar Romaneios ({romaneiosRetirada.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('relatorios')}
          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'relatorios'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Relatórios de Expedição</span>
        </button>

        <button
          onClick={() => setActiveSubTab('nova')}
          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'nova'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Nova Carga / Expedição</span>
        </button>

        <button
          onClick={() => setActiveSubTab('andamento')}
          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'andamento'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Todas as Cargas ({expedicoes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('clientes')}
          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'clientes'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes Cadastrados ({clientes.length})</span>
        </button>
      </div>

      {/* 1. Novo Romaneio de Retirada Form */}
      {activeSubTab === 'novo_romaneio' && (
        <NovoRomaneioRetiradaForm
          editingRomaneio={editingRomaneio}
          onSaved={() => {
            setEditingRomaneio(null);
            setActiveSubTab('romaneios');
          }}
          onCancelEdit={() => {
            setEditingRomaneio(null);
            setActiveSubTab('romaneios');
          }}
        />
      )}

      {/* 2. Listar Romaneios de Retirada */}
      {activeSubTab === 'romaneios' && (
        <ListarRomaneiosRetirada
          onEditRomaneio={(rom) => {
            setEditingRomaneio(rom);
            setActiveSubTab('novo_romaneio');
          }}
          onNewRomaneioClick={() => {
            setEditingRomaneio(null);
            setActiveSubTab('novo_romaneio');
          }}
        />
      )}

      {/* 3. Relatórios de Expedição */}
      {activeSubTab === 'relatorios' && <RelatoriosExpedicao />}

      {/* Nova Expedição Form */}
      {activeSubTab === 'nova' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-700 stroke-[3]" />
              <span>Cadastrar Nova Carga / Expedição de Saída</span>
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>Gera título automático em Contas a Receber</span>
            </div>
          </div>

          {/* Section: Select Client with 1-Click */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Selecione um Cliente Cadastrado com 1 Clique
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalNovoClienteOpen(true)}
                className="text-xs font-extrabold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Cadastrar Novo Cliente</span>
              </button>
            </div>

            {/* Quick Interactive Client Grid / Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {clientes.map((c) => {
                const isSelected = selectedClienteId === c.id || formExpedicao.cliente === c.nome;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCliente(c)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-xs flex items-center gap-1.5">
                        <Building className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`} />
                        <span>{c.nome}</span>
                      </div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                        CNPJ/CPF: {c.cpfCnpj}
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-600'}`}>
                        📍 {c.cidade || 'Monte Dourado/PA'}
                      </div>
                    </div>
                    <div>
                      {isSelected ? (
                        <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 text-[10px] font-black rounded-full flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Selecionado</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-emerald-100 hover:text-emerald-900">
                          Clique p/ Selecionar
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Indicator of current selection with clear option */}
            {formExpedicao.cliente && (
              <div className="pt-2 flex items-center justify-between text-xs font-bold bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-300 text-emerald-950">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-800" />
                  <span>Cliente Selecionado: <strong>{formExpedicao.cliente}</strong> ({formExpedicao.cpfCnpj})</span>
                </span>
                <button
                  type="button"
                  onClick={handleClearSelectedCliente}
                  className="text-[11px] text-slate-700 hover:text-red-700 font-extrabold cursor-pointer underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Trocar / Limpar</span>
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleCreateExpedicao} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Castanha Selection */}
            <div className="md:col-span-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">Tipo de Castanha Expedida</span>
                <span className="text-[11px] text-slate-500 block">Selecione para vincular ao Módulo Financeiro em Contas a Receber</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTipoCastanhaChange('Castanha Beneficiada')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                    formExpedicao.tipoCastanha === 'Castanha Beneficiada'
                      ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs ring-2 ring-amber-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✨ Castanha Beneficiada (Amêndoa Processada)
                </button>
                <button
                  type="button"
                  onClick={() => handleTipoCastanhaChange('Castanha In Natura / Com Casca')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                    formExpedicao.tipoCastanha === 'Castanha In Natura / Com Casca'
                      ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs ring-2 ring-amber-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🌿 Castanha In Natura / Com Casca
                </button>
              </div>
            </div>

            {/* If Castanha Beneficiada is selected, display the 6 1-Click Subtipo Buttons */}
            {formExpedicao.tipoCastanha === 'Castanha Beneficiada' && (
              <div className="md:col-span-3 bg-amber-50/80 border-2 border-amber-300 p-5 rounded-2xl space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Selecione o Tipo de Castanha Beneficiada (Clique Rápido)</span>
                    </span>
                    <span className="text-[11px] text-amber-900 font-medium">
                      Clique no tipo desejado para carregar o preço por kg/caixa e o saldo de estoque atual.
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-amber-200 text-amber-950 rounded-lg border border-amber-300">
                    6 Tipos Comerciais
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {subtiposDisponiveis.map((item) => {
                    const isSelected = subtipoBeneficiada === item.tipo;
                    const est = estoqueBeneficiada.find((e) => e.tipo === item.tipo);
                    const cxEst = est ? est.caixas : 0;
                    const precoUlt = est ? est.ultimoPrecoVenda : 0;

                    return (
                      <button
                        key={item.tipo}
                        type="button"
                        onClick={() => handleSelectSubtipo(item.tipo)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 relative ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-950 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/60'
                        }`}
                      >
                        <div className="text-xl mb-0.5">{item.icon}</div>
                        <div className="font-black text-xs leading-tight">{item.tipo}</div>
                        <div className={`text-[10px] font-medium ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                          {item.desc}
                        </div>
                        <div
                          className={`mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg w-full text-center ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cxEst} cx • R$ {precoUlt.toFixed(2)}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 rounded-full p-1 shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Selection Details Banner */}
                {subtipoBeneficiada && (() => {
                  const activeItem = estoqueBeneficiada.find((e) => e.tipo === subtipoBeneficiada);
                  return (
                    <div className="bg-white p-3.5 rounded-xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl font-black text-sm">
                          📦 {subtipoBeneficiada}
                        </div>
                        <div>
                          <div className="font-black text-slate-900">
                            Estoque em Monte Dourado: <span className="text-emerald-700 font-extrabold">{activeItem?.caixas || 0} caixas</span> ({formatNumber(activeItem?.pesoKg || 0, 0)} kg)
                          </div>
                          <div className="text-slate-600 text-[11px]">
                            Último Preço Venda: <strong>R$ {formatBRL(activeItem?.ultimoPrecoVenda || 0)}/kg</strong> (R$ {formatBRL((activeItem?.ultimoPrecoVenda || 0) * 20)}/cx) • Média Histórica: <strong>R$ {formatBRL(activeItem?.precoMedioVenda || 0)}/kg</strong>
                          </div>
                        </div>
                      </div>
                      <div className="bg-emerald-100/80 text-emerald-950 font-black text-[11px] px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Abate Automático do Estoque no Confirmar</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Cliente / Comprador</label>
                <select
                  className="text-[10px] text-emerald-800 font-bold bg-transparent cursor-pointer border-none p-0 focus:ring-0"
                  onChange={(e) => {
                    const found = clientes.find((c) => c.id === e.target.value);
                    if (found) handleSelectCliente(found);
                  }}
                  value={selectedClienteId || ''}
                >
                  <option value="">-- Selecionar com 1-Click --</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Ex: Nutry Alimentos Ltda"
                value={formExpedicao.cliente}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, cliente: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CPF / CNPJ do Cliente</label>
              <input
                type="text"
                placeholder="Ex: 12.345.678/0001-90"
                value={formExpedicao.cpfCnpj}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, cpfCnpj: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Endereço de Entrega</label>
              <input
                type="text"
                placeholder="Ex: Porto de Belém / Av. das Docas 500"
                value={formExpedicao.endereco}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, endereco: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Produto Expedido</label>
              <input
                type="text"
                value={formExpedicao.produto}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, produto: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Classificação / Tipo</label>
              <input
                type="text"
                value={formExpedicao.classificacao}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, classificacao: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lote de Origem</label>
              <select
                value={formExpedicao.loteId}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, loteId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              >
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>{l.codigo} — {l.origemDominante}</option>
                ))}
              </select>
            </div>

            {/* Quantity inputs in Boxes & Kg with automatic conversion */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Quantidade de Caixas (cx)</label>
                <span className="text-[10px] text-emerald-800 font-extrabold">Padronizado: 20kg/cx</span>
              </div>
              <input
                type="number"
                min="1"
                value={formExpedicao.caixas}
                onChange={(e) => handleCaixasChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Peso Total Equivalente (Kg)</label>
              <input
                type="number"
                value={formExpedicao.pesoTotalKg}
                onChange={(e) => handlePesoKgChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-emerald-800 focus:bg-white"
                required
              />
            </div>

            {/* Price inputs with toggle between R$/kg and R$/caixa */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {precoModo === 'por_kg' ? 'Preço por Kg (R$)' : 'Preço por Caixa (R$)'}
                </label>
                <button
                  type="button"
                  onClick={() => setPrecoModo(precoModo === 'por_kg' ? 'por_caixa' : 'por_kg')}
                  className="text-[10px] text-emerald-800 font-extrabold underline cursor-pointer hover:text-emerald-950"
                >
                  {precoModo === 'por_kg' ? '⇄ Trocar p/ R$/Caixa' : '⇄ Trocar p/ R$/Kg'}
                </button>
              </div>
              {precoModo === 'por_kg' ? (
                <input
                  type="number"
                  step="0.01"
                  value={formExpedicao.precoUnitarioKg}
                  onChange={(e) => handlePrecoKgChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-emerald-800 focus:bg-white"
                  required
                />
              ) : (
                <input
                  type="number"
                  step="0.01"
                  value={valorPorCaixa}
                  onChange={(e) => handlePrecoCaixaChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-emerald-800 focus:bg-white"
                  required
                />
              )}
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Equivalência: R$ {formatBRL(preco)}/kg = R$ {formatBRL(preco * 20)}/cx
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Condição de Pagamento</label>
              <select
                value={formExpedicao.condicaoPagamento}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, condicaoPagamento: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              >
                <option value="À vista">À Vista</option>
                <option value="15 dias">15 dias</option>
                <option value="30 dias">30 dias</option>
                <option value="45 dias">45 dias</option>
                <option value="60 dias">60 dias</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data Vencimento do Título</label>
              <input
                type="date"
                value={formExpedicao.dataVencimento}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, dataVencimento: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade de Caixas/Volume</label>
              <input
                type="number"
                value={formExpedicao.caixas}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, caixas: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Motorista / Condutor</label>
              <input
                type="text"
                value={formExpedicao.motorista}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, motorista: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Veículo / Embarcação</label>
              <input
                type="text"
                value={formExpedicao.veiculo}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, veiculo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transportadora</label>
              <input
                type="text"
                value={formExpedicao.transportadora}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, transportadora: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data de Saída</label>
              <input
                type="date"
                value={formExpedicao.dataExpedicao}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, dataExpedicao: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="md:col-span-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-emerald-950 block">Resumo do Faturamento — Contas a Receber</span>
                <span className="text-xs font-medium text-emerald-800">
                  {formExpedicao.cliente || 'Cliente não informado'} • {formExpedicao.tipoCastanha} ({peso} kg x R$ {formatBRL(preco)}/kg)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Valor Total do Título</span>
                <span className="text-xl font-black text-emerald-900">{formatBRL(valorTotalCalculado)}</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Observações de Transporte</label>
              <input
                type="text"
                value={formExpedicao.observações}
                onChange={(e) => setFormExpedicao({ ...formExpedicao, observações: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Gerar Expedição & Título a Receber</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables View for expedicoes */}
      {activeSubTab !== 'nova' && activeSubTab !== 'clientes' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Registros de Expedição</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-3">Código EXP</th>
                  <th className="p-3">Data Saída</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Tipo Castanha</th>
                  <th className="p-3">Produto / Padrão</th>
                  <th className="p-3 text-right">Peso (Kg)</th>
                  <th className="p-3 text-right">Valor Total R$</th>
                  <th className="p-3 text-center">Título CR</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expedicoes.map((e) => (
                  <tr key={e.id}>
                    <td className="p-3 font-mono font-bold text-emerald-800">{e.codigo}</td>
                    <td className="p-3 font-bold">{e.data}</td>
                    <td className="p-3 font-extrabold text-slate-900">{e.cliente}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        e.tipoCastanha === 'Castanha Beneficiada'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {e.tipoCastanha}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 font-semibold">{e.produto} ({e.classificacao})</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatNumber(e.pesoKg, 0)} kg</td>
                    <td className="p-3 text-right font-black text-emerald-700">{formatBRL(e.valorTotal)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center gap-1">
                        <Receipt className="w-3 h-3 text-emerald-600" />
                        <span>{e.contaReceberCodigo || 'CR-GERADO'}</span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          e.status === 'Concluída'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clients Consultation View */}
      {activeSubTab === 'clientes' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>Cadastro e Consulta de Clientes</span>
              </h3>
              <p className="text-slate-500 text-xs font-medium">
                Selecione qualquer cliente com 1-click para iniciar uma nova expedição.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CNPJ/CPF ou cidade..."
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl w-64 font-semibold"
                />
              </div>

              <button
                onClick={() => setIsModalNovoClienteOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Cadastrar Cliente</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesFiltrados.map((c) => (
              <div key={c.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-emerald-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {c.codigo}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 mt-1">{c.nome}</h4>
                    </div>

                    <button
                      onClick={() => deleteCliente(c.id)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                      title="Remover cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 font-medium pt-1">
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <strong className="font-mono">{c.cpfCnpj}</strong>
                    </p>
                    {c.cidade && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.cidade}</span>
                      </p>
                    )}
                    {c.endereco && (
                      <p className="text-[11px] text-slate-500 pl-5">{c.endereco}</p>
                    )}
                    {c.telefone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.telefone}</span>
                      </p>
                    )}
                    {c.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{c.comprasCount || 0} compras</span>
                    <span className="text-emerald-800">{formatNumber(c.totalKgComprado || 0, 0)} kg comprados</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectCliente(c);
                      setActiveSubTab('nova');
                    }}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <span>Criar Expedição (1-Click)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {clientesFiltrados.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-700 font-bold text-sm">Nenhum cliente encontrado</p>
                <p className="text-slate-500 text-xs mt-1">Clique no botão abaixo para cadastrar um novo cliente.</p>
                <button
                  onClick={() => setIsModalNovoClienteOpen(true)}
                  className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Novo Cliente</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Novo Cliente */}
      {isModalNovoClienteOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Cadastrar Novo Cliente</h3>
                  <p className="text-slate-500 text-xs">Preencha os dados do cliente de expedição</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalNovoClienteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarCliente} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Comercial Castanhas Jari Ltda"
                    value={formNovoCliente.nome}
                    onChange={(e) => setFormNovoCliente({ ...formNovoCliente, nome: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CPF / CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 12.345.678/0001-90"
                    value={formNovoCliente.cpfCnpj}
                    onChange={(e) => setFormNovoCliente({ ...formNovoCliente, cpfCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inscrição Estadual (IE)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 15.123.456-0"
                    value={formNovoCliente.inscricaoEstadual}
                    onChange={(e) => setFormNovoCliente({ ...formNovoCliente, inscricaoEstadual: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Belém/PA"
                    value={formNovoCliente.cidade}
                    onChange={(e) => setFormNovoCliente({ ...formNovoCliente, cidade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (91) 99123-4567"
                    value={formNovoCliente.telefone}
                    onChange={(e) => setFormNovoCliente({ ...formNovoCliente, telefone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Endereço Completo de Entrega
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Marechal Hermes, Galpão 4, Porto de Belém"
                    value={formNovoCliente.endereco}
                    onChange={(e) => setFormNovoCliente({ ...formNovoCliente, endereco: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: compras@cliente.com.br"
                    value={formNovoCliente.email}
                    onChange={(e) => setFormNovoCliente({ ...formNovoCliente, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observações Comerciais
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Condição especial de pagamento / Entrega via balsa"
                    value={formNovoCliente.observacoes}
                    onChange={(e) => setFormNovoCliente({ ...formNovoCliente, observacoes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalNovoClienteOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar & Selecionar Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
