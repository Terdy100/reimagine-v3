# 🗺️ Autonomous Trotro Route Expander & GIS Daemon

An autonomous paratransit expansion engine that systematically covers Greater Accra and connects outwards to other regions corridor-by-corridor without skipping any neighborhood or junction.

---

## 🛡️ Senior GIS Zero-Regression & Resilience Guarantees

1. **Zero-Regression Safeguard**:
   * Takes an automated timestamped backup to `route_expander/backups/` before any write.
   * Runs a Node VM syntax dry-run verification on temporary files before touching the live app.
   * If any route or coordinate fails schema check, the file is left 100% untouched. Existing routes are **NEVER deleted or corrupted**.

2. **Timeout & Failover Resilience**:
   * Every AI call has a strict 15-second timeout with automatic multi-model failover (Groq ➔ Gemini ➔ Cloudflare ➔ OpenRouter).
   * **Ground-Truth GIS Fallback**: If external AI APIs timeout or drop network, the system automatically uses surveyed landmark sequences from `zones.json` so no corridor is ever skipped or lost.
   * Corridors track failure counts and automatically re-queue on the next tick.

3. **Autonomous Background Scheduler**:
   * Runs automatically on a background schedule (heartbeat loop) so you don't need to trigger it manually.

4. **Senior GIS Officer Telemetry & Audit Reporting**:
   * Generates and maintains a comprehensive, audit-grade markdown report at [`route_expander/GIS_EXPANSION_REPORT.md`](file:///c:/Users/Spark%20Marley/Desktop/reimagine/route_expander/GIS_EXPANSION_REPORT.md).
   * Displays executive metrics, completed corridors ledger, QA/QC validations, and the next queued territory.

---

## 🚀 Commands

### 1. Run the Background Scheduler (Hands-Free Daemon)
Starts the autonomous loop to survey and expand corridors every N minutes (default 3 minutes):
```bash
node route_expander/daemon.js --start
```
Or set a custom interval (e.g. every 5 minutes):
```bash
node route_expander/daemon.js --start --interval 5
```

### 2. Survey Just One Corridor on Demand
Runs one cycle immediately, validates stops, commits to live app, and updates the GIS report:
```bash
node route_expander/daemon.js --run-once
```

### 3. Check System Status & Audit Telemetry
Displays the current mapped stats, next upcoming corridor, and updates the GIS report:
```bash
node route_expander/daemon.js --status
```

### 4. Interactive CLI Expansion Tools
```bash
node route_expander/expand.js --status
node route_expander/expand.js --next
node route_expander/expand.js --corridor "spintex"
node route_expander/expand.js --auto 3
```

---

## 📍 Coverage Roadmap (`zones.json`)

* **Phase 1: Greater Accra**
  * Zone 1: Central & Coastal Accra (Circle, Ridge, Osu, Labadi, Kaneshie, Dansoman, Mamprobi, Chorkor)
  * Zone 2: Eastern Corridors, Spintex & Ledzokuku
  * Zone 3: North-Eastern Corridors, Madina & Adenta
  * Zone 4: Northern Corridors, Achimota & Kwabenya
  * Zone 5: North-Western Corridors, Lapaz & Pokuase
  * Zone 6: Western Corridors, Mallam & Kasoa
  * Zone 7: Tema Metropolis, Ashaiman & Kpone
* **Phase 2: Eastern & Central Regional Connectors** (Nsawam, Suhum, Koforidua, Aburi, Winneba, Cape Coast)
* **Phase 3: Ashanti Region** (Kumasi Kejetia Terminal & Radial Arterials)
