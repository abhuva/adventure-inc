# adventure-inc

Static deterministic idle/RPG/management prototype.

Serve the folder, then open `http://localhost:8080/`.

The prototype loads JSON data with `fetch()`, so opening `index.html` directly from `file://` is not the supported path.

```powershell
python -m http.server 8080
```

Validate JavaScript syntax and tests:

```powershell
npm run check:js
npm test
```

Manual smoke checklist:

1. Switch through Map, Tavern, Population, Roster, Dungeon, Temple, and Systems.
2. Toggle auto time and confirm workers/parties move smoothly on the map.
3. Select a dungeon POI on Map and assign the selected party as a repeated route.
4. Simulate a dungeon run and inspect the combat replay timeline.
5. Recruit a visitor and move characters between party groups.
6. Change Temple stone, shard placement, and active links, then confirm run estimates update.
