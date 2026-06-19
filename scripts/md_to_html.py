#!/usr/bin/env python3
"""
Convert the Elmoghazi Clinic specification markdown to a beautiful HTML
with full Arabic RTL support, code highlighting, and proper typography.
No external Python dependencies — uses only stdlib (re, html).
"""

import re
import html
import sys
from pathlib import Path

SRC = Path("/home/z/my-project/download/ELMOGHAZI_CLINIC_COMPLETE_SPECIFICATION.md")
DST = Path("/home/z/my-project/download/ELMOGHAZI_CLINIC_COMPLETE_SPECIFICATION.html")


def escape_html(text: str) -> str:
    return html.escape(text, quote=False)


def render_code_block(match: re.Match) -> str:
    lang = match.group(1) or ""
    code = match.group(2)
    escaped = escape_html(code.strip("\n"))
    lang_attr = f' data-lang="{lang}"' if lang else ""
    return f'<pre{lang_attr}><code>{escaped}</code></pre>'


def render_inline(text: str) -> str:
    # escape first
    text = escape_html(text)
    # inline code
    text = re.sub(r"`([^`\n]+)`", r"<code>\1</code>", text)
    # bold
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    # italic
    text = re.sub(r"\*([^*\n]+)\*", r"<em>\1</em>", text)
    # links [text](url)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    return text


def render_table_row(line: str, is_header: bool = False) -> str:
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    tag = "th" if is_header else "td"
    cells_html = "".join(f"<{tag}>{render_inline(c)}</{tag}>" for c in cells if c != "")
    return f"<tr>{cells_html}</tr>"


