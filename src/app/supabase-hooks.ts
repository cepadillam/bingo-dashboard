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
