#!/usr/bin/env python3
"""
Performance Optimization v4 - Clean line-by-line replacement of inline motion elements.
Handles single-line motion elements with repeat:Infinity by replacing the entire element.
"""

import re

def animate_to_css(animate_str):
    """Map framer-motion animate pattern to CSS animation class."""
    if 'rotate: [0, 360]' in animate_str:
        return 'animate-spin-slow'
    if 'rotate: [360, 0]' in animate_str:
        return 'animate-spin-slow'
    if 'rotate: [0, 180, 360]' in animate_str:
        return 'animate-spin-slow'
    if 'x:' in animate_str and 'y:' in animate_str:
        return 'animate-drift-a'
    if 'x:' in animate_str:
        return 'animate-drift-c'
    if 'y:' in animate_str and 'scale:' in animate_str:
        return 'animate-bounce-y'
    if 'y:' in animate_str and 'rotate:' in animate_str:
        return 'animate-bounce-y'
    if 'scale:' in animate_str and 'rotate:' in animate_str:
        return 'animate-pulse-scale'
    if 'scale:' in animate_str:
        m = re.search(r'scale: \[1, ([\d.]+), 1\]', animate_str)
        if m:
            v = float(m.group(1))
            if v >= 1.2:
                return 'animate-pulse-scale-lg'
            return 'animate-pulse-scale'
        return 'animate-pulse-scale'
    if 'y:' in animate_str:
        m = re.search(r'y: \[0, -(\d+), 0\]', animate_str)
        if m:
            v = int(m.group(1))
            if v >= 5:
                return 'animate-bounce-y'
            return 'animate-bounce-y-sm'
        return 'animate-bounce-y'
    if 'rotate:' in animate_str:
        return 'animate-wiggle-wide'
    return 'animate-pulse-scale'

def replace_motion_element(element_text, tag_type):
    """
    Replace a <motion.{tag_type} animate={{...}} transition={{...repeat:Infinity...}} ... >CONTENT</motion.{tag_type}>
    or <motion.{tag_type} animate={{...}} transition={{...repeat:Infinity...}} ... />
    with a plain element with CSS animation class.
    """
    # Extract animate prop value
    animate_match = re.search(r'animate=\{\{([^}]+)\}\}', element_text)
    if not animate_match:
        return element_text  # Can't process - keep as-is
    
    animate_str = animate_match.group(1)
    css_class = animate_to_css(animate_str)
    
    # Check if self-closing
    is_self_closing = element_text.rstrip().endswith('/>')
    
    # Remove animate and transition props from element
    new_text = element_text
    new_text = re.sub(r'\s*animate=\{\{[^}]+\}\}', '', new_text)
    new_text = re.sub(r'\s*transition=\{\{[^}]+\}\}', '', new_text)
    new_text = re.sub(r'\s*whileTap=\{\{[^}]+\}\}', '', new_text)
    new_text = re.sub(r'\s*whileHover=\{\{[^}]+\}\}', '', new_text)
    
    # Change tag name: <motion.div → <div, </motion.div> → </div
    new_text = new_text.replace(f'<motion.{tag_type}', f'<{tag_type}')
    new_text = new_text.replace(f'</motion.{tag_type}>', f'</{tag_type}>')
    
    # Add CSS animation class to className
    if 'className="' in new_text:
        new_text = re.sub(r'className="([^"]*)"', lambda m: f'className="{m.group(1)} {css_class}"'.strip() if m.group(1) else f'className="{css_class}"', new_text)
    elif 'className={cn(' in new_text:
        # className={cn('...', ...)} pattern - add css_class inside cn() first arg
        def add_to_cn(match):
            existing = match.group(1)
            return "className={cn('" + existing + " " + css_class + "',"
        new_text = re.sub(r"className=\{cn\('([^']+)',", add_to_cn, new_text)
    else:
        # No className prop - add one
        if is_self_closing:
            new_text = new_text.replace('/>', f'className="{css_class}" />')
        else:
            # Insert after opening tag
            new_text = re.sub(f'<{tag_type}', f'<{tag_type} className="{css_class}"', new_text, count=1)
    
    # Clean up extra whitespace from removed props
    new_text = re.sub(r'\s{2,}', ' ', new_text)
    # Fix cases where removal left leading space before >
    new_text = re.sub(r'\s+>', '>', new_text)
    new_text = re.sub(r'\s+/>', '/>', new_text)
    
    return new_text

