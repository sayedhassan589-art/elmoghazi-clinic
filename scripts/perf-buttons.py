#!/usr/bin/env python3
"""
Replace motion.button whileTap/whileHover with plain button + CSS transitions.
"""

import re

def process_buttons(page_path):
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_count = len(re.findall(r'<motion\.button', content))
    print(f"Starting motion.button count: {original_count}")
    
    # Process line by line since most buttons are on single lines
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if '<motion.button' not in line:
            new_lines.append(line)
            continue
        
        # Extract whileTap and whileHover scale values
        tap_match = re.search(r'whileTap=\{\{ scale: ([\d.]+) \}\}', line)
        hover_match = re.search(r'whileHover=\{\{ scale: ([\d.]+)(?:, y: (-?\d+))? \}\}', line)
        
        if not tap_match and not hover_match:
            # motion.button without whileTap/whileHover - just change tag
            # But we need to be careful - some might be intentional
            new_lines.append(line)
            continue
        
        tap_scale = tap_match.group(1) if tap_match else '0.95'
        hover_scale = hover_match.group(1) if hover_match else '1.05'
        
        # Build CSS transition classes
        transition_classes = f'active:scale-[{tap_scale}] hover:scale-[{hover_scale}] transition-transform duration-150'
        
        # Remove whileTap and whileHover props
        new_line = line
        new_line = re.sub(r'\s*whileTap=\{\{[^}]+\}\}', '', new_line)
        new_line = re.sub(r'\s*whileHover=\{\{[^}]+\}\}', '', new_line)
        
        # Change <motion.button to <button
        new_line = new_line.replace('<motion.button', '<button')
        
        # Add transition classes to className
        if 'className="' in new_line:
            new_line = re.sub(r'className="([^"]*)"', lambda m: f'className="{m.group(1)} {transition_classes}"', new_line)
        elif 'className={cn(' in new_line:
            # className={cn('...', ...)} pattern - add classes inside cn() first arg
            def add_to_cn(m):
                existing = m.group(1)
                return "className={cn('" + existing + " " + transition_classes + "',"
            new_line = re.sub(r"className=\{cn\('([^']+)',", add_to_cn, new_line)
        else:
            # No className - add one after <button
            new_line = new_line.replace('<button', f'<button className="{transition_classes}"')
        
        # Change </motion.button> to </button>
        new_line = new_line.replace('</motion.button>', '</button>')
        
        # Clean up extra whitespace
        new_line = re.sub(r'\s{2,}', ' ', new_line)
        
        new_lines.append(new_line)
    
    content = '\n'.join(new_lines)
    
    final_count = len(re.findall(r'<motion\.button', content))
    plain_btn_count = len(re.findall(r'<button', content)) - len(re.findall(r'<Button', content))
    
    print(f"Final motion.button count: {final_count}")
    print(f"Plain <button> count: {plain_btn_count}")
    print(f"Reduced motion.button from {original_count} → {final_count}")
    
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ motion.button optimization complete")

if __name__ == '__main__':
    process_buttons('/home/z/my-project/src/app/page.tsx')
