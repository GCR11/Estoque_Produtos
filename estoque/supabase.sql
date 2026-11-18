-- Execute no SQL Editor do projeto Supabase.
-- Substitua nomes de coluna apenas se a tabela já tiver um esquema diferente.

alter table public."Estoque"
  add column if not exists user_id uuid;

alter table public."Estoque"
  add column if not exists nome_criador text;

alter table public."Estoque"
  alter column user_id set default auth.uid();

update public."Estoque" as estoque
set nome_criador = coalesce(
  nullif(btrim(auth_user.raw_user_meta_data->>'full_name'), ''),
  nullif(btrim(auth_user.raw_user_meta_data->>'name'), ''),
  'Não informado'
)
from auth.users as auth_user
where estoque.user_id = auth_user.id
  and (
    estoque.nome_criador is null
    or btrim(estoque.nome_criador) = ''
    or estoque.nome_criador = 'Não informado'
  );

update public."Estoque"
set nome_criador = 'Não informado'
where nome_criador is null or btrim(nome_criador) = '';

alter table public."Estoque"
  drop constraint if exists estoque_nome_titulo_check;

alter table public."Estoque"
  add constraint estoque_nome_titulo_check
  check (
    char_length(btrim(nome_produto)) between 1 and 100
  );

alter table public."Estoque"
  enable row level security;

drop policy if exists "Usuarios inserem apenas seus registros" on public."Estoque";
create policy "Usuarios inserem apenas seus registros"
  on public."Estoque"
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Usuarios leem apenas seus registros" on public."Estoque";
drop policy if exists "Usuarios leem todos os registros" on public."Estoque";
create policy "Usuarios leem todos os registros"
  on public."Estoque"
  for select
  to authenticated
  using (true);
