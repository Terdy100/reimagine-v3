import re

with open('trotro.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Restore map.on load
html = html.replace("map.on('load',()=>{});", "map.on('load',()=>startLocation());")

# 2. Fix resolveStart
old_resolve = '''function resolveStart(){
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
}'''
new_resolve = '''function resolveStart(){
  // User typed an origin explicitly
  if(originPlace) {
    const byName = window.TrotroNetwork ? window.TrotroNetwork.matchStop(originPlace.name) : null;
    let stop = null;
    if(byName && byName.score >= 40) {
      stop = byName.stop;
    } else {
      const near = window.TrotroNetwork ? TrotroNetwork.nearestStop([originPlace.lon, originPlace.lat]) : null;
      if (near && near.meters <= 2000) stop = near.stop;
    }
    return { point: [originPlace.lon, originPlace.lat], stop: stop, how: 'from search', sure: true };
  }
  // Otherwise use their GPS position if we have it
  if(userPos && window.TrotroNetwork) {
    const near = window.TrotroNetwork.nearestStop(userPos);
    return { point: userPos, stop: near ? near.stop : null, how: 'from your location', sure: true };
  }
  return {point:null,stop:null,how:'',sure:false};
}'''
html = html.replace(old_resolve, new_resolve)

# 3. Add the locate button back
if 'id="locate"' not in html:
    html = html.replace('<div id="status" class="status"></div>', '<div id="status" class="status"></div>\n<button id="locate" class="locate" title="Show my location">Locate</button>')
    # Re-add locate click handler
    js_addition = '''
document.getElementById('locate').onclick=()=>{
  if(userPos) map.flyTo({center:userPos,zoom:16,duration:900});
  else startLocation();
};
const GHANA_ALIASES='''
    html = html.replace('const GHANA_ALIASES=', js_addition)

# 4. Fix selectPlace bypass
old_check = '''  if(!originPlace || activeInput === startSearchEl){
    headline.textContent='Start selected';
    subline.textContent='Now enter your destination.';
    if(originPlace) map.flyTo({center:[originPlace.lon,originPlace.lat],zoom:15,duration:900});
    return;
  }'''
new_check = '''  if(activeInput === startSearchEl || (!originPlace && !userPos)){
    headline.textContent='Start selected';
    subline.textContent='Now enter your destination.';
    if(originPlace) map.flyTo({center:[originPlace.lon,originPlace.lat],zoom:15,duration:900});
    return;
  }'''
html = html.replace(old_check, new_check)

with open('trotro.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Restored GPS tracking in trotro.html")
