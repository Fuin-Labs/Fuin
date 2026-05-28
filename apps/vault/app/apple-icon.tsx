import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const INK = "#f2ece1";
const LIVE = "#c1e859";
const SURFACE = "#0a0907";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: SURFACE,
        }}
      >
        <div style={{ position: "absolute", left: 56, top: 41, width: 23, height: 98, background: INK, display: "flex" }} />
        <div style={{ position: "absolute", left: 79, top: 41, width: 46, height: 22, background: INK, display: "flex" }} />
        <div style={{ position: "absolute", left: 79, top: 79, width: 30, height: 20, background: INK, display: "flex" }} />
        <div style={{ position: "absolute", left: 56, top: 110, width: 23, height: 4, background: LIVE, display: "flex" }} />
      </div>
    ),
    { ...size },
  );
}
