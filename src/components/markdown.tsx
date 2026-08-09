import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Minimal Markdown renderer for AI output.
 *
 * Deliberately builds React elements instead of injecting HTML — model output is
 * untrusted text, and `dangerouslySetInnerHTML` here would be an XSS hole.
 * Supports the subset the prompts actually produce: headings, lists, tables,
 * blockquotes, rules, bold, italic and inline code.
 */

type Inline = string | React.ReactElement;

function renderInline(text: string, keyPrefix: string): Inline[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|`[^`]+`)/g;
  const parts = text.split(pattern).filter((part) => part !== "");

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

const SEPARATOR_ROW = /^\s*\|?[\s:-]*-[\s|:-]*\|?\s*$/;

export function Markdown({ content, className }: { content: string; className?: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactElement[] = [];

  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const raw = lines[index] ?? "";
    const line = raw.trimEnd();

    // blank
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    // horizontal rule
    if (/^\s*(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key++} />);
      index += 1;
      continue;
    }

    // heading
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1]?.length ?? 1;
      const text = heading[2] ?? "";
      const Tag = (["h1", "h2", "h3", "h4"] as const)[level - 1] ?? "h4";
      blocks.push(<Tag key={key++}>{renderInline(text, `h${key}`)}</Tag>);
      index += 1;
      continue;
    }

    // table
    if (line.includes("|") && SEPARATOR_ROW.test(lines[index + 1] ?? "")) {
      const header = splitRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && (lines[index] ?? "").includes("|")) {
        rows.push(splitRow(lines[index] ?? ""));
        index += 1;
      }
      blocks.push(
        <div key={key++} className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {header.map((cell, i) => (
                  <th key={i}>{renderInline(cell, `th-${i}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{renderInline(cell, `td-${rowIndex}-${cellIndex}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index] ?? "")) {
        quoted.push((lines[index] ?? "").replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={key++}>{renderInline(quoted.join(" "), `bq${key}`)}</blockquote>
      );
      continue;
    }

    // unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((item, i) => (
            <li key={i}>{renderInline(item, `ul-${i}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*\d+[.)]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((item, i) => (
            <li key={i}>{renderInline(item, `ol-${i}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // paragraph — consume until a blank line or a new block marker
    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? "";
      if (
        current.trim() === "" ||
        /^(#{1,4})\s+/.test(current) ||
        /^\s*[-*+]\s+/.test(current) ||
        /^\s*\d+[.)]\s+/.test(current) ||
        /^\s*>\s?/.test(current) ||
        current.includes("|")
      ) {
        break;
      }
      paragraph.push(current);
      index += 1;
    }
    if (paragraph.length) {
      blocks.push(<p key={key++}>{renderInline(paragraph.join(" "), `p${key}`)}</p>);
    } else {
      index += 1;
    }
  }

  return <div className={cn("prose-ar", className)}>{blocks}</div>;
}
