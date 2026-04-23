'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, TrendingUp, Trophy, Users, DollarSign, BarChart4,
  Bell, Settings, LogOut, ChevronRight, Plus, MessageCircle, Search,
  Calendar, Download, Filter, AlertCircle, Clock, Ban, CheckCircle2,
  Lock, Volume2, Monitor, X, Check, ChevronLeft, ChevronDown, User,
  Eye, EyeOff, Shield, UserPlus, Power, Trash2, Activity, CreditCard, Menu
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  useActiveSession, useTopPlayers, useRetentionPlayers, registerSale, 
  validateLogin, useSystemUsers, updateSystemUser, deleteSystemUser, createSystemUser,
  bulkInsertPlayers, deletePlayer, updatePlayer, deleteAllPlayers,
  useGastos, addGasto, deleteGasto, updateGasto,
  useGanadores, addGanador, updateGanador, deleteGanador,
  useAlertas, addAlerta, updateAlerta, deleteAlerta,
  useHistoricoSorteos, addSorteo, updateSorteo, deleteSorteo, updatePassword
} from './supabase-hooks';

/* ─── Toast Notification ─────────────────────────────── */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-8 right-8 z-50 bg-violet-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-violet-500/30 animate-larry">
      <Check size={18}/> <span className="font-bold text-sm">{msg}</span>
    </div>
  );
}

/* ─── LOGIN PAGE ────────────────────────────────────────── */
function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await validateLogin(user, pass);
    if (!error && data) {
      onLogin(data);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black font-heading">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 scale-110 opacity-30 blur-sm brightness-50"
        style={{ 
          backgroundImage: 'url(/bg-login.png)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          animation: 'pulse 15s infinite alternate ease-in-out'
        }}
      />
      
      <div className="relative z-10 w-full max-w-[400px] px-8 animate-larry">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-white tracking-tighter">Bienvenido</h2>
          <p className="text-slate-500 text-[13px] font-bold uppercase tracking-[0.3em] mt-2">Acceso Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18}/>
            <input 
              type="text" 
              placeholder="Usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full h-14 bg-[#1a1a1c]/90 backdrop-blur-md rounded-2xl pl-14 pr-6 text-white focus:outline-none border border-white/5 focus:border-white/20 transition-all placeholder:text-slate-400 font-medium text-sm"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18}/>
            <input 
              type={showPass ? 'text' : 'password'} 
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full h-14 bg-[#1a1a1c]/90 backdrop-blur-md rounded-2xl pl-14 pr-14 text-white focus:outline-none border border-white/5 focus:border-white/20 transition-all placeholder:text-slate-400 font-medium text-sm"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full h-14 rounded-2xl font-black text-white transition-all active:scale-95 shadow-xl shadow-rose-500/10 uppercase tracking-widest text-xs
              ${error ? 'bg-rose-700 animate-shake' : 'bg-[#fe3962] hover:bg-[#ff4d73]'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading ? 'Validando...' : error ? 'Credenciales Incorrectas' : 'Entrar al Panel'}
          </button>
        </form>


      </div>

      <style jsx>{`
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </div>
  );
}

/* ─── Root Dashboard ─────────────────────────────────── */
export default function BingoDashboard() {
  const [user, setUser] = useState<any>(null);
  const [isFinishingAuth, setIsFinishingAuth] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('bingo_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      if (localStorage.getItem('bingo_theme') === 'light-mode' || localStorage.getItem('bingo_theme') === 'light-dark') {
        document.body.classList.add('light-mode');
      }
      if (localStorage.getItem('bingo_anim') === 'reduced') {
        document.body.classList.add('reduced-animations');
      }
    } catch (e) { console.error(e); }
    setIsFinishingAuth(false);
  }, []);

  const handleLogin = (userData: any) => {
    localStorage.setItem('bingo_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('bingo_user');
    setUser(null);
  };

  if (isFinishingAuth) return <div className="min-h-screen bg-black" />;
  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <>
      <GlobalStyles />
      <DashboardContent user={user} onLogout={handleLogout} />
    </>
  );
}

function DashboardContent({ user, onLogout }: { user: any; onLogout: () => void }) {
  const { session } = useActiveSession();
  const topPlayers = useTopPlayers();
  const retentionPlayers = useRetentionPlayers();

  const [activeView, setActiveView] = useState('Resumen');
  const gastos = useGastos();
  const ganadores = useGanadores();
  const alertas = useAlertas();
  const historicoSorteos = useHistoricoSorteos();

  const [globalMonth, setGlobalMonth] = useState(new Date().getMonth());
  const [globalYear, setGlobalYear] = useState(new Date().getFullYear());
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const statsMensuales = useMemo(() => {
    const totalVendido = historicoSorteos.filter(s => {
      const d = new Date(s.fecha + 'T00:00:00');
      return d.getMonth() === globalMonth && d.getFullYear() === globalYear;
    }).reduce((acc, s) => acc + (s.vendidos * s.precio), 0);
    
    const totalPremios = historicoSorteos.filter(s => {
      const d = new Date(s.fecha + 'T00:00:00');
      return d.getMonth() === globalMonth && d.getFullYear() === globalYear;
    }).reduce((acc, s) => acc + s.premios, 0);
    
    const totalGastos = gastos.filter(g => {
      const d = new Date(g.fecha + 'T00:00:00');
      return d.getMonth() === globalMonth && d.getFullYear() === globalYear;
    }).reduce((acc, g) => acc + g.monto, 0);
    
    return {
      ingresos: totalVendido,
      premios: totalPremios,
      gastos: totalGastos,
      ganancia: totalVendido - totalPremios - totalGastos,
      volumen: historicoSorteos.reduce((acc, s) => acc + s.vendidos, 0)
    };
  }, [historicoSorteos, gastos, globalMonth, globalYear]);

  const [saleAmount, setSaleAmount] = useState<number>(1);
  const [salePrice, setSalePrice] = useState<number>(session?.precio_carton || 10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showToast = (msg: string) => setToast(msg);

  const handleQuickSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { showToast('No hay sesión activa'); return; }
    setIsSubmitting(true);
    try {
      await registerSale(session.id, session.cartones_vendidos, saleAmount, salePrice);
      showToast(`✓ ${saleAmount} cartón(es) registrado(s)`);
    } catch { showToast('Error al registrar'); }
    finally { setIsSubmitting(false); }
  };

  const viewProps = { session, topPlayers, retentionPlayers, showToast, historicoSorteos, statsMensuales, alertas, ganadores, gastos, globalMonth, globalYear };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 z-[80] transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 border-r border-white/5 flex flex-col fixed inset-y-0 bg-[#080808] z-[100] transition-transform duration-300 ease-out lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8">
          <h2 className="text-lg font-black text-white flex flex-col leading-tight uppercase font-heading tracking-tight">
            Sistema <span className="text-violet-500">Administrativo</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-[0.3em] mt-1">BINGO DASHBOARD</span>
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'Resumen',        icon: <LayoutDashboard size={18}/> },
            { id: 'Sorteo',         icon: <DollarSign size={18}/> },
            { id: 'Ganancias',      icon: <TrendingUp size={18}/> },
            { id: 'Gastos',         icon: <CreditCard size={18}/> },
            { id: 'Ganadores',      icon: <Trophy size={18}/> },
            { id: 'Jugadores',      icon: <Users size={18}/> },
            { id: 'Alertas',        icon: <Bell size={18}/>, badge: alertas.filter(a => a.status === 'CRITICO').length || undefined },
            ...(user?.rol === 'admin' ? [{ id: 'Usuarios', icon: <Shield size={18}/> }] : []),
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveView(item.id); closeMobileMenu(); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${activeView === item.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="text-xs font-black uppercase tracking-widest">{item.id}</span>
              </div>
              {item.badge && <span className="w-5 h-5 bg-rose-600 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-1">
          <button 
            onClick={() => { setActiveView('Configuración'); closeMobileMenu(); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeView === 'Configuración' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Settings size={18}/>
            <span className="text-xs font-black uppercase tracking-widest">Ajustes</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-rose-400 transition-all">
            <LogOut size={18}/>
            <span className="text-xs font-black uppercase tracking-widest">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 transition-all duration-500 min-h-screen">
        <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 text-white bg-violet-600 rounded-2xl shadow-xl shadow-violet-600/30 active:scale-95 transition-transform">
              <Menu size={24}/>
            </button>
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] leading-none mb-1">
                {activeView}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-white lg:hidden">BINGO <span className="text-violet-500">PRO</span></span>
                <p className="text-[10px] text-slate-500 font-bold uppercase hidden lg:block tracking-[0.2em]">Administración Central</p>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 px-2 ml-4">
                  <Calendar size={12} className="text-violet-500" />
                  <select 
                    value={globalMonth} 
                    onChange={e => setGlobalMonth(Number(e.target.value))}
                    className="bg-black/50 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer px-2 py-1 hover:border-violet-500 transition-all"
                  >
                    {meses.map((m, i) => <option key={i} value={i} className="bg-[#0a0a0a] text-white">{m}</option>)}
                  </select>
                  <select 
                    value={globalYear} 
                    onChange={e => setGlobalYear(Number(e.target.value))}
                    className="bg-black/50 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer px-2 py-1 hover:border-violet-500 transition-all"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y} className="bg-[#0a0a0a] text-white">{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] font-black text-white leading-none uppercase tracking-tight">{user?.usuario}</span>
                <span className="text-[9px] font-black text-violet-500 uppercase mt-1 tracking-widest">{user?.rol}</span>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center font-black text-sm text-violet-400">
                {user?.usuario?.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-6 md:space-y-8 overflow-hidden">
          {activeView === 'Resumen'       && <ResumenView {...viewProps} user={user} handleQuickSale={handleQuickSale} saleAmount={saleAmount} setSaleAmount={setSaleAmount} isSubmitting={isSubmitting} />}
          {activeView === 'Sorteo'        && <FinanzasView {...viewProps} />}
          {activeView === 'Ganancias'     && <GananciasView {...viewProps} />}
          {activeView === 'Gastos'        && <GastosView {...viewProps} />}
          {activeView === 'Ganadores'     && <GanadoresView {...viewProps} />}
          {activeView === 'Jugadores'     && <JugadoresView {...viewProps} />}
          {activeView === 'Alertas'       && <AlertasView {...viewProps} />}
          {activeView === 'Usuarios'      && user?.rol === 'admin' && <GestionUsuariosView showToast={showToast} />}
          {activeView === 'Configuración' && <ConfiguracionView showToast={showToast} user={user} />}
        </div>
      </main>
    </div>
  );
}

/* ─── RECHARTS TOOLTIP CUSTOM ──────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0f]/95 border border-violet-500/20 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-6 mt-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}></div>
            <span className="text-[11px] font-bold text-slate-300 uppercase">{p.name}</span>
          </div>
          <span className="text-sm font-black text-white">Bs. {p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── DASHBOARD INCOME CHART (Recharts) ─────────────── */
function InteractiveChart({ data: rawData, period }: { data: any[], period: string }) {
  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];
    return rawData.map(s => ({
      dia: period === 'Mes' ? new Date(s.fecha).getUTCDate() : s.nombre,
      ingresos: s.vendidos * s.precio,
      premios: s.premios
    })).sort((a,b) => (period === 'Mes' ? (a.dia as number) - (b.dia as number) : 0));
  }, [rawData, period]);

  return (
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData.length > 0 ? chartData : [{dia:'-', ingresos:0, premios:0}]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPremios" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
          <XAxis dataKey="dia" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`}/>
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}/>
          <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorIngresos)" dot={false} activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}/>
          <Area type="monotone" dataKey="premios" name="Premios" stroke="#d946ef" strokeWidth={2.5} fill="url(#colorPremios)" dot={false} activeDot={{ r: 5, fill: '#d946ef', stroke: '#fff', strokeWidth: 2 }}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── GANANCIAS MASTER CHART (Recharts) ─────────────── */
