"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { formatDate, toDisplayDate } from "@/lib/dates";

const statusLabels = ["Idle", "Improving", "Moderate", "Efficient", "Peak"];
const taskStatuses = ["pending", "inProgress", "done", "toDo", "notDone"];

function TaskForm({ initialValue, onClose, onSave }) {
  const [form, setForm] = useState(
    initialValue || {
      title: "",
      description: "",
      status: "pending",
      category: "",
      subCategory: "",
      taskDate: formatDate(new Date()),
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1020] p-6 shadow-glow">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">{initialValue ? "Edit task" : "New task"}</h3>
          <button onClick={onClose} className="text-sm text-zinc-400 hover:text-white">Close</button>
        </div>

        <div className="grid gap-4">
          {[
            ["title", "Title"],
            ["description", "Description"],
            ["category", "Category"],
            ["subCategory", "Sub category"],
          ].map(([key, label]) => (
            <label className="grid gap-2" key={key}>
              <span className="text-sm text-zinc-300">{label}</span>
              <input
                value={form[key] || ""}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60"
              />
            </label>
          ))}

          <label className="grid gap-2">
            <span className="text-sm text-zinc-300">Status</span>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60"
            >
              {taskStatuses.map((status) => (
                <option value={status} key={status} className="bg-[#0b1020]">
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-zinc-300">Date</span>
            <input
              type="date"
              value={formatDate(form.taskDate)}
              onChange={(event) => setForm({ ...form, taskDate: event.target.value })}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-medium text-white">{task.title}</p>
          <p className="mt-1 text-sm text-zinc-400">{task.description || "No description"}</p>
        </div>
        <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
          {task.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex flex-wrap gap-2">
          {task.category ? <span className="rounded-full bg-white/5 px-2 py-1">{task.category}</span> : null}
          {task.sub_category ? <span className="rounded-full bg-white/5 px-2 py-1">{task.sub_category}</span> : null}
          <span className="rounded-full bg-white/5 px-2 py-1">{task.task_date}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(task)} className="rounded-full border border-white/10 p-2 text-zinc-300 hover:bg-white/10">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(task.id)} className="rounded-full border border-white/10 p-2 text-zinc-300 hover:bg-white/10">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TaskDashboard() {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [statusOfDay, setStatusOfDay] = useState(0);
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const dateValue = useMemo(() => formatDate(date), [date]);

  async function loadTasks(targetDate = dateValue) {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?date=${targetDate}`, { cache: "no-store" });
      const data = await response.json();
      setTasks(data?.result?.tasks || []);
      setStatusOfDay(data?.result?.statusOfDay ?? 0);
    } finally {
      setLoading(false);
    }
  }

  async function loadQuote() {
    try {
      const response = await fetch("/api/quote", { cache: "no-store" });
      const data = await response.json();
      setQuote(data?.quote || "");
    } catch {
      setQuote("");
    }
  }

  useEffect(() => {
    loadQuote();
  }, []);

  useEffect(() => {
    loadTasks(dateValue);
  }, [dateValue]);

  async function saveTask(payload) {
    const body = {
      ...payload,
      taskDate: formatDate(payload.taskDate),
    };

    setLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: editingTask ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTask ? { taskId: editingTask.id, updateData: body } : body),
      });

      if (!response.ok) {
        throw new Error("Failed to save task");
      }

      setShowForm(false);
      setEditingTask(null);
      await loadTasks(body.taskDate);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(taskId) {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?taskId=${taskId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      await loadTasks(dateValue);
    } finally {
      setLoading(false);
    }
  }

  async function updateDayStatus(value) {
    const nextStatus = Number(value);
    setStatusOfDay(nextStatus);
    await fetch("/api/day", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateValue, statusOfDay: nextStatus }),
    });
  }

  function shiftDate(offset) {
    const next = new Date(date);
    next.setDate(next.getDate() + offset);
    setDate(next);
  }

  return (
    <div className="space-y-6">
      {loading ? <LoadingSpinner /> : null}

      <section className="rounded-3xl border border-white/10 bg-[#0b1020]/85 p-5 shadow-glow">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Tasks Dashboard</p>
            <h1 className="mt-2 font-serif text-3xl text-white">{toDisplayDate(date)}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{quote}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => shiftDate(-1)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/10">
              <ChevronLeft size={18} />
            </button>
            <input
              type="date"
              value={dateValue}
              onChange={(event) => setDate(new Date(event.target.value))}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            />
            <button onClick={() => shiftDate(1)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/10">
              <ChevronRight size={18} />
            </button>
            <select
              value={statusOfDay}
              onChange={(event) => updateDayStatus(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            >
              {statusLabels.map((label, index) => (
                <option key={label} value={index} className="bg-[#0b1020]">
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-sm font-medium text-white"
            >
              <Plus size={16} />
              New task
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(item) => {
                setEditingTask({
                  ...item,
                  taskDate: item.task_date,
                });
                setShowForm(true);
              }}
              onDelete={deleteTask}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-zinc-400">
            No tasks for this day.
          </div>
        )}
      </section>

      {showForm ? (
        <TaskForm
          initialValue={editingTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSave={saveTask}
        />
      ) : null}
    </div>
  );
}