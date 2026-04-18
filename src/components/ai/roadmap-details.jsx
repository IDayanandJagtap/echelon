"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

export function RoadmapDetails({ roadmapData, roadmapId, userId, onConfirm, onCancel, preview = false }) {
  const [data, setData] = useState(roadmapData || null);
  const [loading, setLoading] = useState(!roadmapData && !!roadmapId);
  const [expandedStep, setExpandedStep] = useState(null);

  useEffect(() => {
    const loadRoadmap = async () => {
      if (!roadmapId || data) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/ai/roadmap/get/${userId}/${roadmapId}`, { cache: "no-store" });
        const payload = await response.json();
        const row = payload?.result?.[0];

        if (row) {
          setData({
            ...row,
            plan: row.ai_response,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [roadmapId, userId, data]);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/ai/roadmap/delete/${userId}/${roadmapId}`, { method: "DELETE" });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const plan = data?.plan || data?.ai_response || [];

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1020]/85 p-5 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-violet-300">AI Roadmap</p>
          <h1 className="mt-2 font-serif text-3xl text-white">{data?.title || "Loading..."}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {data?.months_allocated ? `${data.months_allocated} months` : data?.monthsAllocated ? `${data.monthsAllocated} months` : ""}
            {data?.hours_per_day ? ` • ${data.hours_per_day} hrs/day` : data?.hoursPerDay ? ` • ${data.hoursPerDay} hrs/day` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {preview ? (
            <>
              <button onClick={() => onConfirm?.(data)} className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white">
                <Check size={14} className="mr-2 inline" />
                Confirm
              </button>
              <button onClick={onCancel} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300">
                <X size={14} className="mr-2 inline" />
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleDelete} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10">
              <Trash2 size={14} className="mr-2 inline" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {Array.isArray(plan) && plan.length ? (
          plan.map((step, index) => {
            const open = expandedStep === index;

            return (
              <div key={`${step.date}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <button className="flex w-full items-center justify-between gap-4 text-left" onClick={() => setExpandedStep(open ? null : index)}>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Step {index + 1}</p>
                    <p className="mt-1 text-lg text-white">{step.topic}</p>
                  </div>
                  {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {open ? (
                  <div className="mt-4 space-y-2 text-sm text-zinc-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{new Date(step.date).toDateString()}</p>
                    {Array.isArray(step.tasks) ? step.tasks.map((task) => <div key={task}>• {task}</div>) : null}
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">No roadmap data available.</div>
        )}
      </div>
    </div>
  );
}