import { NextResponse, type NextRequest } from "next/server";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { toPublicError } from "@/lib/errors";
import { assertPlanFeature } from "@/lib/usage";
import { slugifyFilename } from "@/lib/utils";

export const runtime = "nodejs";

const HEADING_LEVELS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
];

/** Converts the Markdown subset the tools emit into RTL-aware docx paragraphs. */
function toParagraphs(content: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const rawLine of content.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      paragraphs.push(new Paragraph({ text: "", bidirectional: true }));
      continue;
    }

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      paragraphs.push(
        new Paragraph({ text: "———————————", bidirectional: true, alignment: AlignmentType.CENTER })
      );
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1]?.length ?? 1;
      paragraphs.push(
        new Paragraph({
          text: stripInline(heading[2] ?? ""),
          heading: HEADING_LEVELS[level - 1] ?? HeadingLevel.HEADING_4,
          bidirectional: true,
          alignment: AlignmentType.RIGHT,
        })
      );
      continue;
    }

    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      paragraphs.push(
        new Paragraph({
          text: stripInline(bullet[1] ?? ""),
          bullet: { level: 0 },
          bidirectional: true,
          alignment: AlignmentType.RIGHT,
        })
      );
      continue;
    }

    const ordered = /^(\d+)[.)]\s+(.*)$/.exec(line);
    if (ordered) {
      paragraphs.push(
        new Paragraph({
          text: `${ordered[1]}. ${stripInline(ordered[2] ?? "")}`,
          bidirectional: true,
          alignment: AlignmentType.RIGHT,
        })
      );
      continue;
    }

    // Table rows are flattened to a readable line — docx tables would need a
    // full grid model the Markdown subset does not guarantee.
    if (line.includes("|")) {
      const cells = line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => stripInline(cell.trim()))
        .filter(Boolean);

      if (cells.length && !/^[\s:|-]+$/.test(line)) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: cells.join("   |   "), rightToLeft: true })],
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
          })
        );
      }
      continue;
    }

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: stripInline(line), rightToLeft: true })],
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
      })
    );
  }

  return paragraphs;
}

function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^>\s?/, "");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    await assertPlanFeature(user.id, "export");

    const document = await db.document.findFirst({
      where: { id, ownerId: user.id },
      select: { title: true, content: true },
    });

    if (!document) {
      return NextResponse.json({ message: "المستند غير موجود." }, { status: 404 });
    }

    const file = new Document({
      styles: {
        default: {
          document: { run: { font: "Arial", size: 24 } },
        },
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: document.title,
              heading: HeadingLevel.TITLE,
              bidirectional: true,
              alignment: AlignmentType.RIGHT,
            }),
            ...toParagraphs(document.content),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(file);
    const filename = encodeURIComponent(`${slugifyFilename(document.title)}.docx`);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const safe = toPublicError(error, "documentExport");
    return NextResponse.json(
      { message: safe.message, requestId: safe.requestId },
      { status: safe.status }
    );
  }
}
