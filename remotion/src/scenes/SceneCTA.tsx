import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FRAUNCES, OUTFIT, COLOR } from "../fonts";

// Final CTA scene
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleRise = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 90 } });
  const titleY = interpolate(titleRise, [0, 1], [50, 0]);
  const titleO = interpolate(frame, [4, 20], [0, 1], { extrapolateRight: "clamp" });

  const eyebrowO = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const tagRise = spring({ frame: frame - 18, fps, config: { damping: 18 } });
  const tagY = interpolate(tagRise, [0, 1], [40, 0]);
  const tagO = interpolate(frame, [18, 34], [0, 1], { extrapolateRight: "clamp" });

  const pillO = interpolate(frame, [32, 48], [0, 1], { extrapolateRight: "clamp" });
  const pillScale = spring({ frame: frame - 32, fps, config: { damping: 12, stiffness: 140 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 100px", textAlign: "center" }}>
      <div
        style={{
          fontFamily: OUTFIT,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: 10,
          color: COLOR.teal,
          textTransform: "uppercase",
          opacity: eyebrowO,
          marginBottom: 48,
        }}
      >
        Your recovery, refined
      </div>

      <div
        style={{
          fontFamily: FRAUNCES,
          fontWeight: 600,
          fontSize: 180,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          color: COLOR.ink,
          opacity: titleO,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Sob<span style={{ fontStyle: "italic", color: COLOR.gold }}>a</span>ble
      </div>

      <div
        style={{
          fontFamily: FRAUNCES,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 56,
          lineHeight: 1.2,
          letterSpacing: "-0.015em",
          color: COLOR.goldSoft,
          opacity: tagO,
          transform: `translateY(${tagY}px)`,
          marginTop: 40,
          maxWidth: 800,
        }}
      >
        One sober day at a time.
      </div>

      <div
        style={{
          marginTop: 80,
          padding: "26px 56px",
          borderRadius: 999,
          background: `linear-gradient(135deg, ${COLOR.teal}, ${COLOR.gold})`,
          color: "#0A0F1A",
          fontFamily: OUTFIT,
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: 1,
          opacity: pillO,
          transform: `scale(${interpolate(pillScale, [0, 1], [0.85, 1])})`,
          boxShadow: `0 30px 60px ${COLOR.teal}40`,
        }}
      >
        Start free today
      </div>

      <div
        style={{
          marginTop: 32,
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 22,
          letterSpacing: 4,
          color: COLOR.muted,
          textTransform: "uppercase",
          opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        sobable.lovable.app
      </div>
    </AbsoluteFill>
  );
};
