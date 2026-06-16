import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLOR } from "../fonts";

interface Props {
  src: string;
  delay?: number;
  scale?: number;
  rotate?: number;
  offsetX?: number;
  offsetY?: number;
}

export const PhoneFrame: React.FC<Props> = ({
  src,
  delay = 0,
  scale = 1,
  rotate = 0,
  offsetX = 0,
  offsetY = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 90, mass: 0.9 } });
  const y = interpolate(rise, [0, 1], [120, 0]) + offsetY;
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  // subtle breathing
  const breath = Math.sin((frame - delay) / 40) * 6;

  // phone dimensions
  const W = 560;
  const H = 1212; // 9:19.5 close to iPhone aspect

  return (
    <div
      style={{
        transform: `translate(${offsetX}px, ${y + breath}px) rotate(${rotate}deg) scale(${scale})`,
        opacity,
        filter: "drop-shadow(0 60px 80px rgba(0,0,0,0.55))",
      }}
    >
      <div
        style={{
          width: W,
          height: H,
          borderRadius: 64,
          background: "#0A0F1A",
          padding: 10,
          boxShadow: `0 0 0 1.5px ${COLOR.muted}33, inset 0 0 0 1.5px #ffffff10`,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 56,
            overflow: "hidden",
            position: "relative",
            background: COLOR.bg,
          }}
        >
          <Img
            src={staticFile(src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
          {/* notch */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "50%",
              transform: "translateX(-50%)",
              width: 140,
              height: 32,
              background: "#000",
              borderRadius: 20,
            }}
          />
          {/* subtle screen sheen */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.03) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};
