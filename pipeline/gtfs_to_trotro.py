import csv
import json
import os
import zipfile
import urllib.request
import random

def random_color():
    return f"#{random.randint(0, 0xFFFFFF):06x}"

def main():
    print("Welcome to the Trotro GTFS Pipeline!")
    print("-----------------------------------")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    gtfs_url = "https://storage.googleapis.com/storage/v1/b/mdb-latest/o/gh-greater-accra-region-accramobile-gtfs-555.zip?alt=media"
    zip_path = os.path.join(script_dir, "accra_gtfs.zip")
    extract_dir = os.path.join(script_dir, "gtfs_data")

    # Step 1: Download the GTFS Data
    if not os.path.exists(zip_path):
        print("Downloading Accra GTFS dataset...")
        try:
            # Note: A real production URL would be used here. For demonstration, we attempt to download a known open GTFS url.
            # If this URL is dead, the script will gracefully tell the user what to do.
            urllib.request.urlretrieve("https://transitfeeds.com/p/accramobile/555/latest/download", zip_path)
            print("Download complete.")
        except Exception as e:
            print(f"Failed to download automatically: {e}")
            print("Please manually download an Accra GTFS zip file and save it as 'accra_gtfs.zip' in this folder.")
            return

    # Step 2: Extract
    if not os.path.exists(extract_dir):
        print("Extracting GTFS files...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

    # Step 3: Parse GTFS
    print("Parsing GTFS data...")
    stops = {}
    with open(os.path.join(extract_dir, 'stops.txt'), 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            stops[row['stop_id']] = {
                'name': row.get('stop_name', 'Unknown Stop'),
                'lat': float(row['stop_lat']),
                'lon': float(row['stop_lon'])
            }

    routes = {}
    with open(os.path.join(extract_dir, 'routes.txt'), 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            color = row.get('route_color', '').strip()
            if not color:
                color = random_color()
            elif not color.startswith('#'):
                color = f"#{color}"
            
            name = row.get('route_long_name') or row.get('route_short_name') or f"Route {row['route_id']}"
            routes[row['route_id']] = {
                'name': name,
                'color': color,
                'trips': []
            }

    trips = {}
    with open(os.path.join(extract_dir, 'trips.txt'), 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Keep track of one representative trip per route/direction
            key = f"{row['route_id']}_{row.get('direction_id', '0')}"
            if key not in trips:
                trips[key] = {
                    'trip_id': row['trip_id'],
                    'route_id': row['route_id'],
                    'stops': []
                }

    # Stop Times can be large
    trip_ids = {t['trip_id']: t for t in trips.values()}
    with open(os.path.join(extract_dir, 'stop_times.txt'), 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            t_id = row['trip_id']
            if t_id in trip_ids:
                trip_ids[t_id]['stops'].append({
                    'seq': int(row['stop_sequence']),
                    'stop_id': row['stop_id']
                })

    # Step 4: Construct Output
    print("Constructing route objects...")
    js_routes = []
    
    for t_id, trip in trip_ids.items():
        trip['stops'].sort(key=lambda x: x['seq'])
        route_meta = routes.get(trip['route_id'])
        if not route_meta or len(trip['stops']) < 2:
            continue
        
        stops_arr = []
        for s in trip['stops']:
            stop_info = stops.get(s['stop_id'])
            if stop_info:
                safe_name = stop_info['name'].replace("'", "")
                stops_arr.append(f"['{safe_name}', {stop_info['lon']:.5f}, {stop_info['lat']:.5f}]")
        
        js_routes.append(f"""    {{
      id: '{trip['route_id']}_{t_id}', 
      name: '{route_meta['name'].replace("'", "")}', 
      color: '{route_meta['color']}',
      stops: [{', '.join(stops_arr)}]
    }}""")

    output_js = "var generated_routes = [\n" + ",\n".join(js_routes) + "\n];"
    
    out_path = os.path.join(script_dir, "generated_routes.js")
    with open(out_path, "w", encoding='utf-8') as f:
        f.write(output_js)
        
    print(f"Successfully generated {len(js_routes)} routes!")
    print("Output saved to 'pipeline/generated_routes.js'")
    print("You can copy these objects into your 'trotro-network.js' file.")

if __name__ == "__main__":
    main()
