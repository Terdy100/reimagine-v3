# Custom Trotro & Community Shuttle Registry

This folder gives you complete control to safely add, verify, and manage custom trotro lines, community shuttles, campus shuttles, and inter-city routes in the Trotrolive system.

---

## 📂 Quick File Overview

- **`custom-routes.js`**: The main file where you add your routes. Any route added here is automatically loaded by the routing engine.
- **`README.md`**: This guide with examples, coordinate lookups, and troubleshooting tips.

---

## 🚀 How to Add a New Route (3 Steps)

### Step 1: Open `custom-routes.js`
Open `app/src/custom-routes/custom-routes.js`.

### Step 2: Add your route object to the `customRoutes` array
Paste your route inside the `customRoutes = [...]` array:

```javascript
export const customRoutes = [
  {
    id: 'ashongman-circle',
    name: 'Ashongman ⇄ Circle',
    color: '#0284c7', // Any hex color
    stops: [
      ['Ashongman Estate', -0.2315, 5.7021],
      ['Atomic Junction', -0.1780, 5.6650],
      ['Legon', -0.1860, 5.6500],
      ['37', -0.1854, 5.5865],
      ['Circle', -0.2189, 5.5582]
    ]
  },
  {
    id: 'circle-ashongman',
    name: 'Circle ⇄ Ashongman',
    color: '#0284c7',
    stops: [
      ['Circle', -0.2189, 5.5582],
      ['37', -0.1854, 5.5865],
      ['Legon', -0.1860, 5.6500],
      ['Atomic Junction', -0.1780, 5.6650],
      ['Ashongman Estate', -0.2315, 5.7021]
    ]
  }
];
```

> **Tip**: If trotro vehicles travel in both directions, add both forward and return route entries (as shown above) so passengers can navigate in either direction.

### Step 3: Save the file
That's all! The app will automatically:
- Connect the new stops into the transit graph.
- Allow passengers to transfer to/from any connecting trotro routes at shared stops (e.g. Circle, 37, Legon).
- Snap the transit lines to real roads via OSRM.
- Calculate accurate fares, transit durations, and display clickable map stop markers.

---

## 📍 How to Get GPS Coordinates for Any Bus Stop

1. Open **[Google Maps](https://maps.google.com)** or **[OpenStreetMap](https://www.openstreetmap.org)**.
2. Locate the trotro stop, junction, or station in Ghana.
3. Right-click on the map location and click **Copy coordinates**.
4. Remember the coordinate order:
   - **Longitude (X)**: In Ghana, this is the **first coordinate in our stop array** (e.g. `-0.2189`).
   - **Latitude (Y)**: In Ghana, this is the **second coordinate in our stop array** (e.g. `5.5582`).
   
   Format: `['Stop Name', Longitude, Latitude]`

---

## 🏷️ Popular Greater Accra Interchange Coordinates

You can connect your custom routes to these major transit hubs for automatic passenger transfers:

| Hub / Station | Longitude | Latitude |
| :--- | :--- | :--- |
| **Kwame Nkrumah Circle** | `-0.2189` | `5.5582` |
| **37 Military Hospital** | `-0.1854` | `5.5865` |
| **Kaneshie Market Complex** | `-0.2490` | `5.5598` |
| **Madina Main Station** | `-0.1680` | `5.6830` |
| **Abeka Lapaz Overhead** | `-0.2440` | `5.6030` |
| **Achimota Transport Terminal** | `-0.2310` | `5.6230` |
| **Tetteh Quarshie (Accra Mall)**| `-0.1752` | `5.6112` |
| **Tema Station (Accra Central)**| `-0.2017` | `5.5458` |
| **Dansoman Last Stop** | `-0.2670` | `5.5420` |
| **Mallam Junction** | `-0.2860` | `5.5680` |
| **Ablekuma Main Station** | `-0.3102` | `5.6272` |
| **Kasoa Main Overhead** | `-0.4262` | `5.5342` |
| **East Legon Station** | `-0.1580` | `5.6390` |
| **Tema Community 1** | `-0.0078` | `5.6482` |

---

## 💡 Best Practices

1. **Keep Stop Names Simple**: Use common local names like `"Atomic Junction"`, `"UPSA"`, `"Palace Mall"`.
2. **Reuse Existing Stop Names for Transfers**: If your route stops at a major interchange like `"Circle"`, `"37"`, or `"Lapaz"`, spelling the name the same way ensures instant seamless transfers with all existing trotro lines.
3. **Hex Colors**: Use vibrant distinct colors (e.g., `#0284c7`, `#10b981`, `#f59e0b`, `#8b5cf6`) to make your route easily recognizable on the live map.
