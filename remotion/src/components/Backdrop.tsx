import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLOR } from "../fonts";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 80) * 40;
  const drift2 = Math.cos(frame / 100) * 60;
  const slow = interpolate(frame, [0, 570], [0, 1]);
  return (
    <AbsoluteFill style={{ background: COLOR.bg, overflow: "hidden" }}>
      {/* base radial wash */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, ${COLOR.bgWarm} 0%, ${COLOR.bg} 60%, #03060B 100%)`,
        }}
      />
      {/* drifting teal glow */}
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          top: -300 + drift,
          left: -200 + drift2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLOR.teal}22, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      {/* drifting gold glow */}
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          bottom: -200 - drift,
          right: -300 + drift2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLOR.gold}18, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
      {/* film grain — light noise via SVG turbulence */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08, mixBlendMode: "overlay" }}
      >
        <filter id="n">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(slow * 12)} />
        </filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>
    </AbsoluteFill>
  );
};
