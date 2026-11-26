# Script Layout

- `site/` contains Astro build, preview, privacy, and link-check helpers used by `package.json`.
- `content/` contains write-up and blog content generators. Project authoring remains Obsidian-only.
- `obsidian/` contains local, Git-ignored vault publishing tools and batch-file launchers.
- `tests/` contains local publisher fixture tests.

## Research entries

Copy `templates/new-research-entry.md` into `src/content/infrastructure/`, `src/content/research/`, `src/content/investigations/`, or `src/content/engineering/`. Use a kebab-case filename, fill in the frontmatter, and write the body below it. The file path within the collection, without its extension, is its stable ID. Only entries with `status: published` appear in navigation indexes or receive article routes.

Use `infrastructureRefs` to list the IDs of shared infrastructure entries. For example, an ID of `range/baseline` points to `src/content/infrastructure/range/baseline.md`. The reserved ID `ludus` links to the existing Ludus Cyber Range page. A published article must reference published infrastructure. Keep reusable setup details in infrastructure and link to them from articles. Keep assets for unpublished work outside `public/`, which Astro copies into every build.

Run normal site tasks through the npm commands documented in the root `package.json`. Use the batch files in `obsidian/` for the vault publishing workflow.
