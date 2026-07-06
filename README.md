# Slyzzed Cybersecurity Documentation

Astro static site for cybersecurity projects, technical write-ups, lab documentation, and lessons learned.

The site is fully static and deploys to GitHub Pages from the generated `dist` directory.

## Local Setup

Install dependencies:

```bash
npm install
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`:

```powershell
npm.cmd install
```

## Development Commands

```bash
npm run dev
npm run build
npm run preview
npm run test:site
npm run privacy:check
npm run check:links
```

`npm run build` runs the privacy check before generating the production site.

## Testing Locally

Run a production-style local test server:

```bash
npm run test:site
```

This command builds the site, checks internal links, then serves the generated `dist` output at:

```text
http://127.0.0.1:4321/cybersecurity-portfolio/
```

Useful options:

```bash
npm run test:site -- --port 4322
npm run test:site -- --host 0.0.0.0 --port 4321
npm run test:site -- --skip-build
```

## Content Model

Portfolio content lives in Astro content collections:

- `src/content/projects`
- `src/content/writeups`
- `src/content/blog`

Each entry is a Markdown file with validated frontmatter. Supported status values are:

- `draft`
- `published`
- `archived`

Only entries with `status: published` are included in the production website. Set `featured: true` to include a published entry in the homepage featured records section. Index pages sort entries by `date`, newest first.

Blog posts also support `updatedDate`, `authorAlias`, `category`, `tags`, and optional `coverImage`. Blog author information uses an alias only; do not add real names, email addresses, or profile URLs unless you have intentionally configured and reviewed that disclosure.

## Creating A Project

```bash
npm run new:project -- --title "Home SIEM Lab" --description "Security monitoring lab documentation"
```

This creates a draft Markdown file in `src/content/projects`.

## Creating A Write-up

```bash
npm run new:writeup -- --title "Deploying Wazuh Agents" --description "Agent deployment notes and validation"
```

This creates a draft Markdown file in `src/content/writeups`.

## Creating A Blog Post

```bash
npm run new:blog -- --title "Detection Notes" --description "Research notes and observations"
```

This creates a draft Markdown file in `src/content/blog` using `templates/new-blog-post.md`.

You can override the default non-identifying author alias:

```bash
npm run new:blog -- --title "Detection Notes" --description "Research notes" --authorAlias "Archive Operator"
```

You can also set `BLOG_AUTHOR_ALIAS` in your shell before running the generator. Keep this as an alias unless you intentionally want public attribution.

Templates are stored under:

- `templates/new-project.md`
- `templates/new-writeup.md`
- `templates/new-blog-post.md`

## Publishing Drafts

Review the Markdown content, remove any sensitive details, then update the frontmatter:

```yaml
status: published
featured: true
```

Use `featured: false` for normal published records that should appear only on the relevant index page.

## Privacy Check

Run:

```bash
npm run privacy:check
```

The privacy checker scans configured source paths for email addresses, Windows user paths, common secret assignments, private key blocks, private hostnames, device identifiers, private IP addresses, and any strings listed in `privacy.config.json`.

`privacy.config.json` is intentionally ignored by Git. Create it locally from `privacy.config.example.json`, then add personal names, private hostnames, device IDs, or other sensitive strings to `configuredSensitiveStrings` before publishing content that may contain them.

Do not commit the real privacy config. It may contain the exact strings that should stay private.

## Deployment

The workflow in `.github/workflows/deploy.yml` builds and deploys the Astro site to GitHub Pages on pushes to `main`.

In GitHub, set Pages to use GitHub Actions:

```text
Settings -> Pages -> Source -> GitHub Actions
```

The Astro base path is configured in `astro.config.mjs` for this repository name. If the repository name changes, update `base` before deploying.
