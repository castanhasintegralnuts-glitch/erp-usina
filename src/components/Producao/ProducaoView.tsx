import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuebraManualView } from '../QuebraManual/QuebraManualView';
import { formatBRL, formatNumber, formatDateBR } from '../../utils/conversions';
import {
  Factory,
  Flame,
  Hammer,
  Cpu,
  PackageCheck,
  Plus,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Users,
  Layers,
  Calendar,
  Sparkles,
  Gauge,
  Thermometer,
  FileText,
  X,
  ArrowRight,
  Play,
  CheckSquare
} from 'lucide-react';

export const ProducaoView: React.FC = () => {
  const {
    lotes,
    producoesQuebra,
    currentUser,
    addToast,
    quebradores,
    setDocPreview
  } = useApp();

  const [activeStage, setActiveStage] = useState<'secador' | 'autoclave' | 'quebra' | 'estufa' | 'empacotamento'>('quebra');

  const [modalSaida, setModalSaida] = useState<{
    stage: 'secador' | 'autoclave' | 'estufa';
    id: string;
    loteCodigo: string;
    equipamento: string;
    dataSaida: string;
    horarioSaida: string;
    observacoes: string;
  } | null>(null);

  // Stage 1: Entrada no Secador State
  const [secadorForm, setSecadorForm] = useState({
    loteId: lotes[0]?.id || '',
    quantidadeHl: '40',
    secadorUtilizado: 'Secador A - Ar Forçado 1',
    data: new Date().toISOString().split('T')[0],
    horario: '08:00',
    responsavel: currentUser?.nome || 'Operador Industrial',
    observacoes: 'Controle de umidade pré-quebra',
  });

  const [registrosSecador, setRegistrosSecador] = useState([
    {
      id: 'sec-1',
      loteCodigo: 'MD-LOT-2026-0001',
      quantidadeHl: 80,
      secadorUtilizado: 'Secador A - Ar Forçado 1',
      dataEntrada: '2026-08-05',
      horarioEntrada: '07:30',
      dataSaida: '2026-08-05',
      horarioSaida: '19:30',
      responsavel: 'Manoel do Secador',
      situacao: 'Concluído' as 'Em Secagem' | 'Concluído',
      proximaEtapa: 'Aguardando Autoclavagem',
      observacoes: 'Temperatura mantida em 45°C por 12 horas. Umidade final 7.8%.',
    },
    {
      id: 'sec-2',
      loteCodigo: 'MD-LOT-2026-0002',
      quantidadeHl: 80,
      secadorUtilizado: 'Secador A - Ar Forçado 1',
      dataEntrada: '2026-08-10',
      horarioEntrada: '08:00',
      dataSaida: '',
      horarioSaida: '',
      responsavel: 'Integral NUTS (Master)',
      situacao: 'Em Secagem' as 'Em Secagem' | 'Concluído',
      proximaEtapa: 'Em processamento',
      observacoes: 'Controle de umidade pré-quebra em andamento.',
    },
    {
      id: 'sec-3',
      loteCodigo: 'MD-LOT-2026-0002',
      quantidadeHl: 120,
      secadorUtilizado: 'Secador B - Ar Forçado 2',
      dataEntrada: '2026-08-05',
      horarioEntrada: '09:00',
      dataSaida: '2026-08-05',
      horarioSaida: '21:00',
      responsavel: 'Manoel do Secador',
      situacao: 'Concluído' as 'Em Secagem' | 'Concluído',
      proximaEtapa: 'Aguardando Autoclavagem',
      observacoes: 'Redução de umidade de 11.2% para 7.5%.',
    }
  ]);

  // Stage 2: Autoclave State
  const [autoclaveForm, setAutoclaveForm] = useState({
    loteId: lotes[0]?.id || '',
    autoclaveUtilizada: 'Autoclave 01 - Vapor Pressurizado',
    pressaoBar: '2.5',
    temperaturaCelsius: '125',
    tempoMinutos: '35',
    entradaDataHora: `${new Date().toISOString().split('T')[0]} 08:00`,
    saidaDataHora: `${new Date().toISOString().split('T')[0]} 08:35`,
    responsavel: currentUser?.nome || 'Operador Autoclave',
    situacao: 'Em cozimento' as 'Em cozimento' | 'Concluído',
    observacoes: 'Pressão mantida em 2.5 bar. Separação de LCN e amolecimento da casca para quebra.',
  });

  const [registrosAutoclave, setRegistrosAutoclave] = useState([
    {
      id: 'aut-1',
      loteCodigo: 'MD-LOT-2026-0001',
      autoclaveUtilizada: 'Autoclave 01 - Vapor Pressurizado',
      pressaoBar: 2.5,
      temperaturaCelsius: 125,
      tempoMinutos: 35,
      entrada: '2026-08-05 07:30',
      saida: '2026-08-05 08:05',
      responsavel: 'Benedito da Silva',
      situacao: 'Concluído' as 'Em cozimento' | 'Concluído',
      proximaEtapa: 'Aguardando Quebra Manual',
      observacoes: 'Tratamento térmico concluído com sucesso. Lote liberado para a quebra.',
    },
    {
      id: 'aut-2',
      loteCodigo: 'MD-LOT-2026-0002',
      autoclaveUtilizada: 'Autoclave 02 - Alta Capacidade',
      pressaoBar: 2.8,
      temperaturaCelsius: 128,
      tempoMinutos: 40,
      entrada: '2026-08-06 08:00',
      saida: '',
      responsavel: 'Benedito da Silva',
      situacao: 'Em cozimento' as 'Em cozimento' | 'Concluído',
      proximaEtapa: 'Em cozimento',
      observacoes: 'Cozimento sob pressão em andamento.',
    }
  ]);

  // Stage 3: Estufa State
  const [estufaForm, setEstufaForm] = useState({
    loteId: lotes[0]?.id || '',
    estufaUtilizada: 'Estufa 01 - Circulação 65°C',
    entradaDataHora: `${new Date().toISOString().split('T')[0]} 08:00`,
    saidaDataHora: `${new Date().toISOString().split('T')[0]} 16:00`,
    responsavel: currentUser?.nome || 'Operador Estufa',
    situacao: 'Em processamento' as 'Em processamento' | 'Concluído',
    observacoes: 'Secagem de amêndoas despeladas',
  });

  const [registrosEstufa, setRegistrosEstufa] = useState([
    {
      id: 'est-1',
      loteCodigo: 'MD-LOT-2026-0001',
      estufaUtilizada: 'Estufa 01 - Circulação 65°C',
      entrada: '2026-08-05 08:00',
      saida: '2026-08-05 16:00',
      responsavel: 'Ana Paula Costa',
      situacao: 'Concluído' as 'Em processamento' | 'Concluído',
      proximaEtapa: 'Aguardando Empacotamento',
      observacoes: 'Amêndoas desidratadas a 3.5% umidade final.',
    },
    {
      id: 'est-2',
      loteCodigo: 'MD-LOT-2026-0002',
      estufaUtilizada: 'Estufa 02 - Ar Quente',
      entrada: '2026-08-06 07:00',
      saida: '',
      responsavel: 'Carlos Silva',
      situacao: 'Em processamento' as 'Em processamento' | 'Concluído',
      proximaEtapa: 'Em desidratação',
      observacoes: 'Batelada em andamento na Estufa 02.',
    }
  ]);

  // Stage 4: Empacotamento State
  const [empacotamentoForm, setEmpacotamentoForm] = useState({
    loteId: lotes[0]?.id || '',
    classificacao: 'Extra Large',
    quantidadeProduzidaKg: '100',
    pesoCaixaKg: '20',
    caixasProduzidas: '5',
    responsavel: currentUser?.nome || 'Empacotador Chefe',
  });

  const [registrosEmpacotamento, setRegistrosEmpacotamento] = useState([
    {
      id: 'emp-1',
      data: '2026-08-05',
      colaborador: 'Maria Oliveira Ramos',
      loteCodigo: 'MD-LOT-2026-0001',
      classificacao: 'Extra Large',
      pesoTotalKg: 42.5,
      caixasProduzidas: 2,
      responsavel: 'Integral NUTS (Master)',
    },
    {
      id: 'emp-2',
      data: '2026-08-05',
      colaborador: 'Raimunda do Socorro',
      loteCodigo: 'MD-LOT-2026-0001',
      classificacao: 'Large',
      pesoTotalKg: 35.0,
      caixasProduzidas: 2,
      responsavel: 'Integral NUTS (Master)',
    },
    {
      id: 'emp-3',
      data: '2026-08-06',
      colaborador: 'Josefa de Nazaré',
      loteCodigo: 'MD-LOT-2026-0002',
      classificacao: 'Média',
      pesoTotalKg: 50.0,
      caixasProduzidas: 3,
      responsavel: 'Integral NUTS (Master)',
    }
  ]);

  // Submit Handlers
  const handleAddSecador = (e: React.FormEvent) => {
    e.preventDefault();
    const loteTarget = lotes.find((l) => l.id === secadorForm.loteId) || lotes[0];
    const newReg = {
      id: `sec-${Date.now()}`,
      loteCodigo: loteTarget?.codigo || 'MD-LOT-2026-0001',
      quantidadeHl: parseFloat(secadorForm.quantidadeHl) || 0,
      secadorUtilizado: secadorForm.secadorUtilizado,
      dataEntrada: secadorForm.data,
      horarioEntrada: secadorForm.horario,
      dataSaida: '',
      horarioSaida: '',
      responsavel: secadorForm.responsavel,
      situacao: 'Em Secagem' as const,
      proximaEtapa: 'Em processamento',
      observacoes: secadorForm.observacoes,
    };
    setRegistrosSecador([newReg, ...registrosSecador]);
    addToast(`Entrada no ${secadorForm.secadorUtilizado} registrada! Equipamento em uso.`, 'success');
  };

  const handleAddAutoclave = (e: React.FormEvent) => {
    e.preventDefault();
    const loteTarget = lotes.find((l) => l.id === autoclaveForm.loteId) || lotes[0];
    const newReg = {
      id: `aut-${Date.now()}`,
      loteCodigo: loteTarget?.codigo || 'MD-LOT-2026-0001',
      autoclaveUtilizada: autoclaveForm.autoclaveUtilizada,
      pressaoBar: parseFloat(autoclaveForm.pressaoBar) || 0,
      temperaturaCelsius: parseFloat(autoclaveForm.temperaturaCelsius) || 0,
      tempoMinutos: parseInt(autoclaveForm.tempoMinutos) || 0,
      entrada: autoclaveForm.entradaDataHora,
      saida: '',
      responsavel: autoclaveForm.responsavel,
      situacao: 'Em cozimento' as const,
      proximaEtapa: 'Em cozimento',
      observacoes: autoclaveForm.observacoes,
    };
    setRegistrosAutoclave([newReg, ...registrosAutoclave]);
    addToast(`Entrada na ${autoclaveForm.autoclaveUtilizada} registrada! Equipamento em uso.`, 'success');
  };

  const handleAddEstufa = (e: React.FormEvent) => {
    e.preventDefault();
    const loteTarget = lotes.find((l) => l.id === estufaForm.loteId) || lotes[0];
    const newReg = {
      id: `est-${Date.now()}`,
      loteCodigo: loteTarget?.codigo || 'MD-LOT-2026-0001',
      estufaUtilizada: estufaForm.estufaUtilizada,
      entrada: estufaForm.entradaDataHora,
      saida: '',
      responsavel: estufaForm.responsavel,
      situacao: 'Em processamento' as const,
      proximaEtapa: 'Em desidratação',
      observacoes: estufaForm.observacoes || 'Secagem de amêndoas em andamento',
    };
    setRegistrosEstufa([newReg, ...registrosEstufa]);
    addToast(`Entrada na ${estufaForm.estufaUtilizada} registrada! Equipamento em uso.`, 'success');
  };

  // Completion / Exit Handlers
  const handleAbrirModalSaida = (
    stage: 'secador' | 'autoclave' | 'estufa',
    id: string,
    loteCodigo: string,
    equipamento: string,
    obsAtual: string = ''
  ) => {
    const hoje = new Date().toISOString().split('T')[0];
    const agora = new Date().toTimeString().slice(0, 5);
    setModalSaida({
      stage,
      id,
      loteCodigo,
      equipamento,
      dataSaida: hoje,
      horarioSaida: agora,
      observacoes: obsAtual,
    });
  };

  const handleConfirmarSaida = () => {
    if (!modalSaida) return;
    const { stage, id, equipamento, dataSaida, horarioSaida, observacoes } = modalSaida;
    const saidaStr = `${dataSaida} ${horarioSaida}`;

    if (stage === 'secador') {
      setRegistrosSecador((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                situacao: 'Concluído',
                proximaEtapa: 'Aguardando Autoclavagem',
                dataSaida,
                horarioSaida,
                observacoes: observacoes ? `${r.observacoes} | Saída: ${observacoes}` : r.observacoes,
              }
            : r
        )
      );
      addToast(`Término de secagem registrado! ${equipamento} liberado à disposição para o próximo ciclo. Lote no status: Aguardando Autoclavagem.`, 'success');
    } else if (stage === 'autoclave') {
      setRegistrosAutoclave((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                situacao: 'Concluído',
                proximaEtapa: 'Aguardando Quebra Manual',
                saida: saidaStr,
                observacoes: observacoes ? `${r.observacoes} | Saída: ${observacoes}` : r.observacoes,
              }
            : r
        )
      );
      addToast(`Término de autoclavagem registrado! ${equipamento} liberado à disposição para o próximo ciclo. Lote no status: Aguardando Quebra Manual.`, 'success');
    } else if (stage === 'estufa') {
      setRegistrosEstufa((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                situacao: 'Concluído',
                proximaEtapa: 'Aguardando Empacotamento',
                saida: saidaStr,
                observacoes: observacoes ? `${r.observacoes} | Saída: ${observacoes}` : r.observacoes,
              }
            : r
        )
      );
      addToast(`Término de estufagem registrado! ${equipamento} liberado à disposição para o próximo ciclo. Lote no status: Aguardando Empacotamento.`, 'success');
    }

    setModalSaida(null);
  };

  const handleAddEmpacotamento = (e: React.FormEvent) => {
    e.preventDefault();
    const loteTarget = lotes.find((l) => l.id === empacotamentoForm.loteId) || lotes[0];
    const kg = parseFloat(empacotamentoForm.quantidadeProduzidaKg) || 0;
    const caixas = parseInt(empacotamentoForm.caixasProduzidas) || 1;

    const newReg = {
      id: `emp-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      colaborador: currentUser?.nome || 'Operador',
      loteCodigo: loteTarget?.codigo || 'MD-LOT-2026-0001',
      classificacao: empacotamentoForm.classificacao,
      pesoTotalKg: kg,
      caixasProduzidas: caixas,
      responsavel: empacotamentoForm.responsavel,
    };
    setRegistrosEmpacotamento([newReg, ...registrosEmpacotamento]);
    addToast('Fechamento de empacotamento registrado!', 'success');
  };

  // Calculations for Empacotamento
  const totalKgEmpacotadoDia = registrosEmpacotamento.reduce((acc, r) => acc + r.pesoTotalKg, 0);
  const totalCaixasDia = registrosEmpacotamento.reduce((acc, r) => acc + r.caixasProduzidas, 0);

  // Groupings for Fechamento
  const prodPorColaborador = registrosEmpacotamento.reduce((acc: any, r) => {
    acc[r.colaborador] = (acc[r.colaborador] || 0) + r.pesoTotalKg;
    return acc;
  }, {});

  const prodPorLote = registrosEmpacotamento.reduce((acc: any, r) => {
    acc[r.loteCodigo] = (acc[r.loteCodigo] || 0) + r.pesoTotalKg;
    return acc;
  }, {});

  const prodPorClassificacao = registrosEmpacotamento.reduce((acc: any, r) => {
    acc[r.classificacao] = (acc[r.classificacao] || 0) + r.pesoTotalKg;
    return acc;
  }, {});

  const totalHlSecado = registrosSecador.reduce((acc, s) => acc + s.quantidadeHl, 0);
  const totalMinutosAutoclave = registrosAutoclave.reduce((acc, a) => acc + a.tempoMinutos, 0);
  const totalEstufaKg = registrosEstufa.reduce((acc, e) => acc + e.pesoKg, 0);
  const totalEmpacotadoKg = registrosEmpacotamento.reduce((acc, p) => acc + p.pesoTotalKg, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Factory className="w-4 h-4" />
            <span>Usina de Beneficiamento Monte Dourado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Etapas do Processo Produtivo</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
            Acompanhamento em tempo real do Secador, Autoclave, Quebra Manual, Estufa e Empacotamento de Castanha-do-Pará.
          </p>
        </div>

        <button
          onClick={() => setDocPreview({
            tipo: 'Relatório Consolidado',
            data: {
              docMeta: {
                numeroDocumento: 'MD-PDF-PROD-GERAL',
                dataEmissao: new Date().toLocaleDateString('pt-BR'),
                horarioEmissao: '10:00',
                codigoRastreabilidade: `MD-PROD-${Date.now().toString().slice(-5)}`,
                responsavel: 'FÁBRICA INTEGRAL NUTS',
              },
              extraData: {
                titulo: 'RELATÓRIO CONSOLIDADO — PROCESSAMENTO INDUSTRIAL & ETAPAS',
                descricao: 'Síntese de produção acumulada por etapa: Secagem, Autoclave, Estufa e Empacotamento.',
                indicadores: [
                  { label: 'Total Secado', valor: `${formatNumber(totalHlSecado, 0)} Hl`, detalhe: 'Volume em Casca' },
                  { label: 'Tempo Autoclave', valor: `${totalMinutosAutoclave} min`, detalhe: 'Tratamento térmico' },
                  { label: 'Entrada Estufa', valor: `${formatNumber(totalEstufaKg, 1)} kg`, detalhe: 'Secagem amêndoa' },
                  { label: 'Empacotado Final', valor: `${formatNumber(totalEmpacotadoKg, 1)} kg`, detalhe: 'Pronto p/ venda' },
                ],
                colunas: ['Etapa', 'Equipamento / Setor', 'Lote Referência', 'Volume / Peso', 'Responsável', 'Situação'],
                itens: [
                  ...registrosSecador.map((s) => ['Secador', s.secadorUtilizado, s.loteCodigo, `${s.quantidadeHl} Hl`, s.responsavel, 'Concluído']),
                  ...registrosAutoclave.map((a) => ['Autoclave', a.autoclaveUtilizada, a.loteCodigo, `${a.tempoMinutos} min / ${a.pressaoBar} bar`, a.responsavel, a.situacao]),
                  ...registrosEstufa.map((e) => ['Estufa', e.estufaUtilizada, e.loteCodigo, `${e.pesoKg} kg`, e.responsavel, 'Concluído']),
                  ...registrosEmpacotamento.map((p) => ['Empacotamento', `Selo Vacuum - ${p.classificacao}`, p.loteCodigo, `${p.pesoTotalKg} kg (${p.quantidadeCaixas} cx)`, p.responsavel, 'Concluído']),
                ]
              }
            }
          })}
          className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all cursor-pointer border border-amber-300 shrink-0"
        >
          <FileText className="w-4 h-4 text-slate-950" />
          <span>Gerar PDF Consolidado</span>
        </button>
      </div>

      {/* Stage Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveStage('secador')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'secador'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold'
          }`}
        >
          <div className="flex items-center justify-between">
            <Flame className="w-5 h-5" />
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-950/10">Etapa 1</span>
          </div>
          <div className="mt-3">
            <span className="block text-xs uppercase opacity-80">Secagem em Casca</span>
            <span className="text-sm">Secador</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStage('autoclave')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'autoclave'
              ? 'bg-rose-600 text-white border-rose-500 font-black shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold'
          }`}
        >
          <div className="flex items-center justify-between">
            <Gauge className="w-5 h-5" />
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/20">Etapa 2</span>
          </div>
          <div className="mt-3">
            <span className="block text-xs uppercase opacity-80">Tratamento Térmico</span>
            <span className="text-sm">Autoclave</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStage('quebra')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'quebra'
              ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold'
          }`}
        >
          <div className="flex items-center justify-between">
            <Hammer className="w-5 h-5" />
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/20">Etapa 3</span>
          </div>
          <div className="mt-3">
            <span className="block text-xs uppercase opacity-80">Abertura Artesanal</span>
            <span className="text-sm">Quebra Manual</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStage('estufa')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'estufa'
              ? 'bg-blue-600 text-white border-blue-500 font-black shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold'
          }`}
        >
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5" />
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/20">Etapa 4</span>
          </div>
          <div className="mt-3">
            <span className="block text-xs uppercase opacity-80">Desidratação</span>
            <span className="text-sm">Estufa</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStage('empacotamento')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'empacotamento'
              ? 'bg-purple-600 text-white border-purple-500 font-black shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold'
          }`}
        >
          <div className="flex items-center justify-between">
            <PackageCheck className="w-5 h-5" />
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/20">Etapa 5</span>
          </div>
          <div className="mt-3">
            <span className="block text-xs uppercase opacity-80">Fechamento Diário</span>
            <span className="text-sm">Empacotamento</span>
          </div>
        </button>
      </div>

      {/* Stage 1: Secador */}
      {activeStage === 'secador' && (
        <div className="space-y-6">
          {/* Equipment Status Cards */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Status & Disponibilidade dos Secadores</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                Controle de Equipamentos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                'Secador A - Ar Forçado 1',
                'Secador B - Ar Forçado 2',
                'Secador C - Solar Rotativo'
              ].map((secadorNome) => {
                const emUso = registrosSecador.find(
                  (r) => r.secadorUtilizado === secadorNome && r.situacao === 'Em Secagem'
                );
                return (
                  <div
                    key={secadorNome}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      emUso
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-emerald-50/40 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900">{secadorNome}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                          emUso
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {emUso ? '🔴 Em Uso' : '🟢 À Disposição'}
                      </span>
                    </div>

                    {emUso ? (
                      <div className="space-y-2">
                        <div className="text-[11px] text-slate-700">
                          Lote: <strong className="font-mono text-amber-900">{emUso.loteCodigo}</strong> ({emUso.quantidadeHl} HL)
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Entrada: {emUso.dataEntrada} às {emUso.horarioEntrada}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAbrirModalSaida('secador', emUso.id, emUso.loteCodigo, emUso.secadorUtilizado, emUso.observacoes)}
                          className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registrar Término do Ciclo</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Livre para carga. Pronto para o próximo ciclo de secagem.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Entrada */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              <span>Registrar Entrada de Lote no Secador</span>
            </h2>

            <form onSubmit={handleAddSecador} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lote de Origem</label>
                <select
                  value={secadorForm.loteId}
                  onChange={(e) => setSecadorForm({ ...secadorForm, loteId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>{l.codigo} — {l.origemDominante}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade (Hectolitros)</label>
                <input
                  type="number"
                  value={secadorForm.quantidadeHl}
                  onChange={(e) => setSecadorForm({ ...secadorForm, quantidadeHl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Secador Utilizado</label>
                <select
                  value={secadorForm.secadorUtilizado}
                  onChange={(e) => setSecadorForm({ ...secadorForm, secadorUtilizado: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="Secador A - Ar Forçado 1">Secador A - Ar Forçado 1</option>
                  <option value="Secador B - Ar Forçado 2">Secador B - Ar Forçado 2</option>
                  <option value="Secador C - Solar Rotativo">Secador C - Solar Rotativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data de Entrada</label>
                <input
                  type="date"
                  value={secadorForm.data}
                  onChange={(e) => setSecadorForm({ ...secadorForm, data: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Horário de Entrada</label>
                <input
                  type="time"
                  value={secadorForm.horario}
                  onChange={(e) => setSecadorForm({ ...secadorForm, horario: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsável Operacional</label>
                <input
                  type="text"
                  value={secadorForm.responsavel}
                  onChange={(e) => setSecadorForm({ ...secadorForm, responsavel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações Técnicas</label>
                <input
                  type="text"
                  value={secadorForm.observacoes}
                  onChange={(e) => setSecadorForm({ ...secadorForm, observacoes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar Entrada Secador</span>
                </button>
              </div>
            </form>
          </div>

          {/* Secador Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Registros Recentes de Secagem</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Lote</th>
                    <th className="p-3 text-right">Quantidade</th>
                    <th className="p-3">Secador</th>
                    <th className="p-3">Entrada</th>
                    <th className="p-3">Saída</th>
                    <th className="p-3 text-center">Status / Próxima Etapa</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {registrosSecador.map((r) => {
                    const isEmSecagem = r.situacao === 'Em Secagem';
                    return (
                      <tr key={r.id}>
                        <td className="p-3 font-mono font-bold text-slate-900">{r.loteCodigo}</td>
                        <td className="p-3 text-right font-extrabold text-amber-700">
                          {r.quantidadeHl} hl ({r.quantidadeHl * 5} latas)
                        </td>
                        <td className="p-3 font-bold text-slate-800">{r.secadorUtilizado}</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">{r.dataEntrada} {r.horarioEntrada}</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          {r.dataSaida ? `${r.dataSaida} ${r.horarioSaida}` : <span className="text-amber-600 font-bold">Em andamento</span>}
                        </td>
                        <td className="p-3 text-center">
                          {isEmSecagem ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                              Em Secagem (Equip. Ocupado)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {r.proximaEtapa || 'Aguardando Autoclavagem'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold">{r.responsavel}</td>
                        <td className="p-3 text-center">
                          {isEmSecagem ? (
                            <button
                              type="button"
                              onClick={() => handleAbrirModalSaida('secador', r.id, r.loteCodigo, r.secadorUtilizado, r.observacoes)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-[10px] cursor-pointer transition-colors shadow-xs"
                            >
                              Registrar Saída / Término
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Secador Liberado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: Autoclave */}
      {activeStage === 'autoclave' && (
        <div className="space-y-6">
          {/* Equipment Status Cards */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-rose-600" />
                <span>Status & Disponibilidade das Autoclaves</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                Cozimento & Tratamento Térmico
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                'Autoclave 01 - Vapor Pressurizado',
                'Autoclave 02 - Alta Capacidade',
                'Autoclave 03 - Piloto'
              ].map((autoclaveNome) => {
                const emUso = registrosAutoclave.find(
                  (r) => r.autoclaveUtilizada === autoclaveNome && r.situacao === 'Em cozimento'
                );
                return (
                  <div
                    key={autoclaveNome}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      emUso
                        ? 'bg-rose-50/60 border-rose-300'
                        : 'bg-emerald-50/40 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900">{autoclaveNome}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                          emUso
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {emUso ? '🔴 Em Cozimento' : '🟢 À Disposição'}
                      </span>
                    </div>

                    {emUso ? (
                      <div className="space-y-2">
                        <div className="text-[11px] text-slate-700">
                          Lote: <strong className="font-mono text-rose-900">{emUso.loteCodigo}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-600" />
                          <span>Entrada: {emUso.entrada}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAbrirModalSaida('autoclave', emUso.id, emUso.loteCodigo, emUso.autoclaveUtilizada, emUso.observacoes)}
                          className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registrar Término de Cozimento</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Livre e higienizada. À disposição para o próximo ciclo de cozimento.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-600" />
              <span>Controle de Cozimento & Esterilização em Autoclave</span>
            </h2>

            <form onSubmit={handleAddAutoclave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lote de Origem</label>
                <select
                  value={autoclaveForm.loteId}
                  onChange={(e) => setAutoclaveForm({ ...autoclaveForm, loteId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>{l.codigo} — {l.origemDominante}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Autoclave Utilizada</label>
                <select
                  value={autoclaveForm.autoclaveUtilizada}
                  onChange={(e) => setAutoclaveForm({ ...autoclaveForm, autoclaveUtilizada: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="Autoclave 01 - Vapor Pressurizado">Autoclave 01 - Vapor Pressurizado (3.0 Bar)</option>
                  <option value="Autoclave 02 - Alta Capacidade">Autoclave 02 - Alta Capacidade (5.0 Bar)</option>
                  <option value="Autoclave 03 - Piloto">Autoclave 03 - Piloto (Lotes Especiais)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pressão de Operação (Bar)</label>
                <input
                  type="text"
                  value={autoclaveForm.pressaoBar}
                  onChange={(e) => setAutoclaveForm({ ...autoclaveForm, pressaoBar: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  placeholder="Ex: 2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temperatura (°C)</label>
                <input
                  type="text"
                  value={autoclaveForm.temperaturaCelsius}
                  onChange={(e) => setAutoclaveForm({ ...autoclaveForm, temperaturaCelsius: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  placeholder="Ex: 125"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tempo de Cozimento (Minutos)</label>
                <input
                  type="number"
                  value={autoclaveForm.tempoMinutos}
                  onChange={(e) => setAutoclaveForm({ ...autoclaveForm, tempoMinutos: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  placeholder="Ex: 35"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Entrada (Data/Hora)</label>
                <input
                  type="text"
                  value={autoclaveForm.entradaDataHora}
                  onChange={(e) => setAutoclaveForm({ ...autoclaveForm, entradaDataHora: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsável Operacional</label>
                <input
                  type="text"
                  value={autoclaveForm.responsavel}
                  onChange={(e) => setAutoclaveForm({ ...autoclaveForm, responsavel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações do Ciclo</label>
                <input
                  type="text"
                  value={autoclaveForm.observacoes}
                  onChange={(e) => setAutoclaveForm({ ...autoclaveForm, observacoes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar Entrada na Autoclave</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Histórico de Autoclavagem e Tratamento Térmico</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Lote</th>
                    <th className="p-3">Equipamento</th>
                    <th className="p-3">Parâmetros (Bar / °C / Min)</th>
                    <th className="p-3">Entrada / Saída</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3 text-center">Situação / Próxima Etapa</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {registrosAutoclave.map((r) => {
                    const isEmCozimento = r.situacao === 'Em cozimento';
                    return (
                      <tr key={r.id}>
                        <td className="p-3 font-mono font-bold text-slate-900">{r.loteCodigo}</td>
                        <td className="p-3 font-bold text-rose-900">{r.autoclaveUtilizada}</td>
                        <td className="p-3 font-semibold text-slate-800">
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold">
                            {r.pressaoBar} bar • {r.temperaturaCelsius}°C • {r.tempoMinutos} min
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          {r.entrada} {r.saida ? `→ ${r.saida}` : ''}
                        </td>
                        <td className="p-3 font-semibold">{r.responsavel}</td>
                        <td className="p-3 text-center">
                          {isEmCozimento ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                              Em Cozimento
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {r.proximaEtapa || 'Aguardando Quebra Manual'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isEmCozimento ? (
                            <button
                              type="button"
                              onClick={() => handleAbrirModalSaida('autoclave', r.id, r.loteCodigo, r.autoclaveUtilizada, r.observacoes)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-[10px] cursor-pointer transition-colors shadow-xs"
                            >
                              Registrar Término
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Autoclave Liberada
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: Quebra Manual */}
      {activeStage === 'quebra' && (
        <QuebraManualView />
      )}

      {/* Stage 3: Estufa */}
      {activeStage === 'estufa' && (
        <div className="space-y-6">
          {/* Equipment Status Cards */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Status & Disponibilidade das Estufas</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                Desidratação de Amêndoas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                'Estufa 01 - Circulação 65°C',
                'Estufa 02 - Ar Quente',
                'Estufa 03 - Vácuo Seco'
              ].map((estufaNome) => {
                const emUso = registrosEstufa.find(
                  (r) => r.estufaUtilizada === estufaNome && r.situacao === 'Em processamento'
                );
                return (
                  <div
                    key={estufaNome}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      emUso
                        ? 'bg-blue-50/60 border-blue-300'
                        : 'bg-emerald-50/40 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900">{estufaNome}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                          emUso
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {emUso ? '🔴 Em Uso' : '🟢 À Disposição'}
                      </span>
                    </div>

                    {emUso ? (
                      <div className="space-y-2">
                        <div className="text-[11px] text-slate-700">
                          Lote: <strong className="font-mono text-blue-900">{emUso.loteCodigo}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Entrada: {emUso.entrada}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAbrirModalSaida('estufa', emUso.id, emUso.loteCodigo, emUso.estufaUtilizada, emUso.observacoes || '')}
                          className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registrar Término de Estufagem</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Disponível. Temperatura ideal para nova batelada.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Controle de Estufagem & Desidratação</span>
            </h2>

            <form onSubmit={handleAddEstufa} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lote</label>
                <select
                  value={estufaForm.loteId}
                  onChange={(e) => setEstufaForm({ ...estufaForm, loteId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>{l.codigo} — {l.origemDominante}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estufa Utilizada</label>
                <select
                  value={estufaForm.estufaUtilizada}
                  onChange={(e) => setEstufaForm({ ...estufaForm, estufaUtilizada: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="Estufa 01 - Circulação 65°C">Estufa 01 - Circulação 65°C</option>
                  <option value="Estufa 02 - Ar Quente">Estufa 02 - Ar Quente</option>
                  <option value="Estufa 03 - Vácuo Seco">Estufa 03 - Vácuo Seco</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Entrada (Data/Hora)</label>
                <input
                  type="text"
                  value={estufaForm.entradaDataHora}
                  onChange={(e) => setEstufaForm({ ...estufaForm, entradaDataHora: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsável Operacional</label>
                <input
                  type="text"
                  value={estufaForm.responsavel}
                  onChange={(e) => setEstufaForm({ ...estufaForm, responsavel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações Técnicas</label>
                <input
                  type="text"
                  value={estufaForm.observacoes}
                  onChange={(e) => setEstufaForm({ ...estufaForm, observacoes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar Entrada na Estufa</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Histórico de Estufagem</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Lote</th>
                    <th className="p-3">Estufa</th>
                    <th className="p-3">Entrada / Saída</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3 text-center">Situação / Próxima Etapa</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {registrosEstufa.map((r) => {
                    const isEmProcessamento = r.situacao === 'Em processamento';
                    return (
                      <tr key={r.id}>
                        <td className="p-3 font-mono font-bold text-slate-900">{r.loteCodigo}</td>
                        <td className="p-3 font-bold text-blue-900">{r.estufaUtilizada}</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          {r.entrada} {r.saida ? `→ ${r.saida}` : ''}
                        </td>
                        <td className="p-3 font-semibold">{r.responsavel}</td>
                        <td className="p-3 text-center">
                          {isEmProcessamento ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                              Em Desidratação
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {r.proximaEtapa || 'Aguardando Empacotamento'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isEmProcessamento ? (
                            <button
                              type="button"
                              onClick={() => handleAbrirModalSaida('estufa', r.id, r.loteCodigo, r.estufaUtilizada, r.observacoes || '')}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-[10px] cursor-pointer transition-colors shadow-xs"
                            >
                              Registrar Término
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Estufa Liberada
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stage 4: Empacotamento & Fechamento Diário */}
      {activeStage === 'empacotamento' && (
        <div className="space-y-6">
          {/* Automatic Summaries for Fechamento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-900 text-white p-5 rounded-3xl shadow-md border border-purple-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200 block">Produção Total do Dia</span>
              <span className="text-2xl font-black mt-1 block">{formatNumber(totalKgEmpacotadoDia, 1)} kg</span>
              <span className="text-xs text-purple-200 font-medium">{totalCaixasDia} caixas seladas</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Por Colaborador</span>
              <div className="mt-2 space-y-1">
                {Object.entries(prodPorColaborador).map(([nome, kg]: any) => (
                  <div key={nome} className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate">{nome}</span>
                    <span className="font-extrabold text-purple-700">{formatNumber(kg, 1)} kg</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Por Lote</span>
              <div className="mt-2 space-y-1">
                {Object.entries(prodPorLote).map(([lote, kg]: any) => (
                  <div key={lote} className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 font-mono">{lote}</span>
                    <span className="font-extrabold text-emerald-700">{formatNumber(kg, 1)} kg</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Por Classificação</span>
              <div className="mt-2 space-y-1">
                {Object.entries(prodPorClassificacao).map(([tipo, kg]: any) => (
                  <div key={tipo} className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate">{tipo}</span>
                    <span className="font-extrabold text-amber-700">{formatNumber(kg, 1)} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-purple-600" />
              <span>Registrar Empacotamento / Fechamento de Caixas</span>
            </h2>

            <form onSubmit={handleAddEmpacotamento} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lote</label>
                <select
                  value={empacotamentoForm.loteId}
                  onChange={(e) => setEmpacotamentoForm({ ...empacotamentoForm, loteId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>{l.codigo} — {l.origemDominante}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Classificação do Produto</label>
                <select
                  value={empacotamentoForm.classificacao}
                  onChange={(e) => setEmpacotamentoForm({ ...empacotamentoForm, classificacao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="Extra Large">Extra Large</option>
                  <option value="Large">Large</option>
                  <option value="Média">Média</option>
                  <option value="Miúda">Miúda</option>
                  <option value="Pedaço">Pedaço</option>
                  <option value="Pedacinhos">Pedacinhos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade Produzida (Kg)</label>
                <input
                  type="number"
                  value={empacotamentoForm.quantidadeProduzidaKg}
                  onChange={(e) => setEmpacotamentoForm({ ...empacotamentoForm, quantidadeProduzidaKg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peso por Caixa (Kg)</label>
                <input
                  type="number"
                  value={empacotamentoForm.pesoCaixaKg}
                  onChange={(e) => setEmpacotamentoForm({ ...empacotamentoForm, pesoCaixaKg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Caixas Produzidas</label>
                <input
                  type="number"
                  value={empacotamentoForm.caixasProduzidas}
                  onChange={(e) => setEmpacotamentoForm({ ...empacotamentoForm, caixasProduzidas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsável</label>
                <input
                  type="text"
                  value={empacotamentoForm.responsavel}
                  onChange={(e) => setEmpacotamentoForm({ ...empacotamentoForm, responsavel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar Fechamento de Empacotamento</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Histórico do Fechamento Diário de Empacotamento</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Lote</th>
                    <th className="p-3">Classificação</th>
                    <th className="p-3 text-right">Peso (Kg)</th>
                    <th className="p-3 text-right">Caixas</th>
                    <th className="p-3">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {registrosEmpacotamento.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-bold">{r.data}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{r.loteCodigo}</td>
                      <td className="p-3 font-extrabold text-purple-900">{r.classificacao}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatNumber(r.pesoTotalKg, 1)} kg</td>
                      <td className="p-3 text-right font-extrabold text-emerald-800">{r.caixasProduzidas} caixas</td>
                      <td className="p-3 text-slate-600">{r.responsavel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Término do Ciclo & Liberação de Equipamento */}
      {modalSaida && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Registrar Término do Ciclo & Liberar Equipamento</span>
              </div>
              <button
                type="button"
                onClick={() => setModalSaida(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-amber-900">
                Lote: <span className="font-mono">{modalSaida.loteCodigo}</span>
              </div>
              <div className="text-amber-800">
                Equipamento em Uso: <strong>{modalSaida.equipamento}</strong>
              </div>
              <div className="text-slate-600 text-[11px] pt-1">
                Ao registrar o término do ciclo, o equipamento ficará <strong className="text-emerald-700">À DISPOSIÇÃO</strong> para o próximo lote, e este lote avançará para o status de <strong className="text-amber-900">Aguardando Próxima Etapa</strong>.
              </div>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Data de Saída</label>
                  <input
                    type="date"
                    value={modalSaida.dataSaida}
                    onChange={(e) => setModalSaida({ ...modalSaida, dataSaida: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Horário de Saída</label>
                  <input
                    type="time"
                    value={modalSaida.horarioSaida}
                    onChange={(e) => setModalSaida({ ...modalSaida, horarioSaida: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Observações do Término do Ciclo (Umidade %, parâmetros finais, etc.)</label>
                <textarea
                  rows={2}
                  value={modalSaida.observacoes}
                  onChange={(e) => setModalSaida({ ...modalSaida, observacoes: e.target.value })}
                  placeholder="Ex: Ciclo concluído com sucesso. Equipamento limpo e liberado para a próxima carga."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-normal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalSaida(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarSaida}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Término & Liberar Equipamento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
