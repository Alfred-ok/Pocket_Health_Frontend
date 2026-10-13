import type { HealthInfo, Insurance, Profile } from "../types/pocketHealth";

export type EmergencyAlertKind = "health" | "life_in_danger";

const KIND_LABELS: Record<EmergencyAlertKind, string> = {
  health: "Health Emergency",
  life_in_danger: "Life in Danger Emergency",
};

/**
 * Whole years since a "yyyy-MM-dd" birth date, counted by calendar birthday (not 365.25-day
 * blocks, which is off by one around birthdays). Null for a missing, invalid or future date.
 */
function yearsSince(dateOfBirth: string | null | undefined): number | null {
  const match = dateOfBirth?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const today = new Date();
  let years = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) years--;
  return years >= 0 && years < 150 ? years : null;
}

export function ageFromDob(dateOfBirth: string | null | undefined): string | null {
  const years = yearsSince(dateOfBirth);
  return years === null ? null : `${years} yrs`;
}

function ageInYears(dateOfBirth: string | null | undefined): string | null {
  const years = yearsSince(dateOfBirth);
  return years === null ? null : `${years} years`;
}

/**
 * "0.31234, 32.58123" -> adds a Google Maps link so recipients can open it in one tap.
 * `note` flags a stored reading, e.g. "last known location, recorded 12 min ago".
 */
function describeLocation(location: string, note?: string): string {
  if (!location) return "unavailable";
  const match = location.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  const described = match ? `${location} (https://www.google.com/maps?q=${match[1]},${match[2]})` : location;
  return note ? `${described} [${note}]` : described;
}

/** "Bupa (+256785654321)/Self" — each insurer with its contact number, then self-pay. */
function describeInsurance(insurancePolicies: Insurance[]): string {
  const insurers = insurancePolicies.map((policy) => {
    const contact = policy.phone1 || policy.phone2 || policy.email;
    return contact ? `${policy.insurerName} (${contact})` : policy.insurerName;
  });
  return [...insurers, "Self"].join("/");
}

/**
 * Health Emergency wording from the SOS spec. Every value is pulled from the
 * profile, Health Info and Insurance records; missing values show as "not provided".
 */
function buildHealthEmergencyBody(
  profile: Profile,
  healthInfo: HealthInfo | null,
  insurancePolicies: Insurance[],
  location: string,
  locationNote: string | undefined,
  notes: string
): string {
  const orNone = (value: string | null | undefined) => value?.trim() || "not provided";
  const fullName = [profile.otherNames, profile.surname].filter(Boolean).join(" ");

  const healthDetails = [
    `Name - ${orNone(fullName)}`,
    `Phone - ${orNone(profile.phone1)}`,
    `Age - ${orNone(ageInYears(profile.dateOfBirth))}`,
    `Gender - ${orNone(profile.gender)}`,
    `Blood group - ${orNone(healthInfo?.bloodGroup)}`,
    `Insurance - ${describeInsurance(insurancePolicies)}`,
    `Conditions - ${orNone(healthInfo?.chronicConditions)}`,
    `Medication - ${orNone(healthInfo?.longTermMeds)}`,
    `Allergies - ${orNone(healthInfo?.allergies)}`,
  ].join("; ");

  const message =
    "Please help! I am in a health emergency. " +
    `My current location is ${describeLocation(location, locationNote)}. ` +
    `My residence is ${orNone(profile.residence)}. ` +
    `My health information is: ${healthDetails}.`;

  return notes ? `${message}\n\nAdditional details: ${notes}` : message;
}

function line(label: string, value: string | null | undefined): string {
  return `${label}: ${value?.trim() || "not provided"}`;
}

interface BuildEmergencyMessageParams {
  alertKind: EmergencyAlertKind;
  profile: Profile;
  healthInfo: HealthInfo | null;
  insurancePolicies: Insurance[];
  notes: string;
  /** Live (or last known) coordinates; empty when none could be obtained. */
  location: string;
  /** Set when `location` is a stored reading rather than a live one. */
  locationNote?: string;
  recipientEmails: string[];
}

export interface EmergencyMessage {
  subject: string;
  body: string;
  mailto: string;
}

/**
 * Builds the automated Emergency SOS message. Field selection mirrors the
 * Emergency > Health Info panel (name, age, gender, blood group, allergies,
 * chronic conditions, long-term meds, mental health conditions, family
 * history, insurer contact — all pulled from the person's profile).
 */
export function buildEmergencyMessage({
  alertKind,
  profile,
  healthInfo,
  insurancePolicies,
  notes,
  location,
  locationNote,
  recipientEmails,
}: BuildEmergencyMessageParams): EmergencyMessage {
  const fullName = [profile.otherNames, profile.surname].filter(Boolean).join(" ") || "Unknown";
  const kindLabel = KIND_LABELS[alertKind];

  const subject = `EMERGENCY ALERT: ${kindLabel} - ${fullName}`;

  const insuranceLines =
    insurancePolicies.length === 0
      ? ["Insurer: none on file"]
      : insurancePolicies.flatMap((policy) => [
          line("Insurer", policy.insurerName),
          line("Policy #", policy.policyNumber),
          line("Insurer contact", [policy.phone1, policy.phone2, policy.email].filter(Boolean).join(" / ")),
        ]);

  const sections = [
    `EMERGENCY ALERT - ${kindLabel}`,
    `Sent automatically via PocketHealth at ${new Date().toLocaleString()}`,
    "",
    "PATIENT",
    line("Name", fullName),
    line("Age", ageFromDob(profile.dateOfBirth)),
    line("Gender", profile.gender),
    line("Phone", profile.phone1),
    "",
    "EMERGENCY HEALTH SNAPSHOT",
    line("Blood group", healthInfo?.bloodGroup),
    line("Allergies", healthInfo?.allergies),
    line("Chronic conditions", healthInfo?.chronicConditions),
    line("Long-term medications", healthInfo?.longTermMeds),
    line("Mental health conditions", healthInfo?.mentalConditions),
    line("Family history", healthInfo?.familyHistory),
    "",
    "HEALTH INSURANCE",
    ...insuranceLines,
    "",
    "WHAT'S HAPPENING",
    notes || "No additional details provided.",
    "",
    "LOCATION",
    line("Current location", describeLocation(location, locationNote)),
    line("Residence", profile.residence),
    "",
    "This is an automated emergency message generated by PocketHealth. Please respond or call the sender directly.",
  ];

  const body =
    alertKind === "health"
      ? buildHealthEmergencyBody(profile, healthInfo, insurancePolicies, location, locationNote, notes)
      : sections.join("\n");

  // The "to" segment of a mailto URL is not URI-encoded (it's not a query param) — only
  // subject/body need encoding.
  const to = recipientEmails.filter(Boolean).join(",");
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailto };
}
