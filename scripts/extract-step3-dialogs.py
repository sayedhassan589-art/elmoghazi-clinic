#!/usr/bin/env python3
"""
Step 3: Move More-related dialogs from page.tsx to MoreSection.tsx
"""

PAGE = '/home/z/my-project/src/app/page.tsx'
MORE = '/home/z/my-project/src/components/MoreSection.tsx'

with open(PAGE, 'r', encoding='utf-8') as f:
    page_text = f.read()

with open(MORE, 'r', encoding='utf-8') as f:
    more_text = f.read()

# ─── Identify dialogs to move ────────────────────────────────────────
# Dialogs that belong to MoreSection start after the Smart Patient Registration dialog
# and end before </div> closing tag (the last line of the component return)

# Find the start of the first More-related dialog (Follow-up ADD)
fu_dialog_marker = '<Dialog open={showAddFollowUp}'
fu_start_idx = page_text.find(fu_dialog_marker)
print(f"First More dialog at char {fu_start_idx}")

# Find the end of the last More dialog (Personal Note dialog end)
# The last dialog is the Add Personal Note Dialog
personal_note_end_marker = "onClick={addPersonalNote}>إضافة</Button>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>"
personal_note_end_idx = page_text.find(personal_note_end_marker)
if personal_note_end_idx < 0:
    # Try simpler search
    personal_note_end_idx = page_text.rfind('</Dialog>')
    # Find the next newline after this
    dialog_section_end = page_text.find('\n', personal_note_end_idx + len('</Dialog>')) + 1
else:
    dialog_section_end = personal_note_end_idx + len(personal_note_end_marker)

print(f"Last More dialog ends at char {personal_note_end_idx}")

# Extract the dialog content
# From fu_start_idx to dialog_section_end
dialog_content = page_text[fu_start_idx:dialog_section_end]
print(f"Dialog content: {len(dialog_content)} chars, ~{dialog_content.count(chr(10))} lines")

# ─── Add dialogs to MoreSection.tsx ──────────────────────────────────
# Find the closing of MoreSection component: )
# The component ends with:
#   )
# }
# We need to insert the dialogs before the closing )

# The return statement in MoreSection.tsx wraps the JSX
# Find where the JSX content ends (before the closing )
# We need to add the dialogs inside the return, after the main JSX

# Find the last )} or ) before } at the end of the file
more_last_close = more_text.rfind('\n  )\n}\n')
if more_last_close >= 0:
    # Insert dialogs before the closing )
    # We need to wrap them in a Fragment <>
    new_more = more_text[:more_last_close] + "\n\n" + dialog_content + "\n  )\n}\n"
    
    with open(MORE, 'w', encoding='utf-8') as f:
        f.write(new_more)
    
    print(f"Added dialogs to MoreSection.tsx: {len(new_more)} chars")
else:
    # Try alternative pattern
    more_last_close = more_text.rfind(')}')
    if more_last_close >= 0:
        new_more = more_text[:more_last_close] + "\n\n" + dialog_content + more_text[more_last_close:]
        with open(MORE, 'w', encoding='utf-8') as f:
            f.write(new_more)
        print(f"Added dialogs to MoreSection.tsx (alternative)")
    else:
        print("ERROR: Could not find closing pattern in MoreSection.tsx")
        # Find the return statement and insert after the JSX
        ret_idx = more_text.rfind('return (')
        if ret_idx >= 0:
            # Find the matching closing )
            # Just append before the final }
            last_brace = more_text.rfind('}')
            new_more = more_text[:last_brace] + "\n\n" + dialog_content + "\n}\n"
            with open(MORE, 'w', encoding='utf-8') as f:
                f.write(new_more)
            print(f"Added dialogs to MoreSection.tsx (fallback)")

more_lines = new_more.count('\n') + 1 if 'new_more' in dir() else -1
print(f"MoreSection.tsx: {more_lines} lines")

# ─── Remove dialogs from page.tsx ────────────────────────────────────
# Remove the dialog section from fu_start_idx to dialog_section_end
page_new = page_text[:fu_start_idx] + page_text[dialog_section_end:]

# Clean up any extra blank lines
# Find the closing </div> and make sure it's properly formatted
page_new = page_new.rstrip() + '\n    </div>\n  )\n}\n'

with open(PAGE, 'w', encoding='utf-8') as f:
    f.write(page_new)

page_lines = page_new.count('\n') + 1
print(f"\nModified page.tsx: {page_lines} lines")
print(f"\n✅ Step 3 complete: More dialogs moved to MoreSection.tsx")
