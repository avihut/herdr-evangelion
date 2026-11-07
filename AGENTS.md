# Evangelion layout development

This repository is the authoritative source for the Evangelion Herdr layout. Edit here, validate, then install with `mise run install` (new installation) or `mise run update` (backs up existing owned files). Do not replace settings, keys, shared state or other layouts. Do not switch the user's window without explaining the test and restoring it afterward.

Read `docs/LAYOUT_GUIDE.md` for the reusable design and validation workflow. When working on a live installation, also read its generated AGENTS.md and personal CLAUDE.md. Keep the guide current when the user refines the workflow; reconcile its portable copy with the local canonical reference. Keep README and RECIPE aligned with implemented behavior.

Use pnpm and mise tasks. No third-party runtime or test dependencies are needed, so entering a worktree does not require a package install. Use daft for repository and worktree lifecycle; do not use git checkout/switch/worktree add. Commit daft.yml.

Run `mise run test` and, with Herdr installed, `mise run check`. The native checker does not lay out the UI or verify later interactions; record live checks separately. Games and host status need meaningful pure tests. Use native motion, truthful telemetry and the native layout-switcher rules. Do not start/restart herdr-core for validation.

Never commit live screenshots containing terminal conversations, private settings, logs, tokens or local app state. The published preview is an original illustration with sample data. Other agents may share the config; preserve their edits and coordinate ownership and live QA.
