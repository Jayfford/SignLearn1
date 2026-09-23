create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text default '',
  age text default '',
  birthday text default '',
  contact_number text default '',
  address text default '',
  account_type text default 'student',
  bio text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_login timestamptz
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, age, birthday, contact_number, address, account_type, bio)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'age', ''),
    coalesce(new.raw_user_meta_data->>'birthday', ''),
    coalesce(new.raw_user_meta_data->>'contact_number', ''),
    coalesce(new.raw_user_meta_data->>'address', ''),
    coalesce(new.raw_user_meta_data->>'account_type', 'student'),
    coalesce(new.raw_user_meta_data->>'bio', '')
  )
  on conflict (email) do update
    set name = excluded.name,
        age = excluded.age,
        birthday = excluded.birthday,
        contact_number = excluded.contact_number,
        address = excluded.address,
        account_type = excluded.account_type,
        bio = excluded.bio,
        updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
