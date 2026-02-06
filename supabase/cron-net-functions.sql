-- Enable extensions needed for cron + net
create extension if not exists pg_net with schema public;
create extension if not exists pg_cron with schema pg_catalog;

-- Ensure pg_cron runs in this database
alter system set cron.database_name = 'salonease';
select pg_reload_conf();

-- NOTE: app.settings.functions_url, app.settings.anon_key, and
-- app.settings.service_role_key are automatically populated from
-- the container environment (SUPABASE_PUBLIC_URL, ANON_KEY, SERVICE_ROLE_KEY)
-- via supabase/db-entrypoint.sh — no manual ALTER DATABASE SET needed.

-- Allow common roles to use net functions
grant usage on schema net to postgres, anon, authenticated, service_role;
grant execute on function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer)
  to postgres, anon, authenticated, service_role;
grant execute on function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer)
  to postgres, anon, authenticated, service_role;

-- Cron dispatcher: invokes the enrichment worker via HTTP N times
create or replace function public.invoke_enrichment_worker(n int default 1)
returns void
language plpgsql
security definer
set search_path = public, net
as $$
declare
  base_url text := current_setting('app.settings.functions_url', true);
  anon_key text := current_setting('app.settings.anon_key', true);
  i int;
  target_url text;
begin
  if coalesce(base_url,'') = '' or coalesce(anon_key,'') = '' then
    raise notice 'invoke_enrichment_worker: missing app.settings.* (functions_url or anon_key)';
    return;
  end if;
  target_url := base_url || '/functions/v1/enrichment-worker';
  for i in 1..greatest(1,n) loop
    perform net.http_post(
      url => target_url,
      headers => jsonb_build_object(
        'Authorization', 'Bearer ' || anon_key,
        'apikey', anon_key
      )
    );
  end loop;
end;
$$;

create or replace function public.invoke_verification_worker(n int default 1)
returns void
language plpgsql
security definer
set search_path = public, net
as $$
declare
  base_url text := current_setting('app.settings.functions_url', true);
  anon_key text := current_setting('app.settings.anon_key', true);
  i int;
  target_url text;
begin
  if coalesce(base_url,'') = '' or coalesce(anon_key,'') = '' then
    raise notice 'invoke_verification_worker: missing app.settings.* (functions_url or anon_key)';
    return;
  end if;
  target_url := base_url || '/functions/v1/verification-worker';
  for i in 1..greatest(1,n) loop
    perform net.http_post(
      url => target_url,
      headers => jsonb_build_object(
        'Authorization', 'Bearer ' || anon_key,
        'apikey', anon_key
      )
    );
  end loop;
end;
$$;

-- Switch cron schedules to the dispatcher (idempotent)
do $$ begin perform cron.unschedule('enrichment_worker_a'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('enrichment_worker_b'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('enrichment_worker_c'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('enrichment_worker_d'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('enrichment_worker_e'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('verification_worker_a'); exception when others then null; end $$;

select cron.schedule('enrichment_worker_a', '*/1 * * * *', $$select public.invoke_enrichment_worker(1);$$);
select cron.schedule('enrichment_worker_b', '*/1 * * * *', $$select public.invoke_enrichment_worker(1);$$);
select cron.schedule('enrichment_worker_c', '*/1 * * * *', $$select public.invoke_enrichment_worker(1);$$);
select cron.schedule('enrichment_worker_d', '*/1 * * * *', $$select public.invoke_enrichment_worker(1);$$);
select cron.schedule('enrichment_worker_e', '*/1 * * * *', $$select public.invoke_enrichment_worker(1);$$);
select cron.schedule('verification_worker_a', '*/1 * * * *', $$select public.invoke_verification_worker(1);$$);

-- Retention policy: purge system data older than 1 day (hourly)
-- Application data (campaigns, leads, enrichment_jobs, email_verification_files) is never purged.
create or replace function public.cleanup_system_data()
returns void
language plpgsql
security definer
as $$
begin
  -- pg_cron job run history
  delete from cron.job_run_details where end_time < now() - interval '1 day';
  -- pg_net HTTP responses
  delete from net._http_response where created < now() - interval '1 day';
  -- pgmq archived messages
  delete from pgmq.a_lead_enrichment where archived_at < now() - interval '1 day';
end;
$$;

do $$ begin perform cron.unschedule('system_data_cleanup'); exception when others then null; end $$;
select cron.schedule('system_data_cleanup', '0 * * * *', $$select public.cleanup_system_data();$$);
