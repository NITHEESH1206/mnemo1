import { AbsoluteFill, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import "./fonts";
import { Background } from "./components/Background";
import { HookScene } from "./scenes/HookScene";
import { BrandRevealScene } from "./scenes/BrandRevealScene";
import { ChannelsScene } from "./scenes/ChannelsScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { HowItWorksScene } from "./scenes/HowItWorksScene";
import { CtaScene } from "./scenes/CtaScene";
import { SCENE_FRAMES, TRANSITION_FRAMES } from "./theme";

const T = TRANSITION_FRAMES;
const crossFade = () => (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({
      durationInFrames: T,
      easing: Easing.inOut(Easing.ease),
    })}
  />
);

// Every scene after the first is padded by T so the cross-fade overlap
// keeps the total at exactly SCENE_FRAMES sum (1800 frames / 60s).
export const ExplainerVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.hook}>
          <HookScene />
        </TransitionSeries.Sequence>

        {crossFade()}

        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.brand + T}>
          <BrandRevealScene />
        </TransitionSeries.Sequence>

        {crossFade()}

        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.channels + T}>
          <ChannelsScene />
        </TransitionSeries.Sequence>

        {crossFade()}

        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.features + T}>
          <FeaturesScene />
        </TransitionSeries.Sequence>

        {crossFade()}

        <TransitionSeries.Sequence
          durationInFrames={SCENE_FRAMES.howItWorks + T}
        >
          <HowItWorksScene />
        </TransitionSeries.Sequence>

        {crossFade()}

        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES.cta + T}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
