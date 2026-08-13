import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  User,
  Lock,
  LogIn,
  AlertCircle,
  Building2,
  Award,
  KeyRound,
  Send,
  CheckCircle2,
  X,
  HelpCircle
} from 'lucide-react';

import logoImg from '../../assets/images/integral_nuts_logo_1785983199171.jpg';

export const LoginView: React.FC = () => {
  const { login, solicitarRecuperacaoSenha, usuarios, empresaConfig } = useApp();
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery Modal State
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryLogin, setRecoveryLogin] = useState('');
  const [recoveryNome, setRecoveryNome] = useState('');
  const [recoveryMotivo, setRecoveryMotivo] = useState('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = login(loginInput, senhaInput);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryLogin.trim()) return;

    const res = solicitarRecuperacaoSenha(recoveryLogin.trim(), recoveryMotivo.trim(), recoveryNome.trim());
    setRecoverySuccessMsg(res.message);

    setTimeout(() => {
      setRecoveryLogin('');
      setRecoveryNome('');
      setRecoveryMotivo('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#07160E] text-amber-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1B4D2E]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#6E3B19]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-[#0E281C]/95 border border-[#1B4731] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md z-10">
        
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0C2417] via-[#143E29] to-[#08170F] p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#1B4731]">
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg shrink-0 bg-amber-50">
                <img
                  src={empresaConfig?.logotipoUrl || logoImg}
                  alt="Logo da Empresa"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="font-black text-2xl text-white tracking-tight">
                  {empresaConfig?.nomeFantasia || empresaConfig?.razaoSocial || 'Integral NUTS'}
                </h1>
                <p className="text-xs text-amber-300 font-bold">
                  {empresaConfig?.municipioUF || 'Monte Dourado • Pará'}
                </p>
              </div>
            </div>

            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-black mb-6">
              <Award className="w-4 h-4 text-amber-400" />
              <span>QUALIDADE • ORIGEM • CONFIANÇA</span>
            </div>

            <div className="space-y-4 my-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Acesso Seguro Restrito (RBAC)</span>
              </div>
              
              <h2 className="text-2xl font-black text-white leading-tight">
                Sistema de Gestão Industrial & Rastreabilidade
              </h2>
              
              <p className="text-xs text-amber-100/70 leading-relaxed font-normal">
                Plataforma corporativa da Usina Monte Dourado para controle de recebimento, quebra manual, estufagem, rastreabilidade e expedição de Castanha-do-Pará.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1B4731] text-[11px] text-amber-200/50 font-medium">
            <div className="flex items-center gap-2 text-amber-200 mb-1 font-semibold">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Unidade Industrial Monte Dourado - PA</span>
            </div>
            <span>© 2026 Integral NUTS. Todos os direitos reservados.</span>
          </div>
        </div>

        {/* Right Form & Password Recovery Section */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6">
          
          <div>
            <h3 className="text-xl font-extrabold text-white">Acesse sua Conta</h3>
            <p className="text-xs text-amber-200/60">Informe suas credenciais autorizadas para entrar no sistema.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-xs text-rose-300 font-medium animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-100/90 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Login (E-mail ou CPF)
              </label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Seu e-mail ou CPF cadastrado"
                required
                className="w-full px-4 py-3 bg-[#06140B] border border-[#1B4731] rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-amber-100/90 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRecoverySuccessMsg('');
                    setIsRecoveryModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-[#06140B] border border-[#1B4731] rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1B4D2E] hover:bg-[#143D23] active:bg-[#0E2D19] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30 disabled:opacity-50"
            >
              {loading ? (
                <span>Verificando credenciais...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Recovery Request Section Info Box */}
          <div className="p-4 rounded-2xl bg-[#081B11] border border-[#16422C] flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold text-white block">Esqueceu suas credenciais?</span>
              <p className="text-amber-200/70 text-[11px] mt-0.5 leading-relaxed">
                Nenhum acesso é concedido sem autenticação prévia. Solicite a redefinição de senha para que o <strong className="text-amber-300">Usuário Master</strong> receba a notificação e conceda sua nova senha no sistema.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRecoverySuccessMsg('');
                  setIsRecoveryModalOpen(true);
                }}
                className="mt-2.5 px-3 py-1.5 bg-[#18422A] hover:bg-[#205537] text-amber-300 font-extrabold text-[11px] rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Solicitar Recuperação de Senha</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Password Recovery Modal */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0C2317] border border-[#1D5235] rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative">
            <button
              onClick={() => setIsRecoveryModalOpen(false)}
              className="absolute top-4 right-4 text-amber-200/60 hover:text-white p-1 rounded-xl hover:bg-[#163D28] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#153E27] rounded-2xl border border-amber-500/30">
                <KeyRound className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-black text-base text-white">Solicitar Recuperação de Senha</h4>
                <p className="text-xs text-amber-200/70">O Usuário Master receberá a notificação para aprovação</p>
              </div>
            </div>

            {recoverySuccessMsg ? (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Solicitação Enviada!</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-100">{recoverySuccessMsg}</p>
                <button
                  onClick={() => setIsRecoveryModalOpen(false)}
                  className="w-full mt-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Entendido / Voltar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-amber-100 mb-1">
                    E-mail ou Login do Usuário <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={recoveryLogin}
                    onChange={(e) => setRecoveryLogin(e.target.value)}
                    placeholder="Ex: joao.ramos@integralnuts.com.br"
                    required
                    className="w-full px-3 py-2.5 bg-[#06140B] border border-[#1E4D32] rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-100 mb-1">
                    Nome Completo / Cargo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={recoveryNome}
                    onChange={(e) => setRecoveryNome(e.target.value)}
                    placeholder="Ex: João Souza Ramos - Operador"
                    className="w-full px-3 py-2.5 bg-[#06140B] border border-[#1E4D32] rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-100 mb-1">
                    Motivo / Observação para o Usuário Master
                  </label>
                  <textarea
                    rows={3}
                    value={recoveryMotivo}
                    onChange={(e) => setRecoveryMotivo(e.target.value)}
                    placeholder="Ex: Esqueci a senha de acesso após trocar de celular"
                    className="w-full px-3 py-2.5 bg-[#06140B] border border-[#1E4D32] rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryModalOpen(false)}
                    className="px-4 py-2 bg-[#143B27] hover:bg-[#1A4B32] text-amber-200 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Notificação</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

