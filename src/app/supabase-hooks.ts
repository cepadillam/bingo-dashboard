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
