export interface EmergencyService {
  name: string;
  description: string;
  phone?: string;
  link?: string;
  /** "alert-insurer" renders a "Call My Insurance" button that dials the person's own insurer. */
  action?: "alert-insurer";
}

export const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    name: "Ambulance",
    description: "National emergency ambulance dispatch",
    phone: "999",
  },
  {
    name: "Police",
    description: "Kenya Police emergency line",
    phone: "999",
  },
  {
    name: "Fire",
    description: "Fire and rescue services",
    phone: "999",
  },
  {
    name: "Accident Rescue",
    description: "Kenya Red Cross accident & disaster rescue",
    phone: "1199",
  },
  {
    name: "Suicide Hotline",
    description: "Befrienders Kenya — suicide prevention support",
    phone: "1199",
  },
  {
    name: "SGBV Hotline",
    description: "Gender-based violence support and reporting",
    phone: "1195",
  },
  {
    name: "Child Abuse Hotline",
    description: "Childline Kenya — child protection helpline",
    phone: "116",
  },
  {
    name: "Health Insurer",
    description: "Call the insurer on your policy directly",
    action: "alert-insurer",
  },
];
