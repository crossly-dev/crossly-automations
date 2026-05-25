# crossly-automations — community recipe library

Drop-in automation recipes for [Crossly](https://crossly.shinbetsolutions.com).
Each `.json` file is a portable recipe — paste it into the **Import** dialog at
`/automation`, or POST it to `/api/automation/rules/import`. No code, no setup.

Live demo: <https://crossly.shinbetsolutions.com>
Schema reference: [`schema/automation-recipe.v1.json`](./schema/automation-recipe.v1.json)

---

## Browsing the library

Recipes live under [`recipes/`](./recipes), one folder per platform plus a
`multi/` folder for cross-platform recipes:

```
recipes/
├── poshmark/     share-closet-9am, send-offer-to-likers, ...
├── depop/        refresh-listings, auto-followback, ...
├── vinted/       auto-bump, daily-restock-check, ...
├── facebook/     renew-listings, ...
└── multi/        post-sale-thank-you, weekly-stale-discount, ...
```

Each file is a single recipe. Open it in your editor to see the trigger,
condition, action, and platform list at a glance.

## Using a recipe

**From the web app** (easiest):
1. Open [`/automation`](https://crossly.shinbetsolutions.com/automation)
2. Click **Import**
3. Paste the JSON or upload the `.json` file
4. Click **Validate** → review → **Import**
5. By default the rule is imported **inactive** — flip it on when ready

**From the API** (for agents, scripts, CI):
```bash
curl -X POST https://crossly.shinbetsolutions.com/api/automation/rules/import \
  -H "Authorization: Bearer $CROSSLY_PAT" \
  -H "Content-Type: application/json" \
  -d @recipes/poshmark/share-closet-9am.json
```

Add `?activate=true` to flip the rule on immediately instead of inactive.

## Contributing a recipe

We accept PRs. To submit:

1. Pick a folder under `recipes/` matching the platform (or `multi/` for
   cross-platform), and write your recipe as a `.json` file.
2. Validate it locally:
   ```bash
   node scripts/validate.mjs recipes/poshmark/your-recipe.json
   ```
3. Open a PR. The validate workflow runs on every PR and blocks merges if
   anything fails the schema.

### Naming

Use kebab-case slugs that describe what the recipe **does**, not what it's
called in your head. `share-closet-9am.json` ≫ `my-morning-thing.json`.

### Recipe shape (v1)

```jsonc
{
  "$schema": "https://crossly.shinbetsolutions.com/schemas/automation-recipe.v1.json",
  "schemaVersion": 1,
  "name": "Share closet 9 AM",            // shown in the import preview
  "description": "Optional longer blurb",
  "trigger": {
    "type": "schedule.cron",
    "config": { "cron": "0 9 * * *", "timezone": "America/New_York" }
  },
  "condition": {                           // optional — omit to fire on every trigger
    "type": "listing.has_tag",
    "config": { "tag": "summer" }
  },
  "action": {
    "type": "listing.share_closet",
    "config": {}
  },
  "platforms": ["poshmark"],               // optional platform scope
  "metadata": {                            // optional, ignored by import
    "author": "@your-github",
    "tags": ["poshmark", "daily", "share"]
  }
}
```

Trigger / action / condition `type` values come from the live catalog:
<https://crossly.shinbetsolutions.com/api/automation/catalog>

If your recipe uses a trigger or action that isn't in the catalog yet, open
an issue in the main `crossly` repo first — the recipe will be blocked from
merging here until the catalog ships.

## License

MIT. Recipes contributed here are licensed under the same.
