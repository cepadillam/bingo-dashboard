'use client';
// Vercel Deployment Trigger - v1.0.1

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, TrendingUp, Trophy, Users, DollarSign, BarChart4,
  Bell, Settings, LogOut, ChevronRight, Plus, MessageCircle, Search,
  Calendar, Download, Filter, AlertCircle, Clock, Ban, CheckCircle2,
  Lock, Volume2, Monitor, X, Check, ChevronLeft, ChevronDown
} from 'lucide-react';
import { useActiveSession, useTopPlayers, useRetentionPlayers, registerSale } from './supabase-hooks';

/* ─── Toast Notification ─────────────────────────────── */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-8 right-8 z-50 bg-violet-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-violet-500/30 animate-larry">
      <Check size={18}/> <span className="font-bold text-sm">{msg}</span>
    </div>
  );
}

/* ─── Root Dashboard ─────────────────────────────────── */
export default function BingoDashboard() {
  const { session } = useActiveSession();
  const topPlayers = useTopPlayers();
  const retentionPlayers = useRetentionPlayers();

  const [activeView, setActiveView] = useState('Resumen');
  const [saleAmount, setSaleAmount] = useState<number>(1);
  const [salePrice, setSalePrice] = useState<number>(session?.precio_carton || 10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-violet-500/30">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col fixed inset-y-0 bg-black z-20">
        <div className="p-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">BINGO <span className="text-violet-500">Larry</span></h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'Resumen',        icon: <LayoutDashboard size={18}/> },
            { id: 'Ganancias',      icon: <TrendingUp size={18}/> },
            { id: 'Ganadores',      icon: <Trophy size={18}/> },
            { id: 'Jugadores',      icon: <Users size={18}/> },
            { id: 'Finanzas',       icon: <DollarSign size={18}/> },
            { id: 'Alertas',        icon: <Bell size={18}/>, badge: retentionPlayers.length || undefined },
          ].map(item => (
            <NavItem key={item.id} icon={item.icon} label={item.id} active={activeView === item.id} badge={item.badge} onClick={() => setActiveView(item.id)} />
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-1">
          <NavItem icon={<Settings size={18}/>} label="Configuración" active={activeView === 'Configuración'} onClick={() => setActiveView('Configuración')} />
          <NavItem icon={<LogOut size={18}/>} label="Cerrar Sesión" onClick={() => showToast('Sesión cerrada')} />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-10 min-h-screen overflow-x-hidden">
        {activeView === 'Resumen'       && <ResumenView {...viewProps} handleQuickSale={handleQuickSale} saleAmount={saleAmount} setSaleAmount={setSaleAmount} isSubmitting={isSubmitting} />}
        {activeView === 'Ganancias'     && <GananciasView {...viewProps} />}
        {activeView === 'Ganadores'     && <GanadoresView {...viewProps} />}
        {activeView === 'Jugadores'     && <JugadoresView {...viewProps} />}
        {activeView === 'Finanzas'      && <FinanzasView {...viewProps} />}
        {activeView === 'Alertas'       && <AlertasView {...viewProps} />}
        {activeView === 'Configuración' && <ConfiguracionView showToast={showToast} />}
      </main>
    </div>
  );
}

