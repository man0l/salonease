


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."ack_lead_enrichment"("mid" bigint) RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pgmq'
    AS $$
  select pgmq.archive('lead_enrichment', mid);
$$;


ALTER FUNCTION "public"."ack_lead_enrichment"("mid" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dequeue_and_claim_lead_enrichment"("cnt" integer DEFAULT 10, "vt_seconds" integer DEFAULT 120) RETURNS TABLE("msg_id" bigint, "lead_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pgmq'
    AS $$
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


ALTER FUNCTION "public"."dequeue_and_claim_lead_enrichment"("cnt" integer, "vt_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dequeue_lead_enrichment"("cnt" integer DEFAULT 10, "vt_seconds" integer DEFAULT 60) RETURNS TABLE("msg_id" bigint, "message" "jsonb")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pgmq'
    AS $$
  select r.msg_id, r.message from pgmq.read('lead_enrichment', vt_seconds, cnt) as r;
$$;


ALTER FUNCTION "public"."dequeue_lead_enrichment"("cnt" integer, "vt_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_lead_enrichment"("lid" "uuid") RETURNS bigint
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pgmq'
    AS $$
  select pgmq.send('lead_enrichment', jsonb_build_object('leadId', lid));
$$;


ALTER FUNCTION "public"."enqueue_lead_enrichment"("lid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invoke_enrichment_once"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'net'
    AS $$
declare
  base_url text := current_setting('app.settings.functions_url', true);
  svc_key  text := current_setting('app.settings.service_role_key', true);
  anon_key text := current_setting('app.settings.anon_key', true);
begin
  if coalesce(base_url,'') = '' or coalesce(anon_key,'') = '' then
    raise notice 'invoke_enrichment_once: missing app.settings.*';
    return;
  end if;
  perform net.http_post(
    url => base_url || '/functions/v1/enrichment-worker',
    headers => jsonb_build_object(
      'Authorization', 'Bearer ' || coalesce(svc_key, anon_key),
      'apikey', anon_key,
      'Content-Type', 'application/json'
    ),
    body => '{}'::jsonb,
    timeout_milliseconds => 60000
  );
end;
$$;


ALTER FUNCTION "public"."invoke_enrichment_once"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invoke_enrichment_worker"("n" integer DEFAULT 1) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'net'
    AS $$
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
      headers => jsonb_build_object('Authorization', 'Bearer ' || anon_key)
    );
  end loop;
end;
$$;


ALTER FUNCTION "public"."invoke_enrichment_worker"("n" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invoke_enrichment_worker_vault"("n" integer DEFAULT 1) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'net'
    AS $$
declare
  base_url text := current_setting('app.settings.functions_url', true);
  anon_key text := current_setting('app.settings.anon_key', true);
  i int;
  target_url text;
begin
  if coalesce(base_url,'') = '' or coalesce(anon_key,'') = '' then
    raise notice 'invoke_enrichment_worker_vault: missing app.settings.* (functions_url or anon_key)';
    return;
  end if;
  target_url := base_url || '/functions/v1/enrichment-worker';
  for i in 1..greatest(1,n) loop
    perform net.http_post(
      url => target_url,
      headers => jsonb_build_object('Authorization', 'Bearer ' || anon_key)
    );
  end loop;
end;
$$;


ALTER FUNCTION "public"."invoke_enrichment_worker_vault"("n" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invoke_verification_worker_vault"("n" integer DEFAULT 1) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'net'
    AS $$
declare
  base_url text := current_setting('app.settings.functions_url', true);
  anon_key text := current_setting('app.settings.anon_key', true);
  i int;
  target_url text;
begin
  if coalesce(base_url,'') = '' or coalesce(anon_key,'') = '' then
    raise notice 'invoke_verification_worker_vault: missing app.settings.* (functions_url or anon_key)';
    return;
  end if;
  target_url := base_url || '/functions/v1/verification-worker';
  for i in 1..greatest(1,n) loop
    perform net.http_post(
      url => target_url,
      headers => jsonb_build_object('Authorization', 'Bearer ' || anon_key)
    );
  end loop;
end;
$$;


ALTER FUNCTION "public"."invoke_verification_worker_vault"("n" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."purge_lead_enrichment"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  perform pgmq.purge('lead-enrichment');
exception when others then
  -- swallow errors so API can still reset lead statuses
  raise notice 'purge_lead_enrichment error: %', sqlerrm;
end;
$$;


ALTER FUNCTION "public"."purge_lead_enrichment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."purge_lead_enrichment_queue"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pgmq'
    AS $$
begin
  -- reset lead statuses stuck in queued/processing
  update public.leads set ice_status = 'none' where ice_status in ('queued','processing');
  -- clear queued/running jobs
  delete from public.enrichment_jobs where status in ('queued','running');

  -- try different pgmq purge variants; fallback to drop+create
  begin
    perform pgmq.purge('lead_enrichment'::text);
  exception when undefined_function then
    begin
      perform pgmq.purge_queue('lead_enrichment'::text);
    exception when undefined_function then
      begin
        perform pgmq.drop_queue('lead_enrichment'::text);
        perform pgmq.create('lead_enrichment'::text);
      exception when others then
        null;
      end;
    end;
  end;
end;
$$;


ALTER FUNCTION "public"."purge_lead_enrichment_queue"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "service_line" "text" NOT NULL,
    "summarize_prompt" "text" NOT NULL,
    "icebreaker_prompt" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_verification_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid",
    "source" "text" NOT NULL,
    "file_id" "text" NOT NULL,
    "filename" "text" NOT NULL,
    "lines" integer,
    "filter_query" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text",
    "lines_processed" integer,
    "link1" "text",
    "link2" "text",
    "checked_at" timestamp with time zone,
    "processed" boolean DEFAULT false NOT NULL,
    "emails" "jsonb"
);


ALTER TABLE "public"."email_verification_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enrichment_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."enrichment_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "full_name" "text",
    "company_name" "text",
    "company_website" "text",
    "email" "text",
    "personal_email" "text",
    "linkedin" "text",
    "title" "text",
    "industry" "text",
    "city" "text",
    "state" "text",
    "country" "text",
    "ice_breaker" "text",
    "ice_status" "text" DEFAULT 'none'::"text" NOT NULL,
    "enriched_at" timestamp with time zone,
    "raw" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "verification_status" "text" DEFAULT 'unverified'::"text",
    "verification_checked_at" timestamp with time zone
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_verification_files"
    ADD CONSTRAINT "email_verification_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enrichment_jobs"
    ADD CONSTRAINT "enrichment_jobs_lead_id_key" UNIQUE ("lead_id");



ALTER TABLE ONLY "public"."enrichment_jobs"
    ADD CONSTRAINT "enrichment_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



CREATE INDEX "evf_campaign_idx" ON "public"."email_verification_files" USING "btree" ("campaign_id", "created_at" DESC);



CREATE INDEX "idx_leads_campaign_status" ON "public"."leads" USING "btree" ("campaign_id", "ice_status");



CREATE INDEX "leads_campaign_idx" ON "public"."leads" USING "btree" ("campaign_id");



CREATE INDEX "leads_company_site_idx" ON "public"."leads" USING "btree" ("lower"(COALESCE("company_website", ''::"text")));



CREATE INDEX "leads_email_idx" ON "public"."leads" USING "btree" ("lower"(COALESCE("email", ''::"text")));



CREATE INDEX "leads_ice_status_idx" ON "public"."leads" USING "btree" ("ice_status");



CREATE UNIQUE INDEX "leads_unique_per_campaign_email" ON "public"."leads" USING "btree" ("campaign_id", "lower"(COALESCE("email", ''::"text"))) WHERE ("email" IS NOT NULL);



CREATE UNIQUE INDEX "leads_unique_per_campaign_email_plain" ON "public"."leads" USING "btree" ("campaign_id", "email");



CREATE INDEX "leads_verification_status_idx" ON "public"."leads" USING "btree" ("verification_status");



ALTER TABLE ONLY "public"."email_verification_files"
    ADD CONSTRAINT "email_verification_files_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrichment_jobs"
    ADD CONSTRAINT "enrichment_jobs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrichment_jobs"
    ADD CONSTRAINT "enrichment_jobs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."ack_lead_enrichment"("mid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."ack_lead_enrichment"("mid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ack_lead_enrichment"("mid" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."dequeue_and_claim_lead_enrichment"("cnt" integer, "vt_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."dequeue_and_claim_lead_enrichment"("cnt" integer, "vt_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dequeue_and_claim_lead_enrichment"("cnt" integer, "vt_seconds" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."dequeue_lead_enrichment"("cnt" integer, "vt_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."dequeue_lead_enrichment"("cnt" integer, "vt_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."dequeue_lead_enrichment"("cnt" integer, "vt_seconds" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_lead_enrichment"("lid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."enqueue_lead_enrichment"("lid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_lead_enrichment"("lid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."invoke_enrichment_once"() TO "anon";
GRANT ALL ON FUNCTION "public"."invoke_enrichment_once"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."invoke_enrichment_once"() TO "service_role";



GRANT ALL ON FUNCTION "public"."invoke_enrichment_worker"("n" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."invoke_enrichment_worker"("n" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."invoke_enrichment_worker"("n" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."invoke_enrichment_worker_vault"("n" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."invoke_enrichment_worker_vault"("n" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."invoke_enrichment_worker_vault"("n" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."invoke_verification_worker_vault"("n" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."invoke_verification_worker_vault"("n" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."invoke_verification_worker_vault"("n" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."purge_lead_enrichment"() TO "anon";
GRANT ALL ON FUNCTION "public"."purge_lead_enrichment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."purge_lead_enrichment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."purge_lead_enrichment_queue"() TO "anon";
GRANT ALL ON FUNCTION "public"."purge_lead_enrichment_queue"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."purge_lead_enrichment_queue"() TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."email_verification_files" TO "anon";
GRANT ALL ON TABLE "public"."email_verification_files" TO "authenticated";
GRANT ALL ON TABLE "public"."email_verification_files" TO "service_role";



GRANT ALL ON TABLE "public"."enrichment_jobs" TO "anon";
GRANT ALL ON TABLE "public"."enrichment_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."enrichment_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







