# Creating Herdr layouts and themes

Use this guide when creating a layout, designing a theme, or adding themed features to an existing layout. The aim is a recognizable, useful interface with its own controls, meaningful connections to Herdr's data, and carefully integrated surprises. Read the installed `~/.config/herdr-app/AGENTS.md`, then the installed `~/.config/herdr-app/CLAUDE.md`, then this guide. The current user's instructions take precedence.

This is a maintained reference. When the user expands these preferences, or implementation and testing reveal a better approach, update the relevant section here as part of the same task. Keep the effective instructions in the body and a short dated refinement record at the end.

## Start from the source material

For a fictional universe or historical desktop, research its actual interfaces before choosing colors or writing controls. Look at screenshots and motion, then read manuals, production-design discussions, official typography references, and reliable explanations of the world. Use original sources where possible; distinguish fan reconstructions from frames of the original work.

Identify the visual grammar: typography and hierarchy, panel geometry, information density, symbols, palette, warning states, navigation, transitions and sounds. Research details that can become useful interactions or discoverable surprises. A distinctive layout should carry this grammar through the sidebar, tabs, pane frames, context menus, dialogs, layout picker and games.

Save a concise source list and explain the design decisions in the layout's README. Separate canonical details from invented Herdr adaptations. For example, an EVA livery for Codex is an adaptation; it does not make Codex a canonical pilot. A simulated radio station is entertainment, not a real broadcast.

Choose the appropriate asset method. Draw simple emblems, diagrams and interface shapes as native geometry or original SVG. Use image generation when original bitmap art would materially improve the result. Use installed or appropriately licensed fonts, keep bundled font licenses, and use clear substitutes when a reference font is unavailable. Do not replace useful text with illegible decorative lettering.

## Map the world to Herdr

Every layout presents the same real spaces, tabs, panes, terminals, agents and machines. The metaphor should explain that model and help someone navigate it.

| Herdr concept | Evangelion example | Fallout example | Preserve |
| --- | --- | --- | --- |
| Space | Deployment | Settlement | Real name, machine and selection |
| Tab | Operation | Quest | Real name, active state and panes |
| Agent | EVA unit | Companion | Actual title, address and status |
| Pane | Entry plug terminal | Console | Keyboard focus, splits, zoom and context actions |
| Working | Active unit | Working companion | Actual `working` state |
| Needs input | Angel contact and command request | Attention objective | Actual `blocked` state and route to that agent |
| Completed unseen | MAGI completion channel | Completed objective | Herdr's `done` semantics |
| Idle | Standby | Idle companion | Actual `idle` state |
| Machine | Umbilical link | Map location | Real connection readiness, not fictional geography |

Keep actual names visible beside themed labels. Distinguish multiple agents with their addresses even if they share a costume. Cosmetic choices must not alter an agent's prompts, permissions, model or behavior. Do not invent progress percentages, health readings, review decisions, or completion times when Herdr does not provide them.

Use explicit targets for actions on a row, tab or pane. A right-click menu must act on the object clicked, not whatever happens to have keyboard focus. Use Herdr's normal commands and confirmation behavior. Preserve access to launching agents and terminals, switching spaces/tabs, split/zoom controls, and settings. Set agent navigation order from the displayed agent list so keyboard navigation is coherent.

## Give the layout its own controls

Plan the layout tree before implementing it: title bar, workspace navigation, agent list, operation tabs, terminal region, optional monitor and status bar. Reserve macOS traffic-light space. Provide window buttons on platforms that require them. Prefer resizable or collapsible secondary panels and scrollable lists over truncating the number of workspaces or agents.

The terminal remains the main work surface. Keep dense ornamental detail in the surrounding controls. Make empty, busy, blocked, offline and long-name states deliberate. Check a narrow window as well as a large monitor. Avoid large fixed-height popups and unreachable controls at the screen edge.

Follow the native layout-switcher rules in the installed `~/.config/herdr-app/CLAUDE.md`. Every layout must have a switcher inside its own bar or menu, matching the host font, shape and palette. Normally invoke `run("mod.open", { name: "layout-picker" })`; alternatively draw a native menu in the layout's own mod. Pointer menus size to their rows without a forced height.