function MasterFlowChart({ period, historicoSorteos }: { period: string, historicoSorteos: any[] }) {
  const data = useMemo(() => {
    if (!historicoSorteos || historicoSorteos.length === 0) return [];
    
    // Simplification for now: we show the actual draws, sorted chronologically
    const sorted = [...historicoSorteos].sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    return sorted.map((s, i) => ({
      n: s.nombre || `S${i+1}`,
      ventas: (s.vendidos || 0) * (s.precio || 0),
      premios: s.premios || 0
    }));
  }, [historicoSorteos]);

  return (
    <ResponsiveContainer width="100%" height={420}>
      <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="masterV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="masterP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
        <XAxis dataKey="n" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}/>
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{value}</span>}
        />
        <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#8b5cf6" strokeWidth={3} fill="url(#masterV)" dot={false} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 0 8px #8b5cf6)' }}/>
        <Area type="monotone" dataKey="premios" name="Premios" stroke="#d946ef" strokeWidth={3} fill="url(#masterP)" dot={false} activeDot={{ r: 6, fill: '#d946ef', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 0 8px #d946ef)' }}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ResumenView({ session, topPlayers, ganadores, handleQuickSale, saleAmount, setSaleAmount, isSubmitting, showToast, user, historicoSorteos, gastos, globalMonth, globalYear }) {
  const [period, setPeriod] = useState('Hoy');
  const periods = ['Hoy', 'Semana', 'Mes'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const statsPeriod = useMemo(() => {
    const n = new Date();
    const todayStr = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    const now = new Date();

    const filtered = historicoSorteos.filter(s => {
      if (!s.fecha) return false;
      if (period === 'Hoy') return s.fecha === todayStr;
      
      const d = new Date(s.fecha + 'T00:00:00');
      if (period === 'Semana') {
        const today = new Date(todayStr + 'T00:00:00');
        const diff = today.getTime() - d.getTime();
        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      }
      
      return d.getMonth() === globalMonth && d.getFullYear() === globalYear;
    });

    const totalVendido = filtered.reduce((acc, s) => acc + (s.vendidos * (s.precio || 0)), 0);
    const totalPremios = filtered.reduce((acc, s) => acc + (s.premios || 0), 0);
    
    const totalGastos = gastos.filter(g => {
      if (!g.fecha) return false;
      if (period === 'Hoy') return g.fecha === todayStr;
      
      const d = new Date(g.fecha + 'T00:00:00');
      if (period === 'Semana') {
        const today = new Date(todayStr + 'T00:00:00');
        const diff = today.getTime() - d.getTime();
        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      }
      return d.getMonth() === globalMonth && d.getFullYear() === globalYear;
    }).reduce((acc, g) => acc + (g.monto || 0), 0);
    
    return {
      ingresos: totalVendido,
      premios: totalPremios,
      gastos: totalGastos,
      ganancia: totalVendido - totalPremios - totalGastos,
      volumen: filtered.reduce((acc, s) => acc + (s.vendidos || 0), 0),
      data: filtered
    };
  }, [historicoSorteos, period, gastos, globalMonth, globalYear]);

  return (
    <div className="space-y-6 animate-larry">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading">Panel de Resumen</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Análisis de rendimiento: {period}</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <TabGroup tabs={periods} active={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        <KPICard 
          icon={<DollarSign size={16}/>} 
          label="Ingresos"           
          value={`Bs. ${statsPeriod.ingresos.toLocaleString()}`} 
          trendUp 
          sparkData={[3000, 4500, 3200, 6000, 5500, 8000, statsPeriod.ingresos/4]}
          color="#8b5cf6"
        />
        <KPICard 
          icon={<Users size={16}/>}      
          label="Vendidos"         
          value={`${statsPeriod.volumen}`}  
          sparkData={[200, 300, 250, 400, 350, 500, statsPeriod.volumen/4]}
          color="#10b981"
        />
        <KPICard 
          icon={<CreditCard size={16}/>}      
          label="Gastos"         
          value={`Bs. ${statsPeriod.gastos.toLocaleString()}`}  
          sparkData={[500, 800, 600, 1000, 900, 1200, statsPeriod.gastos/4]}
          color="#f43f5e"
        />
        <KPICard 
          icon={<Trophy size={16}/>}     
          label="Ganancia"            
          value={`Bs. ${statsPeriod.ganancia.toLocaleString()}`} 
          sparkData={[1000, 1500, 1200, 2000, 1800, 2500, statsPeriod.ganancia/4]}
          color="#f59e0b"
        />
        <KPICard 
          icon={<TrendingUp size={16}/>} 
          label="Margen"      
          value={`${((statsPeriod.ganancia / (statsPeriod.ingresos || 1)) * 100).toFixed(1)}%`} 
          sparkData={[60, 65, 62, 70, 68, 72, 70]}
          color="#ec4899"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Chart */}
        <div className="xl:col-span-2 card-larry p-6 h-[380px] flex flex-col relative group overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold flex items-center gap-2 font-heading tracking-widest uppercase"><TrendingUp size={16} className="text-violet-500"/> Histórico del Período</h3>
          </div>
          <InteractiveChart data={statsPeriod.data} period={period} />
        </div>

        {/* Winners */}
        <div className="card-larry p-6 flex flex-col h-[380px]">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2 font-heading tracking-widest uppercase"><Trophy size={16} className="text-amber-500"/> Últimos Ganadores</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {ganadores.length > 0 ? (
              ganadores.slice(0, 10).map((g, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[13px] font-bold text-amber-500">#{i+1}</div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{g.nombre}</h4>
                      <p className="text-[12px] text-slate-500">Bs. {(g.monto || 0).toLocaleString()} • {g.tipo || 'Ganador'}</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-slate-800 group-hover:text-violet-500 transition-colors"/>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-[10px] font-bold uppercase tracking-widest italic opacity-50">
                No hay ganadores registrados aún
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── GANANCIAS ──────────────────────────────────────── */
function GananciasView({ showToast, historicoSorteos, gastos, globalMonth, globalYear }) {
  const [period, setPeriod] = useState('Sorteo');
  const periods = ['Sorteo','Diario','Semana','Mes'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const statsPeriod = useMemo(() => {
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

    const filteredSorteos = historicoSorteos.filter(s => {
      if (!s.fecha) return false;
      if (period === 'Sorteo') return true; // Show all for now or limit to last N
      if (period === 'Diario') return s.fecha === todayStr;
      
      const d = new Date(s.fecha + 'T00:00:00');
      if (period === 'Semana') {
        const today = new Date(todayStr + 'T00:00:00');
        const diff = today.getTime() - d.getTime();
        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      }
      return d.getMonth() === globalMonth && d.getFullYear() === globalYear;
    });

    const totalVendido = filteredSorteos.reduce((acc, s) => acc + (s.vendidos * (s.precio || 0)), 0);
    const totalPremios = filteredSorteos.reduce((acc, s) => acc + (s.premios || 0), 0);
    
    const filteredGastos = gastos.filter(g => {
      if (!g.fecha) return false;
      if (period === 'Sorteo') return true;
      if (period === 'Diario') return g.fecha === todayStr;
      
      const d = new Date(g.fecha + 'T00:00:00');
      if (period === 'Semana') {
        const today = new Date(todayStr + 'T00:00:00');
        const diff = today.getTime() - d.getTime();
        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      }
      return d.getMonth() === globalMonth && d.getFullYear() === globalYear;
    });

    const totalGastos = filteredGastos.reduce((acc, g) => acc + (g.monto || 0), 0);
    
    return {
      ingresos: totalVendido,
      premios: totalPremios,
      gastos: totalGastos,
      ganancia: totalVendido - totalPremios - totalGastos,
      sorteos: filteredSorteos
    };
  }, [historicoSorteos, period, gastos, globalMonth, globalYear]);

  const handleDownload = () => {
    showToast('Reporte generado exitosamente');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black font-heading text-white">Ganancias</h1>
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Análisis de rentabilidad</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <TabGroup tabs={periods} active={period} onChange={setPeriod} />
            <button onClick={handleDownload} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400"><Download size={14}/></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ReportCard label="Ingreso Total"     value={`Bs. ${statsPeriod.ingresos.toLocaleString()}`} color="emerald" />
        <ReportCard label="Premios"           value={`Bs. ${statsPeriod.premios.toLocaleString()}`} color="rose"    />
        <ReportCard label="Gastos"            value={`Bs. ${statsPeriod.gastos.toLocaleString()}`} color="rose"    />
        <ReportCard label="Utilidad Neta"      value={`Bs. ${statsPeriod.ganancia.toLocaleString()}`} color="violet"  />
      </div>

      <div className="card-larry p-8 flex flex-col overflow-hidden bg-gradient-to-b from-[#0d0d0d] to-black min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Análisis de Flujo Maestro</h3>
            <p className="text-[13px] text-slate-400 font-bold mt-1 uppercase">Ventas vs Retorno de Premios</p>
          </div>
        </div>
        <div className="flex-1">
          {statsPeriod.sorteos.length > 0 ? <MasterFlowChart period={period} historicoSorteos={statsPeriod.sorteos} /> : <div className="h-full flex items-center justify-center text-slate-500 font-bold uppercase text-[10px] tracking-widest italic pt-20">No hay sorteos en este período...</div>}
        </div>
      </div>
    </div>
  );
}

function GanadoresView({ ganadores, showToast }) {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGanador, setEditingGanador] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: '', tipo: 'Nuevo', monto: '', cartones: '', sorteo: '', pagado: false });

  const lifetimeWinners = useMemo(() => {
    const map = new Map();
    ganadores.forEach(g => {
      const prev = map.get(g.nombre) || { wins: 0, total: 0 };
      map.set(g.nombre, { wins: prev.wins + 1, total: prev.total + g.monto });
    });
    return Array.from(map.entries()).map(([nombre, stats]) => ({ nombre, ...stats })).sort((a,b) => b.wins - a.wins);
  }, [ganadores]);

  const filtered = ganadores.filter(g => g.nombre.toLowerCase().includes(query.toLowerCase()));

  const handleOpenModal = (ganador = null) => {
    if (ganador) {
      setEditingGanador(ganador);
      setFormData({ nombre: ganador.nombre, tipo: ganador.tipo, monto: ganador.monto.toString(), cartones: ganador.cartones.toString(), sorteo: ganador.sorteo, pagado: ganador.pagado });
    } else {
      setEditingGanador(null);
      setFormData({ nombre: '', tipo: 'Nuevo', monto: '', cartones: '1', sorteo: '', pagado: false });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newGanador = {
      ...formData,
      monto: Number(formData.monto),
      cartones: Number(formData.cartones)
    };

    if (editingGanador) {
      await updateGanador(editingGanador.id, newGanador);
      showToast('Ganador actualizado');
    } else {
      await addGanador({ ...newGanador, fecha: new Date().toLocaleDateString() });
      showToast('Ganador registrado');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este registro?')) {
      await deleteGanador(id);
      showToast('Registro eliminado');
    }
  };

  const togglePago = async (id: string) => {
    const g = ganadores.find(x => x.id === id);
    if(g) await updateGanador(id, { pagado: !g.pagado });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading">Ganadores</h1>
          <p className="text-slate-500 text-xs">Gestión de premios y estados de pago</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
            <input 
              type="text" 
              value={query} 
              onChange={e=>setQuery(e.target.value)} 
              placeholder="Buscar..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-violet-500/50 text-[13px] w-full"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex items-center gap-2 font-bold transition-all text-[13px]"
          >
            <Plus size={14}/> Registrar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <div className="xl:col-span-3 card-larry overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead className="text-[11px] uppercase text-slate-500 font-black border-b border-white/5 bg-[#0d0d0d] sticky top-0 z-10">
                <tr>
                  <th className="py-5 px-6">Jugador</th>
                  <th className="py-5 px-6 text-center">Tipo</th>
                  <th className="py-5 px-6 text-center">Cartones</th>
                  <th className="py-5 px-6 text-right">Monto</th>
                  <th className="py-5 px-6">Sorteo</th>
                  <th className="py-5 px-6 text-center">Estado</th>
                  <th className="py-5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map((g) => (
                  <tr key={g.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-500 flex items-center justify-center font-bold text-[12px]">{g.nombre.charAt(0)}</div>
                        <span className="font-bold text-[13px]">{g.nombre}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter 
                        ${g.tipo === 'VIP' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                          g.tipo === 'Nuevo' ? 'bg-cyan-500/10 text-cyan-500' : 
                          'bg-slate-500/10 text-slate-400'}`}>
                        {g.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                        <Trophy size={10} className="text-amber-500"/>
                        <span className="text-xs font-black text-white">{g.cartones}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-emerald-400 font-black text-sm">Bs. {g.monto.toLocaleString()}</td>
                    <td className="py-4 px-6 text-[12px] text-slate-500 font-bold uppercase tracking-widest">{g.sorteo}</td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => togglePago(g.id)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${g.pagado ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}
                      >
                        {g.pagado ? 'Pagado' : 'Pendiente'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => handleOpenModal(g)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><Settings size={14}/></button>
                      <button onClick={() => handleDelete(g.id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-larry p-6 bg-gradient-to-br from-violet-600/10 to-transparent border border-violet-500/20">
            <h3 className="text-[12px] font-black text-violet-400 uppercase tracking-widest mb-4">Historial de por Vida</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {lifetimeWinners.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center text-[10px] font-black text-amber-500">#{i+1}</div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white truncate">{w.nombre}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{w.wins} Premios</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-400">Bs. {w.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-larry p-6">
            <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-4">Métricas del Mes</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Pendientes</span>
                <span className="text-sm font-black text-rose-500">{ganadores.filter(g=>!g.pagado).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Pagados</span>
                <span className="text-sm font-black text-emerald-500">{ganadores.filter(g=>g.pagado).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL GANADORES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md p-8 rounded-[2rem] shadow-2xl animate-larry max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-black font-heading mb-6">{editingGanador ? 'Editar Ganador' : 'Registrar Ganador'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Jugador</label>
                <input 
                  required 
                  type="text" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo</label>
                  <select 
                    value={formData.tipo} 
                    onChange={e => setFormData({...formData, tipo: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all appearance-none"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Viejo">Viejo</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cartones Ganados</label>
                  <input 
                    required 
                    type="number" 
                    value={formData.cartones} 
                    onChange={e => setFormData({...formData, cartones: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monto (Bs.)</label>
                  <input 
                    required 
                    type="number" 
                    value={formData.monto} 
                    onChange={e => setFormData({...formData, monto: e.target.value})} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sorteo / Referencia</label>
                <input 
                  required 
                  type="text" 
                  value={formData.sorteo} 
                  onChange={e => setFormData({...formData, sorteo: e.target.value})} 
                  placeholder="Ej: #105 • S6"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <input 
                  type="checkbox" 
                  id="pagado" 
                  checked={formData.pagado} 
                  onChange={e => setFormData({...formData, pagado: e.target.checked})}
                  className="w-4 h-4 rounded border-white/10 bg-black text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="pagado" className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ya fue pagado</label>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[11px] font-black uppercase text-slate-500 hover:text-white transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-violet-600 rounded-2xl text-[11px] font-black uppercase text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── GASTOS ────────────────────────────────────────── */
function GastosView({ gastos, showToast, statsMensuales }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<any>(null);
  const [formData, setFormData] = useState({ descripcion: '', monto: '', categoria: 'Operación', fecha: new Date().toISOString().split('T')[0] });

  const handleOpenModal = (gasto = null) => {
    if (gasto) {
      setEditingGasto(gasto);
      setFormData({ descripcion: gasto.descripcion, monto: gasto.monto.toString(), categoria: gasto.categoria, fecha: gasto.fecha });
    } else {
      setEditingGasto(null);
      setFormData({ descripcion: '', monto: '', categoria: 'Operación', fecha: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newGasto = {
      ...formData,
      monto: Number(formData.monto)
    };

    if (editingGasto) {
      const res = await updateGasto(editingGasto.id, newGasto);
      if (res && res.error) { showToast(`Error: ${res.error.message}`); return; }
      else showToast('Gasto actualizado');
    } else {
      const res = await addGasto(newGasto);
      if (res && res.error) { showToast(`Error BD: ${res.error.message}`); return; }
      else showToast('Gasto registrado');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este gasto?')) {
      await deleteGasto(id);
      showToast('Gasto eliminado');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-extrabold font-heading">Gastos</h1><p className="text-slate-500 text-xs">Administración de salidas de capital</p></div>
        <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-rose-500/20"><Plus size={18}/> Registrar Gasto</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 card-larry overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0d0d0d] text-[11px] uppercase tracking-widest text-slate-500 font-black border-b border-white/5">
                <tr><th className="px-6 py-5">Descripción</th><th className="px-6 py-5">Categoría</th><th className="px-6 py-5">Fecha</th><th className="px-6 py-5 text-right">Monto</th><th className="px-6 py-5 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {gastos.map(g => (
                  <tr key={g.id} className="group hover:bg-white/[0.01]">
                    <td className="px-6 py-4 font-bold text-sm text-white">{g.descripcion}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-black uppercase text-slate-400">{g.categoria}</span></td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-bold uppercase">{g.fecha}</td>
                    <td className="px-6 py-4 text-right font-black text-rose-400">Bs. {g.monto.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenModal(g)} className="p-2 text-slate-600 hover:text-white rounded-lg transition-all"><Settings size={14}/></button>
                      <button onClick={() => handleDelete(g.id)} className="p-2 text-slate-600 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-larry p-6 bg-rose-500/5 border border-rose-500/20">
            <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-4">Total Gastos</h3>
            <p className="text-3xl font-black text-white">Bs. {gastos.reduce((acc,g)=>acc+g.monto, 0).toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Impacto en Utilidad: -{((gastos.reduce((acc,g)=>acc+g.monto, 0) / (statsMensuales.ingresos || 1)) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md p-6 md:p-8 rounded-[2rem] shadow-2xl animate-larry max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-black font-heading mb-6">{editingGasto ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</label><input required type="text" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monto (Bs.)</label><input required type="number" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all"/></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoría</label><select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all appearance-none"><option value="Operación">Operación</option><option value="Personal">Personal</option><option value="Marketing">Marketing</option><option value="Local">Local</option></select></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha</label><input required type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500 outline-none transition-all"/></div>
              <div className="pt-6 flex gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[11px] font-black uppercase text-slate-500 hover:text-white transition-all">Cancelar</button><button type="submit" className="flex-1 py-4 bg-rose-600 rounded-2xl text-[11px] font-black uppercase text-white hover:bg-rose-700 transition-all">Guardar Gasto</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function JugadoresView({ topPlayers, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        const playersToSync = data.map((item: any) => ({
          nombre: item.Nombre || item.nombre || item.Name || item.PLAYER || item.Jugador || 'Sin Nombre',
          ganadas: Number(item.Ganadas || item.Wins || item.Victorias || 0),
          puntos: Number(item.Puntos || item.Points || 0),
          telefono: item.Telefono || item.Phone || item.Celular || '',
          ultima_partida: new Date().toISOString()
        }));
        await bulkInsertPlayers(playersToSync);
        showToast(`¡Sincronización Exitosa! ${playersToSync.length} jugadores actualizados.`);
      } catch (err) {
        showToast('Error al procesar archivo');
      } finally { setImporting(false); }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      await deletePlayer(id);
      showToast('Jugador eliminado');
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('⚠️ ¿ESTÁS SEGURO DE ELIMINAR TODA LA BASE DE DATOS DE JUGADORES? Esta acción no se puede deshacer.')) {
      await deleteAllPlayers();
      showToast('Base de datos vaciada');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePlayer(editingPlayer.id, {
      nombre: editingPlayer.nombre,
      telefono: editingPlayer.telefono,
      ganadas: Number(editingPlayer.ganadas),
      puntos: Number(editingPlayer.puntos)
    });
    setEditingPlayer(null);
    showToast('Jugador actualizado');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black font-heading bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Inteligencia de Jugadores</h1>
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestión centralizada y sincronización</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleDeleteAll} className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all" title="Borrar Todo"><Trash2 size={18}/></button>
          <label className={`flex-1 md:flex-none cursor-pointer flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${importing ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/50 shadow-lg shadow-emerald-500/20'}`}>
            {importing ? 'Sincronizando...' : <><Download size={14}/> Importar Excel</>}
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} disabled={importing} />
          </label>
        </div>
      </div>

      <div className="card-larry p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
            <input 
              type="text" 
              placeholder="Buscar por nombre o teléfono..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Jugador</th>
                <th className="text-center py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Puntos</th>
                <th className="text-center py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Victorias</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-xs font-black text-white">{p.nombre.substring(0,2).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{p.nombre}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{p.telefono || 'Sin Teléfono'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-sm text-slate-300">{p.puntos || 0}</td>
                  <td className="py-4 px-6 text-center font-bold text-sm text-amber-500">{p.ganadas || 0}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button onClick={() => setEditingPlayer(p)} className="p-2 text-slate-500 hover:text-violet-400 transition-colors opacity-0 group-hover:opacity-100"><Settings size={14}/></button>
                    <button onClick={() => handleDelete(p.id, p.nombre)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl animate-larry">
            <h2 className="text-xl font-black font-heading mb-6 flex items-center gap-2"><User size={20} className="text-violet-500"/> Editar Jugador</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                <input required type="text" value={editingPlayer.nombre} onChange={e => setEditingPlayer({...editingPlayer, nombre: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Teléfono</label>
                <input type="text" value={editingPlayer.telefono} onChange={e => setEditingPlayer({...editingPlayer, telefono: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Puntos</label>
                  <input type="number" value={editingPlayer.puntos} onChange={e => setEditingPlayer({...editingPlayer, puntos: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Victorias</label>
                  <input type="number" value={editingPlayer.ganadas} onChange={e => setEditingPlayer({...editingPlayer, ganadas: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all"/>
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setEditingPlayer(null)} className="flex-1 py-4 text-xs font-black uppercase text-slate-500 hover:text-white transition-all">Cancelar</button>
                <button type="submit" className="flex-2 py-4 bg-violet-600 rounded-2xl text-xs font-black uppercase text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FINANZAS ───────────────────────────────────────── */
function FinanzasView({ showToast, historicoSorteos }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sorteo, setSorteo] = useState('Sorteo Especial');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [vendidos, setVendidos] = useState(150);
  const [regalados, setRegalados] = useState(10);
  const [repartidos, setRepartidos] = useState(200);
  const [precio, setPrecio] = useState(10);
  const [premios, setPremios] = useState(500);

  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const totalRecaudado = vendidos * precio;
  const ganancia = totalRecaudado - premios;

  const handleSave = async () => {
    const data = { nombre: sorteo, fecha, vendidos, regalados, repartidos, precio, premios };
    if (editingId) {
      const res = await updateSorteo(editingId, data);
      if (res && res.error) showToast(`Error: ${res.error.message}`);
      else { setEditingId(null); showToast('Sorteo actualizado'); }
    } else {
      const res = await addSorteo(data);
      if (res && res.error) showToast(`Error BD: ${res.error.message}`);
      else showToast('Sorteo registrado');
    }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setSorteo(s.nombre);
    setFecha(s.fecha);
    setVendidos(s.vendidos);
    setRegalados(s.regalados);
    setRepartidos(s.repartidos);
    setPrecio(s.precio);
    setPremios(s.premios);
    showToast('Cargando detalles...');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSorteo(id);
    if (editingId === id) setEditingId(null);
    showToast('Sorteo eliminado');
  };

  const resetForm = () => {
    setEditingId(null);
    setSorteo('Nuevo Sorteo');
    setVendidos(0);
    setRegalados(0);
    setRepartidos(0);
    setPremios(0);
  };

  const sorteosMes = useMemo(() => {
    return historicoSorteos.filter(s => new Date(s.fecha).getMonth() === mesSeleccionado);
  }, [historicoSorteos, mesSeleccionado]);

  const statsMes = useMemo(() => {
    const v = sorteosMes.reduce((acc, s) => acc + (s.vendidos * s.precio), 0);
    const p = sorteosMes.reduce((acc, s) => acc + s.premios, 0);
    return { ingresos: v, ganancia: v - p };
  }, [sorteosMes]);

  return (
    <div className="space-y-8 animate-larry">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight">Finanzas</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-xl">
              <button onClick={() => setMesSeleccionado(m => Math.max(0, m-1))} className="p-1 hover:bg-white/10 rounded-lg"><ChevronLeft size={16}/></button>
              <span className="px-4 text-xs font-black uppercase tracking-widest w-32 text-center">{meses[mesSeleccionado]}</span>
              <button onClick={() => setMesSeleccionado(m => Math.min(11, m+1))} className="p-1 hover:bg-white/10 rounded-lg"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {editingId && <button onClick={resetForm} className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><X size={18}/></button>}
          <button onClick={() => showToast('Exportando PDF...')} className="flex-1 md:flex-none p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"><Download size={18}/> <span className="md:hidden text-xs font-bold uppercase">Exportar</span></button>
          <button onClick={handleSave} className={`${editingId ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-violet-600 shadow-violet-500/20'} flex-[2] md:flex-none text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all`}>
            {editingId ? 'Actualizar Sorteo' : 'Registrar Sorteo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input & Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card-larry p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-[#0d0d0d] to-black">
            <div className="space-y-4 md:col-span-1">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em]">Nombre</label>
              <input type="text" value={sorteo} onChange={e => setSorteo(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none" />
            </div>
            <div className="space-y-4 md:col-span-1">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em]">Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none [color-scheme:dark]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:col-span-2 pt-4">
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Venta</label><input type="number" value={vendidos} onChange={e=>setVendidos(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-violet-500/50"/></div>
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Regalo</label><input type="number" value={regalados} onChange={e=>setRegalados(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-violet-500/50"/></div>
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reparto</label><input type="number" value={repartidos} onChange={e=>setRepartidos(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-violet-500/50"/></div>
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Precio</label><input type="number" value={precio} onChange={e=>setPrecio(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-violet-500/50"/></div>
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Premios</label><input type="number" value={premios} onChange={e=>setPremios(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-violet-500/50"/></div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="card-larry p-8 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Desempeño Diario: {meses[mesSeleccionado]}</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-violet-500 rounded-full"></div><span className="text-[10px] font-black text-slate-500 uppercase">Ventas</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-rose-500 rounded-full"></div><span className="text-[10px] font-black text-slate-500 uppercase">Premios</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={sorteosMes.length > 0 ? sorteosMes.map(s => ({ d: new Date(s.fecha).getUTCDate(), v: s.vendidos * s.precio, p: s.premios })).sort((a,b) => a.d - b.d) : [{d:1,v:0,p:0}, {d:30,v:0,p:0}]} 
                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="mIng" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="mPre" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="d" 
                  tick={{fill:'#64748b', fontSize:8, fontWeight:800}} 
                  axisLine={false} 
                  tickLine={false} 
                  type="number"
                  domain={[1, 31]}
                  ticks={[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]}
                  interval={0}
                />
                <YAxis 
                  tick={{fill:'#64748b', fontSize:10, fontWeight:800}} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={v => v >= 1000 ? `${v/1000}k` : v} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.2)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="v" name="Ventas" stroke="#8b5cf6" strokeWidth={3} fill="url(#mIng)" animationDuration={1000} />
                <Area type="monotone" dataKey="p" name="Premios" stroke="#f43f5e" strokeWidth={3} fill="url(#mPre)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Totals Sidebar */}
        <div className="space-y-6">
          <div className="card-larry p-8 bg-violet-600/5 border-violet-500/20 flex flex-col gap-8">
            <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-[0.4em] border-b border-violet-500/10 pb-4">Balance {meses[mesSeleccionado]}</h4>
            
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ingresos Totales</p>
              <p className="text-4xl font-black text-white tracking-tighter">Bs. {statsMes.ingresos.toLocaleString()}</p>
            </div>

            <div className="space-y-1 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Ganancia Neta</p>
              <p className="text-4xl font-black text-emerald-400 tracking-tighter">Bs. {statsMes.ganancia.toLocaleString()}</p>
            </div>

            <div className="pt-6 space-y-4">
              <div className="flex justify-between items-end"><span className="text-[10px] font-black text-slate-500 uppercase">Tasa de Retorno</span><span className="text-sm font-black text-white">{((statsMes.ingresos > 0 ? (statsMes.ingresos - statsMes.ganancia)/statsMes.ingresos : 0)*100).toFixed(1)}%</span></div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-violet-500" style={{width: `${(statsMes.ingresos > 0 ? (statsMes.ingresos - statsMes.ganancia)/statsMes.ingresos : 0)*100}%`}}></div></div>
            </div>
          </div>

          <div className="card-larry p-6 space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Historial de Sorteos</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {sorteosMes.length === 0 && <p className="text-[10px] text-slate-700 uppercase font-black py-10 text-center italic">No hay registros este mes</p>}
              {sorteosMes.map(s => (
                <div key={s.id} onClick={() => handleEdit(s)} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${editingId === s.id ? 'bg-violet-600/10 border-violet-500/50' : 'bg-white/5 border-white/5 hover:border-violet-500/30'}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => handleDelete(s.id, e)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Eliminar Sorteo">
                      <Trash2 size={14}/>
                    </button>
                    <div>
                      <p className="text-[11px] font-black text-white group-hover:text-violet-400 transition-colors">{s.nombre}</p>
                      <p className="text-[9px] font-bold text-slate-500">{s.fecha}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-[11px] font-black text-emerald-400">Bs. {(s.vendidos * s.precio - s.premios).toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{s.vendidos} V / {s.regalados} R / {s.repartidos} Tot</p>
                    </div>
                    <ChevronRight size={12} className="text-slate-800 group-hover:text-violet-500 transition-colors"/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ALERTAS ────────────────────────────────────────── */
function AlertasView({ alertas, showToast }) {
  const [tab, setTab] = useState<'Activos'|'Historial'>('Activos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', detail: '', status: 'PENDIENTE' });

  const stats = useMemo(() => ({
    pendientes: alertas.filter(a => a.status === 'PENDIENTE').length,
    criticos: alertas.filter(a => a.status === 'CRITICO').length,
    baneados: alertas.filter(a => a.status === 'BANEADO').length,
  }), [alertas]);

  const openAdd = () => {
    setEditingAlert(null);
    setFormData({ name: '', detail: '', status: 'PENDIENTE' });
    setModalOpen(true);
  };

  const openEdit = (alert: any) => {
    setEditingAlert(alert);
    setFormData({ name: alert.name, detail: alert.detail, status: alert.status });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const colors: any = { 'PENDIENTE': 'amber', 'CRITICO': 'rose', 'BANEADO': 'slate', 'PAGADO': 'emerald' };
    
    if (editingAlert) {
      await updateAlerta(editingAlert.id, { ...formData, color: colors[formData.status] });
      showToast('Alerta actualizada');
    } else {
      await addAlerta({
        titulo: formData.name,
        detalle: formData.detail,
        estado: formData.status,
        color: colors[formData.status]
      });
      showToast('Nueva alerta creada');
    }
    setModalOpen(false);
  };

  const toggleStatus = async (id: string) => {
    const alert = alertas.find(a => a.id === id);
    if (!alert) return;
    const sequence: any = { 'PENDIENTE': 'CRITICO', 'CRITICO': 'BANEADO', 'BANEADO': 'PAGADO', 'PAGADO': 'PENDIENTE' };
    const colors: any = { 'PENDIENTE': 'amber', 'CRITICO': 'rose', 'BANEADO': 'slate', 'PAGADO': 'emerald' };
    const next = sequence[alert.estado || alert.status];
    await updateAlerta(id, { estado: next, status: next, color: colors[next] });
    showToast('Estado actualizado');
  };

  const deleteAlert = async (id: string) => {
    if (confirm('¿Eliminar esta alerta?')) {
      await deleteAlerta(id);
      showToast('Alerta eliminada');
    }
  };

  const items = tab === 'Activos' ? alertas.filter(a => a.estado !== 'PAGADO' && a.status !== 'PAGADO') : alertas.filter(a => a.estado === 'PAGADO' || a.status === 'PAGADO');

  return (
    <div className="space-y-4 md:space-y-6 animate-larry">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 bg-white/5 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5">
        <div>
          <h1 className="text-lg md:text-4xl font-black font-heading bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Control de Alertas</h1>
          <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Seguridad y deudas</p>
          <button onClick={openAdd} className="mt-4 md:mt-6 flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-violet-500/20"><Plus size={14}/> Nueva Alerta</button>
        </div>
        <div className="flex gap-2 md:gap-8 w-full lg:w-auto lg:pr-6 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 md:gap-4 min-w-max">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20"><Clock size={16}/></div>
            <div><p className="text-lg md:text-2xl font-black leading-none">{stats.pendientes}</p><p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase mt-1">Pendientes</p></div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 min-w-max border-x border-white/10 px-4 md:px-8">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20"><AlertCircle size={16}/></div>
            <div><p className="text-lg md:text-2xl font-black leading-none">{stats.criticos}</p><p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase mt-1">Críticos</p></div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 min-w-max">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400 border border-white/10"><Ban size={16}/></div>
            <div><p className="text-lg md:text-2xl font-black leading-none">{stats.baneados}</p><p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase mt-1">Baneados</p></div>
          </div>
        </div>
      </div>

      <div className="card-larry overflow-hidden">
        <div className="px-4 md:px-8 py-4 md:py-5 border-b border-white/5 flex justify-between items-center bg-[#0d0d0d]">
          <div className="flex gap-2 md:gap-4">
            <button onClick={()=>setTab('Activos')} className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all ${tab==='Activos'?'bg-violet-600 text-white shadow-lg shadow-violet-500/20':'text-slate-500 hover:text-white hover:bg-white/5'}`}>Activos</button>
            <button onClick={()=>setTab('Historial')} className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all ${tab==='Historial'?'bg-violet-600 text-white shadow-lg shadow-violet-500/20':'text-slate-500 hover:text-white hover:bg-white/5'}`}>Resueltos</button>
          </div>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {items.map((item) => (
            <div key={item.id} className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
              <div className="flex items-center gap-3 md:gap-5">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center border transition-all 
                  ${(item.estado || item.status) === 'CRITICO' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                    (item.estado || item.status) === 'PAGADO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                    (item.estado || item.status) === 'BANEADO' ? 'bg-slate-500/10 border-white/10 text-slate-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                  {(item.estado || item.status) === 'CRITICO' ? <AlertCircle size={16}/> : (item.estado || item.status) === 'BANEADO' ? <Ban size={16}/> : (item.estado || item.status) === 'PAGADO' ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-black text-white leading-none">{item.titulo || item.name}</h4>
                  <p className="text-[10px] md:text-[12px] font-bold mt-1 md:mt-1.5 text-slate-500 uppercase tracking-wider">{item.detalle || item.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  onClick={() => toggleStatus(item.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border transition-all active:scale-95 shadow-sm
                    ${(item.estado || item.status) === 'CRITICO' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white' : 
                      (item.estado || item.status) === 'PAGADO' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 
                      (item.estado || item.status) === 'BANEADO' ? 'bg-slate-500/10 border-white/10 text-slate-400 hover:bg-slate-700 hover:text-white' : 
                      'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white'}`}
                >
                  {item.estado || item.status}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-2 text-slate-600 hover:text-violet-400 transition-colors"><Settings size={14}/></button>
                  <button onClick={() => deleteAlert(item.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="py-20 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest italic">
              No hay alertas en esta categoría
            </div>
          )}
        </div>
      </div>

      {/* MODAL ALERTA */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-larry">
            <h2 className="text-xl font-black font-heading mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-rose-500"/> 
              {editingAlert ? 'Editar Alerta' : 'Nueva Alerta'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Jugador</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detalle / Motivo</label>
                <input required type="text" value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all" placeholder="Ej: Deuda de Bs. 50"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado Inicial</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-violet-500 outline-none transition-all">
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CRITICO">CRÍTICO</option>
                  <option value="BANEADO">BANEADO</option>
                  <option value="PAGADO">PAGADO</option>
                </select>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-500 hover:text-white transition-all">Cancelar</button>
                <button type="submit" className="flex-2 py-4 bg-violet-600 rounded-2xl text-xs font-black uppercase text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20">
                  {editingAlert ? 'Guardar Cambios' : 'Crear Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CONFIGURACIÓN ──────────────────────────────────── */
function ConfiguracionView({ showToast, user }) {
  const [activeSection, setActiveSection] = useState('General');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bingo_theme');
      return saved !== 'light-mode' && saved !== 'light-dark';
    }
    return true;
  });
  const [reducedAnim, setReducedAnim] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('bingo_anim') === 'reduced';
    return false;
  });
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (darkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('bingo_theme', 'blackout');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('bingo_theme', 'light-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedAnim) {
      document.body.classList.add('reduced-animations');
      localStorage.setItem('bingo_anim', 'reduced');
    } else {
      document.body.classList.remove('reduced-animations');
      localStorage.setItem('bingo_anim', 'normal');
    }
  }, [reducedAnim]);

  const sections = ['General','Cuenta','Seguridad'];

  const handleSave = () => {
    setSaved(true);
    showToast('Cambios guardados');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdatePass = async () => {
    if (!user?.id) { showToast('Sesión inválida'); return; }
    if (!passActual || !passNueva) { showToast('Completa los campos'); return; }
    setIsUpdatingPass(true);
    try {
      const { error } = await updatePassword(user.id, passActual, passNueva);
      if (error) {
        showToast(error as string);
      } else {
        showToast('✓ Clave actualizada');
        setPassActual('');
        setPassNueva('');
      }
    } catch {
      showToast('Error de conexión');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1000px]">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl md:text-3xl font-extrabold font-heading">Ajustes</h1><p className="text-slate-500 text-[10px] md:text-xs">Configuración del sistema</p></div>
        <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs active:scale-95 transition-all ${saved?'bg-emerald-600 shadow-lg shadow-emerald-500/20':'bg-violet-600 shadow-lg shadow-violet-500/20'}`}>
          {saved ? <Check size={14}/> : <Lock size={14}/>} {saved ? 'Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          {sections.map((s,i) => (
            <button key={s} onClick={()=>setActiveSection(s)} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${activeSection===s?'bg-white/10 text-white':'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {s === 'General' ? <Monitor size={14}/> : s === 'Cuenta' ? <User size={14}/> : <Lock size={14}/>}
              {s}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 card-larry p-8 space-y-8">
          {activeSection === 'General' && <>
            <SectionTitle icon={<Monitor size={16}/>} title="Interfaz" color="violet"/>
            <div className="grid gap-3">
              <ToggleItem label="Modo Blackout" description="Tema oscuro profundo" active={darkMode} onToggle={()=>setDarkMode(v=>!v)}/>
              <ToggleItem label="Reducir Animaciones" description="Optimizar rendimiento" active={reducedAnim} onToggle={()=>setReducedAnim(v=>!v)}/>
            </div>
          </>}


          {activeSection === 'Seguridad' && <>
            <SectionTitle icon={<Lock size={16}/>} title="Seguridad" color="rose"/>
            <div className="bg-[#0c0c0c] rounded-2xl border border-white/5 p-6 space-y-4">
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest">Cambiar Clave</h4>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="password" 
                  placeholder="Actual" 
                  value={passActual}
                  onChange={e => setPassActual(e.target.value)}
                  className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500"
                />
                <input 
                  type="password" 
                  placeholder="Nueva" 
                  value={passNueva}
                  onChange={e => setPassNueva(e.target.value)}
                  className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
              <button 
                onClick={handleUpdatePass} 
                disabled={isUpdatingPass}
                className={`w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs transition-all ${isUpdatingPass ? 'opacity-50' : ''}`}
              >
                {isUpdatingPass ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </>}

          {activeSection === 'Cuenta' && <>
            <SectionTitle icon={<User size={16}/>} title="Perfil" color="cyan"/>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label><input defaultValue="Admin Larry" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500"/></div>
              <div className="space-y-1.5"><label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label><input defaultValue="admin@bingo.com" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500"/></div>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

/* ─── REUSABLE ATOMS ─────────────────────────────────── */
function NavItem({ icon, label, active=false, badge=undefined, onClick=undefined as any }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${active?'sidebar-item-active text-white':'text-slate-400 hover:text-white hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">{icon}<span className="text-sm font-semibold">{label}</span></div>
      {badge && <span className="bg-rose-600 text-[12px] px-2 py-0.5 rounded-full text-white font-bold animate-pulse">{badge}</span>}
    </div>
  );
}

function TabGroup({ tabs, active, onChange }: { tabs: string[], active: string, onChange: (v:string)=>void }) {
  return (
    <div className="flex bg-[#121212] p-1 rounded-xl gap-1 border border-white/5">
      {tabs.map(t => (
        <button key={t} onClick={()=>onChange(t)} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${active===t?'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]':'text-slate-500 hover:text-white'}`}>{t}</button>
      ))}
    </div>
  );
}

function KPICard({ icon, label, value, trend="", trendUp=false, sparkData=[], color="#8b5cf6" }: any) {
  return (
    <div className="card-larry p-5 bg-[#0d0d0d] flex flex-col gap-4 group overflow-hidden relative">
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-violet-600/10 group-hover:text-violet-500 transition-all">{icon}</div>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-xl font-black text-white">{value}</p>
            {trend && <span className={`text-[11px] font-bold ${trendUp?'text-emerald-500':'text-rose-500'}`}>{trend}</span>}
          </div>
        </div>
      </div>
      
      {/* Mini Sparkline */}
      <div className="absolute bottom-0 left-0 right-0 h-12 opacity-50 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData.map((v, i) => ({ v, i }))}>
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="v" 
              stroke={color} 
              strokeWidth={2} 
              fill={`url(#spark-${label})`} 
              dot={false}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ReportCard({ label, value, color, trend="" }: any) {
  const css = { emerald:'border-l-emerald-500 bg-emerald-500/5 text-emerald-500', rose:'border-l-rose-500 bg-rose-500/5 text-rose-500', violet:'border-l-violet-500 bg-violet-500/5 text-violet-500' };
  return (
    <div className={`card-larry py-5 px-6 border-l-4 ${css[color]}`}>
      <p className="text-[12px] font-black uppercase tracking-widest opacity-50 mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {trend && <p className="text-[11px] font-bold mt-1 text-slate-400 uppercase">{trend} vs anterior</p>}
    </div>
  );
}

function AlertSummaryCard({ icon, value, label, color, border=false }) {
  const themes = { amber:'border-amber-500/30 bg-amber-500/5 text-amber-500', rose:'border-rose-500/30 bg-rose-500/5 text-rose-500', slate:'bg-white/5 text-white/50 border-white/10' };
  return <div className={`p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 md:gap-6 border ${border?'border-2':''} ${themes[color]}`}><div className="p-3 md:p-5 bg-black/50 rounded-2xl border border-white/5">{icon}</div><div><p className="text-2xl md:text-4xl font-black text-white">{value}</p><p className="text-[10px] md:text-[13px] font-black uppercase opacity-60 mt-1 tracking-widest">{label}</p></div></div>;
}

function AlertItem({ icon, name, detail, status, color, isBanned=false, isPaid=false }) {
  const cls = { amber:'text-amber-500 bg-amber-500/10 border-amber-500/20', rose:'text-rose-500 bg-rose-500/10 border-rose-500/20', slate:'text-slate-400 bg-white/5 border-white/10', emerald:'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  return (
    <div className="px-4 md:px-8 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-default group">
      <div className="flex items-center gap-3 md:gap-5">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all ${isBanned?'bg-rose-500/10 text-rose-500':isPaid?'bg-emerald-500/10 text-emerald-500':'bg-white/5 text-slate-500 group-hover:text-white'}`}>{icon}</div>
        <div>
          <h4 className="text-xs md:text-sm font-bold text-white leading-none">{name}</h4>
          <p className="text-[10px] md:text-[13px] font-medium mt-1 text-slate-400 uppercase tracking-wider truncate max-w-[150px] md:max-w-none">{detail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[9px] md:text-[12px] font-black uppercase tracking-widest border ${cls[color]}`}>{status}</span>
        <button className="p-2 text-slate-500 hover:text-white transition-colors"><ChevronRight size={14}/></button>
      </div>
    </div>
  );
}

function ToggleItem({ label, description, active, onToggle }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#0c0c0c] rounded-2xl border border-white/5">
      <div className="leading-tight"><h4 className="font-bold text-sm text-white">{label}</h4><p className="text-[12px] text-slate-400 font-bold mt-0.5 uppercase">{description}</p></div>
      <button onClick={onToggle} className={`w-10 h-5 rounded-full p-0.5 transition-all ${active?'bg-violet-600':'bg-white/10'}`} role="switch" aria-checked={active}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-all ${active?'translate-x-5':'translate-x-0'}`}></div>
      </button>
    </div>
  );
}

function SectionTitle({ icon, title, color }) {
  const cols = { violet:'text-violet-500 bg-violet-600/10', emerald:'text-emerald-500 bg-emerald-500/10', amber:'text-amber-500 bg-amber-500/10', rose:'text-rose-500 bg-rose-500/10', cyan:'text-cyan-500 bg-cyan-500/10' };
  return (
    <div className={`flex items-center gap-3 pb-3 border-b border-white/5 ${cols[color]?.split(' ')[0]}`}>
      <div className={`p-2 rounded-lg ${cols[color]}`}>{icon}</div>
      <h3 className="text-lg font-black font-heading">{title}</h3>
    </div>
  );
}

function ExpenseLegend({ color, label }) {
  return <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-sm" style={{backgroundColor:color}}></div><span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{label}</span></div>;
}

/* ─── GESTION DE USUARIOS ────────────────────────────── */
function GestionUsuariosView({ showToast }: { showToast: (m: string) => void }) {
  const users = useSystemUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ usuario: '', clave: '', rol: 'invitado' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createSystemUser(newUser.usuario, newUser.clave, newUser.rol);
    if (!error) {
      showToast('✓ Usuario creado correctamente');
      setIsModalOpen(false);
      setNewUser({ usuario: '', clave: '', rol: 'invitado' });
    } else {
      console.error(error);
      showToast(`Error: ${error.message || 'No se pudo crear'}`);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateSystemUser(id, { status });
    showToast(`Usuario ${status}`);
  };

  const handleKick = async (id: string) => {
    await updateSystemUser(id, { is_online: false }); // Logic for kick
    showToast('Usuario expulsado');
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-larry">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black font-heading bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">Usuarios</h1>
          <p className="text-[10px] md:text-base text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Control de Accesos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-violet-600/20"
        >
          <UserPlus size={18}/> Nuevo Acceso
        </button>
      </div>

      {/* Table - Hidden on all mobile/small tablets */}
      <div className="hidden lg:block card-larry overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] text-[12px] uppercase tracking-widest text-slate-500 font-black border-b border-white/5">
            <tr>
              <th className="px-8 py-5">Usuario</th>
              <th className="px-8 py-5">Rol</th>
              <th className="px-8 py-5">Estado</th>
              <th className="px-8 py-5">Conexión</th>
              <th className="px-8 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {users.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">No hay usuarios registrados</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500">
                      <User size={18}/>
                    </div>
                    <span className="font-bold text-sm text-white">{u.usuario}</span>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${u.rol === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border border-white/5'}`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className={`text-[12px] font-black uppercase tracking-widest ${u.status === 'aprobado' ? 'text-emerald-500' : u.status === 'rechazado' ? 'text-rose-500' : 'text-amber-500'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-8 py-4">
                  {u.is_online ? <span className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Online</span> : <span className="text-slate-700 font-bold uppercase text-[10px] tracking-widest">Offline</span>}
                </td>
                <td className="px-8 py-4 text-right space-x-2">
                  {u.status === 'pendiente' && (
                    <>
                      <button onClick={() => handleUpdateStatus(u.id, 'aprobado')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"><CheckCircle2 size={16}/></button>
                      <button onClick={() => handleUpdateStatus(u.id, 'rechazado')} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Ban size={16}/></button>
                    </>
                  )}
                  {u.is_online && <button onClick={() => handleKick(u.id)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"><Power size={16}/></button>}
                  <button onClick={() => deleteSystemUser(u.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-all"><LogOut size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Visible on Mobile and Tablets */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {users.length === 0 ? (
          <div className="card-larry p-12 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">No hay usuarios registrados</div>
        ) : users.map(u => (
          <div key={u.id} className="card-larry p-5 space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
                  <User size={20}/>
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight">{u.usuario}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${u.rol === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>{u.rol}</span>
                    {u.is_online && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"/> Online</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'aprobado' ? 'text-emerald-500' : u.status === 'rechazado' ? 'text-rose-500' : 'text-amber-500'}`}>
                    {u.status}
                 </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <div className="flex gap-2">
                {u.status === 'pendiente' && (
                  <>
                    <button onClick={() => handleUpdateStatus(u.id, 'aprobado')} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-500/20">Aprobar</button>
                    <button onClick={() => handleUpdateStatus(u.id, 'rechazado')} className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-rose-500/20">Rechazar</button>
                  </>
                )}
              </div>
              <div className="flex gap-1">
                {u.is_online && <button onClick={() => handleKick(u.id)} className="p-3 text-amber-500 bg-amber-500/5 rounded-xl border border-amber-500/10"><Power size={18}/></button>}
                <button onClick={() => deleteSystemUser(u.id)} className="p-3 text-slate-500 bg-white/5 rounded-xl border border-white/10"><LogOut size={18}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR USUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-larry">
            <h2 className="text-xl font-black font-heading mb-4">Nuevo Acceso</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
                <input required type="text" value={newUser.usuario} onChange={e => setNewUser({...newUser, usuario: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-violet-500 outline-none transition-all"/>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Clave</label>
                <input required type="password" value={newUser.clave} onChange={e => setNewUser({...newUser, clave: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-violet-500 outline-none transition-all"/>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol</label>
                <select value={newUser.rol} onChange={e => setNewUser({...newUser, rol: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-violet-500 outline-none transition-all">
                  <option value="invitado">Invitado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="pt-4 flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[10px] font-bold text-slate-500 hover:text-white transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-violet-600 rounded-xl text-[10px] font-black uppercase text-white hover:bg-violet-700 transition-all">Crear Perfil</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Outfit:wght@700;900&display=swap');
    
    :root {
      --violet-glow: 0 0 20px rgba(139, 92, 246, 0.3);
    }

    body {
      font-family: 'Inter', sans-serif;
      background: #000000;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      transition: background 0.5s ease;
    }

    select {
      color-scheme: dark !important;
      background-color: #0a0a0a !important;
      color: #ffffff !important;
    }

    select option {
      background-color: #1a1a1a !important;
      color: #ffffff !important;
    }

    /* Fix for some browsers that force white backgrounds */
    select:-webkit-autofill,
    select:focus {
      background-color: #0a0a0a !important;
      color: #ffffff !important;
    }

    body.light-mode {
      background-color: #e0f7fa !important; /* Azul turquesa muy claro */
      color: #0f172a !important;
    }

    body.light-mode [class~="bg-black"],
    body.light-mode [class~="bg-[#080808]"],
    body.light-mode [class~="bg-[#0d0d0d]"],
    body.light-mode [class~="bg-[#0a0a0a]"],
    body.light-mode [class~="bg-[#0c0c0c]"],
    body.light-mode [class~="bg-[#121212]"],
    body.light-mode [class~="bg-[#1a1a1c]"],
    body.light-mode [class~="bg-slate-900"] {
      background-color: #ffffff !important;
    }

    body.light-mode [class~="bg-black/90"] { background-color: rgba(255,255,255,0.9) !important; }
    body.light-mode [class~="bg-black/80"] { background-color: rgba(255,255,255,0.8) !important; }
    body.light-mode [class~="bg-black/60"] { background-color: rgba(255,255,255,0.6) !important; }
    body.light-mode [class~="bg-black/50"] { background-color: rgba(255,255,255,0.5) !important; }
    body.light-mode [class~="bg-black/40"] { background-color: rgba(255,255,255,0.4) !important; }

    body.light-mode [class~="bg-white/5"] { background-color: rgba(6,182,212,0.05) !important; }
    body.light-mode [class~="bg-white/10"] { background-color: rgba(6,182,212,0.1) !important; }
    body.light-mode [class~="bg-white/[0.02]"] { background-color: rgba(6,182,212,0.03) !important; }
    body.light-mode [class~="bg-white/[0.03]"] { background-color: rgba(6,182,212,0.05) !important; }
    
    body.light-mode [class~="text-white"] { color: #000000 !important; }
    
    /* Keep text white on primary colored buttons/blocks, but ignore gradient text */
    body.light-mode [class*="bg-violet-600"], body.light-mode [class*="bg-violet-600"] * { color: #ffffff !important; }
    body.light-mode [class*="bg-rose-600"], body.light-mode [class*="bg-rose-600"] * { color: #ffffff !important; }
    body.light-mode [class*="bg-emerald-600"], body.light-mode [class*="bg-emerald-600"] * { color: #ffffff !important; }
    body.light-mode [class*="bg-gradient-to-r"]:not([class~="bg-clip-text"]), body.light-mode [class*="bg-gradient-to-r"]:not([class~="bg-clip-text"]) * { color: #ffffff !important; }
    
    /* Darken text gradients for readability in light mode */
    body.light-mode [class~="bg-clip-text"][class~="from-rose-400"] { --tw-gradient-from: #e11d48 !important; }
    body.light-mode [class~="bg-clip-text"][class~="to-orange-400"] { --tw-gradient-to: #ea580c !important; }
    body.light-mode [class~="bg-clip-text"][class~="from-violet-400"] { --tw-gradient-from: #7c3aed !important; }
    body.light-mode [class~="bg-clip-text"][class~="to-cyan-400"] { --tw-gradient-to: #0891b2 !important; }
    body.light-mode [class~="bg-clip-text"][class~="from-white"] { --tw-gradient-from: #1e293b !important; }
    
    body.light-mode [class~="text-slate-300"] { color: #1e293b !important; }
    body.light-mode [class~="text-slate-400"] { color: #334155 !important; }
    body.light-mode [class~="text-slate-500"] { color: #475569 !important; }
    
    body.light-mode [class~="border-white/5"] { border-color: rgba(6,182,212,0.15) !important; }
    body.light-mode [class~="border-white/10"] { border-color: rgba(6,182,212,0.25) !important; }
    
    body.light-mode input, body.light-mode select {
      background-color: #f0fcfd !important;
      color: #000000 !important;
      border-color: rgba(6,182,212,0.3) !important;
    }
    body.light-mode input::placeholder { color: #0891b2 !important; opacity: 0.6 !important; }

    body.light-mode [class~="from-[#0d0d0d]"], body.light-mode [class~="to-black"], body.light-mode [class~="bg-gradient-to-br"], body.light-mode [class~="bg-gradient-to-b"] {
      background: #ffffff !important;
    }

    body.light-mode [class~="divide-white/[0.03]"] > :not([hidden]) ~ :not([hidden]) {
      border-color: rgba(6,182,212,0.15) !important;
    }
    
    body.light-mode [class~="hover:bg-white/[0.02]"]:hover,
    body.light-mode [class~="hover:bg-white/[0.01]"]:hover {
      background-color: rgba(6,182,212,0.08) !important;
    }

    body.light-mode .card-larry {
      background: #ffffff !important;
      border: 1px solid rgba(6,182,212,0.2) !important;
      box-shadow: 0 4px 24px rgba(6,182,212,0.05) !important;
    }

    body.reduced-animations *,
    body.reduced-animations *::before,
    body.reduced-animations *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    .font-heading { font-family: 'Outfit', sans-serif; }

    .card-larry {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 2rem;
      backdrop-filter: blur(16px);
      transition: all 0.5s ease;
    }

    @media (max-width: 768px) {
      .card-larry {
        border-radius: 1.5rem;
        padding: 1.25rem !important;
      }
      .md\:p-10 { padding: 1rem !important; }
    }

    .animate-larry {
      animation: larrySlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes larrySlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.5); }
  `}</style>
);

