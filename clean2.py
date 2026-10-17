import re

with open('trotro.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Clean up selectPlace duplicates
old_select = '''  if(activeInput === startSearchEl) {
    originPlace = item;
    var dest=[item.lon,item.lat];
    new maplibregl.Popup({offset:20}).setLngLat(dest).setHTML('<strong>'+escapeHtml(item.name)+'</strong><br><small>'+escapeHtml(item.address||'Ghana')+'</small>').addTo(map);
  } else {
    var dest=[item.lon,item.lat];
    new maplibregl.Popup({offset:20}).setLngLat(dest).setHTML('<strong>'+escapeHtml(item.name)+'</strong><br><small>'+escapeHtml(item.address||'Ghana')+'</small>').addTo(map);
  }'''
new_select = '''  if(activeInput === startSearchEl) {
    originPlace = item;
  }
  var dest=[item.lon,item.lat];
  new maplibregl.Popup({offset:20}).setLngLat(dest).setHTML('<strong>'+escapeHtml(item.name)+'</strong><br><small>'+escapeHtml(item.address||'Ghana')+'</small>').addTo(map);'''
html = html.replace(old_select, new_select)

# 2. Remove __old_resolveStart entirely
html = re.sub(r'function __old_resolveStart\(\)\{[\s\S]*?(?=\n// Name the start of the trip,)', '', html)

# 3. Remove startLocation()
html = re.sub(r'function startLocation\(\)\{[\s\S]*?(?=document\.getElementById\(\'locate\'\))', '', html)

# 4. Remove toggleStopPicker
html = re.sub(r'function toggleStopPicker\(\)\{[\s\S]*?(?=/\* ---------- WHERE THE TRIP STARTS, AND HOW THAT IS DECIDED)', '', html)

# 5. Remove call to toggleStopPicker in renderStartRow if it's there
html = html.replace('btn.addEventListener(\'click\',toggleStopPicker);', '')

# 6. Remove renderStartRow entirely
html = re.sub(r'function renderStartRow\(\)\{[\s\S]*?(?=async function selectPlace\(item\))', '', html)

# 7. Remove calls to renderStartRow
html = html.replace('renderStartRow();', '')

with open('trotro.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Applied clean2.py")
