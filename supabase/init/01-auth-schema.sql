CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_admin;

CREATE TABLE IF NOT EXISTS auth.users (
 instance_id uuid NULL,
 id uuid NOT NULL UNIQUE,
 aud varchar(255) NULL,
 "role" varchar(255) NULL,
 email varchar(255) NULL UNIQUE,
 encrypted_password varchar(255) NULL,
 confirmed_at timestamptz NULL,
 invited_at timestamptz NULL,
 confirmation_token varchar(255) NULL,
 confirmation_sent_at timestamptz NULL,
 recovery_token varchar(255) NULL,
 recovery_sent_at timestamptz NULL,
 email_change_token varchar(255) NULL,
 email_change varchar(255) NULL,
 email_change_sent_at timestamptz NULL,
 last_sign_in_at timestamptz NULL,
 raw_app_meta_data jsonb NULL,
 raw_user_meta_data jsonb NULL,
 is_super_admin bool NULL,
 created_at timestamptz NULL,
 updated_at timestamptz NULL,
 CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users USING btree (instance_id, email);
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users USING btree (instance_id);
comment on table auth.users is 'Auth: Stores user login data within a secure schema.';

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
 instance_id uuid NULL,
 id bigserial NOT NULL,
 "token" varchar(255) NULL,
 user_id varchar(255) NULL,
 revoked bool NULL,
 created_at timestamptz NULL,
 updated_at timestamptz NULL,
 CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens USING btree (token);
comment on table auth.refresh_tokens is 'Auth: Store of tokens used to refresh JWT tokens once they expire.';

CREATE TABLE IF NOT EXISTS auth.instances (
 id uuid NOT NULL,
 uuid uuid NULL,
 raw_base_config text NULL,
 created_at timestamptz NULL,
 updated_at timestamptz NULL,
 CONSTRAINT instances_pkey PRIMARY KEY (id)
);
comment on table auth.instances is 'Auth: Manages users across multiple sites.';

CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
 instance_id uuid NULL,
 id uuid NOT NULL,
 payload json NULL,
 created_at timestamptz NULL,
 CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);
comment on table auth.audit_log_entries is 'Auth: Audit trail for user actions.';

CREATE TABLE IF NOT EXISTS auth.schema_migrations (
 "version" varchar(255) NOT NULL,
 CONSTRAINT schema_migrations_pkey PRIMARY KEY ("version")
);
comment on table auth.schema_migrations is 'Auth: Manages updates to the auth system.';

INSERT INTO auth.schema_migrations (version)
VALUES ('20171026211738'),
 ('20171026211808'),
 ('20171026211834'),
 ('20180103212743'),
 ('20180108183307'),
 ('20180119214651'),
 ('20180125194653')
ON CONFLICT DO NOTHING;

create or replace function auth.uid()
returns uuid
language sql stable
as $$
 select
 coalesce(
 current_setting('request.jwt.claim.sub', true),
 (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
 )::uuid
$$;

create or replace function auth.role()
returns text
language sql stable
as $$
 select
 coalesce(
 current_setting('request.jwt.claim.role', true),
 (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
 )::text
$$;

create or replace function auth.email()
returns text
language sql stable
as $$
 select
 coalesce(
 current_setting('request.jwt.claim.email', true),
 (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
 )::text
$$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create user supabase_auth_admin noinherit createrole login noreplication;
  end if;
end
$$;

GRANT ALL PRIVILEGES ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;
ALTER USER supabase_auth_admin SET search_path = "auth";
ALTER table "auth".users OWNER TO supabase_auth_admin;
ALTER table "auth".refresh_tokens OWNER TO supabase_auth_admin;
ALTER table "auth".audit_log_entries OWNER TO supabase_auth_admin;
ALTER table "auth".instances OWNER TO supabase_auth_admin;
ALTER table "auth".schema_migrations OWNER TO supabase_auth_admin;

ALTER FUNCTION "auth"."uid" OWNER TO supabase_auth_admin;
ALTER FUNCTION "auth"."role" OWNER TO supabase_auth_admin;
ALTER FUNCTION "auth"."email" OWNER TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION "auth"."uid"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION "auth"."role"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION "auth"."email"() TO PUBLIC;
