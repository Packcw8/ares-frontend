export function displayName(item) {
  if (!item?.user) return "Anonymous";

  if (item.user.is_anonymous || !item.user.username) {
    return "Anonymous";
  }

  return item.user.username;
}
