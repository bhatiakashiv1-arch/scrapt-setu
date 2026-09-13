import type { Role, Language } from '@/types';
import { getItem, setItem } from './storage';
import { supabase } from './supabaseClient';

const ROLE_KEY = 'demoRole';
const LANG_KEY = 'demoLanguage';

export function getCurrentRole(): Role {
  return getItem<Role>(ROLE_KEY) ?? 'collector';
}

export function setCurrentRole(role: Role): void {
  setItem(ROLE_KEY, role);
}

export function getCurrentLanguage(): Language {
  return getItem<Language>(LANG_KEY) ?? 'en';
}

export function setCurrentLanguage(lang: Language): void {
  setItem(LANG_KEY, lang);
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
}

export async function signUp(name: string, email: string, password: string, phone?: string): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
  });

  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'No user returned' };

  // Insert profile row
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: data.user.id,
    name,
    email,
    phone,
    role: 'collector',
  });

  if (profileError) {
    // Profile might already exist or RLS issue — not fatal for auth
    console.warn('Profile insert failed:', profileError.message);
  }

  return {
    user: { id: data.user.id, email: data.user.email ?? email, name, phone, role: 'collector' },
    error: null,
  };
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'No user returned' };

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .maybeSingle();

  const name = profile?.name ?? (data.user.user_metadata?.name as string) ?? email.split('@')[0];

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? email,
      name,
      phone: profile?.phone,
      role: (profile?.role as Role) ?? 'collector',
    },
    error: null,
  };
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return null;

  const userId = sessionData.session.user.id;
  const email = sessionData.session.user.email ?? '';

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const name = profile?.name ?? (sessionData.session.user.user_metadata?.name as string) ?? email.split('@')[0];

  return {
    id: userId,
    email,
    name,
    phone: profile?.phone,
    role: (profile?.role as Role) ?? 'collector',
  };
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;

  const { data } = client.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }

    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    const name = profile?.name ?? (session.user.user_metadata?.name as string) ?? session.user.email?.split('@')[0] ?? 'User';

    callback({
      id: session.user.id,
      email: session.user.email ?? '',
      name,
      phone: profile?.phone,
      role: (profile?.role as Role) ?? 'collector',
    });
  });

  return () => data.subscription.unsubscribe();
}
