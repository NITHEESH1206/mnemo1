import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing — Mnemo",
  description:
    "Simple, honest pricing for the AI memory layer that works everywhere you do.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
