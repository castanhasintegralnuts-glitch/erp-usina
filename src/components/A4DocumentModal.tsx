import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatBRL, formatDateBR, formatNumber } from '../utils/conversions';
import { Printer, Download, Share2, X, Factory, ShieldCheck, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import logoImg from '../assets/images/integral_nuts_logo_1785983199171.jpg';

export const A4DocumentModal: React.FC = () => {
  const { docPreview, setDocPreview, addToast, empresaConfig } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  if (!docPreview) return null;

  const { tipo, data } = docPreview;
  const docMeta = data?.docMeta || {};
  const extraData = data?.extraData || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      addToast('Gerando documento PDF A4...', 'info');
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${tipo.replace(/ /g, '_')}_${docMeta.numeroDocumento || 'MD'}.pdf`);
      addToast('Download do PDF concluído com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao exportar PDF. Tente imprimir diretamente.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06120B]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0E281C] rounded-2xl shadow-2xl border border-[#1B4731] w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        
        {/* Top Control Bar */}
        <div className="bg-[#06140B] text-white p-4 border-b border-[#1B4731] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40">
              Visualização A4
            </span>
            <span className="font-bold text-sm text-white">{tipo} • {docMeta.numeroDocumento || 'MD-DOC'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#1B4D2E] hover:bg-[#143D23] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow border border-emerald-500/30"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              Imprimir / Salvar PDF
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 bg-[#153825] hover:bg-[#1A452E] text-amber-100 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-[#235C3E]"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Baixar PDF
            </button>

            <button
              onClick={() => setDocPreview(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#153825]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas (A4 Dimensions) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-[#081810] flex justify-center flex-1">
          <div
            ref={printRef}
            id="printable-a4-document"
            className="bg-[#FAF8F5] text-slate-900 p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] shadow-2xl font-sans text-xs space-y-6 flex flex-col justify-between"
            style={{ boxSizing: 'border-box' }}
          >
            {/* DOCUMENT HEADER */}
            <div className="space-y-4 border-b-2 border-[#143D23] pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={empresaConfig?.logotipoUrl || logoImg}
                    alt="Logo da Empresa"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-600/60 shadow-xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h1 className="text-base font-black tracking-tight text-[#143D23]">
                      {(empresaConfig?.razaoSocial || empresaConfig?.nomeFantasia || 'INTEGRAL NUTS — MONTE DOURADO').toUpperCase()}
                    </h1>
                    <div className="text-[10px] font-bold text-[#6E3B19] uppercase tracking-wider mb-0.5">
                      QUALIDADE • ORIGEM • CONFIANÇA
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      {empresaConfig?.unidadeIndustrial || 'Unidade Industrial de Monte Dourado — Pará (Vale do Jari)'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      CNPJ: {empresaConfig?.cnpj || '18.293.001/0001-44'} • {empresaConfig?.endereco || 'Rodovia Almeirim - Monte Dourado, Km 12'} • {empresaConfig?.municipioUF || 'Almeirim / Monte Dourado - PA'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-[#143D23] text-white font-bold text-xs px-3 py-1 rounded">
                    {tipo.toUpperCase()}
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    Nº {docMeta.numeroDocumento || 'MD-2026-001'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Emissão: {docMeta.dataEmissao || new Date().toLocaleDateString('pt-BR')} às {docMeta.horarioEmissao || '10:00'}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-amber-50/80 rounded text-[10px] flex items-center justify-between font-mono border border-amber-200">
                <span>CÓDIGO DE RASTREABILIDADE: <strong>{docMeta.codigoRastreabilidade || 'MD-TRC-2026-X'}</strong></span>
                <span>RESPONSÁVEL: {docMeta.responsavel || 'SISTEMA MONTE DOURADO'}</span>
              </div>
            </div>


            {/* DOCUMENT SPECIFIC BODY CONTENT */}
            <div className="flex-1 space-y-6">
              
              {/* IF ROMANEIO DE ENTRADA */}
              {(tipo === 'Romaneio de Entrada' || (tipo === 'Recibo' && extraData?.recebimento)) && (
                <div className="space-y-4">
                  {/* Fornecedor section */}
                  <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                    <h2 className="font-bold text-xs text-slate-900 uppercase border-b pb-1">DADOS DO FORNECEDOR E ORIGEM</h2>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><strong>Nome/Razão:</strong> {extraData?.recebimento?.fornecedorNome || extraData?.fornecedorNome}</div>
                      <div><strong>Comunidade:</strong> {extraData?.recebimento?.comunidade || 'Arumanduba'} ({extraData?.recebimento?.municipio || 'Almeirim'})</div>
                      <div><strong>Origem Castanha:</strong> {extraData?.recebimento?.origemCastanha}</div>
                      <div><strong>Safra:</strong> {extraData?.recebimento?.safra}</div>
                      <div><strong>Veículo/Barco:</strong> {extraData?.recebimento?.veiculo} (Placa: {extraData?.recebimento?.placa || '-'})</div>
                      <div><strong>Motorista:</strong> {extraData?.recebimento?.motorista || '-'}</div>
                    </div>
                  </div>

                  {/* Quantities Table */}
                  <div>
                    <h2 className="font-bold text-xs text-slate-900 uppercase mb-2">MEDIÇÃO E CONVERSÃO DE QUANTIDADES</h2>
                    <table className="w-full border-collapse border border-slate-300 text-center text-[11px]">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold">
                          <th className="border border-slate-300 p-1.5">Qtd Bruta (hl)</th>
                          <th className="border border-slate-300 p-1.5">Qtd Latas (hl × 5)</th>
                          <th className="border border-slate-300 p-1.5">Peso Líquido (kg)</th>
                          <th className="border border-slate-300 p-1.5">Descontos (hl)</th>
                          <th className="border border-slate-300 p-1.5">Qtd Líquida (hl)</th>
                          <th className="border border-slate-300 p-1.5">Latas Líquidas</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-2 font-bold">{extraData?.recebimento?.quantidadeBrutaHl} hl</td>
                          <td className="border border-slate-300 p-2">{extraData?.recebimento?.quantidadeBrutaLatas} latas</td>
                          <td className="border border-slate-300 p-2">{extraData?.recebimento?.pesoLiquidoKg || '-'} kg</td>
                          <td className="border border-slate-300 p-2 text-rose-700 font-bold">{extraData?.recebimento?.quantidadeDescontadaHl || 0} hl</td>
                          <td className="border border-slate-300 p-2 font-black text-emerald-900">{extraData?.recebimento?.quantidadeLiquidaHl} hl</td>
                          <td className="border border-slate-300 p-2 font-bold">{extraData?.recebimento?.quantidadeLiquidaLatas} latas</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Destinos Breakdown */}
                  <div>
                    <h2 className="font-bold text-xs text-slate-900 uppercase mb-2">DESTINAÇÃO E ARMAZENAMENTO NA FÁBRICA</h2>
                    <table className="w-full border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold">
                          <th className="border border-slate-300 p-1.5 text-left">Destino</th>
                          <th className="border border-slate-300 p-1.5 text-center">Hectolitros</th>
                          <th className="border border-slate-300 p-1.5 text-center">Equiv. Latas</th>
                          <th className="border border-slate-300 p-1.5 text-left">Local de Armazenamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extraData?.recebimento?.destinos?.map((d: any) => (
                          <tr key={d.destino}>
                            <td className="border border-slate-300 p-2 font-bold">{d.destino}</td>
                            <td className="border border-slate-300 p-2 text-center">{d.quantidadeHectolitros} hl</td>
                            <td className="border border-slate-300 p-2 text-center">{d.quantidadeLatas} latas</td>
                            <td className="border border-slate-300 p-2">{d.localArmazenamento}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Values */}
                  <div className="p-4 bg-slate-900 text-white rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div>Valor por Hectolitro: <strong>{formatBRL(extraData?.recebimento?.compra?.valorPorHectolitro)}/hl</strong></div>
                      <div>Equivalente por Lata: <strong>{formatBRL(extraData?.recebimento?.compra?.valorEquivalentePorLata)}/lata</strong></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">VALOR LÍQUIDO A PAGAR</div>
                      <div className="text-lg font-black text-emerald-400">
                        {formatBRL(extraData?.recebimento?.compra?.valorLiquido)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IF RECIBO DE QUEBRA */}
              {tipo === 'Recibo de Quebra' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                    <h2 className="font-bold text-xs text-slate-900 uppercase border-b pb-1">DADOS DO COMPROVANTE DE QUEBRA</h2>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><strong>Colaborador(a):</strong> {extraData?.quebradorNome}</div>
                      <div><strong>Código do Recibo:</strong> {extraData?.codigo}</div>
                      <div><strong>Data de Pagamento:</strong> {extraData?.dataPagamento}</div>
                      <div><strong>Forma de Pagamento:</strong> {extraData?.formaPagamento}</div>
                      <div><strong>Responsável:</strong> {extraData?.responsavel}</div>
                      <div><strong>Observações:</strong> {extraData?.observacoes || 'Sem observações'}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">VALOR LÍQUIDO PAGO</div>
                      <div className="text-xl font-black text-emerald-400">
                        {formatBRL(extraData?.valorPago)}
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div>Período Lido: {extraData?.periodoInicio} a {extraData?.periodoFim}</div>
                      <div className="text-emerald-300 font-bold">Status: LIQUIDADO / PAGO</div>
                    </div>
                  </div>
                </div>
              )}

              {/* IF FOLHA DE QUEBRA CONSOLIDADA */}
              {tipo === 'Folha de Quebra' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                    <h2 className="font-bold text-xs text-slate-900 uppercase border-b pb-1">FOLHA CONSOLIDADA DA QUEBRA MANUAL</h2>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><strong>Data do Relatório:</strong> {extraData?.dataImpressao}</div>
                      <div><strong>Unidade Industrial:</strong> Monte Dourado, PA</div>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-bold">
                        <th className="border border-slate-300 p-1.5 text-left">Matrícula</th>
                        <th className="border border-slate-300 p-1.5 text-left">Quebrador(a)</th>
                        <th className="border border-slate-300 p-1.5 text-right">Produzido R$</th>
                        <th className="border border-slate-300 p-1.5 text-right">Pago R$</th>
                        <th className="border border-slate-300 p-1.5 text-right">Pendente R$</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extraData?.summaries?.map((s: any) => (
                        <tr key={s.quebrador.id}>
                          <td className="border border-slate-300 p-1.5 font-mono">{s.quebrador.matricula}</td>
                          <td className="border border-slate-300 p-1.5 font-bold">{s.quebrador.nome}</td>
                          <td className="border border-slate-300 p-1.5 text-right">{formatBRL(s.totalProduzidoR$)}</td>
                          <td className="border border-slate-300 p-1.5 text-right text-emerald-800">{formatBRL(s.totalPagoR$)}</td>
                          <td className="border border-slate-300 p-1.5 text-right text-amber-800 font-bold">{formatBRL(s.totalPendenteR$)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="p-4 bg-slate-900 text-white rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div>Total Pago: <strong>{formatBRL(extraData?.totalGeralPago)}</strong></div>
                      <div>Total Pendente: <strong>{formatBRL(extraData?.totalGeralPendente)}</strong></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">VALOR TOTAL DA FOLHA DE QUEBRA</div>
                      <div className="text-xl font-black text-amber-400">
                        {formatBRL(extraData?.totalFolhaGeralProduzida)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IF RELATÓRIO DE CUSTO DO LOTE */}
              {tipo === 'Relatório de Custo do Lote' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                    <h2 className="font-bold text-xs text-slate-900 uppercase border-b pb-1">DADOS DO LOTE E CUSTOS INTEGRADOS</h2>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><strong>Código do Lote:</strong> {extraData?.lote?.codigo}</div>
                      <div><strong>Fornecedor:</strong> {extraData?.lote?.fornecedorNome}</div>
                      <div><strong>Qtd Hectolitros:</strong> {extraData?.lote?.quantidadeAtualHl} HL</div>
                      <div><strong>Origem:</strong> {extraData?.lote?.origem}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-lg grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div>Custo Matéria-Prima: <strong>{formatBRL(extraData?.custoAquisicaoMateriaPrima)}</strong></div>
                      <div>Mão de Obra de Quebra: <strong className="text-amber-400">{formatBRL(extraData?.totalCustoQuebraLote)}</strong></div>
                      <div>Impacto da Quebra: <strong>{formatNumber(extraData?.impactoMaoDeObraPct, 1)}%</strong></div>
                    </div>
                    <div className="text-right border-l border-slate-700 pl-4">
                      <div className="text-[10px] text-slate-400">CUSTO FINAL POR KG AMÊNDOA</div>
                      <div className="text-2xl font-black text-cyan-300">
                        {formatBRL(extraData?.custoFinalPorKgBeneficiado)}/kg
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IF CONTRATO DE COMPRA FUTURA */}
              {(tipo === 'Contrato de Compra Futura' || tipo === 'Contrato de Compra' || tipo === 'Contrato') && (
                <div className="space-y-4 text-slate-800 text-[11px] leading-relaxed">
                  
                  {/* Contract Header & Title Box */}
                  <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-xl space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                      <h2 className="font-black text-xs text-amber-950 uppercase tracking-tight flex items-center gap-1.5">
                        📜 CONTRATO DE COMPRA E VENDA DE MATÉRIA-PRIMA A TERMO (COMPRA FUTURA)
                      </h2>
                      <span className="text-[10px] bg-amber-900 text-amber-100 font-extrabold px-2 py-0.5 rounded">
                        CONTRATO #{extraData?.compra?.codigo || extraData?.codigo || docMeta.numeroDocumento || 'MD-CMP'}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-900 font-medium">
                      Instrumento particular de promessa de compra e venda de castanha-do-pará em casca in natura com vinculação de preço sobre adiantamento e entrega a termo na fábrica da Integral NUTS em Monte Dourado - PA.
                    </p>
                  </div>

                  {/* Quadros Resumo da Negociação */}
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
                      <div className="font-extrabold text-[#143D23] uppercase border-b border-slate-200 pb-1 text-[10px]">
                        DADOS DO COMPRADOR & FABRICAÇÃO
                      </div>
                      <div><strong>Razão Social:</strong> INTEGRAL NUTS LTDA</div>
                      <div><strong>CNPJ:</strong> 18.293.001/0001-44</div>
                      <div><strong>Unidade:</strong> Parque Industrial de Monte Dourado - PA</div>
                      <div><strong>Endereço:</strong> Rod. Almeirim - Monte Dourado, Km 12</div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
                      <div className="font-extrabold text-[#143D23] uppercase border-b border-slate-200 pb-1 text-[10px]">
                        DADOS DO VENDEDOR / PRODUTOR
                      </div>
                      <div><strong>Nome / Produtor:</strong> {extraData?.compra?.fornecedorNome || extraData?.fornecedorNome || extraData?.beneficiarioNome || 'Produtor Extrativista'}</div>
                      <div><strong>Comunidade:</strong> {extraData?.compra?.comunidade || extraData?.comunidade || 'Comunidade Extrativista'}</div>
                      <div><strong>Município / UF:</strong> {extraData?.compra?.municipio || extraData?.municipio || 'Almeirim / Monte Dourado - PA'}</div>
                      <div><strong>Origem Castanha:</strong> {extraData?.compra?.localOrigemCastanha || extraData?.localOrigemCastanha || 'Vale do Jari / Calha do Rio Jari'}</div>
                    </div>
                  </div>

                  {/* Cláusulas do Contrato */}
                  <div className="space-y-3 pt-1">
                    
                    {/* Cláusula 1 */}
                    <div className="bg-white p-3 border border-slate-300 rounded-lg space-y-1">
                      <h3 className="font-extrabold text-[11px] text-[#143D23] uppercase">
                        CLÁUSULA PRIMEIRA — DO OBJETO E VOLUME NEGOCIADO
                      </h3>
                      <p className="text-[10.5px] text-slate-700">
                        O VENDEDOR compromete-se a vender e entregar à COMPRADORA, e esta compromete-se a adquirir a quantidade estimada de{' '}
                        <strong className="text-slate-900 font-extrabold">
                          {(extraData?.compra?.quantidadeHectolitrosPrevista || extraData?.quantidadeHectolitrosPrevista || 0)} HL
                        </strong>{' '}
                        (equivalente a{' '}
                        <strong className="text-slate-900 font-extrabold">
                          {(extraData?.compra?.quantidadeLatasPrevista || extraData?.quantidadeLatasPrevista || 0)} latas de 20 litros
                        </strong>
                        , na proporção padrão de 1 HL = 5 latas) de castanha-do-pará em casca *in natura*, proveniente de manejo extrativista sustentável da safra vigente.
                      </p>
                    </div>

                    {/* Cláusula 2: Preço, Adiantamento e Vinculação */}
                    <div className="bg-[#0B1E14] text-white p-3.5 rounded-xl space-y-2 border border-[#1B4731]">
                      <h3 className="font-black text-xs text-amber-300 uppercase tracking-tight flex items-center justify-between">
                        <span>CLÁUSULA SEGUNDA — DO PREÇO, ADIANTAMENTO E REGRA DE VINCULAÇÃO</span>
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
                          PREÇO CONTRATADO: {formatBRL(extraData?.compra?.valorPorHectolitro || extraData?.valorPorHectolitro || 0)} / HL
                        </span>
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-900/90 p-2.5 rounded-lg border border-slate-700">
                        <div>
                          <span className="text-slate-400 block font-medium">Preço Unitário Contratado</span>
                          <strong className="text-amber-300 text-xs font-bold block">
                            {formatBRL(extraData?.compra?.valorPorHectolitro || extraData?.valorPorHectolitro || 0)}/HL
                          </strong>
                          <span className="text-[9px] text-slate-400">
                            ({formatBRL((extraData?.compra?.valorPorHectolitro || extraData?.valorPorHectolitro || 0) / 5)}/lata)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Adiantamento Concedido</span>
                          <strong className="text-emerald-400 text-xs font-bold block">
                            {formatBRL(extraData?.compra?.adiantamento || extraData?.adiantamento || 0)}
                          </strong>
                          <span className="text-[9px] text-emerald-300">Pago antecipadamente</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Valor Total Estimado Carga</span>
                          <strong className="text-white text-xs font-bold block">
                            {formatBRL(extraData?.compra?.valorTotalEstimado || extraData?.valorTotalEstimado || 0)}
                          </strong>
                          <span className="text-[9px] text-slate-400">Sujeito a medição física</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-200 leading-snug font-mono bg-emerald-950/60 p-2 rounded border border-emerald-800/60">
                        📌 <strong>Regra de Vinculação Exclusiva:</strong> O valor adiantado de{' '}
                        <strong>{formatBRL(extraData?.compra?.adiantamento || extraData?.adiantamento || 0)}</strong> fixa e vincula o preço contratado de{' '}
                        <strong>{formatBRL(extraData?.compra?.valorPorHectolitro || extraData?.valorPorHectolitro || 0)}/HL</strong> exclusivamente para a quantidade correspondente amortizada pelo adiantamento ({((extraData?.compra?.valorPorHectolitro || extraData?.valorPorHectolitro || 0) > 0 ? ((extraData?.compra?.adiantamento || extraData?.adiantamento || 0) / (extraData?.compra?.valorPorHectolitro || extraData?.valorPorHectolitro || 1)).toFixed(1) : '0.0')} HL). Qualquer volume excedente entregue na fábrica na data da medição (Saldo na Medição) será liquidado pelo <strong>Preço Aberto praticado na data da recepção física</strong>.
                      </p>
                    </div>

                    {/* Cláusula 3 */}
                    <div className="bg-white p-3 border border-slate-300 rounded-lg space-y-1">
                      <h3 className="font-extrabold text-[11px] text-[#143D23] uppercase">
                        CLÁUSULA TERCEIRA — DO PRAZO, LOCAL E CONDIÇÕES DE ENTREGA
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div>
                          <strong>Data Limite de Entrega:</strong>{' '}
                          <span className="font-extrabold text-[#143D23]">
                            {extraData?.compra?.dataPrevistaEntrega || extraData?.dataPrevistaEntrega || 'A combinar'}
                          </span>
                        </div>
                        <div>
                          <strong>Local de Recebimento:</strong> Unidade Industrial Integral Nuts — Monte Dourado, PA
                        </div>
                        <div>
                          <strong>Forma de Pagamento do Saldo:</strong>{' '}
                          {extraData?.compra?.formaPagamentoPrevista || extraData?.formaPagamentoPrevista || 'PIX / Transferência Bancária'}
                        </div>
                        <div>
                          <strong>Observações da Operação:</strong>{' '}
                          {extraData?.compra?.observacoes || extraData?.observacoes || 'Nenhuma observação cadastrada'}
                        </div>
                      </div>
                    </div>

                    {/* Cláusula 4 */}
                    <div className="bg-slate-50 p-3 border border-slate-300 rounded-lg space-y-1 text-[10px] text-slate-700">
                      <h3 className="font-extrabold text-[11px] text-[#143D23] uppercase">
                        CLÁUSULA QUARTA — DA MEDIÇÃO, AVALIAÇÃO DE QUALIDADE E DIVERGÊNCIAS
                      </h3>
                      <p>
                        A quantidade e qualidade definitivas serão apuradas no ato do descarregamento na fábrica em Monte Dourado através de amostragem representativa, aferindo grau de umidade, taxa de chochas/podres e rendimento em massa. Eventuais deságios por qualidade serão aplicados conforme tabela oficial da Usina.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* IF ROMANEIO DE RETIRADA */}
              {tipo === 'Romaneio de Retirada' && (
                <div className="space-y-4">
                  {/* Header / Cliente / Transporte info */}
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
                    <h2 className="font-extrabold text-xs text-slate-900 uppercase border-b border-slate-200 pb-1">
                      DADOS DE IDENTIFICAÇÃO E RETIRADA
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><strong>Cliente / Destinatário:</strong> {extraData?.romaneio?.clienteNome || extraData?.clienteNome || 'Cliente não informado'}</div>
                      <div><strong>CPF / CNPJ:</strong> {extraData?.romaneio?.clienteCpfCnpj || extraData?.clienteCpfCnpj || '-'}</div>
                      <div><strong>Transportadora:</strong> {extraData?.romaneio?.transportadora || extraData?.transportadora || 'Retirada na Usina / Não informada'}</div>
                      <div><strong>Data de Retirada / Emissão:</strong> {formatDateBR(extraData?.romaneio?.dataEmissao || docMeta.dataEmissao)}</div>
                      <div className="col-span-2"><strong>Condição de Pagamento do Pedido:</strong> <span className="font-bold text-emerald-900">{extraData?.romaneio?.condicaoPagamento || extraData?.condicaoPagamento || 'À Vista'}</span></div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <h2 className="font-extrabold text-xs text-slate-900 uppercase mb-2">
                      ITENS DO ROMANEIO DE RETIRADA / PEDIDO DE VENDA
                    </h2>
                    <table className="w-full border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold">
                          <th className="border border-slate-300 p-2 text-left w-20">NF-e</th>
                          <th className="border border-slate-300 p-2 text-left">Produto</th>
                          <th className="border border-slate-300 p-2 text-center w-24">Quantidade</th>
                          <th className="border border-slate-300 p-2 text-right w-32">Valor Unit. (R$)</th>
                          <th className="border border-slate-300 p-2 text-right w-36">Valor Total Item (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(extraData?.romaneio?.itens || extraData?.itens || []).map((item: any, idx: number) => {
                          const q = Number(item.quantidade) || 0;
                          const vu = item.valorUnitario !== undefined ? Number(item.valorUnitario) : (q > 0 ? Number(item.valor) / q : Number(item.valor));
                          const totalItem = Math.round(q * vu * 100) / 100 || Number(item.valor) || 0;

                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50">
                              <td className="border border-slate-300 p-2 font-mono font-bold text-slate-900">{item.nf}</td>
                              <td className="border border-slate-300 p-2 font-medium text-slate-800">{item.produto}</td>
                              <td className="border border-slate-300 p-2 text-center font-bold">{formatNumber(q, 0)}</td>
                              <td className="border border-slate-300 p-2 text-right font-medium text-slate-700">{formatBRL(vu)}</td>
                              <td className="border border-slate-300 p-2 text-right font-bold text-emerald-900">{formatBRL(totalItem)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-black text-slate-900 text-xs border-t-2 border-slate-400">
                          <td colSpan={2} className="border border-slate-300 p-2.5 text-right uppercase">
                            Resumo do Romaneio / Pedido:
                          </td>
                          <td className="border border-slate-300 p-2.5 text-center font-black bg-slate-200">
                            <span className="text-[10px] text-slate-500 font-normal block">Qtd Total</span>
                            {formatNumber(extraData?.romaneio?.quantidadeTotal ?? extraData?.quantidadeTotal ?? 0, 0)}
                          </td>
                          <td className="border border-slate-300 p-2.5 text-right font-bold bg-slate-100" colSpan={1}>
                            <span className="text-[10px] text-slate-500 font-normal block">Preço Médio/Un.</span>
                            {formatBRL(
                              (extraData?.romaneio?.quantidadeTotal ?? extraData?.quantidadeTotal ?? 0) > 0
                                ? (extraData?.romaneio?.valorTotal ?? extraData?.valorTotal ?? 0) / (extraData?.romaneio?.quantidadeTotal ?? extraData?.quantidadeTotal ?? 1)
                                : 0
                            )}
                          </td>
                          <td className="border border-slate-300 p-2.5 text-right font-black text-emerald-900 bg-emerald-50">
                            <span className="text-[10px] text-slate-500 font-normal block">Valor Total Pedido</span>
                            {formatBRL(extraData?.romaneio?.valorTotal ?? extraData?.valorTotal ?? 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Parcelas Table if available */}
                  {((extraData?.romaneio?.parcelas && extraData.romaneio.parcelas.length > 0) || (extraData?.parcelas && extraData.parcelas.length > 0)) && (
                    <div>
                      <h2 className="font-extrabold text-xs text-slate-900 uppercase mb-2">
                        CRONOGRAMA DE PAGAMENTO E PARCELAS DO PEDIDO
                      </h2>
                      <table className="w-full border-collapse border border-slate-300 text-[11px]">
                        <thead>
                          <tr className="bg-slate-800 text-white font-bold">
                            <th className="border border-slate-400 p-1.5 text-center w-16">Parcela</th>
                            <th className="border border-slate-400 p-1.5 text-center w-28">Vencimento</th>
                            <th className="border border-slate-400 p-1.5 text-right w-32">Valor (R$)</th>
                            <th className="border border-slate-400 p-1.5 text-left">Forma de Pagamento</th>
                            <th className="border border-slate-400 p-1.5 text-center w-24">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(extraData?.romaneio?.parcelas || extraData?.parcelas || []).map((parc: any, idx: number) => (
                            <tr key={parc.id || idx} className="hover:bg-slate-50">
                              <td className="border border-slate-300 p-1.5 text-center font-bold">{parc.numero}ª Parcela</td>
                              <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-800">{formatDateBR(parc.dataVencimento)}</td>
                              <td className="border border-slate-300 p-1.5 text-right font-bold text-emerald-900">{formatBRL(parc.valor)}</td>
                              <td className="border border-slate-300 p-1.5">{parc.formaPagamento || 'Boleto/PIX'}</td>
                              <td className="border border-slate-300 p-1.5 text-center font-bold">{parc.status || 'Pendente'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {extraData?.romaneio?.observacoes && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-[10.5px]">
                      <strong>Observações:</strong> {extraData?.romaneio?.observacoes}
                    </div>
                  )}
                </div>
              )}

              {/* IF RELATÓRIO CONSOLIDADO / SÍNTESE */}
              {tipo !== 'Romaneio de Entrada' && tipo !== 'Recibo' && tipo !== 'Recibo de Quebra' && tipo !== 'Folha de Quebra' && tipo !== 'Relatório de Custo do Lote' && tipo !== 'Contrato de Compra Futura' && tipo !== 'Contrato de Compra' && tipo !== 'Contrato' && tipo !== 'Romaneio de Retirada' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                    <h2 className="font-bold text-xs text-slate-900 uppercase border-b pb-1">
                      {extraData?.titulo || 'RELATÓRIO CONSOLIDADO DE INFORMAÇÕES'}
                    </h2>
                    <p className="text-[11px] text-slate-600">
                      {extraData?.descricao || 'Extrato consolidado emitido pelo sistema operacional da fábrica Integral NUTS em Monte Dourado - PA.'}
                    </p>
                  </div>

                  {/* Indicadores Consolidados */}
                  {extraData?.indicadores && extraData.indicadores.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {extraData.indicadores.map((ind: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-900 text-white rounded-lg flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{ind.label}</span>
                          <span className="text-base font-black text-amber-300 mt-1">{ind.valor}</span>
                          {ind.detalhe && <span className="text-[10px] text-emerald-300 font-semibold mt-0.5">{ind.detalhe}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Itens do Relatório */}
                  {extraData?.itens && extraData.itens.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-xs uppercase text-slate-900">Detalhamento dos Registros Consolidados</h3>
                      <table className="w-full border-collapse border border-slate-300 text-[11px]">
                        <thead>
                          <tr className="bg-slate-200 text-slate-900 font-bold">
                            {extraData?.colunas ? (
                              extraData.colunas.map((col: string, i: number) => (
                                <th key={i} className="border border-slate-300 p-1.5 text-left">{col}</th>
                              ))
                            ) : (
                              <>
                                <th className="border border-slate-300 p-1.5 text-left">Item / Identificação</th>
                                <th className="border border-slate-300 p-1.5 text-center">Quantidade</th>
                                <th className="border border-slate-300 p-1.5 text-right">Valor / Posição</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {extraData.itens.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {Array.isArray(row) ? (
                                row.map((cell: any, cIdx: number) => (
                                  <td key={cIdx} className="border border-slate-300 p-1.5">{cell}</td>
                                ))
                              ) : (
                                <>
                                  <td className="border border-slate-300 p-1.5 font-bold">{row.col1 || row.nome || row.codigo}</td>
                                  <td className="border border-slate-300 p-1.5 text-center">{row.col2 || row.quantidade || row.qtd}</td>
                                  <td className="border border-slate-300 p-1.5 text-right font-semibold">{row.col3 || row.valor || row.situacao}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* DOCUMENT FOOTER & SIGNATURES */}
            <div className="space-y-6 pt-6 border-t border-slate-300 text-[10px]">
              {(tipo === 'Contrato de Compra Futura' || tipo === 'Contrato de Compra' || tipo === 'Contrato') ? (
                <div className="space-y-4 pt-2">
                  <div className="text-center font-semibold text-slate-700 text-[10px]">
                    Monte Dourado - PA, {docMeta.dataEmissao || new Date().toLocaleDateString('pt-BR')}
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-6 text-center">
                    <div>
                      <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                        INTEGRAL NUTS — UNIDADE MONTE DOURADO
                      </div>
                      <div className="text-[9px] text-slate-500">Compradora / Representante Legal</div>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                        {extraData?.compra?.fornecedorNome || extraData?.fornecedorNome || extraData?.beneficiarioNome || 'Vendedor / Fornecedor Extrativista'}
                      </div>
                      <div className="text-[9px] text-slate-500">Vendedor / Produtor Extrativista</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4 text-center">
                    <div>
                      <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-600">
                        Testemunha 1 (Nome e CPF)
                      </div>
                    </div>
                    <div>
                      <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-600">
                        Testemunha 2 (Nome / CPF)
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-slate-400 text-[9px] pt-2 border-t border-slate-200">
                    Contrato impresso para assinatura física. Via oficial de registro da fábrica Integral NUTS — Monte Dourado, PA.
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-12 pt-8 text-center">
                    <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                      {tipo === 'Romaneio de Retirada' ? 'Assinatura do Motorista / Retirante' : 'Assinatura do Fornecedor / Entregador'}
                    </div>
                    <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                      {tipo === 'Romaneio de Retirada' ? 'Conferente / Responsável da Expedição (Monte Dourado)' : 'Responsável pelo Recebimento (Monte Dourado)'}
                    </div>
                  </div>

                  <div className="text-center text-slate-400 text-[9px] pt-4">
                    Este documento é via oficial de conferência da fábrica Integral NUTS, Monte Dourado • Módulo Expedição & Romaneio de Retirada
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