def process_page(page_path, globals_path):
    """Process page.tsx to replace framer-motion infinite animations with CSS."""
    
    # First: Add CSS keyframes
    add_css_keyframes(globals_path)
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_repeat_count = len(re.findall(r'repeat: Infinity', content))
    original_motion_div = len(re.findall(r'<motion\.div', content))
    original_motion_btn = len(re.findall(r'<motion\.button', content))
    original_motion_span = len(re.findall(r'<motion\.span', content))
    
    print(f"BEFORE: repeat:Infinity={original_repeat_count}, motion.div={original_motion_div}, motion.button={original_motion_btn}, motion.span={original_motion_span}")
    
    # ═══ Strategy: Find all inline motion elements with repeat:Infinity ═══
    # These are on single lines and include both opening + closing tags
    # Pattern: <motion.{div|span|button} animate={{...}} transition={{...repeat:Infinity...}}>CONTENT</motion.{div|span|button}>
    # or: <motion.{div|span|button} animate={{...}} transition={{...repeat:Infinity...}} className="..." />
    
    # Replace inline motion.div elements with repeat:Infinity
    # Pattern: <motion.div animate={{...}} transition={{...repeat:Infinity...}} [className="..."] >CONTENT</motion.div>
    pattern_inline_div = re.compile(
        r'<motion\.div animate=\{\{[^}]+\}\} transition=\{\{[^}]*repeat: Infinity[^}]*\}\}(?:\s+className="[^"]*")?\s*>[^<]*</motion\.div>'
    )
    for match in pattern_inline_div.finditer(content):
        original = match.group(0)
        replacement = replace_motion_element(original, 'div')
        content = content.replace(original, replacement)
    
    # Pattern: <motion.div animate={{...}} transition={{...repeat:Infinity...}} [className="..."] />  (self-closing)
    pattern_sc_div = re.compile(
        r'<motion\.div animate=\{\{[^}]+\}\} transition=\{\{[^}]*repeat: Infinity[^}]*\}\}\s+className="[^"]*"\s*/>'
    )
    for match in pattern_sc_div.finditer(content):
        original = match.group(0)
        replacement = replace_motion_element(original, 'div')
        content = content.replace(original, replacement)
    
    # Replace inline motion.span elements with repeat:Infinity
    pattern_inline_span = re.compile(
        r'<motion\.span animate=\{\{[^}]+\}\} transition=\{\{[^}]*repeat: Infinity[^}]*\}\}(?:\s+className="[^"]*")?\s*>[^<]*</motion\.span>'
    )
    for match in pattern_inline_span.finditer(content):
        original = match.group(0)
        replacement = replace_motion_element(original, 'span')
        content = content.replace(original, replacement)
    
    # ═══ Handle motion.button with whileTap/whileHover ═══
    # Replace entire <motion.button whileTap={{ scale: X }} whileHover={{ scale: Y }} ...>CONTENT</motion.button>
    # with <button className="... active:scale-[X] hover:scale-[Y] transition-transform duration-150" ...>CONTENT</button>
    
    pattern_motion_btn = re.compile(
        r'<motion\.button\s[^>]*whileTap=\{\{[^}]+\}\}[^>]*whileHover=\{\{[^}]+\}\}[^>]*>[^<]*</motion\.button>'
    )
    for match in pattern_motion_btn.finditer(content):
        original = match.group(0)
        
        # Extract whileTap and whileHover values
        tap_match = re.search(r'whileTap=\{\{ scale: ([\d.]+) \}\}', original)
        hover_match = re.search(r'whileHover=\{\{ scale: ([\d.]+)(?:, y: (-?\d+))? \}\}', original)
        
        tap_scale = tap_match.group(1) if tap_match else '0.9'
        hover_scale = hover_match.group(1) if hover_match else '1.05'
        
        new_text = original
        new_text = re.sub(r'\s*whileTap=\{\{[^}]+\}\}', '', new_text)
        new_text = re.sub(r'\s*whileHover=\{\{[^}]+\}\}', '', new_text)
        new_text = new_text.replace('<motion.button', '<button')
        new_text = new_text.replace('</motion.button>', '</button>')
        
        # Add transition classes to className
        if 'className="' in new_text:
            new_text = re.sub(r'className="([^"]*)"', lambda m: f'className="{m.group(1)} active:scale-[{tap_scale}] hover:scale-[{hover_scale}] transition-transform duration-150"', new_text)
        else:
            new_text = new_text.replace('<button', f'<button className="active:scale-[{tap_scale}] hover:scale-[{hover_scale}] transition-transform duration-150"')
        
        new_text = re.sub(r'\s{2,}', ' ', new_text)
        content = content.replace(original, new_text)
    
    # ═══ Handle remaining repeat:Infinity elements that weren't caught ═══
    # These might be multi-line or have different ordering of props
    # Let me do a second pass to catch any remaining
    
    remaining = len(re.findall(r'repeat: Infinity', content))
    if remaining > 0:
        print(f"\n⚠️  {remaining} repeat:Infinity patterns still remaining")
        # These are likely multi-line elements or elements with props in different order
        # Let me try a broader pattern
        
        # Pattern: motion element with className BEFORE animate/transition
        # <motion.div className="..." animate={{...}} transition={{...repeat:Infinity...}}>CONTENT</motion.div>
        pattern_div_cls_first = re.compile(
            r'<motion\.div className="[^"]*"\s+animate=\{\{[^}]+\}\}\s+transition=\{\{[^}]*repeat: Infinity[^}]*\}\}\s*>[^<]*</motion\.div>'
        )
        for match in pattern_div_cls_first.finditer(content):
            original = match.group(0)
            replacement = replace_motion_element(original, 'div')
            content = content.replace(original, replacement)
        
        # Same for span
        pattern_span_cls_first = re.compile(
            r'<motion\.span className="[^"]*"\s+animate=\{\{[^}]+\}\}\s+transition=\{\{[^}]*repeat: Infinity[^}]*\}\}\s*>[^<]*</motion\.span>'
        )
        for match in pattern_span_cls_first.finditer(content):
            original = match.group(0)
            replacement = replace_motion_element(original, 'span')
            content = content.replace(original, replacement)
        
        # Self-closing with className before animate
        pattern_sc_cls_first = re.compile(
            r'<motion\.div className="[^"]*"\s+animate=\{\{[^}]+\}\}\s+transition=\{\{[^}]*repeat: Infinity[^}]*\}\}\s*/>'
        )
        for match in pattern_sc_cls_first.finditer(content):
            original = match.group(0)
            replacement = replace_motion_element(original, 'div')
            content = content.replace(original, replacement)
    
    # ═══ Third pass: Even broader patterns ═══
    remaining2 = len(re.findall(r'repeat: Infinity', content))
    if remaining2 > 0:
        # Try matching any inline motion.div/span that contains repeat:Infinity
        # This catches elements with various prop ordering
        
        # Pattern: <motion.div [any props including repeat:Infinity]>CONTENT</motion.div>
        # But we need to be careful not to match multi-line elements
        
        for tag in ['div', 'span']:
            # Find all inline motion elements (opening + closing on same conceptual "line")
            # Actually, let's process line by line
            lines = content.split('\n')
            new_lines = []
            for line in lines:
                if 'repeat: Infinity' in line and f'<motion.{tag}' in line:
                    # Find all motion.{tag} elements on this line
                    tag_pattern_open = '<motion.' + tag
                    tag_pattern_close = '</motion.' + tag + '>'
                    
                    # Use flexible regex - any motion.{tag} with animate + repeat:Infinity + className
                    # Handles various ordering of props
                    flex_pattern = r'<motion\.' + tag + r'\s[^>]*animate=\{\{[^}]+\}\}[^>]*transition=\{\{[^}]*repeat: Infinity[^}]*\}\}[^>]*>([^<]*)</motion\.' + tag + r'>'
                    matches = list(re.finditer(flex_pattern, line))
                    for match in matches:
                        original = match.group(0)
                        replacement = replace_motion_element(original, tag)
                        line = line.replace(original, replacement)
                    
                    # Also check for self-closing elements
                    flex_pattern_sc = r'<motion\.' + tag + r'\s[^>]*animate=\{\{[^}]+\}\}[^>]*transition=\{\{[^}]*repeat: Infinity[^}]*\}\}[^>]*/>'
                    matches_sc = list(re.finditer(flex_pattern_sc, line))
                    for match in matches_sc:
                        original = match.group(0)
                        replacement = replace_motion_element(original, tag)
                        line = line.replace(original, replacement)
                
                new_lines.append(line)
            
            content = '\n'.join(new_lines)
    
    # ═══ Handle motion.button with whileTap only (no whileHover) ═══
    # Skipped - too broad for multi-line matching
    
    # ═══ Final stats ═══
    final_repeat = len(re.findall(r'repeat: Infinity', content))
    final_motion_div = len(re.findall(r'<motion\.div', content))
    final_motion_btn = len(re.findall(r'<motion\.button', content))
    final_motion_span = len(re.findall(r'<motion\.span', content))
    converted_css = len(re.findall(r'animate-(wiggle|bounce|pulse|spin|drift|fade-slide|scale-in)', content))
    
    print(f"\nAFTER: repeat:Infinity={final_repeat}, motion.div={final_motion_div}, motion.button={final_motion_btn}, motion.span={final_motion_span}")
    print(f"CSS animation replacements: {converted_css}")
    print(f"Reduced repeat:Infinity from {original_repeat_count} → {final_repeat} (removed {original_repeat_count - final_repeat})")
    print(f"Reduced motion.div from {original_motion_div} → {final_motion_div}")
    print(f"Reduced motion.button from {original_motion_btn} → {final_motion_btn}")
    print(f"Reduced motion.span from {original_motion_span} → {final_motion_span}")
    
    # ═══ Check for invalid JSX (duplicate className, mismatched tags) ═══
    # Check for duplicate className props on same element
    dup_classname = re.findall(r'className="[^"]*"\s+className="[^"]*"', content)
    if dup_classname:
        print(f"\n⚠️  Found {len(dup_classname)} duplicate className props! Need to fix.")
    
    # Check for mismatched tags: <div>...</motion.div> or similar
    # This would be caught by the React compiler, so let's check if build works
    
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Optimization complete")

