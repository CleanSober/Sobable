import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FRAUNCES, OUTFIT, COLOR } from "../fonts";
import { PhoneFrame } from "../components/PhoneFrame";

interface FeatureProps {
  shot: string;
  eyebrow: string;
  title: string;
  italicWord?: string;
  body: string;
  rotate?: number;
}

export const FeatureScene: React.FC<FeatureProps> = ({ shot, eyebrow, title, italicWord, body, rotate = -3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eyeOpacity = interpolate(frame, [2, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleRise = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 90 } });
  const titleY = interpolate(titleRise, [0, 1], [40, 0]);
  const titleO = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" });
  const bodyO = interpolate(frame, [22, 36], [0, 1], { extrapolateRight: "clamp" });

  const renderTitle = () => {
    if (!italicWord) return title;
    const parts = title.split(italicWord);
    return (
      <>
        {parts[0]}
        <span style={{ fontStyle: "italic", color: COLOR.gold }}>{italicWord}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <AbsoluteFill>
      {/* Text block — top third */}
      <div style={{ padding: "120px 100px 0 100px" }}>
        <div
          style={{
            fontFamily: OUTFIT,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: 6,
            color: COLOR.teal,
            textTransform: "uppercase",
            opacity: eyeOpacity,
            marginBottom: 24,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: FRAUNCES,
            fontWeight: 600,
            fontSize: 110,
            lineHeight: 1.02,
            letterSpacing: "-0.028em",
            color: COLOR.ink,
            opacity: titleO,
            transform: `translateY(${titleY}px)`,
            maxWidth: 880,
          }}
        >
          {renderTitle()}
        </div>
        <div
          style={{
            fontFamily: OUTFIT,
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.45,
            color: COLOR.muted,
            opacity: bodyO,
            marginTop: 32,
            maxWidth: 760,
          }}
        >
          {body}
        </div>
      </div>

      {/* Phone — bottom anchored */}
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <PhoneFrame src={shot} delay={10} rotate={rotate} scale={1.05} />
      </div>
    </AbsoluteFill>
  );
};
