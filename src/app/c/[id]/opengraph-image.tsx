import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { findCase } from "@/data/cases";
import { discussedY, sceneLabel } from "@/data/logic";

export const runtime = "nodejs";
export const alt = "ক্ষতিপূরণ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CaseCardImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = findCase(id);
  const font = await readFile(join(process.cwd(), "src/fonts/NotoSansBengali-Bold.ttf"));
  const scene = row ? sceneLabel[row.scene].bn : "ক্ষতিপূরণ";
  const amount = row ? (discussedY(row, "bn") ?? "কোনো ক্ষতিপূরণের অঙ্ক আলোচিত হয়নি") : "ক্ষতিপূরণ";
  const amountSize = amount.length > 28 ? 46 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#efe6c9",
          padding: 18,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#12160f",
            color: "#efe6c9",
            padding: "48px 56px",
            fontFamily: "Noto Sans Bengali",
          }}
        >
          <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>ক্ষতিপূরণ</div>
          <div style={{ display: "flex", fontSize: 36, marginTop: 28 }}>{scene}</div>
          <div
            style={{
              display: "flex",
              fontSize: amountSize,
              color: "#e2b657",
              marginTop: 18,
              lineHeight: 1.25,
            }}
          >
            {amount}
          </div>
          <div style={{ display: "flex", fontSize: 32, marginTop: 36 }}>খেলে দেখুন</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans Bengali", data: font, weight: 700, style: "normal" }],
    },
  );
}
