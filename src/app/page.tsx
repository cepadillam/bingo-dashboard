'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, TrendingUp, Trophy, Users, DollarSign, BarChart4,
  Bell, Settings, LogOut, ChevronRight, Plus, MessageCircle, Search,
  Calendar, Download, Filter, AlertCircle, Clock, Ban, CheckCircle2,
  Lock, Volume2, Monitor, X, Check, ChevronLeft, ChevronDown, User,
  Eye, EyeOff, Shield, UserPlus, Power
} from 'lucide-react';
import { 
  useActiveSession, useTopPlayers, useRetentionPlayers, registerSale, 
  validateLogin, useSystemUsers, updateSystemUser, deleteSystemUser, createSystemUser 
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

        <p className="mt-10 text-center text-[12px] font-black text-slate-400 cursor-pointer hover:text-white transition-colors uppercase tracking-[0.2em] opacity-40">
          ¿Olvidaste tu contraseña?
        </p>
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

  return <DashboardContent user={user} onLogout={handleLogout} />;
}

function DashboardContent({ user, onLogout }: { user: any; onLogout: () => void }) {
  const { session } = useActiveSession();
  const topPlayers = useTopPlayers();
  const retentionPlayers = useRetentionPlayers();

  const [activeView, setActiveView] = useState('Resumen');
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

  const viewProps = { session, topPlayers, retentionPlayers, showToast };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-violet-500/30">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-header z-30 flex items-center justify-between px-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight font-heading">
          BINGO <span className="text-violet-500">Larry</span>
        </h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={20}/> : <Monitor size={20}/>} 
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-60 border-r border-white/5 flex flex-col fixed inset-y-0 bg-black z-50 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8">
          <h2 className="text-xl font-black text-white flex items-center gap-2 font-heading tracking-tighter">BINGO <span className="text-violet-500">Larry</span></h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-50">SISTEMA ADMINISTRATIVO</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'Resumen',        icon: <LayoutDashboard size={16}/> },
            { id: 'Ganancias',      icon: <TrendingUp size={16}/> },
            { id: 'Ganadores',      icon: <Trophy size={16}/> },
            { id: 'Jugadores',      icon: <Users size={16}/> },
            { id: 'Finanzas',       icon: <DollarSign size={16}/> },
            { id: 'Alertas',        icon: <Bell size={16}/>, badge: retentionPlayers.length || undefined },
            ...(user?.rol === 'admin' ? [{ id: 'Usuarios', icon: <Shield size={16}/> }] : []),
          ].map(item => (
            <NavItem 
              key={item.id} 
              icon={item.icon} 
              label={item.id} 
              active={activeView === item.id} 
              badge={item.badge} 
              onClick={() => { setActiveView(item.id); closeMobileMenu(); }} 
            />
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-0.5">
          <NavItem 
            icon={<Settings size={16}/>} 
            label="Configuración" 
            active={activeView === 'Configuración'} 
            onClick={() => { setActiveView('Configuración'); closeMobileMenu(); }} 
          />
          <NavItem icon={<LogOut size={16}/>} label="Cerrar Sesión" onClick={onLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 p-4 lg:p-8 min-h-screen overflow-x-hidden pt-24 lg:pt-8 bg-[#020202]">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {activeView === 'Resumen'       && <ResumenView {...viewProps} user={user} handleQuickSale={handleQuickSale} saleAmount={saleAmount} setSaleAmount={setSaleAmount} isSubmitting={isSubmitting} />}
          {activeView === 'Ganancias'     && <GananciasView {...viewProps} />}
          {activeView === 'Ganadores'     && <GanadoresView {...viewProps} />}
          {activeView === 'Jugadores'     && <JugadoresView {...viewProps} />}
          {activeView === 'Finanzas'      && <FinanzasView {...viewProps} />}
          {activeView === 'Alertas'       && <AlertasView {...viewProps} />}
          {activeView === 'Usuarios'      && user?.rol === 'admin' && <GestionUsuariosView showToast={showToast} />}
          {activeView === 'Configuración' && <ConfiguracionView showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

/* ─── RESUMEN ────────────────────────────────────────── */
/* ─── INTERACTIVE CHART UNIT ────────────────────────── */
function InteractiveChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data = [
    { day: 'Lun', val: 65, label: 'Bs. 4,200' },
    { day: 'Mar', val: 75, label: 'Bs. 3,100' },
    { day: 'Mie', val: 25, label: 'Bs. 8,400' },
    { day: 'Jue', val: 35, label: 'Bs. 6,800' },
    { day: 'Vie', val: 45, label: 'Bs. 5,900' },
    { day: 'Sab', val: 15, label: 'Bs. 9,200' },
    { day: 'Dom', val: 70, label: 'Bs. 3,400' },
  ];

  const xPoints = [0, 16.6, 33.3, 50, 66.6, 83.3, 100];
  const points = data.map((d, i) => `${xPoints[i]},${d.val}`).join(' L ');
  const pathData = `M${points}`;
  const areaData = `${pathData} L100,100 L0,100 Z`;

  return (
    <div className="flex-1 w-full relative pt-10 group/svg" onMouseLeave={() => setHoveredIndex(null)}>
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="glowG_Res" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
          </linearGradient>
          <filter id="neon_Res">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {hoveredIndex !== null && (
          <line x1={xPoints[hoveredIndex]} y1="0" x2={xPoints[hoveredIndex]} y2="100" stroke="rgba(124,58,237,0.4)" strokeWidth="0.5" strokeDasharray="2 1" />
        )}

        <path d={areaData} fill="url(#glowG_Res)" className="transition-all duration-500" />
        <path d={pathData} fill="none" stroke="#a78bfa" strokeWidth="1.5" filter="url(#neon_Res)" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500" />
        
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHoveredIndex(i)} className="cursor-pointer">
            <rect x={xPoints[i]-5} y="0" width="10" height="100" fill="transparent" />
            <circle cx={xPoints[i]} cy={d.val} r={hoveredIndex === i ? "3" : "1.5"} fill={hoveredIndex === i ? "#fff" : "#7c3aed"} className="transition-all duration-200" />
            {hoveredIndex === i && <circle cx={xPoints[i]} cy={d.val} r="6" fill="#7c3aed" opacity="0.3" className="animate-ping" />}
          </g>
        ))}
      </svg>

      {hoveredIndex !== null && (
        <div 
          className="absolute bg-white text-black p-2 rounded-lg shadow-2xl z-20 pointer-events-none animate-larry"
          style={{ 
            left: `${xPoints[hoveredIndex]}%`, 
            top: `${data[hoveredIndex].val}%`,
            transform: 'translate(-50%, -135%)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(124,58,237,0.2)'
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter leading-none mb-1">{data[hoveredIndex].day}</span>
            <span className="text-sm font-black text-black leading-none">{data[hoveredIndex].label}</span>
          </div>
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[11px] text-slate-500 font-bold px-1 py-4 uppercase tracking-tighter">
        {data.map(d => <span key={d.day}>{d.day}</span>)}
      </div>
    </div>
  );
}

function ResumenView({ session, topPlayers, handleQuickSale, saleAmount, setSaleAmount, isSubmitting, showToast, user }) {
  const [period, setPeriod] = useState('Hoy');
  const periods = ['Hoy', 'Semana', 'Mes'];

  return (
    <div className="space-y-6 animate-larry">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading">Dashboard</h1>
          <p className="text-slate-500 text-xs font-medium">Estado actual del Bingo Larry</p>
        </div>
        <TabGroup tabs={periods} active={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={<DollarSign size={16}/>} label="Ingresos"           value={`Bs. ${session?.total_recaudado || 0}`} trend="+12.5%" trendUp />
        <KPICard icon={<Users size={16}/>}      label="Ventas Hoy"         value={`${session?.cartones_vendidos || 0}`}  trend="+5.2%"  trendUp />
        <KPICard icon={<Trophy size={16}/>}     label="Premios"            value={`Bs. ${session?.premios_entregados || 0}`} trend="-1.1%"  />
        <KPICard icon={<TrendingUp size={16}/>} label="Precio Cartón"      value={`Bs. ${session?.precio_carton || 10}`} trend="Estable" trendUp />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Chart */}
        <div className="xl:col-span-2 card-larry p-6 h-[380px] flex flex-col relative group overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold flex items-center gap-2 font-heading"><TrendingUp size={16} className="text-violet-500"/> Flujo de Ingresos</h3>
            {user?.rol !== 'invitado' && (
              <form onSubmit={handleQuickSale} className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <input type="number" value={saleAmount} min={1} onChange={e => setSaleAmount(Number(e.target.value))} className="w-8 bg-transparent text-[13px] text-center focus:outline-none"/>
                <button type="submit" disabled={isSubmitting} className="p-1.5 bg-violet-600 rounded-md hover:bg-violet-700 active:scale-95 transition-all"><Plus size={12}/></button>
              </form>
            )}
          </div>
          <InteractiveChart />
        </div>

        {/* Winners */}
        <div className="card-larry p-6 flex flex-col h-[380px]">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2 font-heading"><Trophy size={16} className="text-amber-500"/> Últimos Ganadores</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {(topPlayers.length > 0 ? topPlayers.slice(0,5) : [1,2,3,4,5]).map((p, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => showToast(`Ver perfil de ${typeof p === 'object' ? p.nombre : 'Jugador 100'+i}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[13px] font-bold text-amber-500">#{i+1}</div>
                  <div><h4 className="font-bold text-xs text-white">{typeof p === 'object' ? p.nombre : `Jugador 100${i+1}`}</h4><p className="text-[12px] text-slate-500">Bs. 500 • Premio Mayor</p></div>
                </div>
                <ChevronRight size={12} className="text-slate-800 group-hover:text-violet-500 transition-colors"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── GANANCIAS ──────────────────────────────────────── */
function GananciasView({ showToast }) {
  const [period, setPeriod] = useState('Diario');
  const periods = ['Sorteo','Diario','Semanal','Mensual','Anual'];

  const dataMap: Record<string, { ventas: number[]; premios: number[] }> = {
    Sorteo:  { ventas: [3800,2600,4100,3200,4800,3500,4300], premios: [1200,900,9800,3700,2100,2800,3900] },
    Diario:  { ventas: [3800,2600,4100,3200,4800,3500,4300], premios: [1200,900,9800,3700,2100,2800,3900] },
    Semanal: { ventas: [8000,7200,9100,6800,10200,8400,9600], premios: [2800,3100,4200,2900,5100,3600,4400] },
    Mensual: { ventas: [32000,28000,41000,35000,47000,38000,44000], premios: [12000,9500,18000,14000,21000,15000,19000] },
    Anual:   { ventas: [380000,420000,350000,440000,510000,480000,520000], premios: [140000,160000,130000,170000,200000,185000,210000] },
  };
  const { ventas, premios } = dataMap[period];
  const labels = ['Sorteo 1','Sorteo 2','Sorteo 3','Sorteo 4','Sorteo 5','Sorteo 6','Sorteo 7'];
  const yTicks = [0, 2500, 5000, 7500, 10000];
  const W=700, H=220, PAD_L=45, PAD_R=15, PAD_T=15, PAD_B=10, maxY=10000;
  const cW=W-PAD_L-PAD_R, cH=H-PAD_T-PAD_B, n=labels.length;
  const xP = (i:number) => PAD_L + (i/(n-1))*cW;
  const yP = (v:number) => PAD_T + cH - Math.min(v,maxY)/maxY*cH;
  const path = (data:number[]) => data.map((v,i) => {
    const x=xP(i), y=yP(v);
    if(i===0) return `M${x},${y}`;
    const px=xP(i-1), py=yP(data[i-1]), cpx=(px+x)/2;
    return `C${cpx},${py} ${cpx},${y} ${x},${y}`;
  }).join(' ');
  const vPath=path(ventas), pPath=path(premios);

  const handleDownload = () => {
    const csv = ['Sorteo,Ventas,Premios', ...labels.map((l,i)=>`${l},${ventas[i]},${premios[i]}`)].join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download = `ganancias_${period.toLowerCase()}.csv`; a.click();
    showToast('Reporte descargado');
  };

  return (
    <div className="space-y-6 animate-larry">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-extrabold font-heading">Ganancias</h1><p className="text-slate-500 text-xs">Análisis de rentabilidad por sorteo</p></div>
        <div className="flex items-center gap-3">
          <TabGroup tabs={periods} active={period} onChange={setPeriod} />
          <div className="flex gap-2">
            <button onClick={handleDownload} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"><Download size={14}/></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportCard label="Ingreso Total"     value="Bs. 45,231" color="emerald" trend="+12%"/>
        <ReportCard label="Premios"           value="Bs. 12,450" color="rose"    trend="+5%"/>
        <ReportCard label="Utilidad Neta"      value="Bs. 32,781" color="violet"  trend="+15%"/>
      </div>

      <div className="card-larry p-8 flex flex-col overflow-hidden bg-gradient-to-b from-[#0d0d0d] to-black min-h-[500px]">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Análisis de Flujo Maestro</h3>
            <p className="text-[13px] text-slate-400 font-bold mt-1">VOLUMEN DE VENTAS VS RETORNO DE PREMIOS</p>
          </div>
          <div className="flex items-center gap-6 bg-black/50 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[13px] text-slate-400 font-black uppercase">Ventas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
              <span className="text-[13px] text-slate-400 font-black uppercase">Premios</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full relative">
          <svg viewBox={`0 0 ${W} ${H+40}`} className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01"/>
              </linearGradient>
              <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.01"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Grid Lines */}
            {yTicks.map(tick => { const y=yP(tick); return (
              <g key={tick}>
                <line x1={PAD_L} y1={y} x2={W-PAD_R} y2={y} stroke="white" strokeOpacity="0.03" strokeWidth="1"/>
                <text x={PAD_L-12} y={y+3} textAnchor="end" fontSize="10" fill="#475569" fontFamily="Inter" fontWeight="800">{tick===0?'0':`${tick/1000}k`}</text>
              </g>
            );})}

            <path d={`${path(ventas)} L${xP(6)},${yP(0)} L${xP(0)},${yP(0)} Z`} fill="url(#gradV)" />
            <path d={`${path(premios)} L${xP(6)},${yP(0)} L${xP(0)},${yP(0)} Z`} fill="url(#gradP)" />

            <path d={path(ventas)} fill="none" stroke="url(#gradV)" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" className="animate-dash" />
            <path d={path(premios)} fill="none" stroke="url(#gradP)" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" />

            {ventas.map((v,i) => (
              <g key={`v${i}`} className="cursor-pointer group">
                <circle cx={xP(i)} cy={yP(v)} r="6" fill="#0d0d0d" stroke="#10b981" strokeWidth="2" className="group-hover:r-8 transition-all" />
                <circle cx={xP(i)} cy={yP(v)} r="2" fill="#10b981" />
              </g>
            ))}
            {premios.map((v,i) => (
              <g key={`p${i}`} className="cursor-pointer group">
                <circle cx={xP(i)} cy={yP(v)} r="6" fill="#0d0d0d" stroke="#f43f5e" strokeWidth="2" />
                <circle cx={xP(i)} cy={yP(v)} r="2" fill="#f43f5e" />
              </g>
            ))}

            {labels.map((lbl,i) => <text key={lbl} x={xP(i)} y={PAD_T+cH+25} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="900" className="uppercase tracking-tighter">{lbl}</text>)}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── GANADORES ──────────────────────────────────────── */
function GanadoresView({ topPlayers }) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string|null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const allWinners = ['Juan Pérez','María Garcia','Carlos López','Ana Torres','Pedro Diaz','Luis Moreno','Carmen Vega','Roberto Díaz','Sandra Gil','Miguel Ruiz'];
  const filtered = allWinners.filter(n => n.toLowerCase().includes(query.toLowerCase()) && (!filterType || (filterType === 'pleno' ? allWinners.indexOf(n) % 2 === 0 : allWinners.indexOf(n) % 2 !== 0)));

  return (
    <div className="space-y-6 animate-larry">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-extrabold font-heading">Ganadores</h1><p className="text-slate-500 text-xs">Historial de premios y sorteos</p></div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
            <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..." className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-violet-500/50 text-[13px] w-40"/>
          </div>
          <button onClick={()=>setShowFilter(!showFilter)} className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold transition-all text-[13px] ${showFilter||filterType?'bg-violet-600 border-violet-500 text-white':'bg-white/5 border-white/10 text-slate-300'}`}><Filter size={14}/> Filtrar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <div className="xl:col-span-3 card-larry overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[12px] uppercase text-slate-500 font-black border-b border-white/5 bg-[#0d0d0d]">
              <tr><th className="py-4 px-6">Jugador</th><th className="py-4 px-6 text-center">Tipo</th><th className="py-4 px-6 text-right">Monto</th><th className="py-4 px-6">Sorteo</th><th className="py-4 px-6 text-right">Fecha</th></tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map((p,i) => (
                <tr key={i} className="group hover:bg-white/[0.02] cursor-pointer">
                  <td className="py-3 px-6"><div className="flex items-center gap-3"><div className="w-7 h-7 rounded-lg bg-violet-600/10 text-violet-500 flex items-center justify-center font-bold text-[13px]">{p.charAt(0)}</div><span className="font-bold text-xs">{p}</span></div></td>
                  <td className="py-3 px-6 text-center"><span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-tighter ${i%2===0?'bg-amber-500/10 text-amber-500':'bg-cyan-500/10 text-cyan-500'}`}>{i%2===0?'Pleno':'Línea'}</span></td>
                  <td className="py-3 px-6 text-right text-emerald-400 font-black text-xs">Bs. {500+i*100}</td>
                  <td className="py-3 px-6 text-[12px] text-slate-500 font-bold">#123{i} • #{45-i}</td>
                  <td className="py-3 px-6 text-right text-slate-400 text-[12px] font-bold">20/03/24</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <div className="card-larry p-5 bg-gradient-to-br from-violet-600/10 to-transparent border border-violet-500/20">
            <h3 className="text-[12px] font-black text-violet-400 uppercase tracking-widest mb-4">Top Ganador</h3>
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-sm">C</div><div><h4 className="text-sm font-black italic">Carlos López</h4><p className="text-amber-500 text-[11px] font-bold uppercase tracking-tighter">🏆 3 Bingos Ganados</p></div></div>
            <div className="space-y-2"><div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase"><span>Total</span><span>Bs. 4,500</span></div><div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[70%]"/></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── JUGADORES ──────────────────────────────────────── */
function JugadoresView({ topPlayers }) {
  const [query, setQuery] = useState('');
  const all = ['Juan Pérez','María Garcia','Carlos López','Ana Torres','Pedro Diaz','Luis Moreno','Carmen Vega','Roberto Díaz','Sandra Gil','Miguel Ruiz'];
  const filtered = all.filter(n => n.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6 animate-larry">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-extrabold font-heading">Jugadores</h1><p className="text-slate-500 text-xs">Base de datos de participantes</p></div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} type="text" placeholder="Buscar..." className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-violet-500/50 text-[13px] w-48"/>
        </div>
      </div>
      <div className="card-larry overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-[12px] uppercase text-slate-500 font-black border-b border-white/5 bg-[#0d0d0d]">
            <tr><th className="py-4 px-8">Jugador</th><th className="py-4 px-8 text-center">Victorias</th><th className="py-4 px-8 text-center">Partidas</th><th className="py-4 px-8 text-right">Registro</th></tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map((p,i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <td className="py-3 px-8"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-400 font-bold flex items-center justify-center text-[13px]">{p.charAt(0)}</div><div><div className="font-bold text-xs">{p}</div><div className="text-[11px] text-slate-400">ID: #{1000+i}</div></div></div></td>
                <td className="py-3 px-8 text-center"><span className="text-emerald-400 font-black text-lg">{Math.max(0, 10-i)}</span></td>
                <td className="py-3 px-8 text-center text-slate-500 font-bold text-xs">{50 - i*3}</td>
                <td className="py-3 px-8 text-right text-slate-500 text-[13px] font-bold italic">20/03/24</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── FINANZAS ───────────────────────────────────────── */
function FinanzasView({ showToast }) {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [monthIdx, setMonthIdx] = useState(2);

  return (
    <div className="space-y-6 animate-larry">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-extrabold font-heading">Finanzas</h1><p className="text-slate-500 text-xs">Balance y rentabilidad operativa</p></div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl border border-white/10 p-1">
          <button onClick={()=>setMonthIdx(i=>Math.max(0,i-1))} className="p-1 px-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"><ChevronLeft size={14}/></button>
          <span className="px-3 font-bold text-[13px] min-w-[80px] text-center uppercase tracking-widest">{months[monthIdx]}</span>
          <button onClick={()=>setMonthIdx(i=>Math.min(11,i+1))} className="p-1 px-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"><ChevronRight size={14}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={<DollarSign size={16}/>} label="Ingresos Brutos"   value="Bs. 24,560" trend="+8.2%" trendUp/>
        <KPICard icon={<BarChart4 size={16}/>}    label="Costos"           value="Bs. 4,230"  trend="+2.1%"/>
        <KPICard icon={<CreditCardIcon size={16}/>} label="Premios"         value="Bs. 12,450" trend="50.6%" trendUp/>
        <div className="card-larry p-5 bg-violet-600/5 border border-violet-500/20 flex items-center justify-between">
          <div><h4 className="text-[11px] font-black text-violet-400 uppercase tracking-widest leading-none mb-1">Rentabilidad</h4><p className="text-xl font-black text-white leading-none">32.1%</p></div>
          <p className="text-[11px] font-bold text-violet-500 uppercase px-2 py-1 bg-violet-500/10 rounded-md">Saludable</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card-larry p-6 flex flex-col h-[380px]">
          <h3 className="text-xs font-black uppercase text-slate-500 mb-6">Balance Ingresos vs Egresos</h3>
          <div className="flex-1 flex items-end gap-6 px-4 relative">
            {['Ene','Feb','Mar','Abr','May','Jun'].map((m,i) => (
              <div key={m} className="flex-1 flex gap-1 items-end justify-center relative h-full">
                <div className="w-4 bg-emerald-500/60 rounded-t-sm" style={{height:`${40+i*8}%`}}></div>
                <div className="w-4 bg-rose-500/60  rounded-t-sm" style={{height:`${20+i%3*10}%`}}></div>
                <span className="absolute -bottom-6 text-[11px] text-slate-400 font-bold uppercase">{m}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-10">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-[11px] font-bold text-slate-400 uppercase">Ingresos</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-rose-500 rounded-full"></div><span className="text-[11px] font-bold text-slate-400 uppercase">Egresos</span></div>
          </div>
        </div>

        <div className="card-larry p-6 flex flex-col items-center justify-center">
          <h3 className="text-xs font-black uppercase text-slate-500 mb-6 self-start">Gastos</h3>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="#22d3ee" strokeWidth="4" strokeDasharray="30 100"/>
              <circle cx="16" cy="16" r="14" fill="none" stroke="#7c3aed" strokeWidth="4" strokeDasharray="40 100" strokeDashoffset="-30"/>
              <circle cx="16" cy="16" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-70"/>
              <circle cx="16" cy="16" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-85"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col"><span className="text-[11px] text-slate-400 font-bold uppercase">Total</span><span className="text-xl font-black italic text-white">100%</span></div>
          </div>
          <div className="w-full grid grid-cols-2 gap-x-4 gap-y-3 mt-8">
            <ExpenseLegend color="#22d3ee" label="Op."/>
            <ExpenseLegend color="#10b981" label="Mkt."/>
            <ExpenseLegend color="#7c3aed" label="Prm."/>
            <ExpenseLegend color="#f59e0b" label="Res."/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ALERTAS ────────────────────────────────────────── */
function AlertasView({ retentionPlayers, showToast }) {
  const [tab, setTab] = useState<'Activos'|'Historial'>('Activos');

  const activos = [
    { icon: <Clock size={14}/>,       name: 'Juan Pérez',   detail: 'Deuda de Bs. 50 • 2024-03-20',  status: 'PENDIENTE', color: 'amber' as const },
    { icon: <AlertCircle size={14}/>, name: 'Carlos Ruiz',  detail: 'Deuda de Bs. 120 • 2024-03-18', status: 'CRÍTICO',   color: 'rose' as const,  isBanned: false },
    { icon: <Ban size={14}/>,         name: 'Maria T.',     detail: 'Baneado el 2024-03-15',          status: 'BANEADO',   color: 'slate' as const, isBanned: true },
    { icon: <CheckCircle2 size={14}/>,name: 'Ana Lopez',    detail: 'Deuda de Bs. 20 • 2024-03-21',  status: 'PAGADO',    color: 'emerald' as const, isPaid: true },
  ];

  const historial = [
    { icon: <CheckCircle2 size={14}/>,name: 'Roberto Diaz', detail: 'Deuda saldada Bs. 80 • 2024-03-01', status: 'RESUELTO', color: 'emerald' as const, isPaid: true },
    { icon: <CheckCircle2 size={14}/>,name: 'Sandra Gil',   detail: 'Deuda saldada Bs. 30 • 2024-02-28', status: 'RESUELTO', color: 'emerald' as const, isPaid: true },
  ];
  const items = tab === 'Activos' ? activos : historial;

  return (
    <div className="space-y-6 animate-larry">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold font-heading">Alertas</h1>
          <p className="text-slate-500 text-xs mt-0.5">Gestión de riesgos y deudas</p>
        </div>
        <div className="flex gap-10 pr-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Clock size={18}/></div>
            <div><p className="text-lg font-black leading-none">12</p><p className="text-[12px] font-bold text-slate-500 uppercase mt-1">Pendientes</p></div>
          </div>
          <div className="flex items-center gap-3 border-x border-white/10 px-10">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><AlertCircle size={18}/></div>
            <div><p className="text-lg font-black leading-none">5</p><p className="text-[12px] font-bold text-slate-500 uppercase mt-1">Críticos</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400"><Ban size={18}/></div>
            <div><p className="text-lg font-black leading-none">3</p><p className="text-[12px] font-bold text-slate-500 uppercase mt-1">Baneados</p></div>
          </div>
        </div>
      </div>

      <div className="card-larry overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#0d0d0d]">
          <div className="flex gap-4">
            <button onClick={()=>setTab('Activos')} className={`text-[13px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${tab==='Activos'?'bg-violet-600 text-white shadow-lg shadow-violet-500/20':'text-slate-500 hover:text-white'}`}>Activos</button>
            <button onClick={()=>setTab('Historial')} className={`text-[13px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${tab==='Historial'?'bg-violet-600 text-white shadow-lg shadow-violet-500/20':'text-slate-500 hover:text-white'}`}>Historial</button>
          </div>
          <button onClick={()=>showToast('Filtros aplicados')} className="text-slate-500 hover:text-white text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 px-4 py-2 border border-white/5 rounded-xl"><Filter size={14}/> Filtrar</button>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {items.map((item, i) => (
            <AlertItem key={i} {...item}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CONFIGURACIÓN ──────────────────────────────────── */
function ConfiguracionView({ showToast }) {
  const [activeSection, setActiveSection] = useState('General');
  const [darkMode, setDarkMode] = useState(true);
  const [reducedAnim, setReducedAnim] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [saved, setSaved] = useState(false);

  const sections = ['General','Cuenta','Notificaciones','Seguridad'];

  const handleSave = () => {
    setSaved(true);
    showToast('Cambios guardados');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-larry max-w-[1000px]">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-extrabold font-heading">Ajustes</h1><p className="text-slate-500 text-xs">Configuración del sistema</p></div>
        <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs active:scale-95 transition-all ${saved?'bg-emerald-600 shadow-lg shadow-emerald-500/20':'bg-violet-600 shadow-lg shadow-violet-500/20'}`}>
          {saved ? <Check size={14}/> : <Lock size={14}/>} {saved ? 'Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          {sections.map((s,i) => (
            <button key={s} onClick={()=>setActiveSection(s)} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${activeSection===s?'bg-white/10 text-white':'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {i===0?<Monitor size={14}/>:i===1?<User size={14}/>:i===2?<Bell size={14}/>:<Lock size={14}/>}
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

          {activeSection === 'Notificaciones' && <>
            <SectionTitle icon={<Bell size={16}/>} title="Alertas" color="amber"/>
            <div className="grid gap-3">
              <ToggleItem label="Email" description="Resúmenes diarios" active={emailNotif} onToggle={()=>setEmailNotif(v=>!v)}/>
              <ToggleItem label="Push" description="Tiempo real" active={pushNotif} onToggle={()=>setPushNotif(v=>!v)}/>
            </div>
          </>}

          {activeSection === 'Seguridad' && <>
            <SectionTitle icon={<Lock size={16}/>} title="Seguridad" color="rose"/>
            <div className="bg-[#0c0c0c] rounded-2xl border border-white/5 p-6 space-y-4">
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest">Cambiar Clave</h4>
              <div className="grid grid-cols-2 gap-3">
                <input type="password" placeholder="Actual" className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500"/>
                <input type="password" placeholder="Nueva" className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500"/>
              </div>
              <button onClick={()=>showToast('Clave actualizada')} className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs transition-all">Actualizar</button>
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

function KPICard({ icon, label, value, trend, trendUp=false }) {
  return (
    <div className="card-larry p-5 bg-[#0d0d0d] flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-violet-600/10 group-hover:text-violet-500 transition-all">{icon}</div>
      <div className="flex-1">
        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-xl font-black text-white">{value}</p>
          <span className={`text-[11px] font-bold ${trendUp?'text-emerald-500':'text-rose-500'}`}>{trend}</span>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ label, value, color, trend }) {
  const css = { emerald:'border-l-emerald-500 bg-emerald-500/5 text-emerald-500', rose:'border-l-rose-500 bg-rose-500/5 text-rose-500', violet:'border-l-violet-500 bg-violet-500/5 text-violet-500' };
  return (
    <div className={`card-larry py-5 px-6 border-l-4 ${css[color]}`}>
      <p className="text-[12px] font-black uppercase tracking-widest opacity-50 mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[11px] font-bold mt-1 text-slate-400 uppercase">{trend} vs anterior</p>
    </div>
  );
}

function AlertSummaryCard({ icon, value, label, color, border=false }) {
  const themes = { amber:'border-amber-500/30 bg-amber-500/5 text-amber-500', rose:'border-rose-500/30 bg-rose-500/5 text-rose-500', slate:'bg-white/5 text-white/50 border-white/10' };
  return <div className={`p-8 rounded-[2rem] flex items-center gap-6 border ${border?'border-2':''} ${themes[color]}`}><div className="p-5 bg-black/50 rounded-2xl border border-white/5">{icon}</div><div><p className="text-4xl font-black text-white">{value}</p><p className="text-[13px] font-black uppercase opacity-60 mt-1 tracking-widest">{label}</p></div></div>;
}

function AlertItem({ icon, name, detail, status, color, isBanned=false, isPaid=false }) {
  const cls = { amber:'text-amber-500 bg-amber-500/10 border-amber-500/20', rose:'text-rose-500 bg-rose-500/10 border-rose-500/20', slate:'text-slate-400 bg-white/5 border-white/10', emerald:'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  return (
    <div className="px-8 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-default group">
      <div className="flex items-center gap-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isBanned?'bg-rose-500/10 text-rose-500':isPaid?'bg-emerald-500/10 text-emerald-500':'bg-white/5 text-slate-500 group-hover:text-white'}`}>{icon}</div>
        <div>
          <h4 className="text-sm font-bold text-white leading-none">{name}</h4>
          <p className="text-[13px] font-medium mt-1 text-slate-400 uppercase tracking-wider">{detail}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-lg text-[12px] font-black uppercase tracking-widest border ${cls[color]}`}>{status}</span>
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

function CreditCardIcon(p: any) {
  return <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
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
      showToast('Usuario creado correctamente');
      setIsModalOpen(false);
      setNewUser({ usuario: '', clave: '', rol: 'invitado' });
    } else showToast('Error al crear usuario');
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
    <div className="space-y-10 animate-larry">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight font-heading">Usuarios</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestiona accesos, roles y permisos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-violet-500/20"
        >
          <UserPlus size={18}/> Crear Acceso
        </button>
      </div>

      <div className="card-larry overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0d0d0d] text-[12px] uppercase tracking-widest text-slate-500 font-black border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Conexión</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {users.map(u => (
              <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-500 text-[13px]">
                      <User size={14}/>
                    </div>
                    <span className="font-bold text-xs text-white">{u.usuario}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-tighter ${u.rol === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border border-white/5'}`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`text-[12px] font-bold uppercase tracking-tighter ${u.status === 'aprobado' ? 'text-emerald-500' : u.status === 'rechazado' ? 'text-rose-500' : 'text-amber-500'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-[9px]">
                  {u.is_online ? <span className="flex items-center gap-1.5 text-emerald-400 font-bold">Online</span> : <span className="text-slate-700 font-bold uppercase">Offline</span>}
                </td>
                <td className="px-6 py-3 text-right space-x-1">
                  {u.status === 'pendiente' && (
                    <>
                      <button onClick={() => handleUpdateStatus(u.id, 'aprobado')} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-all"><CheckCircle2 size={14}/></button>
                      <button onClick={() => handleUpdateStatus(u.id, 'rechazado')} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"><Ban size={14}/></button>
                    </>
                  )}
                  {u.is_online && <button onClick={() => handleKick(u.id)} className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-md transition-all" title="Expulsar"><Power size={14}/></button>}
                  <button onClick={() => deleteSystemUser(u.id)} className="p-1.5 text-slate-700 hover:text-rose-500 transition-all"><LogOut size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