/* ─── RESUMEN ────────────────────────────────────────── */
function ResumenView({ session, topPlayers, handleQuickSale, saleAmount, setSaleAmount, isSubmitting, showToast }) {
  const [period, setPeriod] = useState('Hoy');
  const periods = ['Hoy', 'Semana', 'Mes'];

  return (
    <div className="space-y-8 animate-larry">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold">Resumen General</h1>
          <p className="text-slate-500 mt-2">Vista rápida del estado del Bingo</p>
        </div>
        <TabGroup tabs={periods} active={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard icon={<DollarSign size={20} className="text-slate-400"/>} label="Ingresos Totales"  value={`Bs. ${session?.total_recaudado || 0}`} trend="+5.1%"  trendUp />
        <KPICard icon={<Users size={20} className="text-slate-400"/>}     label="Jugadores Activos" value="340"                                        trend="+5.2%"  trendUp />
        <KPICard icon={<Trophy size={20} className="text-slate-400"/>}    label="Premios Pagados"   value={`Bs. ${session?.premios_entregados || 0}`} trend="-2.1%"  />
        <KPICard icon={<TrendingUp size={20} className="text-slate-400"/>} label="Utilidad Neta"    value={`Bs. ${session?.ganancia_neta || 0}`}       trend="+18.4%" trendUp />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Chart */}
        <div className="xl:col-span-2 card-larry p-8 h-[450px] flex flex-col relative group overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp size={18} className="text-violet-500"/> Flujo de Ingresos</h3>
            <form onSubmit={handleQuickSale} className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <input type="number" value={saleAmount} min={1} onChange={e => setSaleAmount(Number(e.target.value))} className="w-10 bg-transparent text-xs text-center focus:outline-none"/>
              <button type="submit" disabled={isSubmitting} className="p-2 bg-violet-600 rounded-lg hover:bg-violet-700 active:scale-95 transition-all"><Plus size={14}/></button>
            </form>
          </div>
          <div className="flex-1 w-full relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4"/><stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/></linearGradient></defs>
              <path d="M0,100 L0,40 C20,30 40,75 50,65 C60,55 80,85 100,30 L100,100 Z" fill="url(#rg)"/>
              <path d="M0,40 C20,30 40,75 50,65 C60,55 80,85 100,30" fill="none" stroke="#7c3aed" strokeWidth="0.5"/>
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-600 font-bold px-2 py-4">
              <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span><span>Dom</span>
            </div>
          </div>
        </div>

        {/* Winners */}
        <div className="card-larry p-8 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2"><Trophy size={18} className="text-amber-500"/> Últimos Ganadores</h3>
          <div className="space-y-6">
            {(topPlayers.length > 0 ? topPlayers.slice(0,5) : [1,2,3,4,5]).map((p, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => showToast(`Ver perfil de ${typeof p === 'object' ? p.nombre : 'Jugador 100'+i}`)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-xs font-bold text-amber-500">#{i+1}</div>
                  <div><h4 className="font-bold text-sm">{typeof p === 'object' ? p.nombre : `Jugador 100${i+1}`}</h4><p className="text-[10px] text-slate-500">Bs. 500 • Premio Mayor</p></div>
                </div>
                <ChevronRight size={14} className="text-slate-800 group-hover:text-violet-500 transition-colors"/>
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

  // Data varies by period for demo
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
  const W=700, H=280, PAD_L=52, PAD_R=20, PAD_T=20, PAD_B=10, maxY=10000;
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
  const vArea=`${vPath} L${xP(n-1)},${PAD_T+cH} L${xP(0)},${PAD_T+cH} Z`;
  const pArea=`${pPath} L${xP(n-1)},${PAD_T+cH} L${xP(0)},${PAD_T+cH} Z`;

  const handleDownload = () => {
    const csv = ['Sorteo,Ventas,Premios', ...labels.map((l,i)=>`${l},${ventas[i]},${premios[i]}`)].join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download = `ganancias_${period.toLowerCase()}.csv`; a.click();
    showToast('Reporte descargado');
  };

  return (
    <div className="space-y-10 animate-larry">
      <div className="flex justify-between items-start">
        <div><h1 className="text-4xl font-bold">Reporte de Ganancias</h1><p className="text-slate-500 mt-2">Análisis detallado de rentabilidad por sorteo</p></div>
        <div className="flex items-center gap-4">
          <TabGroup tabs={periods} active={period} onChange={setPeriod} />
          <div className="flex gap-2">
            <button onClick={() => showToast('Selecciona un rango de fechas')} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95"><Calendar size={18}/></button>
            <button onClick={handleDownload} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95"><Download size={18}/></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReportCard label="Ingreso Total"     value="Bs. 45,231.00" color="emerald" trend="+12%"/>
        <ReportCard label="Premios Entregados" value="Bs. 12,450.00" color="rose"    trend="+5%"/>
        <ReportCard label="Utilidad Neta"      value="Bs. 32,781.00" color="violet"  trend="+15%"/>
      </div>

      <div className="card-larry p-10 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold">Comparativa de Rendimiento</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><div className="w-8 h-0.5 bg-rose-500 rounded-full"></div><span className="text-[10px] text-slate-500 font-black uppercase">Premios</span></div>
            <div className="flex items-center gap-2"><div className="w-8 border-t-2 border-dashed border-emerald-500"></div><span className="text-[10px] text-slate-500 font-black uppercase">Ventas</span></div>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H+30}`} className="w-full" style={{height:'340px'}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/><stop offset="100%" stopColor="#10b981" stopOpacity="0.02"/></linearGradient>
              <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3"/><stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02"/></linearGradient>
            </defs>
            {yTicks.map(tick => { const y=yP(tick); return (
              <g key={tick}>
                <line x1={PAD_L} y1={y} x2={W-PAD_R} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                <text x={PAD_L-8} y={y+4} textAnchor="end" fontSize="9" fill="#4b5563" fontFamily="Inter,sans-serif" fontWeight="700">{tick===0?'0':`${tick/1000}k`}</text>
              </g>
            );})}
            {labels.map((_,i) => <line key={i} x1={xP(i)} y1={PAD_T} x2={xP(i)} y2={PAD_T+cH} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
            <path d={vArea} fill="url(#gV)"/>
            <path d={pArea} fill="url(#gP)"/>
            <path d={vPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 3"/>
            <path d={pPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
            {ventas.map((v,i) => <g key={`v${i}`}><circle cx={xP(i)} cy={yP(v)} r="5" fill="#0d0d0d" stroke="#10b981" strokeWidth="2"/><circle cx={xP(i)} cy={yP(v)} r="2" fill="#10b981"/></g>)}
            {premios.map((v,i) => <g key={`p${i}`}><circle cx={xP(i)} cy={yP(v)} r="5" fill="#0d0d0d" stroke="#f43f5e" strokeWidth="2"/><circle cx={xP(i)} cy={yP(v)} r="2" fill="#f43f5e"/></g>)}
            {labels.map((lbl,i) => <text key={lbl} x={xP(i)} y={PAD_T+cH+24} textAnchor="middle" fontSize="9" fill="#374151" fontFamily="Inter,sans-serif" fontWeight="800">{lbl}</text>)}
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
    <div className="space-y-8 animate-larry">
      <div><h1 className="text-4xl font-bold">Salón de la Fama</h1><p className="text-slate-500 mt-2">Historial de ganadores y grandes premios</p></div>

      <div className="flex gap-4 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
          <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre, sorteo o cartón..." className="w-full bg-[#0e0e0e] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-violet-500/50 transition-all text-sm"/>
          {query && <button onClick={()=>setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"><X size={16}/></button>}
        </div>
        <div className="relative">
          <button onClick={()=>setShowFilter(!showFilter)} className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-bold transition-all text-sm ${showFilter||filterType?'bg-violet-600 border-violet-500 text-white':'bg-white/5 border-white/10 text-slate-300 hover:text-white'}`}><Filter size={18}/> Filtros {filterType&&`(1)`}</button>
          {showFilter && (
            <div className="absolute top-full mt-2 right-0 bg-[#111] border border-white/10 rounded-2xl p-4 w-48 z-10 space-y-2 shadow-2xl">
              {[['Todos', null],['Bingo Pleno','pleno'],['Línea','linea']].map(([label, val]) => (
                <button key={String(val)} onClick={()=>{setFilterType(val as any);setShowFilter(false);}} className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType===val?'bg-violet-600 text-white':'text-slate-400 hover:text-white hover:bg-white/5'}`}>{label}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={()=>alert('Selector de fechas')} className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 text-slate-300 font-bold hover:text-white transition-colors text-sm active:scale-95"><Calendar size={18}/> Fecha</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 card-larry p-8 overflow-hidden">
          <h3 className="text-lg font-bold mb-6">Últimos Ganadores {query && <span className="text-violet-400 text-sm">• "{query}"</span>}</h3>
          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4 text-slate-700">
              <Search size={40}/><p className="font-bold">Sin resultados para "{query}"</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase text-slate-700 font-black border-b border-white/5">
                <tr><th className="pb-6 px-4">Jugador</th><th className="pb-6 px-4">Premio</th><th className="pb-6 px-4 text-right">Monto</th><th className="pb-6 px-4">Sorteo</th><th className="pb-6 px-4 text-right">Fecha</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p,i) => (
                  <tr key={i} className="group hover:bg-white/[0.01] cursor-pointer">
                    <td className="py-5 px-4 leading-normal"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-500 flex items-center justify-center font-bold text-xs">{p.charAt(0)}</div><span className="font-bold text-sm">{p}</span></div></td>
                    <td className="py-5 px-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${i%2===0?'bg-amber-500/10 text-amber-500':'bg-cyan-500/10 text-cyan-500'}`}>{i%2===0?'Bingo Pleno':'Línea'}</span></td>
                    <td className="py-5 px-4 text-right text-emerald-400 font-black font-mono text-sm">Bs. {500+i*100}</td>
                    <td className="py-5 px-4 text-[10px] text-slate-700 font-bold">#123{i} • Cartón #{45-i}</td>
                    <td className="py-5 px-4 text-right text-slate-800 text-[10px] font-bold">2024-03-{15-i}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="space-y-6">
          <div className="card-larry p-8 bg-gradient-to-br from-[#0e0e0e] to-black relative overflow-hidden">
            <Trophy size={80} className="absolute -right-2 top-0 text-amber-500/10"/>
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-8">Top Ganador del Mes</h3>
            <div className="flex items-center gap-5 mb-8"><div className="w-16 h-16 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-2xl border-4 border-amber-500/20">C</div><div><h4 className="text-2xl font-black">Carlos López</h4><p className="text-amber-500 text-[10px] font-bold uppercase mt-1">3 Bingos Ganados</p></div></div>
            <div className="space-y-4"><div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase"><span>Total Ganado</span><span>Bs. 4,500</span></div><div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[70%]"/></div></div>
          </div>
          <div className="card-larry p-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Estadísticas Rápidas</h3>
            <div className="space-y-3">
              <div className="p-5 bg-black rounded-2xl border border-white/5 flex items-center justify-between"><span className="text-xs text-slate-400">Cartón más suertudo</span><span className="text-cyan-500 font-mono font-bold">#45</span></div>
              <div className="p-5 bg-black rounded-2xl border border-white/5 flex items-center justify-between"><span className="text-xs text-slate-400">Premio promedio</span><span className="text-violet-500 font-mono font-bold">Bs. 350</span></div>
              <div className="p-5 bg-black rounded-2xl border border-white/5 flex items-center justify-between"><span className="text-xs text-slate-400">Total sorteos</span><span className="text-white font-mono font-bold">234</span></div>
            </div>
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
    <div className="space-y-8 animate-larry">
      <div><h1 className="text-4xl font-bold">Jugadores</h1><p className="text-slate-500 mt-2">Listado completo de jugadores registrados</p></div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} type="text" placeholder="Buscar jugador..." className="w-full bg-[#0e0e0e] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-violet-500/50 text-sm"/>
        {query && <button onClick={()=>setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"><X size={16}/></button>}
      </div>
      <div className="card-larry overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-400">{filtered.length} jugadores encontrados</span>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ordenado por: Victorias</span>
        </div>
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase text-slate-700 font-black border-b border-white/5">
            <tr><th className="py-5 px-8">Jugador</th><th className="py-5 px-8 text-center">Victorias</th><th className="py-5 px-8 text-center">Partidas</th><th className="py-5 px-8 text-right">Registro</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((p,i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                <td className="py-6 px-8"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 font-bold flex items-center justify-center">{p.charAt(0)}</div><div><div className="font-bold">{p}</div><div className="text-[10px] text-slate-600">ID: #{1000+i}</div></div></div></td>
                <td className="py-6 px-8 text-center"><span className="text-emerald-400 font-black text-xl">{Math.max(0, 10-i)}</span></td>
                <td className="py-6 px-8 text-center text-slate-500 font-bold">{50 - i*3}</td>
                <td className="py-6 px-8 text-right text-slate-700 text-xs font-bold">2024-0{i+1}-{10+i}</td>
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
    <div className="space-y-10 animate-larry">
      <div className="flex justify-between items-end">
        <div><h1 className="text-4xl font-bold">Finanzas</h1><p className="text-slate-500 mt-2">Balance general y métricas de rentabilidad</p></div>
        <div className="flex items-center gap-2 bg-white/5 rounded-2xl border border-white/10 p-1">
          <button onClick={()=>setMonthIdx(i=>Math.max(0,i-1))} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white active:scale-95"><ChevronLeft size={18}/></button>
          <span className="px-4 font-bold text-sm min-w-[110px] text-center">{months[monthIdx]} 2024</span>
          <button onClick={()=>setMonthIdx(i=>Math.min(11,i+1))} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white active:scale-95"><ChevronRight size={18}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard icon={<DollarSign className="text-emerald-400" size={20}/>} label="Ingresos Brutos"   value="Bs. 24,560" trend="+8.2% vs mes anterior" trendUp/>
        <KPICard icon={<BarChart4 className="text-rose-400" size={20}/>}    label="Costos Operativos" value="Bs. 4,230"  trend="+2.1% (Alerta)"/>
        <KPICard icon={<CreditCardIcon className="text-slate-400" size={20}/>} label="Premios Pagados" value="Bs. 12,450" trend="50.6% de los ingresos" trendUp/>
        <div className="card-larry p-8 bg-violet-600/5 border border-violet-500/20">
          <h4 className="text-[10px] font-black text-violet-400 uppercase mb-2">Rentabilidad Neta</h4>
          <p className="text-4xl font-black">32.1%</p>
          <p className="text-[10px] font-bold text-slate-600 mt-4 uppercase">Margen saludable</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8" style={{height:'520px'}}>
        <div className="xl:col-span-2 card-larry p-10 flex flex-col overflow-hidden">
          <h3 className="text-xl font-bold mb-10">Balance Ingresos vs Egresos — {months[monthIdx]}</h3>
          <div className="flex-1 flex items-end gap-10 px-6 relative">
            {['Ene','Feb','Mar','Abr','May','Jun'].map((m,i) => (
              <div key={m} className="flex-1 flex gap-2 items-end justify-center relative h-full group cursor-pointer">
                <div title={`Ingresos: Bs.${3500+i*800}`} className="w-8 bg-emerald-500 hover:brightness-125 rounded-t-lg transition-all" style={{height:`${40+i*8}%`}}></div>
                <div title={`Egresos: Bs.${1200+i*300}`}  className="w-8 bg-rose-500  hover:brightness-125 rounded-t-lg transition-all" style={{height:`${20+i%3*10}%`}}></div>
                <span className="absolute -bottom-8 text-[10px] text-slate-700 font-black uppercase text-center">{m}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-14 pb-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div><span className="text-[10px] font-black text-slate-600 uppercase">Ingresos</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div><span className="text-[10px] font-black text-slate-600 uppercase">Egresos</span></div>
          </div>
        </div>

        <div className="card-larry p-10 flex flex-col items-center justify-center overflow-hidden">
          <h3 className="text-xl font-bold mb-10 self-start">Distribución de Gastos</h3>
          <div className="relative w-52 h-52">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="#22d3ee" strokeWidth="4" strokeDasharray="30 100"/>
              <circle cx="16" cy="16" r="14" fill="none" stroke="#7c3aed" strokeWidth="4" strokeDasharray="40 100" strokeDashoffset="-30"/>
              <circle cx="16" cy="16" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-70"/>
              <circle cx="16" cy="16" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-85"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col leading-none"><span className="text-[10px] text-slate-600 font-bold uppercase mb-1">Total</span><span className="text-2xl font-black">100%</span></div>
          </div>
          <div className="w-full grid grid-cols-2 gap-y-6 mt-10">
            <ExpenseLegend color="#22d3ee" label="Operativos"/>
            <ExpenseLegend color="#10b981" label="Marketing"/>
            <ExpenseLegend color="#7c3aed" label="Premios"/>
            <ExpenseLegend color="#f59e0b" label="Reserva"/>
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
    { icon: <Clock size={18}/>,       name: 'Juan Pérez',   detail: 'Deuda de Bs. 50 • 2024-03-20',  status: 'PENDIENTE', color: 'amber' as const },
    { icon: <AlertCircle size={18}/>, name: 'Carlos Ruiz',  detail: 'Deuda de Bs. 120 • 2024-03-18', status: 'CRÍTICO',   color: 'rose' as const,  isBanned: false },
    { icon: <Ban size={18}/>,         name: 'Maria T.',     detail: 'Baneado el 2024-03-15',          status: 'BANEADO',   color: 'slate' as const, isBanned: true },
    { icon: <CheckCircle2 size={18}/>,name: 'Ana Lopez',    detail: 'Deuda de Bs. 20 • 2024-03-21',  status: 'PAGADO',    color: 'emerald' as const, isPaid: true },
  ];

  const historial = [
    { icon: <CheckCircle2 size={18}/>,name: 'Roberto Diaz', detail: 'Deuda saldada Bs. 80 • 2024-03-01', status: 'RESUELTO', color: 'emerald' as const, isPaid: true },
    { icon: <CheckCircle2 size={18}/>,name: 'Sandra Gil',   detail: 'Deuda saldada Bs. 30 • 2024-02-28', status: 'RESUELTO', color: 'emerald' as const, isPaid: true },
  ];
  const items = tab === 'Activos' ? activos : historial;

  return (
    <div className="space-y-10 animate-larry">
      <div className="flex justify-between items-end">
        <div><h1 className="text-4xl font-bold">Alertas e Incidencias</h1><p className="text-slate-500 mt-2">Panel de control de riesgos y deudas</p></div>
        <TabGroup tabs={['Activos','Historial']} active={tab} onChange={v => setTab(v as any)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AlertSummaryCard icon={<Clock className="text-amber-500" size={24}/>} value="12" label="FIADOS PENDIENTES" color="amber" border/>
        <AlertSummaryCard icon={<AlertCircle className="text-rose-500" size={24}/>} value="5" label="DEUDAS CRÍTICAS" color="rose" border/>
        <AlertSummaryCard icon={<Ban className="text-slate-600" size={24}/>} value="3" label="USUARIOS BANEADOS" color="slate"/>
      </div>

      <div className="card-larry p-10 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3"><AlertCircle size={20} className="text-rose-500"/> Listado de {tab}</h3>
          <button onClick={()=>showToast('Filtros aplicados')} className="flex items-center gap-2 text-slate-500 text-xs font-bold hover:text-white transition-colors active:scale-95 px-4 py-2 bg-white/5 rounded-xl border border-white/5"><Filter size={16}/> Filtrar</button>
        </div>
        {items.map((item, i) => (
          <AlertItem key={i} {...item}/>
        ))}
      </div>
    </div>
  );
}

/* ─── CONFIGURACIÓN ──────────────────────────────────── */
function ConfiguracionView({ showToast }) {
  const [activeSection, setActiveSection] = useState('General');
  const [darkMode, setDarkMode] = useState(true);
  const [reducedAnim, setReducedAnim] = useState(false);
  const [sounds, setSounds] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [saved, setSaved] = useState(false);

  const sections = ['General','Cuenta','Notificaciones','Seguridad','Gestión Usuarios'];

  const handleSave = () => {
    setSaved(true);
    showToast('Cambios guardados exitosamente');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-10 animate-larry max-w-[1100px]">
      <div className="flex justify-between items-center">
        <div><h1 className="text-4xl font-bold">Configuración</h1><p className="text-slate-500 mt-2">Preferencias del sistema y cuenta</p></div>
        <button onClick={handleSave} className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-sm active:scale-95 transition-all ${saved?'bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]':'bg-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.4)]'}`}>
          {saved ? <><Check size={18}/> Guardado!</> : <><Lock size={18}/> Guardar Cambios</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1 space-y-1">
          {sections.map((s,i) => (
            <button key={s} onClick={()=>setActiveSection(s)} className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeSection===s?'bg-white/10 text-white':'text-slate-700 hover:text-white hover:bg-white/5'}`}>
              {i===0?<Monitor size={16}/>:i===1?<Users size={16}/>:i===2?<Bell size={16}/>:i===3?<Lock size={16}/>:<Users size={16}/>}
              {s}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 card-larry p-12 space-y-10">
          {activeSection === 'General' && <>
            <SectionTitle icon={<Monitor size={20}/>} title="Interfaz" color="violet"/>
            <ToggleItem label="Tema Oscuro (Blackout)" description="Activo en todos los paneles" active={darkMode} onToggle={()=>setDarkMode(v=>!v)}/>
            <ToggleItem label="Animaciones Reducidas" description="Optimizar rendimiento en dispositivos lentos" active={reducedAnim} onToggle={()=>setReducedAnim(v=>!v)}/>
            <SectionTitle icon={<Volume2 size={20}/>} title="Sonido" color="emerald"/>
            <ToggleItem label="Efectos de Bingo" description="Sonidos al cantar números y premios" active={sounds} onToggle={()=>setSounds(v=>!v)}/>
          </>}

          {activeSection === 'Notificaciones' && <>
            <SectionTitle icon={<Bell size={20}/>} title="Notificaciones" color="amber"/>
            <ToggleItem label="Notificaciones por Email" description="Recibir resúmenes diarios por correo" active={emailNotif} onToggle={()=>setEmailNotif(v=>!v)}/>
            <ToggleItem label="Notificaciones Push" description="Alertas en tiempo real en el navegador" active={pushNotif} onToggle={()=>setPushNotif(v=>!v)}/>
          </>}

          {activeSection === 'Seguridad' && <>
            <SectionTitle icon={<Lock size={20}/>} title="Seguridad" color="rose"/>
            <ToggleItem label="Autenticación en dos pasos" description="Añade una capa extra de seguridad" active={twoFactor} onToggle={()=>setTwoFactor(v=>!v)}/>
            <div className="p-8 bg-[#0c0c0c] rounded-[2.5rem] border border-white/5 space-y-4">
              <h4 className="font-bold text-lg">Cambiar Contraseña</h4>
              <input type="password" placeholder="Contraseña actual" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 text-sm"/>
              <input type="password" placeholder="Nueva contraseña" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 text-sm"/>
              <button onClick={()=>showToast('Contraseña actualizada')} className="px-6 py-3 bg-violet-600 rounded-xl font-bold text-sm hover:bg-violet-700 active:scale-95 transition-all">Actualizar Contraseña</button>
            </div>
          </>}

          {activeSection === 'Cuenta' && <>
            <SectionTitle icon={<Users size={20}/>} title="Información de Cuenta" color="cyan"/>
            <div className="space-y-4">
              <div><label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Nombre</label><input defaultValue="Admin Larry" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 text-sm"/></div>
              <div><label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Email</label><input defaultValue="admin@bingoLarry.com" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 text-sm"/></div>
            </div>
          </>}

          {activeSection === 'Gestión Usuarios' && <>
            <SectionTitle icon={<Users size={20}/>} title="Gestión de Usuarios" color="violet"/>
            <p className="text-slate-500 text-sm">Administra los roles y permisos de los usuarios del sistema.</p>
            {['Vendedor','Supervisor','Admin'].map(role => (
              <div key={role} className="p-6 bg-[#0c0c0c] rounded-2xl border border-white/5 flex items-center justify-between">
                <div><h4 className="font-bold">{role}</h4><p className="text-[10px] text-slate-600 uppercase font-bold">1 usuario activo</p></div>
                <button onClick={()=>showToast(`Editando permisos de ${role}`)} className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-violet-600 transition-all active:scale-95">Editar Permisos</button>
              </div>
            ))}
          </>}
        </div>
      </div>
    </div>
  );
}

/* ─── REUSABLE ATOMS ─────────────────────────────────── */
function NavItem({ icon, label, active=false, badge=undefined, onClick=undefined as any }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${active?'sidebar-item-active text-white':'text-slate-600 hover:text-white hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">{icon}<span className="text-sm font-semibold">{label}</span></div>
      {badge && <span className="bg-rose-600 text-[9px] px-2 py-0.5 rounded-full text-white font-bold animate-pulse">{badge}</span>}
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
    <div className="card-larry p-8 bg-[#0d0d0d] cursor-default">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-black rounded-xl border border-white/5">{icon}</div>
        <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${trendUp?'bg-emerald-500/10 text-emerald-500':'bg-rose-500/10 text-rose-500'}`}>{trend}</div>
      </div>
      <p className="text-[10px] font-black text-slate-700 uppercase mb-1 tracking-widest">{label}</p>
      <p className="text-3xl font-black text-white leading-none">{value}</p>
    </div>
  );
}

function ReportCard({ label, value, color, trend }) {
  const css = { emerald:'border-l-emerald-500 bg-emerald-500/5', rose:'border-l-rose-500 bg-rose-500/5', violet:'border-l-violet-500 bg-violet-500/5' };
  return <div className={`card-larry p-10 border-l-4 ${css[color]}`}><p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-50">{label}</p><p className="text-4xl font-black tracking-tighter text-white">{value}</p><p className="text-[10px] font-bold mt-4 text-slate-500">{trend} vs periodo anterior</p></div>;
}

function AlertSummaryCard({ icon, value, label, color, border=false }) {
  const themes = { amber:'border-amber-500/30 bg-amber-500/5 text-amber-500', rose:'border-rose-500/30 bg-rose-500/5 text-rose-500', slate:'bg-white/5 text-white/50 border-white/10' };
  return <div className={`p-8 rounded-[2rem] flex items-center gap-6 border ${border?'border-2':''} ${themes[color]}`}><div className="p-5 bg-black/50 rounded-2xl border border-white/5">{icon}</div><div><p className="text-4xl font-black text-white">{value}</p><p className="text-[10px] font-black uppercase opacity-60 mt-1 tracking-widest">{label}</p></div></div>;
}

function AlertItem({ icon, name, detail, status, color, isBanned=false, isPaid=false }) {
  const cls = { amber:'text-amber-500 bg-amber-500/10 border-amber-500/30', rose:'text-rose-500 bg-rose-500/10 border-rose-500/30', slate:'text-slate-600 bg-white/5 border-white/10', emerald:'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  return (
    <div className="p-8 bg-black border border-white/10 rounded-[2.5rem] flex items-center justify-between hover:bg-white/[0.01] transition-all cursor-default">
      <div className="flex items-center gap-6">
        <div className={`p-4 rounded-full ${isBanned?'bg-rose-500/10 text-rose-500':isPaid?'bg-emerald-500/10 text-emerald-500':'bg-slate-900 text-slate-700'}`}>{icon}</div>
        <div><h4 className="text-xl font-bold text-white">{name}</h4><p className="text-[10px] font-bold mt-1 text-slate-600 uppercase">{detail}</p></div>
      </div>
      <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${cls[color]}`}>{status}</span>
    </div>
  );
}

function ToggleItem({ label, description, active, onToggle }) {
  return (
    <div className="flex items-center justify-between p-8 bg-[#0c0c0c] rounded-[2.5rem] border border-white/5">
      <div className="leading-tight"><h4 className="font-bold text-xl">{label}</h4><p className="text-[10px] text-slate-600 font-bold mt-1 uppercase">{description}</p></div>
      <button onClick={onToggle} className={`w-14 h-8 rounded-full p-1 transition-all ${active?'bg-violet-600':'bg-white/10'}`} role="switch" aria-checked={active}>
        <div className={`w-6 h-6 bg-white rounded-full shadow-xl transition-all ${active?'translate-x-6':'translate-x-0'}`}></div>
      </button>
    </div>
  );
}

function SectionTitle({ icon, title, color }) {
  const cols = { violet:'text-violet-500 bg-violet-600/10', emerald:'text-emerald-500 bg-emerald-500/10', amber:'text-amber-500 bg-amber-500/10', rose:'text-rose-500 bg-rose-500/10', cyan:'text-cyan-500 bg-cyan-500/10' };
  return (
    <div className={`flex items-center gap-4 pb-4 border-b border-white/5 ${cols[color]?.split(' ')[0]}`}>
      <div className={`p-3 rounded-xl ${cols[color]}`}>{icon}</div>
      <h3 className="text-2xl font-black">{title}</h3>
    </div>
  );
}

function ExpenseLegend({ color, label }) {
  return <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-sm" style={{backgroundColor:color}}></div><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</span></div>;
}

function CreditCardIcon(p: any) {
  return <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
}
