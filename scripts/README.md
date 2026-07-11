# Script Layout

- `site/` contains Astro build, preview, privacy, and link-check helpers used by `package.json`.
- `content/` contains write-up and blog content generators. Project authoring remains Obsidian-only.
- `obsidian/` contains local, Git-ignored vault publishing tools and batch-file launchers.
- `tests/` contains local publisher fixture tests.

Run normal site tasks through the npm commands documented in the root `package.json`. Use the batch files in `obsidian/` for the vault publishing workflow.