def add_css_keyframes(globals_path):
    """Add CSS keyframe animations to globals.css."""
    with open(globals_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_animations = '''
  /* ── Performance-optimized CSS animations (replace framer-motion infinite loops) ── */
  --animate-wiggle: wiggle 2s ease-in-out infinite;
  --animate-wiggle-wide: wiggle-wide 1.5s ease-in-out infinite;
  --animate-bounce-y: bounce-y 2s ease-in-out infinite;
  --animate-bounce-y-sm: bounce-y-sm 2s ease-in-out infinite;
  --animate-pulse-scale: pulse-scale 2s ease-in-out infinite;
  --animate-pulse-scale-lg: pulse-scale-lg 1.5s ease-in-out infinite;
  --animate-spin-slow: spin-slow 8s linear infinite;
  --animate-drift-a: drift-a 18s ease-in-out infinite;
  --animate-drift-b: drift-b 14s ease-in-out infinite;
  --animate-drift-c: drift-c 20s ease-in-out infinite;
  --animate-fade-slide-up: fade-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-scale-in-fast: scale-in-fast 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(10deg); }
    75% { transform: rotate(-10deg); }
  }

  @keyframes wiggle-wide {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(15deg); }
    75% { transform: rotate(-15deg); }
  }

  @keyframes bounce-y {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes bounce-y-sm {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  @keyframes pulse-scale {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes pulse-scale-lg {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes drift-a {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(60px, -30px); }
    66% { transform: translate(120px, -60px); }
  }

  @keyframes drift-b {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(-45px, 35px); }
    66% { transform: translate(-90px, 70px); }
  }

  @keyframes drift-c {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(30px, 20px); }
    66% { transform: translate(60px, 40px); }
  }

  @keyframes fade-slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scale-in-fast {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }'''
    
    # Insert after the float keyframe in @theme inline
    float_keyframe = '@keyframes float {\n    0%, 100% { transform: translateY(0); }\n    50% { transform: translateY(-6px); }\n  }'
    
    if float_keyframe in content:
        content = content.replace(float_keyframe, float_keyframe + new_animations)
    else:
        # Find @keyframes float pattern
        pattern = r'@keyframes float \{[^}]+\}'
        match = re.search(pattern, content)
        if match:
            content = content[:match.end()] + new_animations + content[match.end():]
        else:
            print("WARNING: Could not find float keyframe - appending at end of theme block")
            # Find closing of @theme inline block
            theme_close = content.find('\n}', content.find('@theme inline'))
            if theme_close != -1:
                content = content[:theme_close] + new_animations + content[theme_close:]
    
    with open(globals_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Added CSS keyframes to {globals_path}")

if __name__ == '__main__':
    process_page('/home/z/my-project/src/app/page.tsx', '/home/z/my-project/src/app/globals.css')
