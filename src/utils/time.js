import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(relativeTime);
dayjs.extend(utc);

// Primary display (relative, local)
export function timeAgo(utcString) {
  if (!utcString) return "";
  return dayjs.utc(utcString).local().fromNow();
}

// Tooltip / full timestamp (local)
export function fullDate(utcString) {
  if (!utcString) return "";
  return dayjs.utc(utcString).local().format("MMM D, YYYY h:mm A");
}

// Group headers (Today / Yesterday / Date)
export function dateGroup(utcString) {
  if (!utcString) return "";

  const d = dayjs.utc(utcString).local();
  const today = dayjs();
  const yesterday = today.subtract(1, "day");

  if (d.isSame(today, "day")) return "Today";
  if (d.isSame(yesterday, "day")) return "Yesterday";

  return d.format("MMMM D, YYYY");
}
