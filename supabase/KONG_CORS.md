# Kong CORS Configuration

The `kong.yml` file is gitignored. When editing it on the server, ensure **functions-v1** CORS includes all app origins:

```yaml
# functions-v1 plugins
- name: cors
  config:
    origins:
      - https://gtm-zero.com
      - https://www.gtm-zero.com
      - https://app.gtm-zero.com
      - https://zenmanager.eu
      - https://api.zenmanager.eu
      - http://localhost:8081
      - http://localhost:19006
      - http://127.0.0.1:8081
      - http://127.0.0.1:19006
```

**Required for:**
- **zenmanager.eu** – Salonease production
- **localhost** – Local dev (Expo web, Screenshot Organizer)

After editing `/app/salonease/supabase/kong.yml` on Contabo:
```bash
docker exec salonease-supabase-kong-1 kong reload
```

## PostgREST schema (Screenshot Organizer)

For `so-event-ingest` and other Screenshot Organizer features, add `screenshot_organizer` to `PGRST_DB_SCHEMAS` in `supabase/.env`:

```
PGRST_DB_SCHEMAS=public,storage,ninja,screenshot_organizer
```

Then recreate the rest container:
```bash
docker compose -f docker-compose.prod.yml up -d supabase-rest --force-recreate
```
