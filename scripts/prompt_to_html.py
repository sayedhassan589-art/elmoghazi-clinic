#!/usr/bin/env python3
"""Convert the prompt markdown to PDF-friendly HTML."""

import re
import html
from pathlib import Path

SRC = Path("/home/z/my-project/download/PROMPT_TO_REBUILD_APP.md")
DST = Path("/home/z/my-project/download/PROMPT_TO_REBUILD_APP.html")


def escape_html(text: str) -> str:
    return html.escape(text, quote=False)


def render_inline(text: str) -> str:
    text = escape_html(text)
    text = re.sub(r"`([^`\n]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*([^*\n]+)\*", r"<em>\1</em>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    return text


def convert(md: str) -> str:
    code_blocks = []

    def stash_code(match):
        code = match.group(2)
        escaped = escape_html(code.strip("\n"))
        code_blocks.append(f"<pre><code>{escaped}</code></pre>")
        return f"@@CODEBLOCK_{len(code_blocks) - 1}@@"

    md = re.sub(r"```(\w*)\n(.*?)```", stash_code, md, flags=re.DOTALL)
    # Also handle the triple-backtick block in our prompt that uses ``` (no language) at end
    md = re.sub(r"```\n(.*?)```", stash_code, md, flags=re.DOTALL)

    lines = md.split("\n")
    out = []
    in_list = False
    in_ol = False
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            if in_list:
                out.append("</ul>"); in_list = False
            if in_ol:
                out.append("</ol>"); in_ol = False
            level = len(m.group(1))
            text = render_inline(m.group(2))
            out.append(f"<h{level}>{text}</h{level}>")
            i += 1
            continue

        if re.match(r"^-{3,}$|^\*{3,}$", stripped):
            if in_list:
                out.append("</ul>"); in_list = False
            if in_ol:
                out.append("</ol>"); in_ol = False
            out.append("<hr/>")
            i += 1
            continue

        if stripped.startswith(">"):
            if in_list:
                out.append("</ul>"); in_list = False
            if in_ol:
                out.append("</ol>"); in_ol = False
            text = render_inline(stripped.lstrip(">").strip())
            out.append(f"<blockquote>{text}</blockquote>")
            i += 1
            continue

        if re.match(r"^[-*+]\s+", stripped):
            if in_ol:
                out.append("</ol>"); in_ol = False
            if not in_list:
                out.append("<ul>"); in_list = True
            text = render_inline(re.sub(r"^[-*+]\s+", "", stripped))
            out.append(f"<li>{text}</li>")
            i += 1
            continue

        m = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m:
            if in_list:
                out.append("</ul>"); in_list = False
            if not in_ol:
                out.append("<ol>"); in_ol = True
            text = render_inline(m.group(2))
            out.append(f"<li>{text}</li>")
            i += 1
            continue

        if stripped.startswith("[ ]") or stripped.startswith("[x]"):
            if in_list:
                out.append("</ul>"); in_list = False
            if in_ol:
                out.append("</ol>"); in_ol = False
            checked = stripped.startswith("[x]")
            text = render_inline(stripped[3:].strip())
            checkbox = "☑" if checked else "☐"
            out.append(f"<p class='checkbox'>{checkbox} {text}</p>")
            i += 1
            continue

        if in_list:
            out.append("</ul>"); in_list = False
        if in_ol:
            out.append("</ol>"); in_ol = False

        if not stripped:
            i += 1
            continue

        if stripped.startswith("@@CODEBLOCK_"):
            m = re.match(r"@@CODEBLOCK_(\d+)@@", stripped)
            if m:
                out.append(code_blocks[int(m.group(1))])
                i += 1
                continue

        para_lines = [stripped]
        j = i + 1
        while j < len(lines):
            nl = lines[j].strip()
            if not nl:
                break
            if re.match(r"^(#{1,6})\s+", nl): break
            if re.match(r"^[-*+]\s+", nl): break
            if re.match(r"^\d+\.\s+", nl): break
            if re.match(r"^-{3,}$", nl): break
            if nl.startswith(">"): break
            if nl.startswith("[ ]") or nl.startswith("[x]"): break
            para_lines.append(nl)
            j += 1
        para_text = " ".join(para_lines)
        out.append(f"<p>{render_inline(para_text)}</p>")
        i = j

    if in_list: out.append("</ul>")
    if in_ol: out.append("</ol>")
    body = "\n".join(out)
    body = re.sub(r"@@CODEBLOCK_(\d+)@@", lambda m: code_blocks[int(m.group(1))], body)
    return body


TEMPLATE = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>البرومبت الاحترافي — إعادة بناء تطبيق عيادة المغازي</title>
<style>
  @page { size: A4; margin: 18mm 14mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: #ffffff; color: #1f2937;
    font-family: 'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
    font-size: 10pt; line-height: 1.7;
  }
  .cover {
    page-break-after: always;
    text-align: center;
    padding-top: 70mm;
    background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%);
    color: #fff;
    height: 261mm;
    margin: -18mm -14mm 0 -14mm;
    padding-left: 14mm; padding-right: 14mm;
  }
  .cover h1 { font-size: 32pt; font-weight: 800; margin: 0 0 8mm; }
  .cover h2 { font-size: 16pt; font-weight: 500; margin: 0 0 20mm; color: #ddd6fe; }
  .cover .meta { margin-top: 30mm; font-size: 11pt; color: #ddd6fe; }
  .cover .meta div { margin: 4pt 0; }

  h1 { font-size: 20pt; color: #4c1d95; border-bottom: 3px solid #7c3aed; padding-bottom: 4pt; margin-top: 24pt; margin-bottom: 12pt; }
  h2 { font-size: 14pt; color: #5b21b6; margin-top: 18pt; margin-bottom: 6pt; border-right: 4px solid #7c3aed; padding-right: 8pt; }
  h3 { font-size: 12pt; color: #6d28d9; margin-top: 14pt; margin-bottom: 4pt; }
  p { margin: 6pt 0; text-align: right; }
  ul, ol { padding-right: 20pt; padding-left: 0; margin: 6pt 0; }
  li { margin: 3pt 0; text-align: right; }
  pre {
    background: #1e1b3a; color: #e2e8f0;
    padding: 10pt 12pt; border-radius: 6pt;
    overflow-x: auto;
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 8.5pt; line-height: 1.5;
    margin: 8pt 0;
    direction: ltr; text-align: left;
    page-break-inside: avoid;
    border-right: 3pt solid #7c3aed;
    white-space: pre-wrap; word-break: break-word;
  }
  pre code { background: transparent; color: inherit; padding: 0; font-size: inherit; }
  code {
    background: #f3f4f6; color: #be185d;
    padding: 1pt 4pt; border-radius: 3pt;
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 9pt; direction: ltr; unicode-bidi: embed;
  }
  blockquote {
    border-right: 4pt solid #f59e0b;
    background: #fef3c7;
    padding: 8pt 12pt; margin: 8pt 0;
    color: #78350f; border-radius: 0 6pt 6pt 0;
  }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 14pt 0; }
  a { color: #7c3aed; text-decoration: none; }
  strong { color: #4c1d95; font-weight: 700; }
  .checkbox { font-family: monospace; }
  h1, h2, h3 { page-break-after: avoid; }
  p, li { orphans: 2; widows: 2; }
</style>
</head>
<body>

<div class="cover">
  <h1>البرومبت الاحترافي</h1>
  <h2>إعادة بناء تطبيق عيادة المغازي للجلدية والتجميل</h2>
  <div class="meta">
    <div>انسخ هذا البرومبت وأرسله لأي AI</div>
    <div>لإعادة بناء نفس التطبيق بدقة 100%</div>
    <div>2026-06-18</div>
  </div>
</div>

__BODY__

</body>
</html>
"""


def main():
    md = SRC.read_text(encoding="utf-8")
    body = convert(md)
    doc = TEMPLATE.replace("__BODY__", body)
    DST.write_text(doc, encoding="utf-8")
    print(f"HTML: {DST} ({DST.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
