-- Set up realtime
create schema if not exists realtime;
do $$
begin
  begin
    create publication supabase_realtime;
  exception when duplicate_object then
    null;
  end;
end
$$;

-- Supabase super admin
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then
    create user supabase_admin;
    alter user supabase_admin with superuser createdb createrole replication bypassrls;
  end if;
end
$$;

-- Extension namespacing
create schema if not exists extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pgcrypto with schema extensions;
do $$
begin
  begin
    create extension if not exists pgjwt with schema extensions;
  exception when undefined_file then
    raise notice 'pgjwt extension not available, skipping';
  end;
end
$$;

-- Set up auth roles for the developer
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create user authenticator noinherit;
  end if;
end
$$;

grant anon to authenticator;
grant authenticated to authenticator;
grant service_role to authenticator;
grant supabase_admin to authenticator;

grant usage on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- Allow Extensions to be used in the API
grant usage on schema extensions to postgres, anon, authenticated, service_role;

-- Set up namespacing
alter user supabase_admin SET search_path TO public, extensions;

-- These are required so that the users receive grants whenever "supabase_admin" creates tables/function
alter default privileges for user supabase_admin in schema public grant all
 on sequences to postgres, anon, authenticated, service_role;
alter default privileges for user supabase_admin in schema public grant all
 on tables to postgres, anon, authenticated, service_role;
alter default privileges for user supabase_admin in schema public grant all
 on functions to postgres, anon, authenticated, service_role;

-- Set short statement/query timeouts for API roles
alter role anon set statement_timeout = '3s';
alter role authenticated set statement_timeout = '8s';
