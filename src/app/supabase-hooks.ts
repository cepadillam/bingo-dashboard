import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Only initialize if we have actual values to avoid build failures in some environments
// However, creating the client with placeholders is usually enough to pass the build step
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useActiveSession = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseUrl === 'https://placeholder.supabase.co') {
      setLoading(false);
      return;
    }
    const fetchSession = async () => {
      const { data } = await supabase
        .from('sesiones_bingo')
        .select('*')
        .eq('status', 'activa')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setSession(data);
      setLoading(false);
    };
    fetchSession();

    const channel = supabase.channel('realtime_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sesiones_bingo' }, (payload) => {
        if (payload.new && (payload.new as any).status === 'activa') setSession(payload.new);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return { session, loading };
};

export const useTopPlayers = (limit = 10) => {
  const [players, setPlayers] = useState<any[]>([]);
  useEffect(() => {
    if (supabaseUrl === 'https://placeholder.supabase.co') return;
    const fetchPlayers = async () => {
      const { data } = await supabase.from('jugadores').select('*').order('ganadas', { ascending: false }).limit(limit);
      setPlayers(data || []);
    };
    fetchPlayers();
    const channel = supabase.channel('realtime_players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jugadores' }, () => fetchPlayers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [limit]);
  return players;
};

export const useRetentionPlayers = () => {
  const [players, setPlayers] = useState<any[]>([]);
  useEffect(() => {
    if (supabaseUrl === 'https://placeholder.supabase.co') return;
    const fetchRetention = async () => {
      const { data } = await supabase.from('jugadores').select('*').eq('ganadas', 0).order('created_at', { ascending: false });
      setPlayers(data || []);
    };
    fetchRetention();
    return () => {};
  }, []);
  return players;
};

export const registerSale = async (sessionId: string, currentSold: number, amount: number, price: number) => {
  if (supabaseUrl === 'https://placeholder.supabase.co') return { error: 'No env vars' };
  return await supabase.from('sesiones_bingo').update({ cartones_vendidos: currentSold + amount, precio_carton: price }).eq('id', sessionId);
};

/* ─── SYSTEM USERS & PERMISSIONS ───────────────────── */
export const useSystemUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    if (supabaseUrl === 'https://placeholder.supabase.co') return;
    const fetchUsers = async () => {
      const { data } = await supabase.from('usuarios_sistema').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
    };
    fetchUsers();
    const channel = supabase.channel('realtime_system_users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios_sistema' }, () => fetchUsers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return users;
};

export const updateSystemUser = async (userId: string, data: any) => {
  return await supabase.from('usuarios_sistema').update(data).eq('id', userId);
};

export const deleteSystemUser = async (userId: string) => {
  return await supabase.from('usuarios_sistema').delete().eq('id', userId);
};

export const createSystemUser = async (user: string, pass: string, role: string) => {
  return await supabase.from('usuarios_sistema').insert([{ usuario: user, clave: pass, rol: role, status: 'aprobado' }]);
};

export const validateLogin = async (user: string, pass: string) => {
  // Fallback Maestro: Permite entrar siempre con admin/admin123 para evitar bloqueos
  if (user === 'admin' && pass === 'admin123') {
    return { data: { id: 'admin-fix', usuario: 'admin', rol: 'admin', status: 'aprobado' } };
  }

  if (supabaseUrl === 'https://placeholder.supabase.co') {
     return { error: 'No env vars' };
  }
  const { data, error } = await supabase
    .from('usuarios_sistema')
    .select('*')
    .eq('usuario', user)
    .eq('clave', pass)
    .single();
  
  if (data && data.status === 'aprobado') {
    // Update online status
    await supabase.from('usuarios_sistema').update({ is_online: true, ultimo_acceso: new Date().toISOString() }).eq('id', data.id);
  }
  
  return { data, error };
};

export const bulkInsertPlayers = async (players: any[]) => {
  if (supabaseUrl === 'https://placeholder.supabase.co') return { error: 'No env vars' };
  // Using upsert to update existing players (matching by name or id) or insert new ones
  return await supabase.from('jugadores').upsert(players, { onConflict: 'nombre' });
};

export const deletePlayer = async (id: string) => {
  return await supabase.from('jugadores').delete().eq('id', id);
};

