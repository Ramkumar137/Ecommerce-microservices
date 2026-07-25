import type { User } from "@/types/auth";

/**
 * Extracts 1–2 letter uppercase initials from a User object safely.
 *
 * Priorities:
 * 1. first_name + last_name ("Ram Kumar" -> "RK")
 * 2. first_name or username ("Ram" -> "R")
 * 3. email local part ("ramkumar@gmail.com" -> "R", "ram.kumar@gmail.com" -> "RK")
 * 4. Fallback: "U"
 */
export function getUserInitials(user: User | null | undefined): string {
  if (!user) return "U";

  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();

  // 1. Full name available
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  // 2. First name only
  if (firstName) {
    const parts = firstName.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return firstName.charAt(0).toUpperCase();
  }

  // 3. Username fallback
  const username = user.username?.trim();
  if (username) {
    const parts = username.split(/[\s_.-]+/);
    if (parts.length >= 2 && parts[1].length > 0) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return username.charAt(0).toUpperCase();
  }

  // 4. Email fallback
  const email = user.email?.trim();
  if (email) {
    const localPart = email.split("@")[0];
    const parts = localPart.split(/[._-]+/);
    if (parts.length >= 2 && parts[1].length > 0) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return localPart.charAt(0).toUpperCase();
  }

  return "U";
}
