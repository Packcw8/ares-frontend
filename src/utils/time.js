import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Primary display (human-friendly)
export function timeAgo(utc) {
  if (!utc) return "";
  return dayjs(utc).local().fromNow();
}

// Secondary / tooltip / detail display
export function fullDate(utc) {
  if (!utc) return "";
  return dayjs(utc).local().format("MMM D, YYYY h:mm A");
}

// Date grouping (Today / Yesterday / Date)
export function dateGroup(utc) {
  if (!utc) return "";

  const d = dayjs(utc).local();
  const today = dayjs();
  const yesterday = today.subtract(1, "day");

  if (d.isSame(today, "day")) return "Today";
  if (d.isSame(yesterday, "day")) return "Yesterday";

  return d.format("MMMM D, YYYY");
}
