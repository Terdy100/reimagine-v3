import re
with open('trotro.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update HTML search box
old_search = '''  <div class="search-box">
    
    <input id="search" autocomplete="off" placeholder="Where are you going?">
    <button id="searchBtn">Search</button>
  </div>
  <div id="results" class="results"></div>'''
new_search = '''  <div class="search-box">
    <input id="startSearch" autocomplete="off" placeholder="Where are you starting from?">
  </div>
  <div class="search-box" style="margin-top: 8px;">
    <input id="search" autocomplete="off" placeholder="Where are you going?">
    <button id="searchBtn">Search</button>
  </div>
  <div id="results" class="results"></div>'''
html = html.replace(old_search, new_search)

# 2. Update JS variables
html = html.replace("const searchEl=document.getElementById('search');", "const searchEl=document.getElementById('search');\nconst startSearchEl=document.getElementById('startSearch');\nlet activeInput = searchEl;")
html = html.replace('let userPos=null,userMarker=null,watchId=null,searchController=null;', 'let userPos=null,userMarker=null,watchId=null,searchController=null;\nlet originPlace=null;')

# 3. Remove locate button
html = html.replace('<button id="locate" class="locate" title="Show my location">Locate</button>', '')
html = re.sub(r"document\.getElementById\('locate'\)\.onclick=.*?\};", "", html, flags=re.DOTALL)

# 4. Make results attach to the active input
html = html.replace("document.getElementById('searchBtn').onclick=doSearch;", '''
startSearchEl.addEventListener('focus', () => { activeInput = startSearchEl; });
searchEl.addEventListener('focus', () => { activeInput = searchEl; });
document.getElementById('searchBtn').onclick=doSearch;
startSearchEl.addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();if(e.key==='Escape')resultsEl.style.display='none';});
''')

# Update doSearch to read from activeInput
html = html.replace('const q=searchEl.value.trim();if(q.length<2)return;', 'const q=activeInput.value.trim();if(q.length<2)return;')
html = html.replace('searchEl.value=item.name;', 'activeInput.value=item.name;')

# 5. In selectPlace, set originPlace or destPlace
old_select = '''  lastPlace=item;
  const dest=[item.lon,item.lat];
  new maplibregl.Popup({offset:20}).setLngLat(dest).setHTML('<strong>'+escapeHtml(item.name)+'</strong><br><small>'+escapeHtml(item.address||'Ghana')+'</small>').addTo(map);

  if(!userPos&&!chosenStart){'''
new_select = '''  lastPlace=item;
  if(activeInput === startSearchEl) {
    originPlace = item;
    var dest=[item.lon,item.lat];
    new maplibregl.Popup({offset:20}).setLngLat(dest).setHTML('<strong>'+escapeHtml(item.name)+'</strong><br><small>'+escapeHtml(item.address||'Ghana')+'</small>').addTo(map);
  } else {
    var dest=[item.lon,item.lat];
    new maplibregl.Popup({offset:20}).setLngLat(dest).setHTML('<strong>'+escapeHtml(item.name)+'</strong><br><small>'+escapeHtml(item.address||'Ghana')+'</small>').addTo(map);
  }

  if(!originPlace || activeInput === startSearchEl){
    headline.textContent='Start selected';
    subline.textContent='Now enter your destination.';
    if(originPlace) map.flyTo({center:[originPlace.lon,originPlace.lat],zoom:15,duration:900});
    return;
  }
  const destPoint=[lastPlace.lon,lastPlace.lat];

  if(false){'''
html = html.replace(old_select, new_select)

# Fix the dest reference if it was used below in selectPlace
html = html.replace('map.flyTo({center:dest,zoom:15,duration:900});', 'map.flyTo({center:destPoint,zoom:15,duration:900});')
html = html.replace('showStraightLineFare(item,dest,requestId);', 'showStraightLineFare(item,destPoint,requestId);')
html = html.replace('const destPoint=dest;', '')

# 6. Override resolveStart to use originPlace
old_resolve = '''function resolveStart(){
  // 1. The passenger's own answer wins'''
new_resolve = '''function resolveStart(){
  if(originPlace) {
    const byName = window.TrotroNetwork ? window.TrotroNetwork.matchStop(originPlace.name) : null;
    let stop = null;
    if(byName && byName.score >= 40) {
      stop = byName.stop;
    } else {
      const near = window.TrotroNetwork ? TrotroNetwork.nearestStop([originPlace.lon, originPlace.lat]) : null;
      if (near && near.meters <= meta_SNAP_M) stop = near.stop;
    }
    return { point: [originPlace.lon, originPlace.lat], stop: stop, how: 'from search', sure: true };
  }
  return {point:null,stop:null,how:'',sure:false};
}
function __old_resolveStart(){
  // 1. The passenger's own answer wins'''
html = html.replace(old_resolve, new_resolve)

# 7. Disable startLocation geolocation logic
html = html.replace("map.on('load',()=>startLocation());", "map.on('load',()=>{});")

with open('trotro.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated trotro.html")
