"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { NewAIPlan } from "@/components/ai/new-ai-plan";
import { RoadmapDetails } from "@/components/ai/roadmap-details";

export function AIPage({ userId }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [previewRoadmap, setPreviewRoadmap] = useState(null);

  async function loadRoadmaps() {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/roadmap/get/${userId}`, { cache: "no-store" });
      const data = await response.json();
      setRoadmaps(data?.result || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoadmaps();
  }, [userId]);

  async function generateRoadmap(form) {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/roadmap/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      setPreviewRoadmap(data?.result || null);
      setShowNewPlan(false);
    } finally {
      setLoading(false);
    }
  }

  async function confirmRoadmap(data) {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/roadmap/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (response.ok) {
        setPreviewRoadmap(null);
        await loadRoadmaps();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {loading ? <LoadingSpinner /> : null}

      {previewRoadmap ? (
        <RoadmapDetails roadmapData={previewRoadmap} preview onConfirm={confirmRoadmap} onCancel={() => setPreviewRoadmap(null)} />
      ) : (
        <>
          <section className="rounded-3xl border border-white/10 bg-[#0b1020]/85 p-5 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-violet-300">AI</p>
                <h1 className="mt-2 font-serif text-3xl text-white">Roadmaps by AI</h1>
              </div>
              <button onClick={() => setShowNewPlan(true)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-sm font-medium text-white">
                <Plus size={16} />
                New plan
              </button>
            </div>
          </section>

          <section className="grid gap-4">
            {roadmaps.length ? (
              roadmaps.map((roadmap) => (
                <a key={roadmap.id} href={`/ai/roadmap/${roadmap.id}`} className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg text-white">{roadmap.title}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {roadmap.months_allocated} months • {roadmap.hours_per_day} hrs/day
                      </p>
                    </div>
                    <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                      skill {roadmap.skill_level}
                    </span>
                  </div>
                </a>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-zinc-400">No roadmaps yet.</div>
            )}
          </section>
        </>
      )}

      {showNewPlan ? <NewAIPlan onGenerate={generateRoadmap} onClose={() => setShowNewPlan(false)} /> : null}
    </div>
  );
}