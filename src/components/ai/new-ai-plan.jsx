"use client";

import { useState } from "react";

export function NewAIPlan({ onGenerate, onClose }) {
  const [form, setForm] = useState({
    title: "",
    skillLevel: 0,
    monthsAllocated: 3,
    hoursPerDay: 2,
    startDate: new Date().toISOString().split("T")[0],
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1020] p-6 shadow-glow">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Create AI roadmap</h3>
          <button onClick={onClose} className="text-sm text-zinc-400 hover:text-white">Close</button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-zinc-300">Skill</span>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-zinc-300">Skill level</span>
            <select value={form.skillLevel} onChange={(event) => setForm({ ...form, skillLevel: Number(event.target.value) })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
              {[
                "Beginner",
                "Intermediate",
                "Advanced",
                "Expert",
              ].map((item, index) => (
                <option value={index} key={item} className="bg-[#0b1020]">
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-zinc-300">Months</span>
              <input type="number" min="1" value={form.monthsAllocated} onChange={(event) => setForm({ ...form, monthsAllocated: Number(event.target.value) })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-zinc-300">Hours/day</span>
              <input type="number" min="1" value={form.hoursPerDay} onChange={(event) => setForm({ ...form, hoursPerDay: Number(event.target.value) })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm text-zinc-300">Start date</span>
            <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">Cancel</button>
          <button onClick={() => onGenerate(form)} className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white">Generate</button>
        </div>
      </div>
    </div>
  );
}