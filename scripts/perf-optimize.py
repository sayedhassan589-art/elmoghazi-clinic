#!/usr/bin/env python3
"""
Performance Optimization Script for Elmoghazi Clinic App
Replaces heavy framer-motion animations with lightweight CSS animations.

Key optimizations:
1. Replace `repeat: Infinity` framer-motion animations with CSS keyframes
2. Replace `motion.button whileTap/whileHover` with CSS transitions
3. Replace simple `motion.div initial/animate` with CSS animation classes
4. Keep AnimatePresence for tab transitions and dialogs
"""

import re
import sys

def add_css_animations(globals_css_path):
    """Add CSS keyframe animations to globals.css for common patterns."""
    with open(globals_css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the end of @theme inline block's @keyframes section
    # Add new keyframes after the existing float keyframe
    
    new_keyframes = '''
  /* ── Performance-optimized animations (replace framer-motion infinite loops) ── */
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
  }
'''
    
    # Insert after the existing float keyframe closing brace
    insert_marker = '  @keyframes float {\n    0%, 100% { transform: translateY(0); }\n    50% { transform: translateY(-6px); }\n  }\n}'
    
    if insert_marker in content:
        content = content.replace(insert_marker, insert_marker.rstrip('}') + new_keyframes + '}')
    else:
        # Try to find @keyframes float block
        float_pattern = r'(@keyframes float \{[^}]+\})'
        match = re.search(float_pattern, content)
        if match:
            pos = match.end()
            # Find the closing } of @theme inline
            # We need to insert before the closing brace of @theme
            content = content[:pos] + new_keyframes + content[pos:]
    
    with open(globals_css_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Added CSS keyframes to {globals_css_path}")

def optimize_page_tsx(page_path):
    """Replace framer-motion patterns with CSS equivalents in page.tsx."""
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    
    # ═══ Pattern 1: Replace wiggle animations ═══
    # animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
    content = re.sub(
        r'<motion\.div animate=\{\{ rotate: \[0, 10, -10, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity, repeatDelay: \d+ \}\}',
        '<div className="animate-wiggle"',
        content
    )
    # Same for motion.span
    content = re.sub(
        r'<motion\.span animate=\{\{ rotate: \[0, 10, -10, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity, repeatDelay: \d+ \}\}',
        '<span className="animate-wiggle"',
        content
    )
    
    # animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5/2, repeat: Infinity, repeatDelay: 3 }}
    content = re.sub(
        r'<motion\.span animate=\{\{ rotate: \[0, 15, -15, 0\] \}\} transition=\{\{ duration: [\d.]+, repeat: Infinity, repeatDelay: \d+ \}\}',
        '<span className="animate-wiggle-wide"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ rotate: \[0, 15, -15, 0\] \}\} transition=\{\{ duration: [\d.]+, repeat: Infinity, repeatDelay: \d+ \}\}',
        '<div className="animate-wiggle-wide"',
        content
    )
    
    # ═══ Pattern 2: Replace bounce-y animations ═══
    # animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}
    content = re.sub(
        r'<motion\.div animate=\{\{ y: \[0, -3, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity[^}]*\}\}',
        '<div className="animate-bounce-y-sm"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ y: \[0, -5, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity[^}]*\}\}',
        '<div className="animate-bounce-y"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ y: \[0, -8, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity[^}]*\}\>',
        '<div className="animate-bounce-y">',
        content
    )
    # With delay
    content = re.sub(
        r'<motion\.div animate=\{\{ y: \[0, -3, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity, delay: [^}]+\}\}',
        '<div className="animate-bounce-y-sm"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ y: \[0, -5, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity, delay: [^}]+\}\>',
        '<div className="animate-bounce-y">',
        content
    )
    
    # ═══ Pattern 3: Replace pulse-scale animations ═══
    # animate={{ scale: [1, 1.1, 1] }} with repeat: Infinity
    content = re.sub(
        r'<motion\.div animate=\{\{ scale: \[1, 1\.1, 1\] \}\} transition=\{\{ duration: \d+, repeat: Infinity[^}]*\}\}',
        '<div className="animate-pulse-scale"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ scale: \[1, 1\.15, 1\] \}\} transition=\{\{ duration: \d+, repeat: Infinity[^}]*\}\>',
        '<div className="animate-pulse-scale"',
        content
    )
    # animate={{ scale: [1, 1.2, 1] }}
    content = re.sub(
        r'<motion\.span animate=\{\{ scale: \[1, 1\.2, 1\] \}\} transition=\{\{ duration: [\d.]+, repeat: Infinity[^}]*\}\}',
        '<span className="animate-pulse-scale-lg"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ scale: \[1, 1\.2, 1\] \}\} transition=\{\{ duration: [\d.]+, repeat: Infinity[^}]*\}\>',
        '<div className="animate-pulse-scale-lg"',
        content
    )
    # animate={{ scale: [1, 1.3, 1] }}
    content = re.sub(
        r'<motion\.span animate=\{\{ scale: \[1, 1\.3, 1\] \}\} transition=\{\{ duration: [\d.]+, repeat: Infinity[^}]*\}\>',
        '<span className="animate-pulse-scale-lg"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ scale: \[1, 1\.3, 1\] \}\} transition=\{\{ duration: [\d.]+, repeat: Infinity[^}]*\}\>',
        '<div className="animate-pulse-scale-lg"',
        content
    )
    # Combined scale+rotate: animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
    content = re.sub(
        r'<motion\.div animate=\{\{ scale: \[1, 1\.1, 1\], rotate: \[0, 5, -5, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity[^}]*\}\>',
        '<div className="animate-pulse-scale"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ scale: \[1, 1\.15, 1\], rotate: \[0, 5, -5, 0\] \}\} transition=\{\{ duration: \d+, repeat: Infinity[^}]*\}\>',
        '<div className="animate-pulse-scale"',
        content
    )
    # animate={{ scale: [1, 1.05, 1] }}
    content = re.sub(
        r'<motion\.div animate=\{\{ scale: \[1, 1\.05, 1\] \}\} transition=\{\{ duration: \d+, repeat: Infinity[^}]*\}\>',
        '<div className="animate-pulse-scale"',
        content
    )
    
    # ═══ Pattern 4: Replace spin-slow animations ═══
    # animate={{ rotate: [0, 360] }} transition={{ duration: 6/8, repeat: Infinity, ease: 'linear' }}
    content = re.sub(
        r'<motion\.div animate=\{\{ rotate: \[0, 360\] \}\} transition=\{\{ duration: \d+, repeat: Infinity, ease: \'linear\' \}\>',
        '<div className="animate-spin-slow"',
        content
    )
    
    # ═══ Pattern 5: Replace drift animations (background blobs) ═══
    # animate={{ x: [0, 120, 0], y: [0, -60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
    content = re.sub(
        r'<motion\.div animate=\{\{ x: \[0, 120, 0\], y: \[0, -60, 0\] \}\} transition=\{\{ duration: 18, repeat: Infinity, ease: \'linear\' \}\>',
        '<div className="animate-drift-a"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ x: \[0, -90, 0\], y: \[0, 70, 0\] \}\} transition=\{\{ duration: 14, repeat: Infinity, ease: \'linear\' \}\>',
        '<div className="animate-drift-b"',
        content
    )
    content = re.sub(
        r'<motion\.div animate=\{\{ x: \[0, 60, 0\], y: \[0, 40, 0\] \}\} transition=\{\{ duration: 20, repeat: Infinity, ease: \'linear\' \}\>',
        '<div className="animate-drift-c"',
        content
    )
    
    # ═══ Pattern 6: Replace motion.button whileTap/whileHover ═══
    # These create animation contexts per button - replace with CSS transitions
    # motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={...} className="..."
    # → <button onClick={...} className="... active:scale-[0.9] hover:scale-[1.05] transition-transform"
    
    def replace_motion_button(match):
        attrs = match.group(0)
        # Extract className
        class_match = re.search(r'className="([^"]*)"', attrs)
        cls = class_match.group(1) if class_match else ''
        # Add transition classes
        cls += ' active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150'
        attrs = re.sub(r'className="[^"]*"', f'className="{cls}"', attrs)
        # Remove whileTap and whileHover
        attrs = re.sub(r'whileTap=\{\{ scale: [\d.]+ \}\}', '', attrs)
        attrs = re.sub(r'whileHover=\{\{ scale: [\d.]+, y: -?\d+ \}\}', '', attrs)
        attrs = re.sub(r'whileHover=\{\{ scale: [\d.]+ \}\}', '', attrs)
        # Replace motion.button with button
        attrs = attrs.replace('<motion.button', '<button')
        return attrs
    
    content = re.sub(
        r'<motion\.button[^>]*whileTap=\{\{ scale: [\d.]+ \}\}[^>]*>',
        replace_motion_button,
        content
    )
    
    # Also handle motion.button with just whileTap or just whileHover
    content = re.sub(
        r'<motion\.button whileTap=\{\{ scale: 0\.95 \}\}',
        '<button className="active:scale-[0.95] transition-transform duration-150"',
        content
    )
    content = re.sub(
        r'<motion\.button whileTap=\{\{ scale: 0\.9 \}\}',
        '<button className="active:scale-[0.9] transition-transform duration-150"',
        content
    )
    
    # ═══ Pattern 7: Replace closing tags ═══
    # </motion.div> → </div>
    # </motion.button> → </button>
    # </motion.span> → </span>
    # Only replace those that were converted from infinite animations
    # Actually, we need to replace ALL closing tags that match our conversions
    # But we should NOT replace closing tags for motion elements we kept
    
    # For now, let's count what we changed and manually handle closing tags
    # The regex replacements above should have changed opening tags
    # We need corresponding closing tag changes
    
    # ═══ Fix closing tags for converted elements ═══
    # We converted specific patterns, so we need to ensure closing tags match
    # Since JSX is nested, we can't blindly replace all </motion.div> with </div>
    # because some motion.div elements we didn't convert still need their closing tags
    
    # Let's be safe and only replace closing tags in blocks we know we converted
    # For the animate-* class patterns, we know the opening tag was changed
    
    # ═══ Pattern 8: Remove unused motion imports if possible ═══
    # Keep motion and AnimatePresence since we still use them for tab transitions and dialogs
    
    # ═══ Pattern 9: Replace simple motion.div entry animations ═══
    # motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
    # → div className="animate-fade-slide-up"
    content = re.sub(
        r'<motion\.div initial=\{\{ opacity: 0, y: -15 \}\} animate=\{\{ opacity: 1, y: 0 \}\}',
        '<div className="animate-fade-slide-up"',
        content
    )
    content = re.sub(
        r'<motion\.div initial=\{\{ opacity: 0, y: 20 \}\} animate=\{\{ opacity: 1, y: 0 \}\} transition=\{\{ delay: [\d.]+ \}\}',
        '<div className="animate-fade-slide-up"',
        content
    )
    content = re.sub(
        r'<motion\.div initial=\{\{ opacity: 0, y: 20 \}\} animate=\{\{ opacity: 1, y: 0 \}\}',
        '<div className="animate-fade-slide-up"',
        content
    )
    
    # ═══ Pattern 10: Replace motion.div scale-in animations ═══
    # motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
    content = re.sub(
        r'<motion\.div initial=\{\{ scale: 0\.8 \}\} animate=\{\{ scale: 1 \}\}',
        '<div className="animate-scale-in-fast"',
        content
    )
    
    new_len = len(content)
    diff = original_len - new_len
    
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Optimized {page_path}")
    print(f"   Original: {original_len} chars")
    print(f"   Optimized: {new_len} chars")
    print(f"   Reduced: {diff} chars ({diff/original_len*100:.1f}%)")
    
    # Count remaining motion elements
    remaining_motion_div = len(re.findall(r'<motion\.div', content))
    remaining_motion_button = len(re.findall(r'<motion\.button', content))
    remaining_motion_span = len(re.findall(r'<motion\.span', content))
    remaining_repeat_infinity = len(re.findall(r'repeat: Infinity', content))
    
    print(f"   Remaining motion.div: {remaining_motion_div}")
    print(f"   Remaining motion.button: {remaining_motion_button}")
    print(f"   Remaining motion.span: {remaining_motion_span}")
    print(f"   Remaining repeat:Infinity: {remaining_repeat_infinity}")

if __name__ == '__main__':
    globals_css = '/home/z/my-project/src/app/globals.css'
    page_tsx = '/home/z/my-project/src/app/page.tsx'
    
    add_css_animations(globals_css)
    optimize_page_tsx(page_tsx)
