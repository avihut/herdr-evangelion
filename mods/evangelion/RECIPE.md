# Evangelion

A native NERV operations console surrounds the real Herdr terminals: burnt orange rules, dark green-black instruments, EVA silhouettes, MAGI channels and high-contrast title typography. The light appearance uses warm technical-paper surfaces around dark, readable terminal panels.

## What you see

62px title bar with macOS traffic-light clearance, NERV leaf and deployment title. A resizable 268px left sidebar holds deployments and scrollable agent cards. A center column holds a 34px operation tab strip and the active tab's terminal panes, each with a 28px header. A resizable 220px right monitor holds the MAGI triad, attention contacts and machine links. A 34px bottom bar contains a native layout selector, real agent counts, motion control, local network and battery status, and settings.

## How it behaves

The model is Herdr's own live spaces/agents/panes. ACTIVE is working, NEEDS YOU is blocked, COMPLETE is done, STANDBY is idle. Unit colors are selectable liveries; a terminal address always disambiguates the agent. MAGI status channels filter the list. Angel contacts focus the blocked agent. Context menus target the clicked space/tab/pane. The layout selector follows the house replacement and title rules. No global key bindings change.

Working indicators and victory text use native opacity loops, disabled by the MOTION control. Timers only refresh actual host telemetry every 30 seconds. There are no fake completion percentages, countdowns, Internet claims, or automated actions on agents.

SIM opens a 5×5 solvable Ireul toggle puzzle and a 16-card Israfel memory game. Three NERV clicks/seven MAGI clicks open SEELE; the refrigeration button reveals Pen Pen. Winning shows a congratulations card. See README for controls and provenance.

## Built from

`layouts/evangelion.json`, `themes/evangelion-dark.json`, `themes/evangelion-light.json`, one role-based `mods/evangelion` with main.js, kit.js, simulation.js, pure model.js, original SVG assets and OFL Antonio fonts. Root look properties stay on the root. Manifest with place:none is installed before main.js. The mod owns its popup style, so no other agent's shared layout-picker code is edited.

Uses Herdr spaces, agents, panes, machines, setAgentOrder, layouts, props, shared/setShared, theme/settings/window, run, overlays, and exec for the two read-only macOS telemetry commands. Games and easter eggs use only local state/shared scores. Shells and agents launch only through Herdr's existing user-invoked menus.

## Watch out

Use supported native elements; GPUI Background objects cannot currently pass through this Herdr build's generic `.bg` binding, so the hazard stripe is SVG. No timer-based animation. Default check does not exercise every role; force roles in temporary copies. Do not poll Herdr agents; they re-render live. Unit livery addresses are session-local, and future core address reuse can reuse that preference. Right monitor can be hidden in narrow windows. Non-macOS host telemetry is not implemented.

## Done when

Standalone checks and pure state tests pass. Live dark/light screenshots show readable controls and terminals, native menu opens at its trigger and switches, agent navigation and game clicks work, network/battery reflect the host, no app errors, previous layout restored after checks. Record exact evidence and any missing human acceptance in VALIDATION.md.
