import re
import sys

with open('trotro.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove __old_resolveStart and old functions completely
old_resolve_start = re.search(r'function __old_resolveStart\(\)\{.*?\}', html, flags=re.DOTALL)
if old_resolve_start:
    # wait, it might contain nested braces, regex for JS function is hard.
    pass

# A better way: just let me remove specific blocks using split/replace
# Let's replace the whole section starting from 'function ensureUserVisual()' down to 'const GHANA_ALIASES='

# Find the start
start_idx = html.find('function ensureUserVisual()')
end_idx = html.find('const GHANA_ALIASES=')

if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + html[end_idx:]

# Remove toggleStopPicker and renderStartRow
start_idx = html.find('function toggleStopPicker()')
end_idx = html.find('function resolveStart()')

if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + html[end_idx:]

start_idx = html.find('function renderStartRow()')
end_idx = html.find('async function selectPlace(item)')

if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + html[end_idx:]

# Remove call to renderStartRow in selectPlace
html = html.replace('renderStartRow();', '')

# Remove __old_resolveStart
start_idx = html.find('function __old_resolveStart()')
end_idx = html.find('async function selectPlace(item)', start_idx)
# actually __old_resolveStart is after resolveStart and before selectPlace, wait no.
# resolveStart is above renderStartRow.

with open('trotro.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Cleaned up trotro.html")
