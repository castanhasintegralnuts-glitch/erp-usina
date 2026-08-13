import { ItemDestino, Recebimento, DestinoTipo } from '../types';

/**
 * Integral NUTS Monte Dourado Factory Rules:
 * - 1 Hectolitro (hl) = 5 Latas
 * - 1 Volume = 1 Hectolitro (hl)
 * - 1 Lote Padrão Industrial = 80 Volumes (80 hl = 400 Latas)
 */
export const LATAS_PER_HL = 5;
export const VOLUMES_PER_LOTE = 80; // Cada lote é formado por 80 volumes
export const HL_PER_VOLUME = 1; // Cada volume equivale a 1 hectolitro

export function hlToLatas(hl: number): number {
  return Math.round((hl * LATAS_PER_HL) * 100) / 100;
}

export function latasToHl(latas: number): number {
  return Math.round((latas / LATAS_PER_HL) * 100) / 100;
}

/**
 * Converts hectoliters/volumes to standard lot metrics
 * (80 volumes per lot)
 */
export function calculateLoteMetrics(quantidadeHl: number) {
  const volumes = quantidadeHl; // 1 volume = 1 hl
  const lotesCompletos = Math.floor(volumes / VOLUMES_PER_LOTE);
  const sobraVolumes = Math.round((volumes % VOLUMES_PER_LOTE) * 100) / 100;
  const porcentagemOcupacao = Math.min(100, Math.round((volumes / VOLUMES_PER_LOTE) * 100));

  return {
    volumes,
    lotesCompletos,
    sobraVolumes,
    porcentagemOcupacao,
    capacidadePadraoVolumes: VOLUMES_PER_LOTE,
  };
}

export function calculateRealKgFactors(
  pesoLiquidoKg: number | undefined,
  hl: number
): { kgPorHl: number | undefined; kgPorLata: number | undefined } {
  if (!pesoLiquidoKg || pesoLiquidoKg <= 0 || hl <= 0) {
    return { kgPorHl: undefined, kgPorLata: undefined };
  }
  const kgPorHl = Math.round((pesoLiquidoKg / hl) * 100) / 100;
  const kgPorLata = Math.round((pesoLiquidoKg / (hl * LATAS_PER_HL)) * 100) / 100;
  return { kgPorHl, kgPorLata };
}

/**
 * Validates if the sum of all item destinations equals the approved net quantity (or approved hl)
 */
export function validateDestinationsSum(
  destinos: ItemDestino[],
  quantidadeLiquidaAprovadaHl: number
): { isValid: boolean; somaAtual: number; diferenca: number } {
  const somaAtual = destinos.reduce((acc, curr) => acc + (curr.quantidadeHectolitros || 0), 0);
  const roundedSoma = Math.round(somaAtual * 100) / 100;
  const roundedAprovada = Math.round(quantidadeLiquidaAprovadaHl * 100) / 100;
  const diferenca = Math.round((roundedAprovada - roundedSoma) * 100) / 100;

  return {
    isValid: Math.abs(diferenca) < 0.001,
    somaAtual: roundedSoma,
    diferenca,
  };
}

export function formatBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

export function formatNumber(valor: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(valor || 0);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

export function generateReceiptCode(seq: number, year: number = 2026): string {
  const numFormatted = String(seq).padStart(4, '0');
  return `MD-REC-${year}-${numFormatted}`;
}

export function generateBatchCode(seq: number, year: number = 2026): string {
  const numFormatted = String(seq).padStart(4, '0');
  return `MD-LOT-${year}-${numFormatted}`;
}

export function generateDocCode(prefix: string, seq: number): string {
  const numFormatted = String(seq).padStart(5, '0');
  return `${prefix}-2026-${numFormatted}`;
}

/**
 * Calculates current available stock divided into Monte Dourado categories
 */
export function calculateStockSummaries(recebimentos: Recebimento[]) {
  let beneficiamentoHl = 0;
  let vendaComCascaHl = 0;
  let quarentenaHl = 0;
  let devolucaoHl = 0;
  let descarteHl = 0;

  let valorTotalBeneficiamento = 0;
  let valorTotalVendaComCasca = 0;

  recebimentos.forEach((rec) => {
    if (rec.cancelado) return;

    const valorUnitarioHl = rec.compra?.valorPorHectolitro || 0;

    rec.destinos.forEach((dest) => {
      const q = dest.quantidadeHectolitros || 0;
      switch (dest.destino) {
        case 'Beneficiamento':
          beneficiamentoHl += q;
          valorTotalBeneficiamento += q * valorUnitarioHl;
          break;
        case 'Venda com Casca':
          vendaComCascaHl += q;
          valorTotalVendaComCasca += q * valorUnitarioHl;
          break;
        case 'Quarentena':
          quarentenaHl += q;
          break;
        case 'Devolução':
          devolucaoHl += q;
          break;
        case 'Descarte':
          descarteHl += q;
          break;
      }
    });
  });

  const custoMedioBeneficiamentoHl = beneficiamentoHl > 0 ? valorTotalBeneficiamento / beneficiamentoHl : 0;
  const custoMedioVendaComCascaHl = vendaComCascaHl > 0 ? valorTotalVendaComCasca / vendaComCascaHl : 0;

  return {
    beneficiamentoHl,
    beneficiamentoLatas: hlToLatas(beneficiamentoHl),
    vendaComCascaHl,
    vendaComCascaLatas: hlToLatas(vendaComCascaHl),
    quarentenaHl,
    quarentenaLatas: hlToLatas(quarentenaHl),
    devolucaoHl,
    devolucaoLatas: hlToLatas(devolucaoHl),
    descarteHl,
    descarteLatas: hlToLatas(descarteHl),
    custoMedioBeneficiamentoHl,
    custoMedioBeneficiamentoLata: custoMedioBeneficiamentoHl / LATAS_PER_HL,
    custoMedioVendaComCascaHl,
    custoMedioVendaComCascaLata: custoMedioVendaComCascaHl / LATAS_PER_HL,
  };
}
