"use client";

import { useState } from "react";
import { Check, Plus, Loader2 } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { cn } from "@/lib/utils";

type R = { id: string; task: string; fireAt: string; recurrence: string };

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LiveReminders({
  initial,
  linked,
}: {
  initial: R[];
  linked: boolean;
}) {
  const [items, setItems] = useState<R[]>(initial);
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    const t = text.trim();
    if (!t) return;
    setAdding(true);
    setErr(null);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || data.error || "Couldn't add that.");
        return;
      }
      setItems((prev) =>
        [...prev, data.reminder].sort(
          (a, b) => +new Date(a.fireAt) - +new Date(b.fireAt),
        ),
      );
      setText("");
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setAdding(false);
    }
  }

  async function complete(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id)); // optimistic
    try {
      await fetch("/api/reminders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      /* best-effort */
    }
  }

  if (!linked) {
    return (
      <div className="card-soft p-6">
        <div className="text-[15.5px] font-extrabold text-ink">
          Connect your WhatsApp
        </div>
        <p className="mt-2 text-[14px] text-ink/65">
          Your reminders live on WhatsApp. After you subscribe, send the
          activation code to Feru AI on WhatsApp to link this account — then
          they’ll show up here, live.
        </p>
        <a
          href="/pricing"
          className="btn-primary mt-5 inline-flex px-5 py-2.5 text-[14px]"
        >
          See plans →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Quick add */}
      <div className="card-soft p-6">
        <div className="mb-3 text-[15.5px] font-extrabold text-ink">
          Quick add
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-ink/8 bg-bg-tint/60 p-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Remind me to…"
            className="flex-1 bg-transparent px-2 py-2 text-[14px] text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <GradientButton onClick={add} size="sm" variant="primary" disabled={adding}>
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </GradientButton>
        </div>
        {err && <p className="mt-2 text-[12.5px] text-red-600">{err}</p>}
      </div>

      {/* Today / upcoming */}
      <div className="card-soft p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[15.5px] font-extrabold text-ink">
            Your reminders
          </div>
          <span className="text-[12.5px] text-ink/55">
            {items.length} pending
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-[14px] text-ink/55">
            All clear. Add one above, or just text Feru AI on WhatsApp.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((r) => (
              <li
                key={r.id}
                className="group flex items-center gap-3 rounded-xl border border-ink/8 bg-white px-3.5 py-3 transition-colors hover:border-flame-300"
              >
                <button
                  onClick={() => complete(r.id)}
                  aria-label="Mark done"
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border border-ink/20 transition-all hover:border-flame-400 hover:bg-flame-500"
                >
                  <Check
                    size={12}
                    className="text-white opacity-0 group-hover:opacity-100"
                    strokeWidth={3}
                  />
                </button>
                <span className="flex-1 text-[14px] font-medium text-ink">
                  {r.task}
                </span>
                <span
                  className={cn(
                    "text-[12px] font-bold text-ink/65",
                    new Date(r.fireAt) < new Date() && "text-flame-600",
                  )}
                >
                  {fmt(r.fireAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
