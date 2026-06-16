import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { MainVideoVO } from "./MainVideoVO";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={633}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="mainvo"
      component={MainVideoVO}
      durationInFrames={610}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
