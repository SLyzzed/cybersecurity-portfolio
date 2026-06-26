# Slyzzed Cybersecurity Documentation

A simple static documentation-focused website built with plain HTML and CSS.

## Files

- `index.html` - Homepage and documentation index.
- `projects.html` - Project list and future documentation placeholders.
- `writeups.html` - Technical write-up placeholder list.
- `writeups/wazuh-home-siem.md` - Example Jekyll Markdown write-up.
- `_config.yml` - GitHub Pages and Jekyll configuration.
- `_layouts/default.html` - Shared layout for Markdown write-up pages.
- `about.html` - Short site description and profile links.
- `style.css` - Shared styling and responsive layout.
- `README.md` - Project notes and publishing checklist.

## Constraints

- No JavaScript.
- No framework.
- No backend.
- No database.
- No contact form.

## Markdown Write-ups

Markdown write-ups live in the `writeups` directory and use Jekyll front matter.

Example:

```markdown
---
layout: default
title: Wazuh Home SIEM
permalink: /writeups/wazuh-home-siem/
---
```

The default layout uses `relative_url` for internal paths so GitHub Pages project sites work correctly at:

```text
https://USERNAME.github.io/REPOSITORY-NAME/
```

This repository is currently configured with:

```yaml
baseurl: "/cybersecurity-portfolio"
```

If the repository name changes, update `baseurl` in `_config.yml` to match the new GitHub Pages project path.

## GitHub Pages Settings

In the GitHub repository, enable GitHub Pages from:

```text
Settings -> Pages
```

Use these settings:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

## Placeholder Values To Replace

Replace these before publishing:

```text
Date placeholder: YYYY-MM-DD
Future documentation link placeholder
```

Current profile URL:

```text
https://github.com/SLyzzed
```

The project and write-up links currently point to placeholders. Replace them with real documentation page URLs when those pages are created.

## Local Preview

Open `index.html` directly in a browser. The site is fully static and does not require a development server.

## Publishing Updates

Use the included Bash script to commit and push site changes to GitHub:

```bash
./deploy.sh
```

On Windows, run this from Git Bash, WSL, or another terminal where `bash` is installed.

You can also pass a custom commit message:

```bash
./deploy.sh "Update project documentation"
```

The script stages the static site files, commits them, and pushes to the current Git branch.
