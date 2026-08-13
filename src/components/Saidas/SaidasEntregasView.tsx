import React, { useState } from 'react';
import { Send, Truck, FileText, CheckCircle2, PackageCheck, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SaidasEntregasView: React.FC = () => {
  const { addToast, gerarDocumento } = useApp();
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('Castanha Beneficiada Extra Large - Caixa 20kg');
  const [quantidadeCaixas, setQuantidadeCaixas] = useState('10');
  const [transportadora, setTransportadora] = useState('Navegação Rio Jari S/A');

  const handleRegistrarSaida = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim()) {
      addToast('Informe o nome do cliente / comprador.', 'error');
      return;
    }

    const doc = gerarDocumento('Romaneio de Saída', 'SAIDA-' + Date.now(), cliente);
    addToast(`Romaneio de Saída N° ${doc.numeroDocumento} gerado com sucesso!`, 'success');
    setCliente('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Send className="w-4 h-4" />
            <span>Módulo de Saídas e Expedição</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Saídas, Romaneios e Entregas</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Emissão de romaneios de expedição, transporte hidroviário/terrestre e acompanhamento de entregas de produto acabado.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-700" />
          <span>Emitir Novo Romaneio de Expedição/Saída</span>
        </h2>

        <form onSubmit={handleRegistrarSaida} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cliente / Comprador Destino</label>
            <input
              type="text"
              placeholder="Ex: Nutry Brasil Alimentos Ltda"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Produto</label>
            <select
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Castanha Beneficiada Extra Large - Caixa 20kg">Castanha Beneficiada Extra Large - Caixa 20kg</option>
              <option value="Castanha Beneficiada Large - Caixa 20kg">Castanha Beneficiada Large - Caixa 20kg</option>
              <option value="Castanha Beneficiada Média - Caixa 20kg">Castanha Beneficiada Média - Caixa 20kg</option>
              <option value="Castanha Beneficiada Miúda - Caixa 20kg">Castanha Beneficiada Miúda - Caixa 20kg</option>
              <option value="Castanha Beneficiada Pedaço - Caixa 20kg">Castanha Beneficiada Pedaço - Caixa 20kg</option>
              <option value="Castanha Beneficiada Pedacinhos - Caixa 20kg">Castanha Beneficiada Pedacinhos - Caixa 20kg</option>
              <option value="Castanha-do-Pará em Casca (In Natura) - Sacos 50kg">Castanha-do-Pará em Casca (In Natura) - Sacos 50kg</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade (Volume/Caixas)</label>
            <input
              type="number"
              value={quantidadeCaixas}
              onChange={(e) => setQuantidadeCaixas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Transportadora / Embarcação</label>
            <input
              type="text"
              value={transportadora}
              onChange={(e) => setTransportadora(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Gerar Romaneio de Saída</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
