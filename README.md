# Ūrēi — Works Index

A letterpress-inspired mothership for applications, experiments, and reference works.

Live site: https://8viliv8.github.io/urei-works-index/

The deployable static site is in `dist/`. Edit `dist/data.js` to add or update work and reference links.

The initial release is deliberately link-first: it gathers scattered public destinations before their source projects are migrated into canonical GitHub repositories.

## Adding works from the site (ADMIN)

`admin.html` (footer link "ADMIN") adds a work by pasting a URL. It commits to `dist/data.js` through the GitHub API, inserting before the `@@WORKS_END` marker, and Pages redeploys automatically.

- No server is used. A fine-grained GitHub token (this repository only, Contents: Read and write) is encrypted in the browser with the admin password (PBKDF2-SHA256 600k + AES-256-GCM) and stored as `dist/admin-key.json`. The token and password themselves are never stored.
- The encrypted file is public, so the password must be long (16+ characters).
- If the token expires or leaks: revoke it on GitHub, create a new one, and use "鍵を設定し直す" on the admin page.