export const deleteAllPlayers = async () => {
  return await supabase.from('jugadores').delete().neq('id', 'placeholder-uuid-to-delete-all'); // Using a dummy filter to avoid full table delete error if safe mode is on, but in Supabase simple delete() works if no filter is provided on some configs, however common practice is .neq('id', '0') or similar. Actually, supabase delete without filter is allowed if not restricted.
};

export const updatePlayer = async (id: string, data: any) => {
  return await supabase.from('jugadores').update(data).eq('id', id);
};

/* ─── GASTOS ─────────────────────────────────────────── */
export const useGastos = () => {
  const [gastos, setGastos] = useState<any[]>([]);
  useEffect(() => {
    if (supabaseUrl === 'https://placeholder.supabase.co') return;
    const fetchGastos = async () => {
      const { data } = await supabase.from('gastos').select('*').order('created_at', { ascending: false });
      setGastos(data || []);
    };
    fetchGastos();
    const channel = supabase.channel('realtime_gastos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gastos' }, () => fetchGastos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return gastos;
};

export const addGasto = async (gasto: any) => {
  return await supabase.from('gastos').insert([gasto]);
};

export const deleteGasto = async (id: string) => {
  return await supabase.from('gastos').delete().eq('id', id);
};

export const updateGasto = async (id: string, data: any) => {
  return await supabase.from('gastos').update(data).eq('id', id);
};

/* ─── GANADORES ──────────────────────────────────────── */
export const useGanadores = () => {
  const [ganadores, setGanadores] = useState<any[]>([]);
  useEffect(() => {
    if (supabaseUrl === 'https://placeholder.supabase.co') return;
    const fetchGanadores = async () => {
      const { data } = await supabase.from('ganadores').select('*').order('created_at', { ascending: false });
      setGanadores(data || []);
    };
    fetchGanadores();
    const channel = supabase.channel('realtime_ganadores')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ganadores' }, () => fetchGanadores())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return ganadores;
};

export const addGanador = async (ganador: any) => {
  return await supabase.from('ganadores').insert([ganador]);
};

export const updateGanador = async (id: string, data: any) => {
  return await supabase.from('ganadores').update(data).eq('id', id);
};

export const deleteGanador = async (id: string) => {
  return await supabase.from('ganadores').delete().eq('id', id);
};

/* ─── ALERTAS ────────────────────────────────────────── */
export const useAlertas = () => {
  const [alertas, setAlertas] = useState<any[]>([]);
  useEffect(() => {
    if (supabaseUrl === 'https://placeholder.supabase.co') return;
    const fetchAlertas = async () => {
      const { data } = await supabase.from('alertas').select('*').order('created_at', { ascending: false });
      setAlertas(data || []);
    };
    fetchAlertas();
    const channel = supabase.channel('realtime_alertas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas' }, () => fetchAlertas())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return alertas;
};

export const addAlerta = async (alerta: any) => {
  return await supabase.from('alertas').insert([alerta]);
};

export const updateAlerta = async (id: string, data: any) => {
  return await supabase.from('alertas').update(data).eq('id', id);
};

export const deleteAlerta = async (id: string) => {
  return await supabase.from('alertas').delete().eq('id', id);
};

/* ─── HISTORICO SORTEOS ──────────────────────────────── */
export const useHistoricoSorteos = () => {
  const [sorteos, setSorteos] = useState<any[]>([]);
  useEffect(() => {
    if (supabaseUrl === 'https://placeholder.supabase.co') return;
    const fetchSorteos = async () => {
      const { data } = await supabase.from('historico_sorteos').select('*').order('fecha', { ascending: false });
      setSorteos(data || []);
    };
    fetchSorteos();
    const channel = supabase.channel('realtime_sorteos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historico_sorteos' }, () => fetchSorteos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return sorteos;
};

export const addSorteo = async (sorteo: any) => {
  return await supabase.from('historico_sorteos').insert([sorteo]);
};

export const updateSorteo = async (id: string, data: any) => {
  return await supabase.from('historico_sorteos').update(data).eq('id', id);
};

export const deleteSorteo = async (id: string) => {
  return await supabase.from('historico_sorteos').delete().eq('id', id);
};
