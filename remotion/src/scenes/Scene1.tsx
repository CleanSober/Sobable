import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FRAUNCES, OUTFIT, COLOR } from "../fonts";

// Scene 1 — Hook: massive serif word reveal
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["Quit.", "Track.", "Thrive."];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
      {/* eyebrow */}
      <div
        style={{
          fontFamily: OUTFIT,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: 8,
          color: COLOR.teal,
          textTransform: "uppercase",
          opacity: interpolate(frame, [4, 18], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [4, 18], [12, 0], { extrapolateRight: "clamp" })}px)`,
          marginBottom: 40,
        }}
      >
        Sobable
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "flex-start" }}>
        {words.map((w, i) => {
          const start = 8 + i * 14;
          const s = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 110 } });
          const opacity = interpolate(frame - start, [0, 10], [0, 1], { extrapolateRight: "clamp" });
          const ty = interpolate(s, [0, 1], [60, 0]);
          const italic = i === 2;
          return (
            <div
              key={w}
              style={{
                fontFamily: FRAUNCES,
                fontWeight: 600,
                fontStyle: italic ? "italic" : "normal",
                fontSize: 200,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                color: i === 2 ? COLOR.gold : COLOR.ink,
                opacity,
                transform: `translateY(${ty}px)`,
              }}
            >
              {w}
            </div>
          );
        })}
      </div>

      {/* underline accent */}
      <div
        style={{
          marginTop: 64,
          width: interpolate(frame, [50, 80], [0, 240], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 4,
          background: `linear-gradient(90deg, ${COLOR.teal}, ${COLOR.gold})`,
          borderRadius: 4,
          alignSelf: "flex-start",
          marginLeft: 80,
        }}
      />
    </AbsoluteFill>
  );
};
