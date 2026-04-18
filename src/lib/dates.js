export function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDisplayDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function getStartAndEndDate(baseDate, range, delta = 0) {
  const reference = new Date(baseDate);
  const start = new Date(reference);
  const end = new Date(reference);

  if (String(range).toLowerCase() === "weekly") {
    const offset = reference.getDay() === 0 ? -6 : 1 - reference.getDay();
    start.setDate(reference.getDate() + offset + delta * 7);
    end.setDate(start.getDate() + 6);
  } else if (String(range).toLowerCase() === "monthly") {
    start.setDate(1);
    start.setMonth(start.getMonth() + delta);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
  } else {
    start.setFullYear(start.getFullYear() + delta);
    start.setMonth(0, 1);
    end.setFullYear(start.getFullYear());
    end.setMonth(11, 31);
  }

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}