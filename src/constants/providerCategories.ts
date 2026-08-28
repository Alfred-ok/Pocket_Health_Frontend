import type { BadgeColor } from "../components/ui/badge/Badge";

export const PROVIDER_CATEGORIES: { value: string; label: string }[] = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "specialist", label: "Specialist" },
  { value: "hospital", label: "Hospital" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "lab", label: "Lab" },
  { value: "insurer", label: "Insurer" },
];

export const categoryLabels: Record<string, string> = Object.fromEntries(
  PROVIDER_CATEGORIES.map((c) => [c.value, c.label])
);

export const categoryColors: Record<string, BadgeColor> = {
  doctor: "primary",
  nurse: "info",
  specialist: "dark",
  hospital: "success",
  pharmacy: "warning",
  lab: "error",
  insurer: "light",
};

const feeLabels: Record<string, string> = {
  doctor: "Consultation fee",
  nurse: "Consultation fee",
  specialist: "Consultation fee",
  hospital: "Service fee",
  lab: "Test fee",
  pharmacy: "Delivery fee",
  insurer: "Plan info",
};

export function feeLabel(category: string | null | undefined): string {
  if (!category) return "Consultation fee";
  return feeLabels[category.toLowerCase()] ?? "Consultation fee";
}
