import { Navbar } from "@/components/landing/Navbar";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { Hero } from "@/components/landing/Hero";
import { IntegrationStrip } from "@/components/landing/IntegrationStrip";
import { Overload } from "@/components/landing/Overload";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Features } from "@/components/landing/Features";
import { StopForgetting } from "@/components/landing/StopForgetting";
import { WhyFeru } from "@/components/landing/WhyFeru";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="[overflow-x:clip]">
        <Hero />
        <IntegrationStrip />
        <Overload />
        <LiveDemo />
        <Features />
        <StopForgetting />
        <WhyFeru />
        <Stats />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