def convert_markdown(md: str) -> str:
    # protect code blocks
    code_blocks = []

    def stash_code(match: re.Match) -> str:
        lang = match.group(1) or ""
        code = match.group(2)
        escaped = escape_html(code.strip("\n"))
        lang_attr = f' data-lang="{lang}"' if lang else ""
        code_blocks.append(f'<pre{lang_attr}><code>{escaped}</code></pre>')
        return f"@@CODEBLOCK_{len(code_blocks) - 1}@@"

    md = re.sub(r"```(\w*)\n(.*?)```", stash_code, md, flags=re.DOTALL)

    lines = md.split("\n")
    out = []
    in_list = False
    in_ol = False
    in_table = False
    table_rows = []

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # headings
        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            # close any open list/table
            if in_list:
                out.append("</ul>")
                in_list = False
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if in_table:
                out.append("</tbody></table>")
                in_table = False
            level = len(m.group(1))
            text = render_inline(m.group(2))
            out.append(f"<h{level}>{text}</h{level}>")
            i += 1
            continue

        # horizontal rule
        if re.match(r"^-{3,}$|^\*{3,}$|^_{3,}$", stripped):
            if in_list:
                out.append("</ul>")
                in_list = False
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if in_table:
                out.append("</tbody></table>")
                in_table = False
            out.append("<hr/>")
            i += 1
            continue

        # blockquote
        if stripped.startswith(">"):
            if in_list:
                out.append("</ul>")
                in_list = False
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if in_table:
                out.append("</tbody></table>")
                in_table = False
            text = render_inline(stripped.lstrip(">").strip())
            out.append(f"<blockquote>{text}</blockquote>")
            i += 1
            continue

        # unordered list
        if re.match(r"^[-*+]\s+", stripped):
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if not in_list:
                out.append("<ul>")
                in_list = True
            text = render_inline(re.sub(r"^[-*+]\s+", "", stripped))
            out.append(f"<li>{text}</li>")
            i += 1
            continue

        # ordered list
        m = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m:
            if in_list:
                out.append("</ul>")
                in_list = False
            if not in_ol:
                out.append("<ol>")
                in_ol = True
            text = render_inline(m.group(2))
            out.append(f"<li>{text}</li>")
            i += 1
            continue

        # table
        if "|" in stripped and stripped.count("|") >= 1:
            # check if separator line follows
            if i + 1 < len(lines) and re.match(r"^\s*\|?[\s\-:]+\|[\s\-:|]+$", lines[i + 1]):
                # this is the header
                if in_list:
                    out.append("</ul>")
                    in_list = False
                if in_ol:
                    out.append("</ol>")
                    in_ol = False
                if in_table:
                    out.append("</tbody></table>")
                out.append("<table>")
                out.append("<thead>")
                out.append(render_table_row(stripped, is_header=True))
                out.append("</thead>")
                out.append("<tbody>")
                in_table = True
                i += 2  # skip header + separator
                continue
            elif in_table:
                out.append(render_table_row(stripped))
                i += 1
                continue

        # close list/table on non-list line
        if in_list:
            out.append("</ul>")
            in_list = False
        if in_ol:
            out.append("</ol>")
            in_ol = False
        if in_table:
            out.append("</tbody></table>")
            in_table = False

        # empty line
        if not stripped:
            i += 1
            continue

        # restore code blocks before paragraph
        if stripped.startswith("@@CODEBLOCK_"):
            m = re.match(r"@@CODEBLOCK_(\d+)@@", stripped)
            if m:
                out.append(code_blocks[int(m.group(1))])
                i += 1
                continue

        # paragraph (collect consecutive non-empty lines)
        para_lines = [stripped]
        j = i + 1
        while j < len(lines):
            nl = lines[j].strip()
            if not nl:
                break
            if re.match(r"^(#{1,6})\s+", nl):
                break
            if re.match(r"^[-*+]\s+", nl):
                break
            if re.match(r"^\d+\.\s+", nl):
                break
            if re.match(r"^-{3,}$", nl):
                break
            if nl.startswith(">"):
                break
            if "|" in nl and j + 1 < len(lines) and re.match(
                r"^\s*\|?[\s\-:]+\|[\s\-:|]+$", lines[j + 1]
            ):
                break
            para_lines.append(nl)
            j += 1
        para_text = " ".join(para_lines)
        out.append(f"<p>{render_inline(para_text)}</p>")
        i = j

    # close any open blocks
    if in_list:
        out.append("</ul>")
    if in_ol:
        out.append("</ol>")
    if in_table:
        out.append("</tbody></table>")

    body = "\n".join(out)

    # restore code blocks
    body = re.sub(
        r"@@CODEBLOCK_(\d+)@@",
        lambda m: code_blocks[int(m.group(1))],
        body,
    )

    return body


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
<meta charset="UTF-8">
<title>Elmoghazi Clinic — Complete Application Specification</title>
<style>
  @page {
    size: A4;
    margin: 18mm 14mm 18mm 14mm;
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #1f2937;
    font-family: 'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
    font-size: 10.5pt;
    line-height: 1.65;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Cover page */
  .cover {
    page-break-after: always;
    text-align: center;
    padding-top: 60mm;
    background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%);
    color: #ffffff;
    height: 261mm;
    margin: -18mm -14mm 0 -14mm;
    padding-left: 14mm;
    padding-right: 14mm;
  }
  .cover h1 {
    font-size: 36pt;
    font-weight: 800;
    margin: 0 0 8mm 0;
    line-height: 1.2;
  }
  .cover h2 {
    font-size: 18pt;
    font-weight: 500;
    margin: 0 0 20mm 0;
    color: #ddd6fe;
  }
  .cover .badge {
    display: inline-block;
    padding: 6pt 16pt;
    background: rgba(255,255,255,0.15);
    border: 1pt solid rgba(255,255,255,0.35);
    border-radius: 20pt;
    font-size: 11pt;
    margin: 4pt;
  }
  .cover .meta {
    margin-top: 40mm;
    font-size: 11pt;
    color: #ddd6fe;
  }
  .cover .meta div { margin: 4pt 0; }

  /* Headings */
  h1 {
    font-size: 22pt;
    color: #4c1d95;
    border-bottom: 3px solid #7c3aed;
    padding-bottom: 4pt;
    margin-top: 24pt;
    margin-bottom: 12pt;
    font-weight: 700;
  }
  h2 {
    font-size: 16pt;
    color: #5b21b6;
    margin-top: 20pt;
    margin-bottom: 8pt;
    font-weight: 700;
    border-right: 4px solid #7c3aed;
    padding-right: 8pt;
  }
  h3 {
    font-size: 13pt;
    color: #6d28d9;
    margin-top: 16pt;
    margin-bottom: 6pt;
    font-weight: 600;
  }
  h4 {
    font-size: 11.5pt;
    color: #7c3aed;
    margin-top: 12pt;
    margin-bottom: 4pt;
    font-weight: 600;
  }
  h5, h6 {
    font-size: 10.5pt;
    color: #6b7280;
    margin-top: 10pt;
    margin-bottom: 4pt;
    font-weight: 600;
  }

  p { margin: 6pt 0; }

  /* Arabic paragraphs — RTL */
  p:lang(ar), li:lang(ar) { direction: rtl; text-align: right; }

  /* Mixed content — keep LTR for English-dominant lines, RTL for Arabic-dominant */
  p, li { unicode-bidi: plaintext; }

  /* Code blocks */
  pre {
    background: #1e1b3a;
    color: #e2e8f0;
    padding: 10pt 12pt;
    border-radius: 6pt;
    overflow-x: auto;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 8.5pt;
    line-height: 1.5;
    margin: 8pt 0;
    direction: ltr;
    text-align: left;
    page-break-inside: avoid;
    border-right: 3pt solid #7c3aed;
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: inherit;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Inline code */
  code {
    background: #f3f4f6;
    color: #be185d;
    padding: 1pt 4pt;
    border-radius: 3pt;
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 9pt;
    direction: ltr;
    unicode-bidi: embed;
  }

  /* Tables */
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 10pt 0;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #e5e7eb;
    padding: 5pt 8pt;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f5f3ff;
    color: #4c1d95;
    font-weight: 700;
  }
  tbody tr:nth-child(even) { background: #faf9ff; }

  /* Lists */
  ul, ol {
    margin: 6pt 0;
    padding-left: 20pt;
  }
  li { margin: 3pt 0; }

  /* Blockquote */
  blockquote {
    border-right: 4pt solid #f59e0b;
    background: #fef3c7;
    padding: 8pt 12pt;
    margin: 8pt 0;
    color: #78350f;
    direction: rtl;
    text-align: right;
    border-radius: 0 6pt 6pt 0;
  }

  /* Horizontal rule */
  hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 14pt 0;
  }

  /* Links */
  a { color: #7c3aed; text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Strong */
  strong { color: #4c1d95; font-weight: 700; }

  /* Page breaks */
  h1 { page-break-after: avoid; }
  h2, h3, h4 { page-break-after: avoid; }
  pre, table { page-break-before: auto; }

  /* Avoid orphans/widows */
  p, li { orphans: 2; widows: 2; }
</style>
</head>
<body>

<div class="cover">
  <h1>Elmoghazi Clinic</h1>
  <h2>Complete Application Specification<br/>المواصفات الكاملة للتطبيق</h2>
  <div>
    <span class="badge">Next.js 16</span>
    <span class="badge">TypeScript</span>
    <span class="badge">Prisma</span>
    <span class="badge">PostgreSQL</span>
    <span class="badge">Tailwind CSS 4</span>
  </div>
  <div class="meta">
    <div>Disaster Recovery &amp; Rebuild Guide</div>
    <div>عيادة المغازي للجلدية والتجميل</div>
    <div>Generated: 2026-06-18</div>
  </div>
</div>

__BODY__

</body>
</html>
"""


def main():
    md_text = SRC.read_text(encoding="utf-8")
    body = convert_markdown(md_text)
    html_doc = HTML_TEMPLATE.replace("__BODY__", body)
    DST.write_text(html_doc, encoding="utf-8")
    print(f"HTML written: {DST}")
    print(f"Size: {DST.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
