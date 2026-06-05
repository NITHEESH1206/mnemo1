"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Testimonials() {
  return (
    <section className="section relative">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-h2 text-ink">
            <span className="gradient-text">50,000+ people</span>
            <br />
            who finally stopped forgetting.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-ink/65">
            Real words from real people who let Feru AI handle their memory.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.07 }}
              className={cn(t.featured && "md:col-span-2")}
            >
              <TestimonialCard {...t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  name,
  role,
  quote,
  rating,
  featured,
  photo,
}: {
  name: string;
  role: string;
  quote: string;
  rating: number;
  featured?: boolean;
  seed: string;
  photo: string;
}) {
  return (
    <article
      className={cn(
        "card-soft relative h-full p-7 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_28px_60px_-20px_rgba(120,53,15,0.28)]",
        featured && "bg-gradient-to-br from-flame-50 to-amber-50",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-1" aria-label={`Rated ${rating} of 5`}>
          {Array.from({ length: rating }).map((_, i) => (
            <Star
              key={i}
              size={18}
              className="fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.45)]"
            />
          ))}
        </div>
        <Image
          src={photo}
          width={48}
          height={48}
          alt={name}
          className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-[0_4px_14px_rgba(120,53,15,0.22)]"
          unoptimized
        />
      </div>

      <p
        className={cn(
          "mt-6 font-medium text-ink",
          featured ? "text-[20px] leading-[1.45]" : "text-[15.5px] leading-[1.6]",
        )}
      >
        “{quote}”
      </p>

      <div className="mt-6 border-t border-ink/8 pt-4 text-[13px] text-ink/70">
        <span className="font-bold text-ink">{name}</span>
        <span className="mx-1.5 text-ink/35">·</span>
        {role}
      </div>
    </article>
  );
}
