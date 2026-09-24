import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "ক্ষতিপূরণ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function HomeCardImage() {
  const font = await readFile(join(process.cwd(), "src/fonts/NotoSansBengali-Bold.ttf"));

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
            padding: "72px 80px",
            fontFamily: "Noto Sans Bengali",
          }}
        >
          <div style={{ display: "flex", fontSize: 132, fontWeight: 700, lineHeight: 1.1 }}>
            ক্ষতিপূরণ
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans Bengali", data: font, weight: 700, style: "normal" }],
    },
  );
}
