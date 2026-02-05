create extension if not exists pgmq;

create or replace function public.ack_lead_enrichment(mid bigint) returns boolean
language sql security definer
set search_path to 'public', 'pgmq'
as $$
  select pgmq.archive('lead_enrichment', mid);
$$;

alter function public.ack_lead_enrichment(mid bigint) owner to postgres;

create or replace function public.dequeue_and_claim_lead_enrichment(cnt integer default 10, vt_seconds integer default 120)
returns table(msg_id bigint, lead_id uuid)
language plpgsql security definer
set search_path to 'public', 'pgmq'
as $$
declare
  r record;
  lid uuid;
  claimed boolean;
begin
  for r in select * from pgmq.read('lead_enrichment', vt_seconds, cnt)
  loop
    begin
      lid := (r.message->>'leadId')::uuid;
    exception when others then
      perform pgmq.archive('lead_enrichment', r.msg_id);
      continue;
    end;

    with c as (
      update public.leads
         set ice_status = 'processing', enriched_at = null
       where id = lid
         and ice_status <> 'processing'
         and ice_status <> 'done'
       returning id
    )
    select exists(select 1 from c) into claimed;

    if claimed then
      msg_id := r.msg_id;
      lead_id := lid;
      return next;
    else
      perform pgmq.archive('lead_enrichment', r.msg_id);
    end if;
  end loop;
end;
$$;

alter function public.dequeue_and_claim_lead_enrichment(cnt integer, vt_seconds integer) owner to postgres;

grant all on function public.ack_lead_enrichment(mid bigint) to anon;
grant all on function public.ack_lead_enrichment(mid bigint) to authenticated;
grant all on function public.ack_lead_enrichment(mid bigint) to service_role;

grant all on function public.dequeue_and_claim_lead_enrichment(cnt integer, vt_seconds integer) to anon;
grant all on function public.dequeue_and_claim_lead_enrichment(cnt integer, vt_seconds integer) to authenticated;
grant all on function public.dequeue_and_claim_lead_enrichment(cnt integer, vt_seconds integer) to service_role;
