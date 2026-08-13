import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Edit,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  Lock,
  Search
} from 'lucide-react';
import { Quebrador } from '../../types';

export const QuebradoresTab: React.FC = () => {
  const {
    quebradores,
    addQuebrador,
    updateQuebrador,
    toggleQuebradorStatus,
    activePerfil,
  } = useApp();

  const isManagerOrAdmin = activePerfil === 'Administrador' || activePerfil === 'Gestor';

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuebrador, setEditingQuebrador] = useState<Quebrador | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState(new Date().toISOString().split('T')[0]);
  const [usuarioAcesso, setUsuarioAcesso] = useState('');
  const [telefone, setTelefone] = useState('');

  const filteredQuebradores = quebradores.filter(
    (q) =>
      q.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.usuarioAcesso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingQuebrador(null);
    setNome('');
    setCpf('');
    setDataAdmissao(new Date().toISOString().split('T')[0]);
    setUsuarioAcesso('');
    setTelefone('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Quebrador) => {
    setEditingQuebrador(q);
    setNome(q.nome);
    setCpf(q.cpf || '');
    setDataAdmissao(q.dataAdmissao);
    setUsuarioAcesso(q.usuarioAcesso);
    setTelefone(q.telefone || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Informe o nome do colaborador.');
      return;
    }

    const cleanUsername = (usuarioAcesso || nome.toLowerCase().replace(/\s+/g, '.')).trim();

    if (editingQuebrador) {
      updateQuebrador(editingQuebrador.id, {
        nome,
        cpf,
        dataAdmissao,
        usuarioAcesso: cleanUsername,
        telefone,
      });
    } else {
      addQuebrador({
        nome,
        cpf,
        situacao: 'Ativo',
        dataAdmissao,
        usuarioAcesso: cleanUsername,
        telefone,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm">Cadastro de Quebradores (Colaboradores Diretos)</h2>
            <p className="text-xs text-slate-500">Controle de credenciais e fichas de admissão dos quebradores da fábrica</p>
          </div>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-200" />
            <span>Cadastrar Novo Colaborador</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, matrícula ou usuário..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 shadow-xs"
        />
      </div>

      {/* Collaborators List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px]">
              <tr>
                <th className="p-3">Matrícula</th>
                <th className="p-3">Nome do Quebrador</th>
                <th className="p-3">CPF</th>
                <th className="p-3">Usuário de Acesso</th>
                <th className="p-3">Data Admissão</th>
                <th className="p-3 text-center">Situação</th>
                {isManagerOrAdmin && <th className="p-3 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredQuebradores.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{q.matricula}</td>
                  <td className="p-3 font-bold text-slate-900">{q.nome}</td>
                  <td className="p-3 font-mono text-slate-600">{q.cpf || 'Não informado'}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px] font-bold border border-slate-200">
                      @{q.usuarioAcesso}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{q.dataAdmissao}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        q.situacao === 'Ativo'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}
                    >
                      {q.situacao}
                    </span>
                  </td>
                  {isManagerOrAdmin && (
                    <td className="p-3 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer border border-slate-300"
                        title="Editar cadastro"
                      >
                        <Edit className="w-3 h-3 text-amber-800" />
                      </button>
                      <button
                        onClick={() => toggleQuebradorStatus(q.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          q.situacao === 'Ativo'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                        title={q.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                      >
                        {q.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-800" />
                {editingQuebrador ? 'Editar Cadastro do Quebrador' : 'Cadastrar Novo Quebrador'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria de Oliveira Souza"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF (opcional)</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Admissão *</label>
                  <input
                    type="date"
                    value={dataAdmissao}
                    onChange={(e) => setDataAdmissao(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Usuário de Acesso ao Painel *</label>
                <input
                  type="text"
                  value={usuarioAcesso}
                  onChange={(e) => setUsuarioAcesso(e.target.value)}
                  placeholder="Ex: maria.souza"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp (opcional)</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(93) 99000-0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 text-white font-extrabold rounded-xl shadow"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
