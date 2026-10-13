import type { EmergencyContact } from "../types/pocketHealth";

/** Contacts in the order they're tried: lowest priority number first, ties keep their saved order. */
export function sortByPriority(contacts: EmergencyContact[]): EmergencyContact[] {
  return [...contacts].sort((a, b) => a.priority - b.priority);
}

/** The primary contact is the first one in priority order — the person the Health Emergency SOS goes to. */
export function getPrimaryContact(contacts: EmergencyContact[]): EmergencyContact | null {
  return sortByPriority(contacts)[0] ?? null;
}
