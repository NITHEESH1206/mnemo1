"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import { PricingToggle } from "@/components/ui/PricingToggle";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { GradientButton } from "@/components/ui/GradientButton";
import { CheckoutButton } from "@/components/ui/CheckoutButton";
import { Mascot } from "@/components/ui/Mascot";
import { FAQS, PRICING, type PricingPlan } from "@/lib/constants";
import { whatsappCTAUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  return (
    <section id="pricing" className="section relative overflow-hidden">
      <div className="container-x relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="pill">Pricing</span>
          <h2 className="mt-5 text-h2 text-ink">
            Pick the memory <span className="gradient-text">that fits you.</span>
          </h2>
          <p className="mt-5 text-[17px] text-ink/65">
            No hidden limits. No surprise paywalls. 14-day money-back guarantee
            on every paid plan.
          </p>
          <div className="mt-8 flex justify-center">
            <PricingToggle billing={billing} onChange={setBilling} />
          </div>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
          {PRICING.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className={cn(
                "relative",
                plan.highlight && "md:-my-3 md:scale-[1.03]",
              )}
            >
              <PricingCard plan={plan} billing={billing} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-10 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 text-center"
        >
          <span className="text-[14px] font-semibold text-emerald-800">
            ✓ 14-day money-back guarantee.
          </span>{" "}
          <span className="text-[14px] text-emerald-900/80">
            Try it free. Then you have a full 14 days to request a complete
            refund. No questions, no forms.
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-24"
        >
          <h3 className="text-center text-[32px] font-extrabold tracking-tight text-ink">
            Frequently asked questions
          </h3>
          <div className="mt-10">
            <FAQAccordion items={FAQS} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  billing,
}: {
  plan: PricingPlan;
  billing: "monthly" | "annual";
}) {
  const price = billing === "annual" ? plan.annual : plan.monthly;
  const struckPrice =
    billing === "annual" && plan.monthly > 0 ? plan.monthly : null;

  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-[28px] p-7",
        plan.highlight
          ? "gradient-border bg-white shadow-[0_30px_70px_-20px_rgba(234,88,12,0.35)]"
          : "card-soft hover:-translate-y-[2px] transition-transform duration-300",
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_8px_24px_-6px_rgba(234,88,12,0.55)]">
            ★ Most Popular
          </span>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-flame-700">
            ✦ {plan.category}
          </div>
          <div className="mt-1.5 text-[26px] font-extrabold tracking-tight text-ink">
            {plan.name}
          </div>
          <p className="mt-1 text-[13.5px] text-ink/60">{plan.blurb}</p>
        </div>
        <div className="shrink-0">
          <Mascot
            variant={plan.mascot}
            size={72}
            hueShift={plan.highlight ? -20 : 0}
          />
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-[46px] font-extrabold tracking-tight text-ink">
          ₹{price}
        </span>
        {struckPrice !== null && (
          <span className="text-[18px] font-semibold text-ink/40 line-through">
            ₹{struckPrice}
          </span>
        )}
        <span className="text-[14px] text-ink/55">/mo</span>
      </div>
      <div className="mt-1 text-[12.5px] font-semibold text-ink/55">
        {billing === "annual" ? "Billed annually" : "Billed monthly"}
        {billing === "annual" && plan.annual > 0 && (
          <span className="ml-1.5 text-flame-700">· 30% off</span>
        )}
      </div>

      {/* Watch in action preview pill */}
      <a
        href="#demo"
        className="mt-6 flex items-center gap-3 rounded-2xl border border-ink/8 bg-bg-tint/60 p-2 transition-colors hover:border-flame-300 hover:bg-flame-50"
      >
        <span className="relative grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-dark">
          <span
            aria-hidden
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(251,191,36,0.4), transparent 60%)",
            }}
          />
          <Play size={14} className="relative z-10 fill-white text-white" />
        </span>
        <span className="text-[13px] font-semibold text-ink">
          Watch <span className="text-flame-700">{plan.name}</span> in action
        </span>
      </a>

      <ul className="mt-6 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span className="mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gradient-primary shadow-[0_2px_6px_rgba(249,115,22,0.4)]">
              <Check size={10} className="text-white" strokeWidth={3} />
            </span>
            <span className="text-[14.5px] leading-relaxed text-ink/85">
              {f}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        {price > 0 ? (
          <CheckoutButton
            plan={plan.name}
            billing={billing}
            variant={plan.highlight ? "primary" : "ink"}
          >
            Subscribe · ₹{price}/mo →
          </CheckoutButton>
        ) : (
          <GradientButton
            href={whatsappCTAUrl(
              `Hi Mnemo! I'm on the ${plan.name} plan — let's get started.`,
            )}
            target="_blank"
            variant="ink"
            size="md"
            className="w-full justify-center"
          >
            {plan.cta} →
          </GradientButton>
        )}
      </div>
    </div>
  );
}
