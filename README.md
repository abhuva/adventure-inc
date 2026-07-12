# adventure-inc

Static deterministic idle/RPG/management prototype.

Serve the folder, then open `http://localhost:8080/`.

The prototype loads JSON data with `fetch()`, so opening `index.html` directly from `file://` is not the supported path.

```powershell
python -m http.server 8080
```

Validate JavaScript syntax:

```powershell
node --check src\app.js
```
