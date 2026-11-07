# Validation record

Checked on macOS with the installed Herdr native runtime on 2026-11-07.

- Initial native check and every layout/dialog role passed. Populated agent, pane, monitor and sidebar fixtures, Israfel, open refrigerator and battery variants passed.
- Pure tests exercise 500 containment seeds, reversible moves, hints after arbitrary moves, complete memory-game solutions, duplicate/mismatch gating, telemetry parsing, layout rules and livery/status mapping.
- Installer tests use temporary homes: fresh installation, conflict refusal, update backups, preserving unrelated settings, dry runs and rejecting destination symlinks.
- Live dark/light views were inspected. Light controls retain dark terminals; running Codex prompts, output and diffs were readable after the palette correction.
- The native switcher opened at its trigger with correct titles, marking and replacement filtering. Clicking Windows XP switched the actual window.
- Ireul was won live and its completion/score display observed. Israfel card reveal and mismatch/continue interaction were inspected. Its complete live win was not performed; complete solutions pass pure tests.
- Pen Pen and SEELE render in native fixtures. Their live click paths remain unverified after UI testing was interrupted by concurrent use.
- Actual local LINK UP and 100% AC were observed. Charging, discharging, absent battery and failure behavior use fixtures, not different physical hardware. Host telemetry is macOS only.
- Final live status had no runtime errors or overlays. The previous Windows XP layout and original appearance setting were restored.

Native fixtures validate description construction, not geometry or later callbacks. Private QA captures remain local; the public preview is illustrated SVG, not evidence of live behavior.

## Optional pane-name integration and installer update

The integration source passed 23 native fixtures before the host-memory incident. The current source passes 22 isolated tests: 14 JavaScript game/parser/integration tests and 8 installer tests. New cases cover missing/malformed capabilities, exact clicked-pane routing, identity-scoped Unicode names, fresh installed import completeness, preserving local extras, rollback after folder-swap and layout-write failures, and retaining recovery data if rollback fails.

The installer now stages a complete mod outside the watched directory and swaps folders. This source-only revision has not been installed into the live window during the incident. A preceding repair installed the missing helper and passed the installed module check.

Live QA of the shared pane-name dependency reported save/reset/cancel, Unicode, stale targets and unfocused-target isolation working. Evangelion-specific live rename acceptance remains pending. Further installs and layout switches were stopped after the active Windows XP mod reported out-of-memory/Null errors. The earlier clean-status record above describes the original layout QA, not this later incident. Native terminal-menu fallback for an absent external mod is documented by Herdr; it has not been clicked live in an installation without that dependency. No app or core restart was performed for this release.
