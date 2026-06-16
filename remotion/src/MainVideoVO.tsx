import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Backdrop } from "./components/Backdrop";
import { Scene1 } from "./scenes/Scene1";
import { FeatureScene } from "./scenes/FeatureScene";
import { SceneCTA } from "./scenes/SceneCTA";

export const MainVideoVO: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Audio src={staticFile("audio/narration.mp3")} volume={1} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <FeatureScene
            shot="shots/home.png"
            eyebrow="Track every day"
            title="Days that actually count."
            italicWord="count"
            body="A serene daily counter, calendar, and milestones — built for the long road."
            rotate={-3}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <FeatureScene
            shot="shots/checkin.png"
            eyebrow="Daily check-in"
            title="Notice how you feel."
            italicWord="feel"
            body="Eight gentle prompts — mood, sleep, cravings — so you spot patterns before they grow."
            rotate={2.5}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <FeatureScene
            shot="shots/triggers.png"
            eyebrow="Catch triggers early"
            title="Know your urges."
            italicWord="urges"
            body="Log triggers in seconds. Sobable learns your patterns so you can stay ahead of them."
            rotate={-2}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <FeatureScene
            shot="shots/progress.png"
            eyebrow="See real progress"
            title="Proof you're changing."
            italicWord="changing"
            body="Money saved, time reclaimed, health restored — your wins, made visible."
            rotate={3}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
