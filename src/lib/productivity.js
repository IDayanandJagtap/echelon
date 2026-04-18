import { getDateRange, formatDate } from "@/lib/dates";

export function deriveTaskStatus(tasks = []) {
  if (!tasks.length) {
    return 0;
  }

  const completedStatuses = new Set(["done"]);
  const pendingStatuses = new Set(["pending", "notDone", "toDo", "todo", "onHold"]);

  if (tasks.every((task) => completedStatuses.has(task.status))) {
    return 2;
  }

  if (tasks.every((task) => pendingStatuses.has(task.status))) {
    return 3;
  }

  return 1;
}

export function deriveDayStatusFromTasks(tasks = []) {
  if (!tasks.length) {
    return 0;
  }

  if (tasks.every((task) => task.status === "done")) {
    return 4;
  }

  if (tasks.some((task) => task.status === "inProgress")) {
    return 3;
  }

  if (tasks.some((task) => task.status === "pending" || task.status === "onHold")) {
    return 2;
  }

  return 1;
}

export function groupDaysByWeekday(days = [], statusOfDay) {
  const grouped = {
    sun: { count: 0 },
    mon: { count: 0 },
    tue: { count: 0 },
    wed: { count: 0 },
    thu: { count: 0 },
    fri: { count: 0 },
    sat: { count: 0 },
  };

  for (const day of days) {
    if (statusOfDay !== undefined && statusOfDay !== null && String(day.status_of_day) !== String(statusOfDay)) {
      continue;
    }

    const weekday = new Date(day.day_date).toLocaleString("en-US", { weekday: "short" }).toLowerCase();
    if (grouped[weekday]) {
      grouped[weekday].count += 1;
    }
  }

  return grouped;
}

export function buildLineChartSeries(days = [], startDate, endDate) {
  const dayMap = new Map(
    days.map((day) => [formatDate(day.day_date), day])
  );

  return getDateRange(startDate, endDate).map((date) => {
    const day = dayMap.get(date);
    return {
      date,
      day: new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
      status: day ? day.status_of_day : 0,
    };
  });
}