# Arcadia Link

A 2D pixel-art VRMMORPG prototype (Sword Art Online style) that runs in the browser. Plain HTML, CSS and JavaScript with no build step and no dependencies.

## Run it
Open `index.html` in a browser, or serve the folder: `python3 -m http.server 8000` then visit http://localhost:8000.

## Controls
WASD / arrows move, J or click attacks, 1-4 skills, K dodge, R potion, E interact, M menu, Enter chat.
On touch devices drag the left half of the screen to move and use the buttons on the right.

## Code map
- `src/core.js` utilities, synthesized audio, procedural pixel sprites
- `src/world.js` tile maps, the city/plains and the dungeon
- `src/data.js` items, enemies, skills, quests, player state, save/load
- `src/combat.js` player actions, enemy AI, the Gravel King boss, projectiles
- `src/ui.js` status window, shops, dialogs, HUD, minimap
- `src/main.js` rendering, lighting, input, game loop

Scripts share globals and load in the order listed in `index.html`.

## Status
This is a first prototype. Known weak spots: sprites are generated in code and look basic, combat feedback is thin, the world is small, and the "other players" are AI, not a real network.

## Roadmap to a real MMO
1. Art pass: hand-drawn sprite sheets, tilesets, lighting, weather, effects.
2. Combat pass: hit-stop, trails, enemy telegraphs, more skills and enemy types.
3. World: several zones and towns, guilds, market, crafting, more floors.
4. Multiplayer: Node.js + WebSocket server that owns the game state (positions, combat, loot) with an account database. The client then only sends input and renders server snapshots.
5. App: wrap with Capacitor for iOS/Android, or rebuild the client in Unity/Godot.

## Build an Android APK (GitHub Actions)
Push to `main` or run the workflow manually from the Actions tab ("Build Arcadia Link APK").
The APK is uploaded as the `Arcadia-Link-APK` artifact on the run page. It is a debug build; install it by enabling "install unknown apps" on your phone.
