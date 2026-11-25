create table public.clhtml_public_handoff (
  slot text primary key check (slot = 'current'),
  body text not null check (length(trim(body)) > 0)
);
alter table public.clhtml_public_handoff enable row level security;
revoke all privileges on table public.clhtml_public_handoff from public, anon, authenticated;
grant select on table public.clhtml_public_handoff to anon;
create policy "Read the published Claude brief" on public.clhtml_public_handoff
  for select to anon using (slot = 'current');
