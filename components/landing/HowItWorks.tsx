"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { STEPS } from "@/lib/constants";
import { Mascot } from "@/components/ui/Mascot";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section relative overflow-hidden">
      <div className="container-x relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="pill">How it works</span>
          <h2 className="mt-5 text-h2 text-ink">Up and running in minutes</h2>
          <p className="mt-5 text-[17px] text-ink/65">
            Three steps. No new apps. No new habits to build.
          </p>
        </motion.div>

        <div className="relative mt-20 space-y-24">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 md:block"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(249,115,22,0.4) 0, rgba(249,115,22,0.4) 6px, transparent 6px, transparent 14px)",
              backgroundSize: "1px 14px",
              backgroundRepeat: "repeat-y",
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid items-center gap-10 md:grid-cols-2 md:gap-16"
            >
              <div className={cn(i % 2 === 1 && "md:order-2")}>
                <StepMock index={i} />
              </div>

              <div
                className={cn(
                  "relative",
                  i % 2 === 1 ? "md:order-1 md:pr-8" : "md:pl-8",
                )}
              >
                <div className="inline-flex h-10 items-center rounded-full bg-gradient-primary px-3.5 text-[12.5px] font-extrabold tracking-wide text-white shadow-[0_8px_22px_-6px_rgba(234,88,12,0.5)]">
                  STEP {step.num}
                </div>
                <h3 className="mt-5 text-[30px] font-extrabold tracking-tight text-ink sm:text-[34px]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-md text-[16.5px] leading-relaxed text-ink/65">
                  {step.description}
                </p>
              </div>

              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-primary shadow-[0_0_18px_rgba(249,115,22,0.8)] md:block"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepMock({ index }: { index: number }) {
  const Mock = [OnboardingMock, ChatMock, DashboardMock][index] ?? OnboardingMock;
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.25),transparent_65%)] blur-2xl" />
      <div className="card-soft relative overflow-hidden">
        <Mock />
      </div>
    </div>
  );
}

function OnboardingMock() {
  return (
    <div className="p-7">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-ink/55">
            Step 1 of 3
          </div>
          <div className="mt-1 text-[22px] font-extrabold text-ink">
            Connect your channels
          </div>
        </div>
        <Mascot variant="glasses" size={56} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          { n: "WhatsApp", c: true },
          { n: "Calendar", c: true },
          { n: "Email", c: false },
          { n: "Web App", c: true },
        ].map((ch) => (
          <div
            key={ch.n}
            className="flex items-center gap-2.5 rounded-xl border border-ink/8 bg-bg-tint/60 px-3.5 py-3"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-primary text-[11px] font-extrabold text-white">
              {ch.n[0]}
            </span>
            <span className="text-[13px] font-semibold text-ink">{ch.n}</span>
          </div>
        ))}
      </div>
      <a
        href="/pricing"
        className="btn-primary mt-6 w-full py-2.5 text-[13px]"
      >
        Continue
      </a>
    </div>
  );
}

function ChatMock() {
  return (
    <div className="flex h-[360px] flex-col p-5">
      <div className="flex items-center gap-2.5 border-b border-ink/8 pb-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-[12px] font-extrabold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
          F
        </div>
        <div className="text-[13px] font-extrabold text-ink">Feru AI</div>
        <span className="ml-auto text-[10.5px] font-semibold text-emerald-600">
          ● online
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-end gap-2.5">
        <div className="self-end max-w-[80%] rounded-2xl rounded-br-md bg-gradient-primary px-3.5 py-2 text-[12.5px] text-white shadow-[0_6px_16px_rgba(249,115,22,0.32)]">
          Add oat milk to my shopping list
        </div>
        <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md border border-ink/8 bg-bg-tint/70 px-3.5 py-2 text-[12.5px] text-ink">
          Added 🥛 — your shopping list now has 4 items.
        </div>
        <div className="self-end max-w-[80%] rounded-2xl rounded-br-md bg-gradient-primary px-3.5 py-2 text-[12.5px] text-white shadow-[0_6px_16px_rgba(249,115,22,0.32)]">
          Voice: ‘Tell me what’s due tomorrow’
        </div>
        <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md border border-ink/8 bg-bg-tint/70 px-3.5 py-2 text-[12.5px] text-ink">
          You have 3 reminders tomorrow — first up: <b>9:00 AM standup prep</b>.
        </div>
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-ink/55">
            Today
          </div>
          <div className="text-[20px] font-extrabold text-ink">5 reminders</div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-700">
          ● All synced
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            className="h-16 rounded-lg border border-ink/8 bg-bg-tint/60 p-1.5 text-[10px] font-semibold text-ink/55"
          >
            <div>{d}</div>
            {[2, 4, 5].includes(i) && (
              <div className="mt-1 h-1.5 w-full rounded-full bg-gradient-primary" />
            )}
            {i === 4 && (
              <div className="mt-1 h-1.5 w-2/3 rounded-full bg-flame-300" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {[
          { t: "Standup prep", time: "9:00 AM", done: true },
          { t: "Review brand PDF", time: "4:30 PM", done: false },
          { t: "Send invoice", time: "8:00 PM", done: false },
        ].map((r) => (
          <div
            key={r.t}
            className="flex items-center justify-between rounded-lg border border-ink/8 bg-white px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded-[5px] border",
                  r.done
                    ? "border-flame-500 bg-flame-500"
                    : "border-ink/20",
                )}
              >
                {r.done && <Check size={10} className="text-white" strokeWidth={3} />}
              </span>
              <span
                className={cn(
                  "text-[12.5px] font-semibold",
                  r.done ? "text-ink/45 line-through" : "text-ink",
                )}
              >
                {r.t}
              </span>
            </div>
            <span className="text-[11px] text-ink/55">{r.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
