import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Hammer,
  Calendar,
  User,
  BarChart3,
  DollarSign,
  Calculator,
  Users,
  Trophy,
  Layers,
  ShieldCheck,
  Plus,
  Shield,
  Building2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

import { ProducaoDiaTab } from './ProducaoDiaTab';
import { PainelQuebradorTab } from './PainelQuebradorTab';
import { DashboardGestorTab } from './DashboardGestorTab';
import { PagamentosFolhaTab } from './PagamentosFolhaTab';
import { TabelaPrecosTab } from './TabelaPrecosTab';
import { QuebradoresTab } from './QuebradoresTab';
import { RankingsTab } from './RankingsTab';
import { RelatoriosCustosTab } from './RelatoriosCustosTab';
import { AuditoriaTab } from './AuditoriaTab';
import { QuebradorMecanicoTab } from './QuebradorMecanicoTab';
import { NovoLancamentoModal } from './NovoLancamentoModal';
import { PerfilUsuario } from '../../types';
import { Cpu } from 'lucide-react';

export const QuebraManualView: React.FC = () => {
  const { activePerfil, setActivePerfil, setActiveTab } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    | 'producao-dia'
    | 'quebrador-mecanico'
    | 'painel-quebrador'
    | 'dashboard'
    | 'pagamentos'
    | 'tabela-precos'
    | 'quebradores'
    | 'rankings'
    | 'custos-lote'
    | 'auditoria'
  >('producao-dia');

  const [isNovoLancamentoOpen, setIsNovoLancamentoOpen] = useState(false);

  const subNavItems = [
    { id: 'producao-dia', label: 'Produção Manual do Dia', icon: Calendar, perfis: ['Administrador', 'Gestor', 'Recebimento', 'Consulta'] },
    { id: 'quebrador-mecanico', label: 'Quebrador Mecânico (kg/h)', icon: Cpu, perfis: ['Administrador', 'Gestor', 'Recebimento', 'Consulta'] },
    { id: 'painel-quebrador', label: 'Painel do Quebrador', icon: User, perfis: ['Administrador', 'Gestor', 'Quebrador', 'Consulta'] },
    { id: 'dashboard', label: 'Dashboard & Indicadores', icon: BarChart3, perfis: ['Administrador', 'Gestor', 'Financeiro', 'Consulta'] },
    { id: 'pagamentos', label: 'Folha & Pagamentos', icon: DollarSign, perfis: ['Administrador', 'Gestor', 'Financeiro'] },
    { id: 'tabela-precos', label: 'Tabela de Preços', icon: Calculator, perfis: ['Administrador', 'Gestor', 'Financeiro'] },
    { id: 'quebradores', label: 'Quebradores', icon: Users, perfis: ['Administrador', 'Gestor'] },
    { id: 'rankings', label: 'Rankings & Desempenho', icon: Trophy, perfis: ['Administrador', 'Gestor', 'Quebrador', 'Consulta'] },
    { id: 'custos-lote', label: 'Custos por Lote', icon: Layers, perfis: ['Administrador', 'Gestor', 'Financeiro'] },
    { id: 'auditoria', label: 'Trilha de Auditoria', icon: ShieldCheck, perfis: ['Administrador', 'Gestor'] },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Top Main Section Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm border border-slate-700"
            title="Voltar ao Painel Principal"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 text-amber-200 flex items-center justify-center shadow-lg border border-amber-700/50 shrink-0">
            <Hammer className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Módulo — Gestão da Quebra Manual
              </h1>
              <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                Usina Monte Dourado, PA
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Controle de produção por quebrador, remuneração automática, indicadores de produtividade e custo do lote.
            </p>
          </div>
        </div>

        {/* Quick Profile Simulation Toggle */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-800" />
            <span className="text-xs font-bold text-slate-700">Perfil Ativo:</span>
          </div>
          <select
            value={activePerfil}
            onChange={(e) => setActivePerfil(e.target.value as PerfilUsuario)}
            className="bg-white border border-slate-300 text-slate-900 font-black text-xs px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-amber-500 shadow-2xs"
          >
            <option value="Administrador">Administrador (Acesso Total)</option>
            <option value="Gestor">Gestor / Supervisor da Quebra</option>
            <option value="Quebrador">Quebrador (Acesso Restrito)</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Consulta">Consulta</option>
          </select>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-slate-900 rounded-2xl p-2 text-white shadow-md border border-slate-800 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-800 text-amber-100 shadow-md ring-1 ring-amber-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Render Body */}
      {activeSubTab === 'producao-dia' && (
        <ProducaoDiaTab onOpenNovoLancamento={() => setIsNovoLancamentoOpen(true)} />
      )}

      {activeSubTab === 'quebrador-mecanico' && <QuebradorMecanicoTab />}

      {activeSubTab === 'painel-quebrador' && <PainelQuebradorTab />}

      {activeSubTab === 'dashboard' && <DashboardGestorTab />}

      {activeSubTab === 'pagamentos' && <PagamentosFolhaTab />}

      {activeSubTab === 'tabela-precos' && <TabelaPrecosTab />}

      {activeSubTab === 'quebradores' && <QuebradoresTab />}

      {activeSubTab === 'rankings' && <RankingsTab />}

      {activeSubTab === 'custos-lote' && <RelatoriosCustosTab />}

      {activeSubTab === 'auditoria' && <AuditoriaTab />}

      {/* Global New Launch Modal */}
      <NovoLancamentoModal
        isOpen={isNovoLancamentoOpen}
        onClose={() => setIsNovoLancamentoOpen(false)}
      />

    </div>
  );
};
