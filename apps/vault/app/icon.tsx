import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const INK = "#f2ece1";
const LIVE = "#c1e859";
const SURFACE = "#0a0907";

export default function Icon() {
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
        <div style={{ position: "absolute", left: 10, top: 7, width: 4, height: 18, background: INK, display: "flex" }} />
        <div style={{ position: "absolute", left: 14, top: 7, width: 8, height: 4, background: INK, display: "flex" }} />
        <div style={{ position: "absolute", left: 14, top: 14, width: 5, height: 4, background: INK, display: "flex" }} />
        <div style={{ position: "absolute", left: 10, top: 20, width: 4, height: 2, background: LIVE, display: "flex" }} />
      </div>
    ),
    { ...size },
  );
}