Every switcher lists `layouts()` once, hides a built-in when its personal replacement exists, uses the shared title conventions, marks `shared("layout")`, and switches through `layout.switch`. In particular, show Windows 98 rather than Win98 Dark. Keep these rules aligned with `mods/layout-picker/main.js`. Do not wrap a root or float a detached switcher over the layout. Update the switcher table in CLAUDE.md after installation.

## Make light and dark usable

Design both appearances deliberately. Check foregrounds, muted labels, borders, selected rows, alerts, icons, menus, dialogs and games in each. Fixed accent colors often need darker light-mode variants. A light version may adapt the original design while preserving its hierarchy and identity.

Treat terminal colors separately from the surrounding controls. Already-running terminal applications can retain explicit dark backgrounds and pale true-color text. Switching the terminal's default background to white can therefore make Codex output, prompts and diffs unreadable even when the sidebar looks correct.

The tested default for these themed layouts is **light controls around dark terminal surfaces**, with a readable dark ANSI palette in both appearances. A genuinely light terminal variant is acceptable only after testing the actual running agents, including their input areas, code blocks, diffs, selections and muted text. Do not claim to have fixed the application's own theme when the change is confined to the terminal palette.

Theme files define terminal `background`, `foreground`, `selection`, `cursor` and ANSI colors; their `colors` overrides supply the panel palette. Validate the result in this installed Herdr version. Keep root look properties on the outermost layout node. Do not leave a testing appearance override or replace unrelated settings after verification.

## Show real network and battery status

Each new layout includes a native network indicator and a battery icon on battery-equipped computers. Put them in a status bar, system tray or equivalent control area that belongs to the design.

- Report the local computer's status separately from remote Herdr machine availability.
- Describe what was measured: an active local interface or available route is not proof of Internet access. Do not hardcode Connected, a network speed, charge percentage or a countdown.
- Show unknown on failed probes. Tooltips can show interface names, the meaning of the indicator and the last sample time.
- Show real battery percentage and distinguish charging, AC-powered, discharging and unknown. Hide the battery on computers known to have no battery. If hardware was detected and a later sample fails, retain an unknown battery indication rather than a stale percentage.
- Use a supported host API if available. On this macOS build, the layouts use read-only `scutil --nwi` and `pmset -g batt`, generally every 30 seconds. Parse normal, missing-hardware and failure outputs. Document unsupported platforms rather than displaying plausible invented values.
- Explain new program execution, external file access or network requests before adding them. Local status displays do not need external telemetry services.

Read current implementations before reusing them. A familiar-looking tray icon may be decorative or may have changed since its earlier version.

## Build worthwhile easter eggs and games

For a substantial fictional or nostalgic layout, include researched details that reward exploration: a hidden character, an in-world maintenance panel, a familiar shutdown refusal, a special completion screen, a secret menu, badges, or a playable mini-game. Preserve the ordinary workspace while someone explores.

Use the installed Windows 98 and Windows XP layouts as examples of integrated games, native menus and discoverability; read their current source without editing it. Their assets and implementation are not automatically part of a new layout.

Prefer a few completed interactions over many decorative buttons. Themed games need real rules, restart, feedback, a reachable win condition and appropriate persistence. Examples from these layouts are a RobCo positional-likeness trainer, an original holotape route puzzle, an Ireul containment puzzle and an Israfel matching drill. Test the rules independently of the UI: solvability, move costs, edge cases, duplicate clicks, lockout, undo, hints, victory and saved scores as applicable.

Keep fictional emergencies inside clearly labeled simulations. A secret should not send agent prompts, kill processes, close workspaces, alter permissions, merge work, or change real files as a surprise. Store preferences, discoveries and game scores in a layout-specific namespace. Use local reset controls for optional progress.

Make primary games discoverable through a normal menu or inventory. Let easter eggs retain some mystery, with gentle hints and a spoiler section in the README. Offer a close or escape path. Keep sounds opt-in and use original or appropriately licensed audio.

## Animate through the native renderer

Use GPUI's native `.frames`, `.spin`, `.loop` and transitions for animation. Working indicators, subdued radar or radio motion, game feedback and deliberate victory effects can add character. Every animation should fit the source material and stay clear of terminal text.

