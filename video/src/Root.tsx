import { Composition } from "remotion";
import { ExplainerVideo } from "./ExplainerVideo";
import { FeruReel } from "./FeruReel";
import { FPS, TOTAL_FRAMES } from "./theme";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="FeruExplainer"
        component={ExplainerVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {/* 30s vertical Reel for Instagram (1080×1920 @ 30fps) */}
      <Composition
        id="FeruReel"
        component={FeruReel}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
