with open('trotro-network.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Precompute st.transfers
target1 = '  var stopList = Object.keys(stops).map(function (k) { return stops[k]; });'
precompute_code = '''  var stopList = Object.keys(stops).map(function (k) { return stops[k]; });
  stopList.forEach(function (st) {
    st.transfers = [];
    for (var wi = 0; wi < stopList.length; wi++) {
      var other = stopList[wi];
      if (other.name === st.name) continue;
      if (Math.abs(other.lat - st.lat) > 0.005 || Math.abs(other.lon - st.lon) > 0.005) continue;
      var wm = haversineM([st.lon, st.lat], [other.lon, other.lat]);
      if (wm <= meta.transferWalkM) st.transfers.push({ stop: other, meters: wm });
    }
  });'''

if target1 in code and 'st.transfers = [];' not in code:
    code = code.replace(target1, precompute_code)
    print("Added transfer precomputation")

# 2. Use st.transfers in dijkstra
old_trans_loop = '''        for (var wi = 0; wi < stopList.length; wi++) {
          var other = stopList[wi];
          if (other.name === stop.name) continue;
          if (Math.abs(other.lat - stop.lat) > 0.005 || Math.abs(other.lon - stop.lon) > 0.005) continue;
          var wm = haversineM([stop.lon, stop.lat], [other.lon, other.lat]);
          if (wm > meta.transferWalkM) continue;'''

new_trans_loop = '''        var trans = stop.transfers || [];
        for (var wi = 0; wi < trans.length; wi++) {
          var other = trans[wi].stop;
          var wm = trans[wi].meters;'''

if old_trans_loop in code:
    code = code.replace(old_trans_loop, new_trans_loop)
    print("Used precomputed transfers in dijkstra")

with open('trotro-network.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated trotro-network.js with transfer precomputation")