Provide a visible reduced-motion control. Avoid aggressive flashing, constant alarms, automatic full-screen interruptions and noise during work. Native animation stops when not drawn; JavaScript timers that repeatedly call `notify()` for animation redraw the whole window and waste battery. Timers belong to real clocks or telemetry, at the lowest useful frequency. Herdr's own live model already triggers renders; do not poll agents or spaces.

## Implement safely in the shared config

Herdr mods are native GPUI JavaScript, not HTML or a web view. Read the installed `herdr.d.ts` and `gpui-kit.d.ts`; they describe the actual runtime. Use existing mods as examples, but validate every borrowed API in the standalone checker. Never edit the generated type files, frame files, shipped mods or generated AGENTS.md.

For a new mod, create `mod.json` with `"place": "none"` **before** writing `main.js`. Otherwise Herdr can auto-dock it and wrap the current layout's root. Check for name collisions, install new names, keep assets together, and write the layout JSON after its dependencies exist. Avoid changing global key bindings for ordinary layout features.

For updates, stage the complete mod outside the watched `mods/` directory and replace its folder with renames. Preserve local unowned files, keep a backup, and retain recovery files if rollback fails. Prepare all dependencies before exposing the entry point; write themes and the layout after the complete mod. Validate the installed package's transitive local imports in a temporary home, not only the source tree.

Repeated file-by-file hot reloads have exhausted the host's mod runtime in observed XP testing. Reinstalling, switching layouts and creating another test tab did not recover that incident; only restarting Herdr.app did. If `out of memory` or repeated `Null` errors appear, stop live installs, switches and test tabs. Record the error and coordinate recovery. Do not restart the app without the user's authorization, and never restart herdr-core as a workaround. The exact cause of a new incident still needs evidence; do not assume every OOM has the same cause.

Keep pure game and parsing logic in separate modules so it can be tested without launching Herdr. Keep slow work in `cx.spawn`, use the callback's current context, and do not retain `cx` for later use. Guard overlapping host probes and handle failures without inventing successful results.

Coordinate file ownership when other agents are active. Give each layout its own mod, theme and asset paths. Ask before editing another agent's module; prefer a local native picker when the shared picker is owned elsewhere. Coordinate live-window testing so two agents do not switch the window or change appearance at once.

The installed `hc --skill` identifies `hc` as Herdr.app's core and distinguishes it from the older `herdr` multiplexer. Use the tool and manual for the actual product. A sandbox can block an existing core socket and make `hc` attempt startup; use the authorized access mechanism rather than starting or restarting a second server. Never restart the user's core as a validation shortcut.

When a separate source repository is useful, follow the user's daft workflow, use pnpm, and expose repeated development/install/check commands as mise tasks when using mise. Record whether the authoritative source is a repository or the config files; do not edit generated installed copies when a source workflow already exists.

## Verify the installed result

1. Run `herdr-app check` for every changed mod. Its initial render does not cover layout geometry, deferred content, interactions or later states.
2. Exercise every role in isolated fixtures, including populated lists, empty lists, selected panes, alternate game modes, victory states, and relevant host-status branches. Keep fixtures and mock data out of the installed runtime.
3. Run meaningful pure tests for game mechanics and telemetry parsing. Do not add tests that merely repeat cosmetic implementation details.
4. Tell the user before temporarily switching their window. Record the previous layout and appearance, coordinate with other agents, then inspect the real installed layout using `herdr-app shot` and `herdr-app status`.
5. Inspect both appearances. Check actual Codex and other terminal text as well as layout controls. Check long names, scrolling, menus near edges, smaller widths, and active/blocked/done/idle presentations where available.
6. Click the native switcher: verify its position, style, deduplication, titles and active marker, then actually switch a layout. Test representative navigation, context actions, games and discoveries through the UI.
7. Confirm real network and battery readings. Use parser fixtures for states the current hardware cannot produce; report which branches were not physically observed.
8. Check for runtime errors, restore the previous layout and appearance, close only temporary overlays or test tabs created by this work, and preserve unrelated changes made during testing.

Use CUA for clicks not available through purpose-built Herdr commands. If interaction is interrupted by the person using the app, refresh the UI state before proceeding. Do not infer that a timed-out click succeeded. Report test limits accurately; a fixture pass is not a screenshot or a completed human interaction.

## Document and deliver

Each substantial layout should include:

