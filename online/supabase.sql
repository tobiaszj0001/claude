-- Only Pantslow Gang: ranking online.
-- Wklej całość w Supabase -> SQL Editor -> Run.
create extension if not exists pgcrypto;

create table if not exists opg_players (
  nick text primary key,
  pin_hash text not null,
  summary jsonb not null default '{}'::jsonb,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table opg_players enable row level security;
-- Brak polityk = nikt nie czyta tabeli bezpośrednio; dostęp tylko przez funkcje poniżej.

create or replace function opg_login(p_nick text, p_pin text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r opg_players%rowtype; n text := lower(trim(p_nick));
begin
  if length(n) < 2 or length(n) > 16 then return jsonb_build_object('ok', false, 'error', 'Ksywka 2-16 znaków'); end if;
  if p_pin !~ '^[0-9]{4,8}$' then return jsonb_build_object('ok', false, 'error', 'PIN to 4-8 cyfr'); end if;
  select * into r from opg_players where nick = n;
  if not found then
    insert into opg_players(nick, pin_hash) values (n, crypt(p_pin, gen_salt('bf')));
    return jsonb_build_object('ok', true, 'profile', null, 'new', true);
  end if;
  if r.pin_hash <> crypt(p_pin, r.pin_hash) then return jsonb_build_object('ok', false, 'error', 'Zły PIN'); end if;
  return jsonb_build_object('ok', true, 'profile', r.profile, 'new', false);
end $$;

create or replace function opg_save(p_nick text, p_pin text, p_summary jsonb, p_profile jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r opg_players%rowtype; n text := lower(trim(p_nick));
begin
  select * into r from opg_players where nick = n;
  if not found or r.pin_hash <> crypt(p_pin, r.pin_hash) then return jsonb_build_object('ok', false, 'error', 'Zły PIN'); end if;
  update opg_players set summary = p_summary, profile = p_profile, updated_at = now() where nick = n;
  return jsonb_build_object('ok', true);
end $$;

create or replace function opg_board()
returns jsonb language sql security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'nick', nick, 'xp', summary->'xp', 'level', summary->'level', 'wins', summary->'wins', 'fights', summary->'fights',
    'best_streak', summary->'best_streak', 'max_combo', summary->'max_combo', 'survival_best', summary->'survival_best',
    'crowns', summary->'crowns', 'trophies', summary->'trophies', 'fastest_win', summary->'fastest_win', 'bosses', summary->'bosses',
    'chips', summary->'chips', 'casino_win', summary->'casino_win', 'casino_loss', summary->'casino_loss', 'casino_net', summary->'casino_net', 'jackpots', summary->'jackpots',
    'updated_at', updated_at) order by (summary->>'xp')::numeric desc nulls last), '[]'::jsonb)
  from opg_players;
$$;

grant execute on function opg_login(text, text) to anon, authenticated;
grant execute on function opg_save(text, text, jsonb, jsonb) to anon, authenticated;
grant execute on function opg_board() to anon, authenticated;
