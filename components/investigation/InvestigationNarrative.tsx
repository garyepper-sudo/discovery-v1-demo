"use client";

import { V3EmergenceEvent } from "../../engine/v3/types";

const emergenceEvents = [
  {
    time: "09:14",
    label: "Evidence ingested",
    title: "15 evidence objects entered the workspace.",
    detail: "Discovery began reading public signals, company context, customer concerns, and competitive pressure.",
    status: "complete",
  },
  {
    time: "09:15",
    label: "Theme detected",
    title: "Customer Friction appeared.",
    detail: "Pricing, constraints, availability, and complexity began clustering into a repeated pattern.",
    status: "complete",
  },
  {
    time: "09:16",
    label: "Connection formed",
    title: "Growth Pressure connected to Customer Friction.",
    detail: "Discovery found that demand signals may be strong while customer concerns still limit momentum.",
    status: "complete",
  },
  {
    time: "09:17",
    label: "Tension surfaced",
    title: "Leadership confidence conflicts with customer friction.",
    detail: "The system preserved the contradiction instead of smoothing it away.",
    status: "warning",
  },
  {
    time: "09:18",
    label: "Belief formed",
    title: "Customer concerns may be limiting momentum.",
    detail: "Discovery produced a candidate belief with supporting evidence and a recommended next action.",
    status: "complete",
  },
];

export default function InvestigationNarrative({
  events,
}: {
  events: V3EmergenceEvent[];
}) {
  return (
    <section className="rounded-[2rem] border border-[#d9b95f]/30 bg-[#15130d]/80 p-8 shadow-[0_0_80px_rgba(217,185,95,0.08)]">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.45em] text-[#f0cf6a]">
          Emergence Timeline
        </p>
        <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-[#f6efe3]">
          Watch understanding take shape.
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#c9c0ae]">
          Discovery does not just return an answer. It shows the sequence by
          which messy evidence becomes a stable leadership belief.
        </p>
      </div>

      <div className="space-y-5">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="relative rounded-3xl border border-white/10 bg-black/20 p-6"
          >
            <div className="flex gap-5">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold ${
                    event.strength < 0.75
                      ? "border-orange-300/50 bg-orange-300/10 text-orange-200"
                      : "border-[#f0cf6a]/50 bg-[#f0cf6a]/10 text-[#f0cf6a]"
                  }`}
                >
                  {index + 1}
                </div>

                {index < emergenceEvents.length - 1 && (
                  <div className="mt-3 h-12 w-px bg-[#f0cf6a]/25" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#c9c0ae]">
                    Step {index + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#f0cf6a]">
                    Emergence Event
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-semibold text-[#f6efe3]">
                  {event.title}
                </h3>

                <p className="mt-2 max-w-3xl text-base leading-7 text-[#c9c0ae]">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}