- A README with how to select it, everyday controls, the Herdr mapping, games, easter egg spoilers, preferences, research links, telemetry behavior and platform limitations.
- A RECIPE following AGENTS.md: what the person sees, how it behaves, what it is built from, pitfalls and acceptance checks.
- A settings preview and useful dark/light screenshots. Keep private terminal contents local unless publication is explicitly requested.
- A short validation record distinguishing static checks, logic tests, observed UI behavior and anything unverified.
- An entry in CLAUDE.md's switcher table.

The completion message should say what was installed, how to select it, the most interesting features, what was tested, and any material limitation. Link the README and this reference rather than repeating every instruction in chat. Restore the user's prior screen unless they ask to keep the new layout active.

## Publish a faithful showcase

When publication is requested, give each layout its own repository with an authoritative source, safe installer, repeatable mise tasks, pnpm tests, tracked daft configuration and applicable licenses. Preserve original artwork and font notices. Refuse accidental overwrites, back up explicit updates, install the manifest before the entry point and layout last, and leave global state and active appearance alone.

Make the README rich and inviting while accurately showing the finished implementation. Start with a clean original preview and a concise identity, then tour the controls, world-to-Herdr mapping, rooms or modes, mini-games and customization. Use collapsible easter-egg spoilers. Include straightforward installation/update steps, source workflow, validation limits, telemetry/platform behavior and research/credits. Distinguish illustrated previews from actual UI captures and implemented features from plans. Never publish private terminal conversations, state, credentials or personal QA captures just to make a showcase look complete.

For room-based interfaces and advisor portraits, research how the original navigation and transitions work before adapting them. For requested 3D, inspect native renderer support and accurately distinguish interactive 3D, pre-rendered 3D assets and 2D illustration. These are design options when the source and request call for them, not requirements to bolt onto every layout.

## Reusable request

> Read `~/.config/herdr-app/AGENTS.md`, then `CLAUDE.md`, then `LAYOUT_GUIDE.md`. Create and install a Herdr layout inspired by **[source or universe]**. Research its actual interfaces and lore; map them to real workspaces, tabs, panes, agents and machines. Build a cohesive native interface with its own layout switcher, real network and battery indicators, readable light/dark appearances, thoughtful motion controls, and integrated easter eggs or playable features where they fit. Validate the installed result, document controls and sources, and restore my previous layout after tests. Incorporate new preferences and verified lessons into `LAYOUT_GUIDE.md` as you work.

## Keep this guide current

When the user refines the workflow, update the relevant instruction in this guide and any affected implementation. Preserve the distinction between a general preference and a request specific to one theme. When testing reveals a limitation, record the narrow observed condition and its verified workaround; remove obsolete advice when it is superseded.

Keep detailed API facts in AGENTS.md and the generated types, and universal house rules in CLAUDE.md. This guide connects them into a design and build workflow. Link to the authoritative rule instead of maintaining conflicting copies. Do not put durable instructions in generated AGENTS.md.

Add a brief date and explanation below for meaningful refinements. Do not keep chat transcripts, temporary agent IDs, permission-prompt history or abandoned plans.

| Date | Refinement |
| --- | --- |
| 2026-11-07 | Established the researched layout workflow from Evangelion and Fallout: faithful design language, real Herdr mappings, games, discoveries, native motion, ownership and live validation. |
| 2026-11-07 | Made measured local network status and hardware-aware battery indicators standard for new layouts. Distinguished link availability from Internet reachability and specified unknown/failure states. |
| 2026-11-07 | Added verification of running agents in light mode. Adopted dark terminal surfaces within light controls where retained Codex dark formatting makes pale terminal backgrounds unreadable. |
| 2026-11-07 | Added the user's requirement to keep this reference linked from house rules and update it as the workflow is expanded or refined. |
| 2026-11-07 | Added public per-layout packaging and rich, faithful README showcases with original previews, implemented-feature tours, game rules, spoiler sections, source workflow and honest validation limits. Recorded room navigation, advisor portraits and accurate 3D terminology as source-dependent design options. |
| 2026-11-07 | Added whole-folder staged updates, installed-import completeness tests, rollback recovery retention, and a stop-and-coordinate rule for observed host runtime exhaustion. |

This is a portable guide copy. Reconcile refinements with your local canonical guide; do not publish personal configuration or private QA captures.
