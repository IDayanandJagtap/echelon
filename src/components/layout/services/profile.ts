export interface UserLike {
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    name?: string | null;
    username?: string | null;
  } | null;
}

export interface UserProfileSummary {
  displayName: string;
  email: string;
  initials: string;
}

function normalizeNameParts(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function getDisplayName(user?: UserLike | null) {
  const metadata = user?.user_metadata || {};
  return metadata.full_name || metadata.name || metadata.username || user?.email?.split("@")[0] || "User";
}

export function getUserInitials(displayName: string) {
  const parts = normalizeNameParts(displayName);

  if (!parts.length) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function getUserProfileSummary(user?: UserLike | null): UserProfileSummary {
  const displayName = getDisplayName(user);

  return {
    displayName,
    email: user?.email || "",
    initials: getUserInitials(displayName),
  };
}
