#!/usr/bin/env python3
"""
Extract heavy sub-tab sections from MoreSection.tsx into separate lazy-loaded components.
This reduces the initial bundle size from ~241KB to ~50KB + lazy chunks.

Sections to extract:
- reports (lines ~1884-2632) → MoreReports.tsx
- personal (lines ~3075-3974) → MorePersonal.tsx  
- broadcast (lines ~1461-1881) → MoreBroadcast.tsx
"""

import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.readlines()

def write_file(path, lines):
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

# Read the original file
source = read_file('/home/z/my-project/src/components/MoreSection.tsx')
total_lines = len(source)
print(f"Original MoreSection: {total_lines} lines")

# Find the exact boundaries of each sub-tab section
# We look for the pattern: {moreSubTab === 'xxx' && (

# Find broadcast section (lines around 1461-1881)
broadcast_start = None
broadcast_end = None
for i, line in enumerate(source):
    if "moreSubTab === 'broadcast'" in line and broadcast_start is None:
        broadcast_start = i
    if broadcast_start and i > broadcast_start + 10:
        # Look for the end pattern: })()} which closes the IIFE
        if '})()}' in line and broadcast_end is None:
            broadcast_end = i
            break

# Find reports section (lines around 1884-2632)
reports_start = None
reports_end = None
for i, line in enumerate(source):
    if "moreSubTab === 'reports'" in line and reports_start is None:
        reports_start = i
    if reports_start and i > reports_start + 10:
        # Reports uses a simple div: {moreSubTab === 'reports' && (<div ...
        # End is when we find the closing </div>)}
        if '</div>)}' in line and reports_end is None:
            # Check if this is the right closing tag (after reports content)
            if i > reports_start + 100:  # Reports is long
                reports_end = i
                break

# Find personal section (lines around 3075-3974)
personal_start = None
personal_end = None
for i, line in enumerate(source):
    if "moreSubTab === 'personal'" in line and personal_start is None:
        personal_start = i

# Personal section ends before the closing dialogs
# Find the closing of personal section - look for the pattern that ends it
if personal_start:
    # Count JSX depth to find matching close
    depth = 0
    found_first_tag = False
    for i in range(personal_start, len(source)):
        line = source[i]
        # Count opening and closing JSX tags
        opens = line.count('<motion.div') + line.count('<div') + line.count('<Card') + line.count('<Dialog')
        closes = line.count('</motion.div>') + line.count('</div>') + line.count('</Card>') + line.count('</Dialog>')
        
        if opens > 0:
            found_first_tag = True
        depth += opens - closes
        
        if found_first_tag and depth <= 0 and i > personal_start + 50:
            personal_end = i
            break

print(f"Broadcast: {broadcast_start+1} - {broadcast_end+1}")
print(f"Reports: {reports_start+1} - {reports_end+1}")
print(f"Personal: {personal_start+1} - {personal_end+1}")

# Now let's verify by checking the actual line content
print(f"\nBroadcast start: {source[broadcast_start].strip()[:80]}")
print(f"Broadcast end: {source[broadcast_end].strip()[:80]}")
print(f"Reports start: {source[reports_start].strip()[:80]}")
print(f"Reports end: {source[reports_end].strip()[:80]}")
print(f"Personal start: {source[personal_start].strip()[:80]}")
if personal_end:
    print(f"Personal end: {source[personal_end].strip()[:80]}")
