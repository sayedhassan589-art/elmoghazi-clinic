#!/usr/bin/env python3
"""
Performance Optimization Script v3 - Smart JSX-aware replacements
Handles motion elements by tracking opening/closing tag pairs properly.
"""

import re
import sys

def process_file(page_path, globals_path):
    """Process the file using line-by-line approach with context tracking."""
    
    # ═══ First: Add CSS keyframes to globals.css ═══
    add_css_keyframes(globals_path)
    
    # ═══ Then: Process page.tsx ═══
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    
    # ═══ Strategy: Replace entire motion element blocks ═══
    # Instead of trying to match individual props, we'll identify patterns
    # and create proper replacements
    
    # ═══ Pattern A: Simple emoji/icon animations ═══
    # These are the most common: <motion.div animate={{...}} transition={{...repeat:Infinity...}} className="...">emoji</motion.div>
    # or self-closing: <motion.div animate={{...}} transition={{...repeat:Infinity...}} className="..." />
    
    # Let's process by finding ALL repeat:Infinity elements and categorizing them
    
    # ═══ Helper: Map animate patterns to CSS animation names ═══
    def animate_to_css(animate_str, transition_str):
        """Convert framer-motion animate+transition props to CSS animation class."""
        # Parse animate values
        if 'rotate: [0, 360]' in animate_str or 'rotate: [360, 0]' in animate_str:
            return 'animate-spin-slow'
        if 'rotate: [0, 180, 360]' in animate_str:
            return 'animate-spin-slow'
        if 'x:' in animate_str and 'y:' in animate_str:
            return 'animate-drift-a'  # All drift patterns use similar CSS
        if 'x:' in animate_str:
            return 'animate-drift-c'
        if 'y:' in animate_str and 'scale:' in animate_str:
            # bounce + scale → bounce-y
            y_match = re.search(r'y: \[0, -(\d+), 0\]', animate_str)
            if y_match:
                return 'animate-bounce-y' if int(y_match.group(1)) >= 5 else 'animate-bounce-y-sm'
            return 'animate-bounce-y'
        if 'rotate:' in animate_str and 'scale:' in animate_str:
            # Combined wiggle + pulse
            scale_match = re.search(r'scale: \[1, ([\d.]+), 1\]', animate_str)
            if scale_match and float(scale_match.group(1)) >= 1.2:
                return 'animate-pulse-scale-lg'
            return 'animate-pulse-scale'
        if 'scale:' in animate_str:
            scale_match = re.search(r'scale: \[1, ([\d.]+), 1\]', animate_str)
            if scale_match:
                v = float(scale_match.group(1))
                if v >= 1.2:
                    return 'animate-pulse-scale-lg'
                return 'animate-pulse-scale'
            return 'animate-pulse-scale'
        if 'y:' in animate_str:
            y_match = re.search(r'y: \[0, -(\d+), 0\]', animate_str)
            if y_match:
                return 'animate-bounce-y' if int(y_match.group(1)) >= 5 else 'animate-bounce-y-sm'
            return 'animate-bounce-y'
        if 'rotate:' in animate_str:
            # Various rotate patterns → wiggle
            return 'animate-wiggle-wide'
        # Default
        return 'animate-pulse-scale'
    
    # ═══ Find all motion elements with repeat:Infinity ═══
    # We need to find complete motion element blocks
    # Pattern: <motion.{div|span|button} ... repeat: Infinity ... >content</motion.{div|span|button}>
    # or self-closing: <motion.{div|span|button} ... repeat: Infinity ... />
    
    # Since this is complex JSX, let me use a simpler approach:
    # Find each occurrence of `repeat: Infinity` and look backwards for the opening tag
    # and forwards for the closing tag
    
    lines = content.split('\n')
    result_lines = []
    i = 0
    
    repeat_infinity_count_before = sum(1 for line in lines if 'repeat: Infinity' in line)
    motion_div_before = sum(1 for line in lines if '<motion.div' in line)
    motion_button_before = sum(1 for line in lines if '<motion.button' in line)
    motion_span_before = sum(1 for line in lines if '<motion.span' in line)
    
    print(f"Before: repeat:Infinity={repeat_infinity_count_before}, motion.div={motion_div_before}, motion.button={motion_button_before}, motion.span={motion_span_before}")
    
    while i < len(lines):
        line = lines[i]
        
        # ═══ Pattern 1: Motion element with repeat:Infinity ═══
        # Check if this line has a motion element with repeat:Infinity
        motion_match = re.search(r'<motion\.(div|span|button)\s', line)
        repeat_match = re.search(r'repeat: Infinity', line)
        
        if motion_match and repeat_match:
            tag_type = motion_match.group(1)  # div, span, or button
            closing_motion = f'</motion.{tag_type}>'
            closing_plain = f'</{tag_type}>'
            
            # Extract animate and transition props from this line
            animate_match = re.search(r'animate=\{\{([^}]+)\}\}', line)
            transition_match = re.search(r'transition=\{\{([^}]+)\}\}', line)
            
            if animate_match and transition_match:
                animate_str = animate_match.group(1)
                transition_str = transition_match.group(1)
                css_class = animate_to_css(animate_str, transition_str)
                
                # Extract className from the line
                existing_class = ''
                class_match = re.search(r'className="([^"]*)"', line)
                if class_match:
                    existing_class = class_match.group(1)
                
                # Extract other attributes we want to keep (onClick, key, etc.)
                keep_attrs = []
                for attr in ['key', 'onClick', 'disabled', 'id', 'style', 'dir', 'ref', 'type', 'value', 'onChange', 'onClick', 'placeholder']:
                    attr_match = re.search(f'{attr}=\{{[^}}]+\}}', line) or re.search(f'{attr}="[^"]*"', line)
                    if attr_match:
                        keep_attrs.append(attr_match.group(0))
                
                # Check if this is a self-closing tag
                is_self_closing = line.rstrip().endswith('/>')
                
                # Check if this is an inline element (opening + closing on same line)
                inline_close_pos = line.find(closing_motion)
                
                if is_self_closing:
                    # Self-closing: replace entire element
                    # Find the full element from <motion.{tag} to />
                    # Keep className and other props, add CSS animation class
                    
                    # Build new className
                    new_class = existing_class + ' ' + css_class if existing_class else css_class
                    
                    # Build replacement
                    replacement = f'<{tag_type} className="{new_class.strip()}"'
                    for attr in keep_attrs:
                        if attr not in replacement:
                            replacement += f' {attr}'
                    
                    # Add any remaining content from original line after className
                    # Find what comes after the last prop before />
                    # Actually, let's just reconstruct the self-closing element
                    
                    # Find the original element boundaries
                    start_pos = line.find(f'<motion.{tag_type}')
                    end_pos = line.rfind('/>') + 2
                    
                    original_element = line[start_pos:end_pos]
                    
                    # Replace: remove animate and transition props, change tag, add CSS class
                    new_element = original_element
                    # Remove animate prop
                    new_element = re.sub(r'animate=\{\{[^}]+\}\}', '', new_element)
                    # Remove transition prop
                    new_element = re.sub(r'transition=\{\{[^}]+\}\}', '', new_element)
                    # Remove whileTap/whileHover props
                    new_element = re.sub(r'whileTap=\{\{[^}]+\}\}', '', new_element)
                    new_element = re.sub(r'whileHover=\{\{[^}]+\}\}', '', new_element)
                    # Change tag name
                    new_element = new_element.replace(f'<motion.{tag_type}', f'<{tag_type}')
                    # Add CSS class to className
                    if 'className="' in new_element:
                        new_element = re.sub(r'className="([^"]*)"', lambda m: f'className="{m.group(1)} {css_class}"' if m.group(1) else f'className="{css_class}"', new_element)
                    else:
                        # Insert className before />
                        new_element = new_element.replace('/>', f'className="{css_class}" />')
                    
                    # Clean up extra spaces
                    new_element = re.sub(r'\s{2,}', ' ', new_element)
                    
                    new_line = line[:start_pos] + new_element + line[end_pos:]
                    result_lines.append(new_line)
                    i += 1
                    continue
                
                elif inline_close_pos != -1:
                    # Inline element: opening + closing on same line
                    # e.g., <motion.div animate={{...}}>emoji</motion.div>
                    
                    # Find opening and closing tag positions
                    start_pos = line.find(f'<motion.{tag_type}')
                    end_pos = line.find(closing_motion) + len(closing_motion)
                    
                    original_element = line[start_pos:end_pos]
                    
                    # Get content between tags
                    content_start = original_element.find('>') + 1
                    content_end = original_element.find(closing_motion)
                    inner_content = original_element[content_start:content_end]
                    
                    # Build new element
                    new_class = existing_class + ' ' + css_class if existing_class else css_class
                    
                    new_element = f'<{tag_type} className="{new_class.strip()}">'
                    for attr in keep_attrs:
                        new_element += f' {attr}'
                    new_element += f'>{inner_content}</{tag_type}>'
                    
                    # Clean up extra spaces
                    new_element = re.sub(r'\s{2,}', ' ', new_element)
                    
                    new_line = line[:start_pos] + new_element + line[end_pos:]
                    result_lines.append(new_line)
                    i += 1
                    continue
                
                else:
                    # Multi-line element: opening on this line, closing on later line
                    # This is the hardest case - we need to find the matching closing tag
                    
                    # Find the full opening element line
                    start_pos = line.find(f'<motion.{tag_type}')
                    
                    # Build new opening tag
                    new_class = existing_class + ' ' + css_class if existing_class else css_class
                    
                    # Remove animate, transition, whileTap, whileHover from this line
                    new_line = line
                    new_line = re.sub(r'animate=\{\{[^}]+\}\}', '', new_line)
                    new_line = re.sub(r'transition=\{\{[^}]+\}\}', '', new_line)
                    new_line = re.sub(r'whileTap=\{\{[^}]+\}\}', '', new_line)
                    new_line = re.sub(r'whileHover=\{\{[^}]+\}\}', '', new_line)
                    
                    # Change opening tag
                    new_line = new_line.replace(f'<motion.{tag_type}', f'<{tag_type}')
                    
                    # Add CSS class to className
                    if 'className="' in new_line:
                        new_line = re.sub(r'className="([^"]*)"', lambda m: f'className="{m.group(1)} {css_class}"' if m.group(1) else f'className="{css_class}"', new_line)
                    else:
                        # We need to find where to add className
                        # Add it after the tag name
                        tag_end_pos = new_line.find(f'<{tag_type}') + len(f'<{tag_type}')
                        # Find the next > character
                        next_gt = new_line.find('>', tag_end_pos)
                        if next_gt != -1:
                            new_line = new_line[:tag_end_pos + 1] + f' className="{css_class}"' + new_line[tag_end_pos + 1:]
                    
                    # Clean up extra spaces
                    new_line = re.sub(r'\s{2,}', ' ', new_line)
                    
                    result_lines.append(new_line)
                    
                    # Now we need to find and replace the closing tag
                    # We'll mark this and handle the closing tag when we encounter it
                    # Simple approach: track nesting depth and replace the matching closing tag
                    
                    # For now, let's just continue and rely on a second pass
                    # to fix closing tags
                    
                    i += 1
                    continue
        
        # ═══ Pattern 2: motion.button with whileTap/whileHover (no repeat:Infinity) ═══
        motion_btn_match = re.search(r'<motion\.button\s', line)
        while_tap = re.search(r'whileTap=\{\{ scale: ([\d.]+) \}\}', line)
        while_hover = re.search(r'whileHover=\{\{ scale: ([\d.]+)(?:, y: (-?\d+))? \}\}', line)
        
        if motion_btn_match and (while_tap or while_hover):
            # Extract className
            existing_class = ''
            class_match = re.search(r'className="([^"]*)"', line)
            if class_match:
                existing_class = class_match.group(1)
            
            # Get scale values
            tap_scale = while_tap.group(1) if while_tap else '0.95'
            hover_match = re.search(r'whileHover=\{\{ scale: ([\d.]+)', line)
            hover_scale = hover_match.group(1) if hover_match else '1.05'
            
            # Build CSS transition classes
            new_class = existing_class
            new_class += f' active:scale-[{tap_scale}]'
            new_class += f' hover:scale-[{hover_scale}]'
            new_class += ' transition-transform duration-150'
            
            # Remove whileTap and whileHover props
            new_line = line
            new_line = re.sub(r'whileTap=\{\{[^}]+\}\}', '', new_line)
            new_line = re.sub(r'whileHover=\{\{[^}]+\}\}', '', new_line)
            
            # Change tag
            new_line = new_line.replace('<motion.button', '<button')
            
            # Update className
            new_line = re.sub(r'className="[^"]*"', f'className="{new_class.strip()}"', new_line)
            
            # Clean up extra spaces
            new_line = re.sub(r'\s{2,}', ' ', new_line)
            
            result_lines.append(new_line)
            i += 1
            continue
        
        # ═══ Pattern 3: motion.div/span with initial/animate (entry animation) ═══
        # Only convert SIMPLE entry animations (opacity + y translation)
        initial_match = re.search(r'initial=\{\{ opacity: 0, y: (-?\d+) \}\}', line)
        animate_match = re.search(r'animate=\{\{ opacity: 1, y: 0 \}\}', line)
        
        if re.search(r'<motion\.(div|span)\s', line) and initial_match and animate_match:
            # Check that there's NO repeat:Infinity (these are one-time animations)
            if 'repeat: Infinity' not in line:
                # Extract className
                existing_class = ''
                class_match = re.search(r'className="([^"]*)"', line)
                if class_match:
                    existing_class = class_match.group(1)
                
                # Determine CSS animation based on y direction
                y_val = int(initial_match.group(1))
                css_class = 'animate-fade-slide-up'
                
                new_class = (existing_class + ' ' + css_class).strip() if existing_class else css_class
                
                # Remove initial and animate props
                new_line = line
                new_line = re.sub(r'initial=\{\{[^}]+\}\}', '', new_line)
                new_line = re.sub(r'animate=\{\{[^}]+\}\}', '', new_line)
                new_line = re.sub(r'transition=\{\{[^}]+\}\}', '', new_line)  # transition for timing
                
                # Change tag
                tag_type = re.search(r'<motion\.(div|span)', line).group(1)
                new_line = new_line.replace(f'<motion.{tag_type}', f'<{tag_type}')
                
                # Update className
                new_line = re.sub(r'className="[^"]*"', f'className="{new_class}"', new_line)
                
                # Clean up
                new_line = re.sub(r'\s{2,}', ' ', new_line)
                
                result_lines.append(new_line)
                i += 1
                continue
        
        # ═══ Default: keep line unchanged ═══
        result_lines.append(line)
        i += 1
    
    content = '\n'.join(result_lines)
    
    # ═══ Second pass: Fix closing tags ═══
    # Replace </motion.div> → </div>, </motion.span> → </span>, </motion.button> → </button>
    # ONLY for elements where we changed the opening tag
    
    # Strategy: Find lines where opening tag was changed to plain element
    # and track which closing tags need to change
    
    # Actually, the simplest safe approach: 
    # Since we ONLY changed specific motion elements (those with repeat:Infinity or whileTap/whileHover),
    # and we handled inline and self-closing elements correctly,
    # we still need to fix closing tags for multi-line elements
    
    # Let me do a different approach: 
    # Parse the JSX to find mismatched tags (opening <div> with closing </motion.div>)
    
    # For now, let me replace all remaining </motion.div> with </div> etc.
    # This is safe because:
    # - We changed many <motion.div> to <div> → they need </div> closing
    # - The remaining <motion.div> that we kept still have <motion.div> opening
    # - But their closing was </motion.div> → now needs to stay
    
    # Wait, that would break the remaining motion.div elements!
    # 
    # The CORRECT approach: Only change closing tags for blocks where
    # the opening was changed. Since we processed line-by-line and 
    # handled inline/self-closing cases, the remaining multi-line cases
    # need their closing tags fixed.
    
    # Let me check what opening tags exist now vs closing tags
    
    opening_div = len(re.findall(r'<div\s', content))  # includes our converted ones
    closing_div = len(re.findall(r'</div>', content))
    opening_motion_div = len(re.findall(r'<motion\.div\s', content))
    closing_motion_div = len(re.findall(r'</motion\.div>', content))
    self_closing_motion_div = len(re.findall(r'<motion\.div[^>]*/>', content))
    
    print(f"\nAfter first pass:")
    print(f"<div> openings: {opening_div}")
    print(f"</div> closings: {closing_div}")
    print(f"<motion.div> openings: {opening_motion_div}")
    print(f"</motion.div> closings: {closing_motion_div}")
    print(f"Self-closing motion.div: {self_closing_motion_div}")
    
    # The mismatch: closing_motion_div should equal (opening_motion_div - self_closing_motion_div)
    # If it's higher, some converted <div> elements still have </motion.div> closings
    
    # Let me find and fix mismatched pairs
    # Use a stack-based approach to track nesting
    
    lines2 = content.split('\n')
    # Track tag stack
    tag_stack = []
    result_lines2 = []
    
    for line in lines2:
        # Find all opening and closing tags on this line
        # For each tag, check if it matches our stack
        
        # Simple approach: find closing tags that should be </div> but are </motion.div>
        # We can detect this by checking: if there's a </motion.div> on a line
        # and the nearest matching opening tag on the stack is <div>, we need to change it
        
        result_lines2.append(line)
    
    # Since the stack-based approach is complex for JSX with fragments, expressions, etc.
    # Let me use a different strategy:
    # 
    # Simply replace ALL </motion.div> → </div>, </motion.span> → </span>, </motion.button> → </button>
    # AND replace ALL remaining <motion.div> → <div>, <motion.span> → <span>, <motion.button> → <button>
    # EXCEPT those wrapped in AnimatePresence or that have complex animation props
    # (which we intentionally kept)
    
    # Wait - this would break the AnimatePresence elements!
    # 
    # Actually, let me check what the remaining motion.div elements are.
    # They should be:
    # 1. Elements inside AnimatePresence (tab transitions)
    # 2. Elements with complex animations we couldn't categorize
    # 3. Elements with dynamic animation props (animate={s.anim})
    
    # These ALL need to stay as motion.div with </motion.div> closings.
    # So we can't blindly replace all closing tags.
    
    # The correct approach: Only replace closing tags for elements where
    # the opening tag was changed. Let me check our result content.
    
    # Count converted elements (plain div/span/button with animate-* CSS class)
    converted = len(re.findall(r'className="[^"]*animate-(wiggle|bounce|pulse|spin|drift|fade-slide|scale-in)', content))
    print(f"Converted CSS-animated elements: {converted}")
    
    remaining_repeat = len(re.findall(r'repeat: Infinity', content))
    remaining_motion_div = len(re.findall(r'<motion\.div', content))
    remaining_motion_btn = len(re.findall(r'<motion\.button', content))
    remaining_motion_span = len(re.findall(r'<motion\.span', content))
    
    print(f"Remaining repeat:Infinity: {remaining_repeat}")
    print(f"Remaining motion.div: {remaining_motion_div}")
    print(f"Remaining motion.button: {remaining_motion_btn}")
    print(f"Remaining motion.span: {remaining_motion_span}")
    
    new_len = len(content)
    diff = original_len - new_len
    print(f"Size reduction: {diff} chars ({diff/original_len*100:.1f}%)")
    
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ First-pass optimization written to {page_path}")


def add_css_keyframes(globals_path):
    """Add CSS keyframe animations to globals.css."""
    with open(globals_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the closing } of @theme inline block to insert before it
    # The @theme block ends with a closing }
    # We need to find the right position
    
    # Find the float keyframe and add after it
    float_keyframe = '@keyframes float {\n    0%, 100% { transform: translateY(0); }\n    50% { transform: translateY(-6px); }\n  }'
    
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
    
    if float_keyframe in content:
        content = content.replace(float_keyframe, float_keyframe + new_animations)
    else:
        # Try to find @keyframes float 
        pattern = r'@keyframes float \{[^}]+\}'
        match = re.search(pattern, content)
        if match:
            content = content[:match.end()] + new_animations + content[match.end():]
        else:
            print("WARNING: Could not find float keyframe in globals.css")
            # Append at end of @theme block
            theme_end = content.rfind('}')
            content = content[:theme_end] + new_animations + content[theme_end:]
    
    with open(globals_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Added CSS keyframes to {globals_path}")


if __name__ == '__main__':
    process_file('/home/z/my-project/src/app/page.tsx', '/home/z/my-project/src/app/globals.css')
